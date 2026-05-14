import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + 5)

  await prisma.contest.upsert({
    where: { id: 'contest-seed-001' },
    update: {
      endDate: end,
      status: 'ACTIVE',
    },
    create: {
      id:           'contest-seed-001',
      title:        'JavaScript Algorithm Challenge #12',
      description:  'Array manipulation · Sorting · Recursive functions',
      startDate:    now,
      endDate:      end,
      entryFree:    10000,
      entryPro:     3000,
      entryVip:     0,
      taskCount:    5,
      prizeFirst:   200000,
      prizeSecond:  150000,
      prizeThird:   120000,
      status:       'ACTIVE',
    }
  })

  console.log('✅ Contest seeded!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
