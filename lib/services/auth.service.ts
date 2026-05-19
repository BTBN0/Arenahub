import prisma from '../db'
import {
  generateAccessToken, generateRefreshToken,
  verifyRefreshToken,
  storeRefreshToken, removeRefreshToken,
} from '../auth'
import { logActivity } from './analytics.service'

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
