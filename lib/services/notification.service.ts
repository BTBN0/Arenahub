import prisma from '../db'

/* ══ sendNotification ═══════════════════ */
export const sendNotification = (data:{
  userId: string; title: string; message: string; type?:string
}) =>
  prisma.notification.create({ data:{ type:'info', ...data } })

/* ══ sendInAppNotification ══════════════ */
export const sendInAppNotification = sendNotification

/* ══ sendEmail ══════════════════════════ */
export const sendEmail = async (to: string, subject: string, body: string) => {
  // Hook for email provider (Nodemailer, Resend, etc.)
  // For now: log only
  console.log(`[EMAIL] To:${to} | Subject:${subject}`)
  // TODO: integrate Nodemailer or Resend
  return { sent: true, to, subject }
}

/* ══ getUserNotifications ═══════════════ */
export const getUserNotifications = (userId: string, onlyUnread = false) =>
  prisma.notification.findMany({
    where:   { userId, ...(onlyUnread ? { isRead:false } : {}) },
    orderBy: { createdAt:'desc' },
    take:    50,
  })

/* ══ markAsRead ═════════════════════════ */
export const markAsRead = (id: string) =>
  prisma.notification.update({ where:{ id }, data:{ isRead:true } })

export const markAllAsRead = (userId: string) =>
  prisma.notification.updateMany({ where:{ userId, isRead:false }, data:{ isRead:true } })
