import prisma from '../db'
import { addXP } from './game.service'
import { assignTaskToUser } from './task.service'
import { sendNotification } from './notification.service'

/* ══════════════════════════════════════
   AI SERVICE — Agent Logic
   Groq API (free) ашиглана
══════════════════════════════════════ */
const GROQ_KEY   = process.env.GROQ_API_KEY || ''
const GROQ_MODEL = 'llama-3.1-8b-instant'
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'

async function callGroq(messages: { role:string; content:string }[], maxTokens=400) {
  if (!GROQ_KEY) throw new Error('GROQ_API_KEY тохируулаагүй')
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', Authorization:`Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model:GROQ_MODEL, max_tokens:maxTokens, temperature:0.7, messages }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content as string ?? ''
}

/* ══ processUserPrompt ══════════════════ */
export const processUserPrompt = async (userId: string, prompt: string) => {
  const intent = await analyzeUserIntent(prompt)
  const action = await decideAction(intent, userId)
  return executeAction(action, userId, prompt)
}

/* ══ generateResponse ═══════════════════ */
export const generateResponse = (systemPrompt: string, userMessage: string, history: {role:string;content:string}[] = []) =>
  callGroq([{ role:'system', content:systemPrompt }, ...history, { role:'user', content:userMessage }])

/* ══ analyzeUserIntent ══════════════════ */
export const analyzeUserIntent = async (prompt: string): Promise<string> => {
  const lower = prompt.toLowerCase()
  if (lower.includes('hint') || lower.includes('тусал') || lower.includes('help'))    return 'GET_HINT'
  if (lower.includes('task') && (lower.includes('өгөөч') || lower.includes('санал'))) return 'RECOMMEND_TASK'
  if (lower.includes('явц') || lower.includes('progress') || lower.includes('стат')) return 'ANALYZE_PROGRESS'
  if (lower.includes('level') || lower.includes('xp'))                                return 'GET_STATS'
  if (lower.includes('дараагийн') || lower.includes('next'))                          return 'NEXT_ACTION'
  return 'GENERAL_CHAT'
}

/* ══ decideAction ═══════════════════════ */
export const decideAction = async (intent: string, userId: string) => {
  const user = await prisma.user.findUnique({ where:{ id:userId }, select:{ level:true, xp:true } })
  return { intent, userId, userLevel: user?.level ?? 1, userXp: user?.xp ?? 0 }
}

/* ══ executeAction ══════════════════════ */
export const executeAction = async (
  action: { intent:string; userId:string; userLevel:number },
  userId: string,
  prompt: string,
) => {
  switch (action.intent) {
    case 'RECOMMEND_TASK': return recommendTask(userId)
    case 'ANALYZE_PROGRESS': return analyzeProgress(userId)
    default: return generateResponse(buildSystemPrompt(action.userLevel), prompt)
  }
}

function buildSystemPrompt(level: number) {
  return `Та ArenaHub IT сургалтын платформын AI агент байна. Монгол хэлээр хариулна.
Хэрэглэгч level ${level} дээр байна. Богино, тодорхой, урамшуулалтай байна.`
}

/* ══ recommendTask ══════════════════════ */
export const recommendTask = async (userId: string) => {
  const done    = await prisma.taskSubmission.findMany({ where:{ userId }, select:{ taskId:true } })
  const doneIds = done.map(d => d.taskId)
  const user    = await prisma.user.findUnique({ where:{ id:userId }, select:{ level:true } })

  const diff = user && user.level >= 10 ? 'ADVANCED' : user && user.level >= 5 ? 'INTERMEDIATE' : 'BEGINNER'
  const tasks = await prisma.task.findMany({
    where:{ id:{ notIn:doneIds }, lesson:{ course:{ isActive:true, difficulty:diff } } },
    include:{ lesson:{ include:{ course:true } } },
    take:3, orderBy:{ orderIndex:'asc' },
  })
  return { recommended: tasks.map(t => ({ id:t.id, title:t.title, xp:t.xpReward, course:t.lesson.course.title })) }
}

/* ══ autoAssignTask ═════════════════════ */
export const autoAssignTask = async (userId: string) => {
  const { recommended } = await recommendTask(userId)
  if (!recommended.length) return null
  const task = recommended[0]
  await assignTaskToUser(userId, task.id)
  await sendNotification({ userId, title:'🎯 Шинэ task!', message:`"${task.title}" task танд хуваарилагдлаа`, type:'info' })
  return task
}

/* ══ autoCompleteTask ═══════════════════ */
export const autoCompleteTask = async (userId: string, taskId: string) => {
  const task = await prisma.task.findUnique({ where:{ id:taskId } })
  if (!task) throw new Error('Task олдсонгүй')
  await prisma.taskSubmission.upsert({
    where:  { userId_taskId:{ userId, taskId } },
    update: { status:'PASSED', xpEarned:task.xpReward, submittedAt:new Date() },
    create: { userId, taskId, status:'PASSED', xpEarned:task.xpReward },
  })
  await addXP(userId, task.xpReward)
  return { taskId, xpEarned: task.xpReward }
}

/* ══ generateHint ═══════════════════════ */
export const generateHint = async (taskId: string, userCode?: string) => {
  const task = await prisma.task.findUnique({
    where:{ id:taskId }, include:{ lesson:{ include:{ course:true } } }
  })
  if (!task) throw new Error('Task олдсонгүй')
  const prompt = `Task: ${task.title}\nТайлбар: ${task.description}${userCode ? `\nХэрэглэгчийн код:\n${userCode}` : ''}\nЭнэ task-д hint өгнө үү. Шууд хариулт өгөхгүй, чиглүүл.`
  const hint = await callGroq([{ role:'user', content:prompt }])
  return { taskId, hint }
}

/* ══ suggestNextAction ══════════════════ */
export const suggestNextAction = async (userId: string) => {
  const [progress, recent] = await Promise.all([
    prisma.lessonProgress.count({ where:{ userId, completed:true } }),
    prisma.taskSubmission.findFirst({ where:{ userId }, orderBy:{ submittedAt:'desc' }, include:{ task:true } }),
  ])
  if (!recent) return { suggestion:'Эхний task-аа эхлүүлэх цаг боллоо! 🚀' }
  const prompt = `Хэрэглэгч ${progress} хичээл дуусгасан. Сүүлд "${recent.task.title}" task хийсэн.
Дараагийн хийх зүйлийг богиноор санал болго.`
  const suggestion = await callGroq([{ role:'user', content:prompt }])
  return { suggestion }
}

/* ══ autoFillForm ═══════════════════════ */
export const autoFillForm = async (formType: string, context: Record<string, unknown>) => {
  const prompt = `${formType} маягтын талбаруудыг JSON хэлбэрт бөглөж өг. Context: ${JSON.stringify(context)}
Зөвхөн JSON буцаана, тайлбар хэрэггүй.`
  const result = await callGroq([{ role:'user', content:prompt }])
  try { return JSON.parse(result) } catch { return {} }
}

/* ══ analyzeProgress ═══════════════════ */
const analyzeProgress = async (userId: string) => {
  const [passed, failed, lessons] = await Promise.all([
    prisma.taskSubmission.count({ where:{ userId, status:'PASSED' } }),
    prisma.taskSubmission.count({ where:{ userId, status:'FAILED' } }),
    prisma.lessonProgress.count({ where:{ userId, completed:true } }),
  ])
  const passRate = passed + failed > 0 ? Math.round(passed / (passed + failed) * 100) : 0
  const prompt = `Хэрэглэгчийн явц: ${passed} task давсан, ${failed} амжилтгүй, ${lessons} хичээл дуусгасан. Pass rate: ${passRate}%.
Монгол хэлээр богино, урамшуулалтай шинжилгээ өгнө үү.`
  return callGroq([{ role:'user', content:prompt }])
}

/* ══ callExternalAPI ════════════════════ */
export const callExternalAPI = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options)
  return res.json()
}

/* ══ callInternalService ════════════════ */
export const callInternalService = async (service: string, action: string, payload: unknown) => {
  const services: Record<string, Record<string, Function>> = {
    game:   { addXP },
    task:   { assignTaskToUser },
  }
  const fn = services[service]?.[action]
  if (!fn) throw new Error(`Service ${service}.${action} олдсонгүй`)
  return fn(payload)
}

/* ══ validateActionPermission ═══════════ */
export const validateActionPermission = async (userId: string, action: string) => {
  const user = await prisma.user.findUnique({ where:{ id:userId }, select:{ role:true } })
  const adminOnly = ['DELETE_USER', 'BAN_USER', 'SYSTEM_RESET']
  if (adminOnly.includes(action) && user?.role !== 'ADMIN') return false
  return true
}
