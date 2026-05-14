import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'
import { logActivity } from '@/lib/services/analytics.service'
import { rateLimiter, getClientIP } from '@/lib/services/security.service'
import prisma from '@/lib/db'

const GROQ_KEY   = process.env.GROQ_API_KEY || ''
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'

const TOKEN_COST: Record<string, number> = {
  hint:    1,
  debug:   2,
  explain: 3,
  general: 1,
}

/* ── Groq API call ── */
async function callGroq(messages: { role: string; content: string }[]) {
  if (!GROQ_KEY) throw new Error('NO_KEY')
  const res = await fetch(GROQ_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: GROQ_MODEL, max_tokens: 1024, temperature: 0.7, messages }),
  })
  if (res.status === 429) throw Object.assign(new Error('RATE_LIMIT'), { status: 429 })
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    const detail  = (errBody as { error?: { message?: string } }).error?.message ?? JSON.stringify(errBody)
    throw new Error(`Groq ${res.status}: ${detail}`)
  }
  const d = await res.json()
  return d.choices?.[0]?.message?.content as string ?? ''
}

/* ── Token check & deduct ── */
async function useTokens(userId: string, cost: number, action: string, taskId?: string) {
  const bal = await prisma.tokenBalance.findUnique({ where: { userId } })
  const current = bal?.balance ?? 0
  if (current < cost) return { ok: false, balance: current }

  await prisma.tokenBalance.upsert({
    where:  { userId },
    update: { balance: { decrement: cost }, totalUsed: { increment: cost } },
    create: { userId, balance: 0, totalUsed: cost },
  })
  await prisma.tokenUsage.create({ data: { userId, action, cost, taskId } })
  return { ok: true, balance: current - cost }
}

/* ── Player context from DB ── */
async function getPlayerContext(userId: string) {
  const [user, subs, lessonsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, level: true, xp: true },
    }),
    prisma.taskSubmission.findMany({
      where:   { userId },
      select:  { status: true, task: { select: { title: true } } },
      orderBy: { submittedAt: 'desc' },
      take:    20,
    }),
    prisma.lessonProgress.count({ where: { userId, completed: true } }),
  ])

  const passed = subs.filter(s => s.status === 'PASSED').length
  const failed = subs.filter(s => s.status === 'FAILED').length

  return {
    username:         user?.username ?? '',
    level:            user?.level    ?? 1,
    xp:               user?.xp       ?? 0,
    passedTasks:      passed,
    failedTasks:      failed,
    passRate:         passed + failed > 0 ? Math.round(passed / (passed + failed) * 100) : 0,
    completedLessons: lessonsCount,
    skillLevel:       (user?.level ?? 1) >= 10 ? 'advanced' : (user?.level ?? 1) >= 5 ? 'intermediate' : 'beginner',
    recentFails:      subs.filter(s => s.status === 'FAILED').slice(0, 3).map(s => s.task.title),
  }
}

/* ── Suggest tasks ── */
async function getSuggestions(userId: string) {
  const done    = await prisma.taskSubmission.findMany({ where: { userId }, select: { taskId: true } })
  const doneIds = done.map(d => d.taskId)
  const tasks   = await prisma.task.findMany({
    where:   { id: { notIn: doneIds }, lesson: { course: { isActive: true } } },
    select:  { id: true, title: true, xpReward: true, taskType: true,
               lesson: { select: { course: { select: { title: true } } } } },
    take:    3,
    orderBy: { orderIndex: 'asc' },
  })
  return tasks.map(t => ({
    id: t.id, title: t.title, xp: t.xpReward,
    course: t.lesson.course.title, type: t.taskType,
  }))
}

/* ── POST /api/ai ── */
export async function POST(req: NextRequest) {
  try {
    const u  = requireAuth(req)
    const ip = getClientIP(req)

    if (!rateLimiter(ip + '_ai', 30, 15 * 60 * 1000)) {
      return ok({ reply: '⏳ Хэт олон хүсэлт. 1 минут хүлээгээд дахин оролдоно уу.' })
    }

    if (!GROQ_KEY) {
      return ok({
        reply: '⚙️ AI тохируулаагүй байна.\n\n1. https://console.groq.com → бүртгүүлнэ (үнэгүй)\n2. API Keys → Create key\n3. .env файлд: GROQ_API_KEY=gsk_...\n4. npm run dev дахин эхлүүлнэ'
      })
    }

    const body = await req.json() as {
      message:      string
      requestType?: string
      taskId?:      string
      userCode?:    string
      history?:     { role: string; content: string }[]
    }
    if (!body.message?.trim()) return err('message байхгүй байна')

    const reqType = body.requestType ?? 'general'
    const cost    = TOKEN_COST[reqType] ?? 1

    // Check & deduct tokens
    const tokenResult = await useTokens(u.id, cost, reqType, body.taskId)
    if (!tokenResult.ok) {
      return err(`Token хүрэлцэхгүй байна. Үлдэгдэл: ${tokenResult.balance} · Шаардлагатай: ${cost}`, 402)
    }

    const [ctx, sugg] = await Promise.all([
      getPlayerContext(u.id),
      getSuggestions(u.id),
    ])

    const lower = body.message.toLowerCase()

    // Task санал
    if ((lower.includes('санал') || lower.includes('task өгөөч') || lower.includes('recommend') || lower.includes('task өг')) && sugg.length) {
      const list = sugg.map((t, i) => `${i + 1}. **${t.title}** — ${t.course} (+${t.xp}XP)`).join('\n')
      return ok({ reply: `${ctx.username} минь, эдгээр task тохирно:\n\n${list}\n\nАль нэгийг эхлүүлэх үү? 🎯`, tokenUsed: cost, balance: tokenResult.balance - cost })
    }

    // Дараагийн алхам
    if (lower.includes('дараагийн') || lower.includes('next') || lower.includes('юу хийх')) {
      if (sugg.length) {
        return ok({ reply: `Дараагийн алхам: **${sugg[0].title}** task-г хийж үзнэ үү! ${sugg[0].course} хичээлийн хэсэг. +${sugg[0].xp}XP авна. 💪`, tokenUsed: cost, balance: tokenResult.balance - cost })
      }
    }

    const isAdmin = lower.includes('admin') || lower.includes('нэмэх') || lower.includes('устгах') || lower.includes('ban')

    const modeNote = {
      hint:    'Шийдлийг шууд өгөхгүй. Алхмаар чиглүүл, hint өг, псевдокод ашигла.',
      debug:   'Алдааг задлан тайлбарла. Яагаад гарсныг ойлгуул. Засварыг шууд өгөхгүй.',
      explain: 'Concept-г гүнзгий, дэлгэрэнгүй тайлбарла. Жишээ кодыг хэсэгчлэн харуул.',
      general: 'Богино, тодорхой хариулт өг.',
    }

    const system = `Та ArenaHub онлайн IT сургалтын платформын AI туслагч байна. Монгол хэлээр богино, тодорхой, урамшуулалтай хариулна. "${ctx.username} минь" гэж хандаж болно.

${isAdmin ? `## ADMIN MODE\nAdmin үйлдлийг товч тайлбарлана. ACTION үг: "үүсгэнэ", "засна", "устгана".`
: `## REQUEST TYPE: ${reqType.toUpperCase()}\n${modeNote[reqType as keyof typeof modeNote] ?? modeNote.general}
## USER MODE ДҮРЭМ\n- Бүрэн код бичиж өгөхгүй\n- Суралцагчийг өөрөө бодуулах`}

=== СУРАЛЦАГЧИЙН МЭДЭЭЛЭЛ ===
Нэр: ${ctx.username} | Level: ${ctx.level} | XP: ${ctx.xp} | Ур чадвар: ${ctx.skillLevel}
Pass rate: ${ctx.passRate}% | Давсан task: ${ctx.passedTasks} | Дууссан хичээл: ${ctx.completedLessons}
Сүүлийн алдаа: ${ctx.recentFails.join(', ') || 'байхгүй'}
${sugg.length ? `\nСанал болгох task:\n${sugg.map((t, i) => `${i + 1}. ${t.title} (+${t.xp}XP) — ${t.course}`).join('\n')}` : ''}
${body.taskId   ? `\nTask ID: ${body.taskId}` : ''}
${body.userCode ? `\nХэрэглэгчийн код:\n\`\`\`js\n${body.userCode}\n\`\`\`` : ''}

Хариулт 250 үгнээс хэтрэхгүй.`

    const history = (body.history ?? [])
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }))
    const reply   = await callGroq([
      { role: 'system', content: system },
      ...history,
      { role: 'user', content: body.message },
    ])

    await logActivity(u.id, 'AI_CHAT', { message: body.message.slice(0, 100), type: reqType, cost })

    return ok({ reply, tokenUsed: cost, balance: tokenResult.balance })

  } catch (e: unknown) {
    const msg = (e as Error).message
    if (msg === 'RATE_LIMIT') return ok({ reply: '⏳ Хэт олон хүсэлт. 1 минут хүлээгээд дахин оролдоно уу.' })
    if (msg === 'NO_KEY')     return ok({ reply: '⚙️ GROQ_API_KEY тохируулаагүй байна.' })
    if (msg.startsWith('Groq')) return ok({ reply: `⚠️ AI алдаа: ${msg}` })
    return handleError(e)
  }
}