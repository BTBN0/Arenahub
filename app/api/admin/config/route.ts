import { NextRequest } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { ok, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

const DEFAULT_AI_PROMPT = `Та ArenaHub онлайн IT сургалтын платформын AI туслагч байна.

## USER MODE (default)
- ШУУД ШИЙДЭЛ ӨГӨХГҮЙ — алхам алхмаар бодоход тусална
- Бүрэн код бичиж өгөхгүй, оронд нь псевдокод эсвэл hint өгнө
- Сократийн аргаар асуулт асуун бодоход хөтөлнө
- Монгол хэлээр тайлбарлана

## ADMIN MODE (admin keyword detected)
- Admin үйлдлийн тайлбар товч хийнэ
- Системийн мэдээллийг тодорхой тайлбарлана`

export async function GET(req: NextRequest) {
  try {
    requirePermission(req, 'system.settings')
    const rows = await prisma.$queryRaw<{ key: string; value: string }[]>`
      SELECT key, value FROM system_configs
    `
    const config: Record<string, string> = {}
    for (const r of rows) config[r.key] = r.value

    return ok({
      maintenanceMode: config['maintenance_mode'] === 'true',
      aiPrompt:        config['ai_prompt'] ?? DEFAULT_AI_PROMPT,
      tokenXpRate:     config['token_xp_rate'] ?? '10',
      tokenCoinRate:   config['token_coin_rate'] ?? '5',
    })
  } catch (e) { return handleError(e) }
}

export async function PUT(req: NextRequest) {
  try {
    const admin  = requirePermission(req, 'system.settings')
    const body   = await req.json()
    const allowed = ['maintenance_mode', 'ai_prompt', 'token_xp_rate', 'token_coin_rate']

    for (const [key, val] of Object.entries(body)) {
      if (!allowed.includes(key)) continue
      const value = String(val)
      await prisma.$executeRaw`
        INSERT INTO system_configs (key, value, "updatedAt", "updatedBy")
        VALUES (${key}, ${value}, NOW(), ${admin.id})
        ON CONFLICT (key) DO UPDATE SET value = ${value}, "updatedAt" = NOW(), "updatedBy" = ${admin.id}
      `
    }

    await prisma.adminLog.create({
      data: { adminId: admin.id, action: 'SYSTEM_CONFIG_UPDATE', details: body as object }
    })

    return ok({ message: 'Тохиргоо хадгалагдлаа' })
  } catch (e) { return handleError(e) }
}
