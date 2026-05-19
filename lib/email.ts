import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

/* ── Send email ── */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL SKIP — SMTP not configured] To: ${to} | ${subject}`)
    return { skipped: true }
  }
  return transporter.sendMail({
    from:    `"ArenaHub" <${process.env.SMTP_USER}>`,
    to, subject, html,
  })
}

/* ── Welcome email ── */
export async function sendWelcomeEmail(email: string, username: string) {
  const html = `
    <div style="font-family:monospace;background:#070d1a;color:#e0e8f4;padding:32px;max-width:500px">
      <h1 style="color:#00e5ff;font-size:16px;letter-spacing:3px">ARENAHUB</h1>
      <h2 style="color:#ffe600;font-size:13px">ТАВТАЙ МОРИЛ, ${username.toUpperCase()}!</h2>
      <p style="color:#8a9ab5">IT сургалтын тоглоомд тавтай морилно уу.</p>
      <div style="margin:20px 0;padding:16px;border:1px solid rgba(0,229,255,.2)">
        <p style="color:#00e5ff;margin:0 0 8px">🎯 Эхний алхмууд:</p>
        <p style="color:#8a9ab5;margin:4px 0">1. Хичээл сонгох</p>
        <p style="color:#8a9ab5;margin:4px 0">2. Task хийж XP цуглуулах</p>
        <p style="color:#8a9ab5;margin:4px 0">3. Leaderboard-д дээшлэх</p>
      </div>
      <a href="${APP_URL}" style="display:inline-block;padding:12px 24px;
        background:transparent;border:2px solid #00e5ff;color:#00e5ff;
        text-decoration:none;font-family:monospace;font-size:12px;letter-spacing:2px">
        ▶ ТОГЛООМ ЭХЛЭХ
      </a>
    </div>
  `
  return sendEmail(email, 'ArenaHub — Тавтай морил!', html)
}
