import prisma from '../db'
import { getDashboardStats, systemLogs } from './analytics.service'
import { deleteUser } from './user.service'
import { deleteTask } from './task.service'

/* ══ getDashboardStats ══════════════════ */
export { getDashboardStats }

/* ══ getAllUsersAdmin ════════════════════ */
export const getAllUsersAdmin = (opts?: { search?:string; page?:number; limit?:number }) => {
  const { search, page=1, limit=20 } = opts ?? {}
  const where = search
    ? { OR: [{ username:{ contains:search, mode:'insensitive' as const } },
             { email:   { contains:search, mode:'insensitive' as const } }] }
    : {}
  return Promise.all([
    prisma.user.findMany({
      where, skip:(page-1)*limit, take:limit,
      orderBy:{ createdAt:'desc' },
      select:{ id:true, username:true, email:true, role:true, xp:true, level:true, createdAt:true,
               _count:{ select:{ enrollments:true, taskSubmissions:true } } },
    }),
    prisma.user.count({ where }),
  ]).then(([users, total]) => ({ users, total, page, limit, pages: Math.ceil(total/limit) }))
}

/* ══ getAllTasksAdmin ════════════════════ */
export const getAllTasksAdmin = () =>
  prisma.task.findMany({
    include:{ lesson:{ include:{ course:true } }, _count:{ select:{ submissions:true } } },
    orderBy:{ lesson:{ course:{ title:'asc' } } },
  })

/* ══ deleteAnyUser ══════════════════════ */
export { deleteUser as deleteAnyUser }

/* ══ deleteAnyTask ══════════════════════ */
export { deleteTask as deleteAnyTask }

/* ══ systemLogs ═════════════════════════ */
export { systemLogs }
