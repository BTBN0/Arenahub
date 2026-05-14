import { NextRequest } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { ok, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

type AchDef = {
  title: string; icon: string; description: string; condition: string
  type: string; rarity: string; xpReward: number; rewardType: string; rewardAmount: number
}

const ACHIEVEMENTS: AchDef[] = [
  /* ── HTML ── */
  { title:'HTML Beginner',     icon:'🌐', rarity:'COMMON', type:'SKILL_BASED',       xpReward:10,  rewardType:'TOKEN',  rewardAmount:2,   condition:'htmlTasks >= 1',         description:'Эхний HTML task-аа шийдлээ!' },
  { title:'Structure Builder', icon:'🏗', rarity:'RARE',   type:'SKILL_BASED',       xpReward:30,  rewardType:'BADGE',  rewardAmount:0,   condition:'htmlTasks >= 10',        description:'10 HTML task алдаагүй шийдлээ!' },
  { title:'HTML Master',       icon:'📄', rarity:'EPIC',   type:'SKILL_BASED',       xpReward:100, rewardType:'TOKEN',  rewardAmount:10,  condition:'htmlLessons >= 3',       description:'HTML хичээлийг бүрэн дуусгасан мастер!' },

  /* ── CSS ── */
  { title:'Style Starter',     icon:'🎨', rarity:'COMMON', type:'SKILL_BASED',       xpReward:10,  rewardType:'XP',     rewardAmount:0,   condition:'cssTasks >= 1',          description:'Эхний CSS task-аа шийдлээ!' },
  { title:'Pixel Designer',    icon:'🖼', rarity:'RARE',   type:'SKILL_BASED',       xpReward:50,  rewardType:'BADGE',  rewardAmount:0,   condition:'cssTasks >= 5',          description:'5 layout task шийдсэн дизайнер!' },
  { title:'CSS Artist',        icon:'✨', rarity:'EPIC',   type:'SKILL_BASED',       xpReward:120, rewardType:'TOKEN',  rewardAmount:15,  condition:'cssLessons >= 3',        description:'CSS lesson бүрэн дуусгасан уран бүтээлч!' },

  /* ── JavaScript ── */
  { title:'JS Fighter',        icon:'⚔', rarity:'RARE',   type:'SKILL_BASED',       xpReward:70,  rewardType:'TOKEN',  rewardAmount:5,   condition:'jsTasks >= 20',          description:'20 JavaScript task шийдсэн тэмцэгч!' },
  { title:'Logic Master',      icon:'🧠', rarity:'RARE',   type:'PERFORMANCE_BASED', xpReward:100, rewardType:'BADGE',  rewardAmount:0,   condition:'jsTasks >= 10',          description:'10 JS task дараалж алдаагүй шийдлээ!' },
  { title:'JS Warrior',        icon:'🗡', rarity:'EPIC',   type:'SKILL_BASED',       xpReward:200, rewardType:'TOKEN',  rewardAmount:20,  condition:'jsLessons >= 3',         description:'JavaScript lesson бүрэн дуусгасан дайчин!' },

  /* ── React ── */
  { title:'Component Maker',   icon:'⚛', rarity:'COMMON', type:'SKILL_BASED',       xpReward:30,  rewardType:'XP',     rewardAmount:0,   condition:'reactTasks >= 1',        description:'Эхний React component үүсгэлээ!' },
  { title:'State Controller',  icon:'🎛', rarity:'RARE',   type:'SKILL_BASED',       xpReward:100, rewardType:'TOKEN',  rewardAmount:10,  condition:'reactTasks >= 15',       description:'15 React task шийдсэн state мастер!' },
  { title:'React Architect',   icon:'🏛', rarity:'EPIC',   type:'SKILL_BASED',       xpReward:250, rewardType:'BADGE',  rewardAmount:0,   condition:'reactLessons >= 3',      description:'React course бүрэн дуусгасан архитект!' },

  /* ── Backend ── */
  { title:'API Builder',       icon:'🔌', rarity:'COMMON', type:'SKILL_BASED',       xpReward:40,  rewardType:'XP',     rewardAmount:0,   condition:'backendTasks >= 1',      description:'Анхны API task шийдлээ!' },
  { title:'Server Engineer',   icon:'🖥', rarity:'RARE',   type:'SKILL_BASED',       xpReward:150, rewardType:'TOKEN',  rewardAmount:15,  condition:'backendTasks >= 20',     description:'20 backend task шийдсэн инженер!' },
  { title:'Backend King',      icon:'👑', rarity:'EPIC',   type:'SKILL_BASED',       xpReward:300, rewardType:'BADGE',  rewardAmount:0,   condition:'backendLessons >= 3',    description:'Backend lesson бүрэн дуусгасан хаан!' },

  /* ── Database ── */
  { title:'Data Keeper',       icon:'🗄', rarity:'COMMON', type:'SKILL_BASED',       xpReward:50,  rewardType:'XP',     rewardAmount:0,   condition:'dbTasks >= 1',           description:'Эхний database query шийдлээ!' },
  { title:'Query Runner',      icon:'⚡', rarity:'RARE',   type:'SKILL_BASED',       xpReward:120, rewardType:'TOKEN',  rewardAmount:10,  condition:'dbTasks >= 15',          description:'15 database task шийдсэн query runner!' },
  { title:'Database Legend',   icon:'💎', rarity:'EPIC',   type:'SKILL_BASED',       xpReward:350, rewardType:'BADGE',  rewardAmount:0,   condition:'dbLessons >= 3',         description:'Database lesson бүрэн дуусгасан legend!' },

  /* ── Performance ── */
  { title:'Speed Runner',      icon:'🏃', rarity:'RARE',   type:'PERFORMANCE_BASED', xpReward:20,  rewardType:'TOKEN',  rewardAmount:2,   condition:'passedTasks >= 5',       description:'Task-ийг хурдан шийдэж чадсан!' },
  { title:'Perfect Run',       icon:'🎯', rarity:'RARE',   type:'PERFORMANCE_BASED', xpReward:80,  rewardType:'BADGE',  rewardAmount:0,   condition:'passedTasks >= 5 && !hintUsed', description:'5 task алдаагүй дараалж шийдлээ!' },
  { title:'Unstoppable',       icon:'🔥', rarity:'EPIC',   type:'PERFORMANCE_BASED', xpReward:200, rewardType:'BADGE',  rewardAmount:0,   condition:'passedTasks >= 20',      description:'20 task дараалж шийдсэн зогшошгүй тэмцэгч!' },

  /* ── AI / Hint ── */
  { title:'Self Thinker',      icon:'💡', rarity:'RARE',   type:'BEHAVIOR_BASED',    xpReward:100, rewardType:'TOKEN',  rewardAmount:15,  condition:'passedTasks >= 15 && !hintUsed', description:'15 task hint ашиглахгүй шийдлээ!' },
  { title:'AI Explorer',       icon:'🤖', rarity:'RARE',   type:'BEHAVIOR_BASED',    xpReward:50,  rewardType:'XP',     rewardAmount:0,   condition:'aiUsage >= 10',          description:'AI-г 10 удаа ашиглав!' },

  /* ── Streak ── */
  { title:'3 Day Streak',      icon:'🔥', rarity:'COMMON', type:'BEHAVIOR_BASED',    xpReward:0,   rewardType:'TOKEN',  rewardAmount:5,   condition:'streakDays >= 3',        description:'3 өдөр дараалан active байлаа!' },
  { title:'Weekly Grind',      icon:'📅', rarity:'RARE',   type:'BEHAVIOR_BASED',    xpReward:100, rewardType:'BADGE',  rewardAmount:0,   condition:'streakDays >= 7',        description:'7 өдөр дараалан хичээллэсэн!' },
  { title:'Monthly Legend',    icon:'🌟', rarity:'EPIC',   type:'BEHAVIOR_BASED',    xpReward:500, rewardType:'TOKEN',  rewardAmount:50,  condition:'streakDays >= 30',       description:'30 өдрийн тасралтгүй streak! Гайхалтай!' },

  /* ── Progression ── */
  { title:'First Step',        icon:'👣', rarity:'COMMON', type:'PROGRESSION_BASED', xpReward:10,  rewardType:'XP',     rewardAmount:0,   condition:'passedTasks >= 1',       description:'Анхны task-аа шийдлээ!' },
  { title:'Getting Started',   icon:'🚀', rarity:'COMMON', type:'PROGRESSION_BASED', xpReward:20,  rewardType:'XP',     rewardAmount:0,   condition:'completedLessons >= 1',  description:'Анхны хичээлээ дуусгалаа!' },
  { title:'Task Hunter',       icon:'🎯', rarity:'RARE',   type:'PROGRESSION_BASED', xpReward:50,  rewardType:'TOKEN',  rewardAmount:5,   condition:'passedTasks >= 10',      description:'10 task шийдсэн анчин!' },
  { title:'Elite Coder',       icon:'⭐', rarity:'EPIC',   type:'PROGRESSION_BASED', xpReward:300, rewardType:'TOKEN',  rewardAmount:30,  condition:'level >= 10',            description:'Level 10-т хүрсэн элит кодер!' },
  { title:'XP Master',         icon:'💠', rarity:'EPIC',   type:'PROGRESSION_BASED', xpReward:200, rewardType:'COIN',   rewardAmount:200, condition:'totalXp >= 2000',        description:'2000 XP цуглуулсан мастер!' },

  /* ── Leaderboard ── */
  { title:'Top 100',           icon:'🥉', rarity:'COMMON', type:'PROGRESSION_BASED', xpReward:0,   rewardType:'BADGE',  rewardAmount:0,   condition:'passedTasks >= 15',      description:'Leaderboard-т орсон!' },
  { title:'Top 10',            icon:'🥈', rarity:'RARE',   type:'PROGRESSION_BASED', xpReward:0,   rewardType:'TOKEN',  rewardAmount:200, condition:'passedTasks >= 50',      description:'Leaderboard top 10-д орлоо!' },
  { title:'Arena Champion',    icon:'🏆', rarity:'EPIC',   type:'PROGRESSION_BASED', xpReward:1000,rewardType:'TOKEN',  rewardAmount:500, condition:'passedTasks >= 100',     description:'Leaderboard #1! Тэнгэрт хүрсэн Arena Champion!' },
]

export async function POST(req: NextRequest) {
  try {
    requirePermission(req, 'content.achievement')

    let created = 0
    let skipped = 0

    for (const a of ACHIEVEMENTS) {
      const exists = await prisma.achievement.findFirst({ where: { title: a.title } })
      if (exists) { skipped++; continue }

      await prisma.$executeRaw`
        INSERT INTO achievements (id, title, description, icon, "xpReward", condition, type, rarity, "rewardType", "rewardAmount", "createdAt")
        VALUES (
          gen_random_uuid(), ${a.title}, ${a.description}, ${a.icon},
          ${a.xpReward}, ${a.condition}, ${a.type}, ${a.rarity},
          ${a.rewardType}, ${a.rewardAmount}, NOW()
        )
      `
      created++
    }

    return ok({ message: `✓ ${created} achievement үүсгэгдлээ, ${skipped} аль байсан.`, created, skipped })
  } catch(e) { return handleError(e) }
}