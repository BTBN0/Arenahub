/// <reference types="node" />
import { PrismaClient } from '@prisma/client'
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

const prisma    = new PrismaClient()
const scryptAsync = promisify(scrypt)

async function main() {
  const hash = async (pw: string) => {
    const salt = randomBytes(16).toString('hex')
    const buf  = (await scryptAsync(pw, salt, 64)) as Buffer
    return `${buf.toString('hex')}.${salt}`
  }

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
