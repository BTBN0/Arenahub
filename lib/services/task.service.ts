import prisma from '../db'

type TaskInput = {
  lessonId:    string
  title:       string
  description: string
  taskType:    'quiz'|'code'
  options?:    string[]
  answer?:     number
  starterCode?: string
  testCases?:  unknown[]
  xpReward?:   number
  orderIndex?: number
}

/* ══ CRUD ═══════════════════════════════ */
export const createTask = (data: TaskInput) =>
  prisma.task.create({ data: data as Parameters<typeof prisma.task.create>[0]['data'] })

export const getAllTasks = (lessonId?: string) =>
  prisma.task.findMany({
    where:   lessonId ? { lessonId } : {},
    orderBy: { orderIndex: 'asc' },
    include: { _count:{ select:{ submissions:true } } },
  })

export const getTaskById = (id: string) =>
  prisma.task.findUnique({
    where:   { id },
    include: { lesson:{ include:{ course:true } } },
  })

export const updateTask = (id: string, data: Partial<TaskInput>) =>
  prisma.task.update({ where:{ id }, data: data as Parameters<typeof prisma.task.update>[0]['data'] })

export const deleteTask = (id: string) =>
  prisma.task.delete({ where:{ id } })

/* ══ ASSIGNMENT ═════════════════════════ */
export const assignTaskToUser = (userId: string, taskId: string) =>
  prisma.taskSubmission.upsert({
    where:  { userId_taskId:{ userId, taskId } },
    update: {},
    create: { userId, taskId, status:'TODO' as 'TODO' },
  })

export const removeTaskFromUser = (userId: string, taskId: string) =>
  prisma.taskSubmission.deleteMany({ where:{ userId, taskId } })

export const getUserTasks = (userId: string) =>
  prisma.taskSubmission.findMany({
    where:   { userId },
    include: { task:{ include:{ lesson:{ include:{ course:true } } } } },
    orderBy: { submittedAt:'desc' },
  })

export const getTaskParticipants = (taskId: string) =>
  prisma.taskSubmission.findMany({
    where:   { taskId },
    include: { user:{ select:{ id:true, username:true, level:true } } },
  })

/* ══ STATUS ══════════════════════════════ */
export const startTask = (userId: string, taskId: string) =>
  prisma.taskSubmission.upsert({
    where:  { userId_taskId:{ userId, taskId } },
    update: { status:'IN_PROGRESS' },
    create: { userId, taskId, status:'IN_PROGRESS' },
  })

export const completeTask = (userId: string, taskId: string, xpEarned: number) =>
  prisma.taskSubmission.upsert({
    where:  { userId_taskId:{ userId, taskId } },
    update: { status:'PASSED', xpEarned, submittedAt:new Date() },
    create: { userId, taskId, status:'PASSED', xpEarned },
  })

export const failTask = (userId: string, taskId: string) =>
  prisma.taskSubmission.upsert({
    where:  { userId_taskId:{ userId, taskId } },
    update: { status:'FAILED', submittedAt:new Date() },
    create: { userId, taskId, status:'FAILED', xpEarned:0 },
  })

export const resetTask = (userId: string, taskId: string) =>
  prisma.taskSubmission.deleteMany({ where:{ userId, taskId } })

/* ══ SEARCH / FILTER / PAGINATION ════════ */
export const searchTasks = (query: string) =>
  prisma.task.findMany({
    where:{ OR:[{ title:{ contains:query, mode:'insensitive' } },
                { description:{ contains:query, mode:'insensitive' } }] },
    take: 20,
  })

export const filterTasks = (opts: { taskType?:string; lessonId?:string }) =>
  prisma.task.findMany({
    where:   opts,
    orderBy: { orderIndex:'asc' },
  })

export const paginateResults = <T>(items: T[], page: number, limit: number) => ({
  data:  items.slice((page-1)*limit, page*limit),
  page, limit,
  total: items.length,
  pages: Math.ceil(items.length / limit),
})

export const sortResults = <T extends Record<string, unknown>>(
  items: T[], field: keyof T, dir: 'asc'|'desc' = 'asc'
) => [...items].sort((a,b) => {
  if (a[field] < b[field]) return dir==='asc' ? -1 : 1
  if (a[field] > b[field]) return dir==='asc' ?  1 : -1
  return 0
})
