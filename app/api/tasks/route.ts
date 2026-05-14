import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import prisma from '@/lib/db'
import { getAllTasks, createTask, getUserTasks, searchTasks, filterTasks } from '@/lib/services/task.service'
import { ok, handleError } from '@/lib/api-helpers'

/* GET /api/tasks?lessonId=&mine=&search= */
export async function GET(req: NextRequest) {
  try {
    const u        = requireAuth(req)
    const sp       = req.nextUrl.searchParams
    const lessonId = sp.get('lessonId') ?? undefined
    const mine     = sp.get('mine') === 'true'
    const search   = sp.get('search')
    const type     = sp.get('taskType') ?? undefined

    if (mine)   return ok({ tasks: await getUserTasks(u.id) })
    if (search) return ok({ tasks: await searchTasks(search) })
    if (type)   return ok({ tasks: await filterTasks({ taskType: type, lessonId }) })

    // Run tasks + submissions in parallel when lessonId is known
    const [rawTasks, submissions] = lessonId
      ? await Promise.all([
          getAllTasks(lessonId),
          prisma.taskSubmission.findMany({
            where:  { userId: u.id, task: { lessonId } },
            select: { taskId:true, status:true, selected:true, xpEarned:true },
          }),
        ])
      : await (async () => {
          const tasks = await getAllTasks(undefined)
          const subs  = await prisma.taskSubmission.findMany({
            where:  { userId: u.id, taskId: { in: tasks.map(t => t.id) } },
            select: { taskId:true, status:true, selected:true, xpEarned:true },
          })
          return [tasks, subs] as const
        })()
    const subMap = Object.fromEntries(submissions.map(s => [s.taskId, s]))
    // Hide answer from client, attach submission
    return ok({ tasks: rawTasks.map(t => ({
      ...t,
      answer:    undefined,
      submitted: subMap[t.id] ? {
        id:       t.id,
        status:   subMap[t.id].status,
        selected: subMap[t.id].selected,
        xpEarned: subMap[t.id].xpEarned,
      } : undefined,
    })) })
  } catch (e) { return handleError(e) }
}

/* POST /api/tasks (content.task permission) */
export async function POST(req: NextRequest) {
  try {
    requirePermission(req, 'content.task')

    const schema = z.object({
      lessonId:      z.string(),
      title:         z.string().min(2),
      titleEn:       z.string().optional(),
      description:   z.string(),
      descriptionEn: z.string().optional(),
      taskType:      z.enum(['quiz', 'code']).default('quiz'),
      options:       z.array(z.string()).optional(),
      optionsEn:     z.array(z.string()).optional(),
      answer:        z.number().int().optional(),
      starterCode:   z.string().optional(),
      testCases:     z.array(z.unknown()).optional(),
      xpReward:      z.number().int().min(0).default(20),
      orderIndex:    z.number().int().default(0),
    })
    const data = schema.parse(await req.json())
    return ok({ task: await createTask(data) }, 201)
  } catch (e) { return handleError(e) }
}
