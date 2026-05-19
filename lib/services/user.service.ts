import prisma from '../db'

/* ══ createUser ═════════════════════════ */
export const createUser = (data: { username:string; email:string; passwordHash:string; role?:string }) =>
  prisma.user.create({ data: data as Parameters<typeof prisma.user.create>[0]['data'] })

/* ══ getUserById ════════════════════════ */
export const getUserById = (id: string) =>
  prisma.user.findUnique({
    where:  { id },
    select: { id:true, username:true, email:true, role:true, xp:true, level:true,
              avatarUrl:true, createdAt:true,
              _count:{ select:{ enrollments:true, taskSubmissions:true } } },
  })

/* ══ getUserByEmail ═════════════════════ */
export const getUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } })

/* ══ getAllUsers ════════════════════════ */
export const getAllUsers = (opts?: { search?:string; page?:number; limit?:number }) => {
  const { search, page=1, limit=20 } = opts ?? {}
  const where = search
    ? { OR: [{ username:{ contains:search, mode:'insensitive' as const } },
             { email:   { contains:search, mode:'insensitive' as const } }] }
    : {}
  return prisma.user.findMany({
    where, skip:(page-1)*limit, take:limit, orderBy:{ createdAt:'desc' },
    select:{ id:true, username:true, email:true, role:true, xp:true,
             level:true, createdAt:true, avatarUrl:true },
  })
}

/* ══ updateUser ═════════════════════════ */
export const updateUser = (id: string, data: Partial<{ username:string; email:string; avatarUrl:string }>) =>
  prisma.user.update({ where:{ id }, data })

/* ══ deleteUser ═════════════════════════ */
export const deleteUser = (id: string) =>
  prisma.user.delete({ where:{ id } })

/* ══ updateUserRole ═════════════════════ */
export const updateUserRole = (id: string, role: 'ADMIN'|'STUDENT'|'INSTRUCTOR') =>
  prisma.user.update({ where:{ id }, data:{ role } })

/* ══ getUserRole ════════════════════════ */
export const getUserRole = async (id: string) => {
  const u = await prisma.user.findUnique({ where:{ id }, select:{ role:true } })
  return u?.role ?? null
}

/* ══ updateProfile ══════════════════════ */
export const updateProfile = (id: string, data: Partial<{ username:string; avatarUrl:string; bio:string; country:string }>) =>
  prisma.user.update({ where:{ id }, data, select:{ id:true, username:true, avatarUrl:true, bio:true, country:true, role:true, xp:true, level:true, coins:true } })

/* ══ uploadAvatar ═══════════════════════ */
export const uploadAvatar = (id: string, avatarUrl: string) =>
  prisma.user.update({ where:{ id }, data:{ avatarUrl } })

/* ══ banUser / unbanUser ════════════════ */
// Using role field as ban mechanism (role = BANNED)
export const banUser = async (id: string) => {
  await prisma.refreshToken.deleteMany({ where:{ userId:id } })
  return prisma.user.update({ where:{ id }, data:{ role:'STUDENT' as 'STUDENT' } })
  // In real app: add isBanned boolean field to schema
}
export const unbanUser = (id: string) =>
  prisma.user.update({ where:{ id }, data:{ role:'STUDENT' } })
