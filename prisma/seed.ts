import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 12)

  // ── Users ──────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@arenahub.mn' }, update: {},
    create: { username:'ADMIN', email:'admin@arenahub.mn',
      passwordHash: await hash('admin123'), role:'ADMIN', xp:9999, level:99 }
  })
  for (const [i, name] of ['PIXEL_NINJA','DARKCODE_X','BYTE_QUEEN','GLITCH_RIDER'].entries()) {
    await prisma.user.upsert({
      where: { email:`${name.toLowerCase()}@arenahub.mn` }, update: {},
      create: { username:name, email:`${name.toLowerCase()}@arenahub.mn`,
        passwordHash: await hash('student123'), role:'STUDENT',
        xp:(4-i)*800, level:(4-i)*4 }
    })
  }

  console.log('✅ Users seeded')
  console.log('👉 Run: npm run db:roadmap  — to seed courses, lessons & tasks')
}

main().catch(console.error).finally(()=>prisma.$disconnect())
