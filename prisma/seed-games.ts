import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_GAMES = [
  {
    name:        'City Builder',
    slug:        'city-builder',
    gameType:    'city',
    description: 'Build a pixel city by answering quiz questions correctly',
    thumbnail:   null,
    hpMax:       3,
    xpReward:    50,
    config: {
      bgColor:       '#1a1a2e',
      groundColor:   '#16213e',
      particleColor: '#ffe600',
    },
  },
  {
    name:        'Island Adventure',
    slug:        'island-adventure',
    gameType:    'island',
    description: 'Grow your island empire with each correct answer',
    thumbnail:   null,
    hpMax:       3,
    xpReward:    50,
    config: {
      bgColor:       '#0d1b2a',
      waterColor:    '#1e90ff',
      particleColor: '#00e5ff',
    },
  },
  {
    name:        'Castle Defense',
    slug:        'castle-defense',
    gameType:    'castle',
    description: 'Defend your castle walls through code knowledge',
    thumbnail:   null,
    hpMax:       3,
    xpReward:    60,
    config: {
      bgColor:       '#1a0a2e',
      wallColor:     '#8b6914',
      particleColor: '#ff6b35',
    },
  },
  {
    name:        'Kingdom',
    slug:        'kingdom',
    gameType:    'kingdom',
    description: 'Expand your kingdom by mastering programming concepts',
    thumbnail:   null,
    hpMax:       4,
    xpReward:    75,
    config: {
      bgColor:       '#0a1628',
      particleColor: '#ffd700',
    },
  },
  {
    name:        'Time Machine',
    slug:        'time-machine',
    gameType:    'timemachine',
    description: 'Travel through time by solving advanced challenges',
    thumbnail:   null,
    hpMax:       3,
    xpReward:    80,
    config: {
      bgColor:       '#0d0d1a',
      particleColor: '#00ffff',
    },
  },
  {
    name:        'Mega City',
    slug:        'mega-city',
    gameType:    'megacity',
    description: 'Construct the ultimate mega city through expert knowledge',
    thumbnail:   null,
    hpMax:       5,
    xpReward:    100,
    config: {
      bgColor:       '#050510',
      particleColor: '#ff00ff',
    },
  },
  {
    name:        'Enemy Raid',
    slug:        'enemy-raid',
    gameType:    'enemy',
    description: 'Defeat waves of enemies by answering correctly',
    thumbnail:   null,
    hpMax:       3,
    xpReward:    60,
    config: {
      bgColor:       '#1a0000',
      particleColor: '#ff3333',
    },
  },
  {
    name:        'Quiz Arena',
    slug:        'quiz-arena',
    gameType:    'quiz',
    description: 'Classic quiz mode — no canvas game, pure knowledge test',
    thumbnail:   null,
    hpMax:       3,
    xpReward:    30,
    config: {},
  },
  {
    name:        'Code Editor',
    slug:        'code-editor',
    gameType:    'code',
    description: 'Write real code to pass test cases',
    thumbnail:   null,
    hpMax:       3,
    xpReward:    40,
    config: {
      language: 'javascript',
    },
  },
]

async function main() {
  console.log('🎮 Seeding default games...')

  for (const g of DEFAULT_GAMES) {
    await prisma.game.upsert({
      where:  { slug: g.slug },
      update: {
        name:        g.name,
        gameType:    g.gameType,
        description: g.description,
        hpMax:       g.hpMax,
        xpReward:    g.xpReward,
        config:      g.config,
        isActive:    true,
      },
      create: {
        name:        g.name,
        slug:        g.slug,
        gameType:    g.gameType,
        description: g.description,
        thumbnail:   g.thumbnail,
        hpMax:       g.hpMax,
        xpReward:    g.xpReward,
        config:      g.config,
        isActive:    true,
      },
    })
    console.log(`  ✅ ${g.name} (${g.gameType})`)
  }

  const count = await prisma.game.count()
  console.log(`\n🎮 Total games in DB: ${count}`)

  // ── Backfill LessonGame from Lesson.gameType ─────────────────
  // For each lesson that has a gameType set, find the matching Game
  // and create a LessonGame entry if one doesn't exist yet.
  console.log('\n🔗 Backfilling LessonGame from existing Lesson.gameType...')

  const lessons = await prisma.lesson.findMany({
    where: { gameType: { not: null } },
    select: { id: true, title: true, gameType: true },
  })

  let linked = 0
  let skipped = 0

  for (const lesson of lessons) {
    if (!lesson.gameType) continue

    const game = await prisma.game.findFirst({
      where: { gameType: lesson.gameType, isActive: true },
    })

    if (!game) {
      console.log(`  ⚠️  No game found for gameType="${lesson.gameType}" (lesson: ${lesson.title})`)
      skipped++
      continue
    }

    const existing = await prisma.lessonGame.findUnique({
      where: { lessonId_gameId: { lessonId: lesson.id, gameId: game.id } },
    })

    if (existing) {
      skipped++
      continue
    }

    await prisma.lessonGame.create({
      data: { lessonId: lesson.id, gameId: game.id, orderIndex: 0 },
    })
    linked++
    console.log(`  🔗 ${lesson.title} → ${game.name}`)
  }

  console.log(`\n✅ Linked: ${linked}, Skipped/no-match: ${skipped}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
