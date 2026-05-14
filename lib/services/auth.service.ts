import prisma from '../db'
import {
  hashPassword, comparePassword,
  generateAccessToken, generateRefreshToken,
  verifyRefreshToken, decodeToken,
  storeRefreshToken, removeRefreshToken, revokeAllSessions,
} from '../auth'
import { logActivity } from './analytics.service'

/* ══ registerUser ═══════════════════════ */
export async function registerUser(data: {
  username: string; email: string; password: string
}) {
  if (await prisma.user.findUnique({ where: { email: data.email } }))
    throw Object.assign(new Error('И-мэйл аль хэдийн бүртгэлтэй'), { status: 409 })
  if (await prisma.user.findUnique({ where: { username: data.username } }))
    throw Object.assign(new Error('Хэрэглэгчийн нэр авагдсан'), { status: 409 })

  const passwordHash = await hashPassword(data.password)
  const user = await prisma.user.create({
    data: { username: data.username, email: data.email, passwordHash },
    select: { id:true, username:true, email:true, role:true, xp:true, level:true },
  })
  const accessToken  = generateAccessToken({ id:user.id, username:user.username, email:user.email, role:user.role })
  const refreshToken = generateRefreshToken({ id:user.id, username:user.username, email:user.email, role:user.role })
  await storeRefreshToken(user.id, refreshToken)
  await logActivity(user.id, 'REGISTER', { email: data.email })
  return { user, accessToken, refreshToken }
}

/* ══ loginUser ══════════════════════════ */
export async function loginUser(email: string, password: string, ip?: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw Object.assign(new Error('И-мэйл эсвэл нууц үг буруу'), { status: 401 })
  if (!(await comparePassword(password, user.passwordHash)))
    throw Object.assign(new Error('И-мэйл эсвэл нууц үг буруу'), { status: 401 })

  const payload      = { id:user.id, username:user.username, email:user.email, role:user.role }
  const accessToken  = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)
  await storeRefreshToken(user.id, refreshToken)
  await logActivity(user.id, 'LOGIN', { ip })
  const { passwordHash:_, ...safe } = user
  return { user: safe, accessToken, refreshToken }
}

/* ══ logoutUser ═════════════════════════ */
export async function logoutUser(userId: string) {
  await removeRefreshToken(userId)
  await logActivity(userId, 'LOGOUT', {})
}

/* ══ refreshToken ═══════════════════════ */
export async function refreshToken(token: string) {
  let payload: ReturnType<typeof verifyRefreshToken>
  try { payload = verifyRefreshToken(token) }
  catch { throw Object.assign(new Error('Refresh token хүчингүй'), { status: 401 }) }

  const stored = await prisma.refreshToken.findUnique({ where: { userId: payload.id } })
  if (!stored || stored.token !== token)
    throw Object.assign(new Error('Token буруу эсвэл хүчингүй'), { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!user) throw Object.assign(new Error('Хэрэглэгч олдсонгүй'), { status: 404 })

  const newPayload      = { id:user.id, username:user.username, email:user.email, role:user.role }
  const newAccessToken  = generateAccessToken(newPayload)
  const newRefreshToken = generateRefreshToken(newPayload)
  await storeRefreshToken(user.id, newRefreshToken)
  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}
