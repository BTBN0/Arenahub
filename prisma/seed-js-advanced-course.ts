/**
 * Seed: JavaScript – Advanced Game Logic (Course 4)
 * Run: npx tsx prisma/seed-js-advanced-course.ts
 *
 * Creates/upserts Course 4 (JS_ADV) with 7 lessons × 5 tasks.
 * testCases format: { mode: "js", checks: JsRule[] }
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type JsRule = {
  type: 'hasKeyword' | 'hasText' | 'hasPattern' | 'hasCount'
  keyword?: string
  text?: string
  count?: number
  pattern?: string
  hint: string
}

function jsMeta(checks: JsRule[]) {
  return JSON.parse(JSON.stringify({ mode: 'js', checks }))
}

// ── Lesson data ─────────────────────────────────────────────────────────
const LESSONS = [

  // ══════════════════════════════════════════════════
  // LESSON 1: OBJECT – PLAYER / ENEMY
  // ══════════════════════════════════════════════════
  {
    title: 'Объект – Player / Enemy',
    description: 'JavaScript объект үүсгэх, өөрчлөх, нэгтгэх',
    orderIndex: 1,
    xpReward: 60,
    tasks: [
      {
        title: 'Player объект үүсгэх',
        description: `player нэртэй объект үүсгэж дараах шинж чанаруудыг нэмнэ үү:
- name: "Hero"
- hp: 100
- score: 0

Дараа нь console.log(player) хийнэ үү.

Жишээ:
const player = {
  name: "Hero",
  hp: 100,
  score: 0
}
console.log(player)

Тайлбар:
- Объект нь {} хашилтаар үүсгэгдэнэ
- key: value хэлбэрээр бичнэ
- console.log(player) нь бүх объектыг харуулна`,
        starterCode: `// player объект үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'player',  hint: 'player нэртэй хувьсагч үүсгэ' },
          { type: 'hasPattern', pattern: '\\{',  hint: 'Объектыг {} ашиглан үүсгэ' },
          { type: 'hasText',    text: 'name',    hint: 'name шинж чанар нэмэ' },
          { type: 'hasText',    text: 'hp',      hint: 'hp шинж чанар нэмэ' },
          { type: 'hasText',    text: 'score',   hint: 'score шинж чанар нэмэ' },
          { type: 'hasText',    text: 'console.log', hint: 'console.log(player) ашиглан харуул' },
        ] as JsRule[],
      },
      {
        title: 'Enemy объект үүсгэх',
        description: `enemy нэртэй объект үүсгэж дараах шинж чанаруудыг нэмнэ үү:
- type: "Dragon"
- damage: 25
- hp: 200

Дараа нь console.log(enemy) хийнэ үү.

Жишээ:
const enemy = {
  type: "Dragon",
  damage: 25,
  hp: 200
}
console.log(enemy)`,
        starterCode: `// enemy объект үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'enemy',   hint: 'enemy нэртэй хувьсагч үүсгэ' },
          { type: 'hasPattern', pattern: '\\{',  hint: 'Объектыг {} ашиглан үүсгэ' },
          { type: 'hasText',    text: 'type',    hint: 'type шинж чанар нэмэ' },
          { type: 'hasText',    text: 'damage',  hint: 'damage шинж чанар нэмэ' },
          { type: 'hasText',    text: 'hp',      hint: 'hp шинж чанар нэмэ' },
          { type: 'hasText',    text: 'console.log', hint: 'console.log(enemy) ашиглан харуул' },
        ] as JsRule[],
      },
      {
        title: 'Объектын утга унших',
        description: `player болон enemy объект үүсгэж дараахыг console.log хийнэ үү:
1. player.name
2. player.hp
3. enemy.type
4. enemy.damage

Жишээ:
const player = { name: "Hero", hp: 100, score: 0 }
const enemy  = { type: "Dragon", damage: 25, hp: 200 }

console.log("Player:", player.name)
console.log("HP:", player.hp)
console.log("Enemy:", enemy.type)
console.log("Damage:", enemy.damage)`,
        starterCode: `// player болон enemy үүсгэж утгыг харуулна уу
`,
        checks: [
          { type: 'hasText',    text: 'player.name',   hint: 'player.name ашигла' },
          { type: 'hasText',    text: 'player.hp',     hint: 'player.hp ашигла' },
          { type: 'hasText',    text: 'enemy.type',    hint: 'enemy.type ашигла' },
          { type: 'hasText',    text: 'enemy.damage',  hint: 'enemy.damage ашигла' },
          { type: 'hasCount',   text: 'console.log', count: 4, hint: 'console.log-ийг 4 удаа ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Объектын утга өөрчлөх',
        description: `enemy объект үүсгэнэ үү.
Дараа нь enemy.hp-г 10-аар бууруулна уу.
Өмнөх болон дараах hp-г log хийнэ үү.

Жишээ:
const enemy = { type: "Dragon", damage: 25, hp: 200 }
console.log("Before:", enemy.hp)

enemy.hp -= 10

console.log("After:", enemy.hp)`,
        starterCode: `// enemy объект үүсгэж hp-г бууруулна уу
`,
        checks: [
          { type: 'hasText',    text: 'enemy',              hint: 'enemy объект үүсгэ' },
          { type: 'hasText',    text: 'enemy.hp',           hint: 'enemy.hp ашигла' },
          { type: 'hasPattern', pattern: 'enemy\\.hp\\s*-=|enemy\\.hp\\s*=.*enemy\\.hp\\s*-',
                                hint: 'enemy.hp -= 10 гэж бууруул' },
          { type: 'hasCount',   text: 'console.log', count: 2, hint: 'Өмнө болон дараах hp-г log хий' },
        ] as JsRule[],
      },
      {
        title: 'Объектуудыг нэгтгэх',
        description: `player болон enemy объект үүсгэж,
тэдгээрийг агуулсан game объект үүсгэнэ үү.

Жишээ:
const player = { name: "Hero", hp: 100, score: 0 }
const enemy  = { type: "Dragon", damage: 25, hp: 200 }

const game = {
  player: player,
  enemy:  enemy,
  round:  1
}

console.log("Game round:", game.round)
console.log("Player HP:", game.player.hp)
console.log("Enemy HP:", game.enemy.hp)`,
        starterCode: `// player, enemy, game объектуудыг үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'player',       hint: 'player объект үүсгэ' },
          { type: 'hasText',    text: 'enemy',        hint: 'enemy объект үүсгэ' },
          { type: 'hasText',    text: 'game',         hint: 'game объект үүсгэ' },
          { type: 'hasText',    text: 'game.player',  hint: 'game.player ашигла' },
          { type: 'hasText',    text: 'game.enemy',   hint: 'game.enemy ашигла' },
          { type: 'hasText',    text: 'console.log',  hint: 'console.log ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 2: ARRAY – MULTIPLE ENEMIES
  // ══════════════════════════════════════════════════
  {
    title: 'Массив – Олон дайсан (Array)',
    description: 'Массив үүсгэх, нэмэх, давтах',
    orderIndex: 2,
    xpReward: 60,
    tasks: [
      {
        title: 'Дайсны массив үүсгэх',
        description: `enemies нэртэй хоосон массив үүсгэнэ үү.
Дараа нь console.log(enemies) болон console.log(enemies.length) хийнэ үү.

Жишээ:
const enemies = []
console.log(enemies)
console.log("Count:", enemies.length)

Тайлбар:
- [] нь хоосон массив
- .length нь элементийн тоог буцаана`,
        starterCode: `// enemies хоосон массив үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'enemies',        hint: 'enemies нэртэй хувьсагч үүсгэ' },
          { type: 'hasPattern', pattern: '\\[\\s*\\]',  hint: '[] хоосон массив үүсгэ' },
          { type: 'hasText',    text: '.length',        hint: '.length ашигла' },
          { type: 'hasText',    text: 'console.log',    hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Массивд 3 дайсан нэмэх',
        description: `enemies массив үүсгэж .push() ашиглан 3 дайсны объект нэмнэ үү.
Бүр дайсанд name болон hp шинж чанар байх ёстой.
Эцэст нь enemies-ийг log хийнэ үү.

Жишээ:
const enemies = []
enemies.push({ name: "Goblin",   hp: 50  })
enemies.push({ name: "Orc",      hp: 100 })
enemies.push({ name: "Dragon",   hp: 200 })
console.log(enemies)
console.log("Total:", enemies.length)`,
        starterCode: `// enemies массивд 3 объект нэмнэ үү
`,
        checks: [
          { type: 'hasText',  text: 'enemies',         hint: 'enemies массив үүсгэ' },
          { type: 'hasCount', text: '.push(',  count: 3, hint: '.push()-ийг 3 удаа ашигла' },
          { type: 'hasText',  text: 'name',             hint: 'name шинж чанар нэмэ' },
          { type: 'hasText',  text: 'hp',               hint: 'hp шинж чанар нэмэ' },
          { type: 'hasText',  text: 'console.log',      hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Массивыг давтах',
        description: `enemies массив үүсгэж 3 дайсан нэмнэ үү.
for давталт ашиглан бүр дайсны нэрийг log хийнэ үү.

Жишээ:
const enemies = [
  { name: "Goblin",  hp: 50  },
  { name: "Orc",     hp: 100 },
  { name: "Dragon",  hp: 200 },
]
for (let i = 0; i < enemies.length; i++) {
  console.log("Enemy:", enemies[i].name)
}`,
        starterCode: `// enemies массивыг for давталтаар давтана уу
`,
        checks: [
          { type: 'hasText',    text: 'enemies',      hint: 'enemies массив үүсгэ' },
          { type: 'hasKeyword', keyword: 'for',        hint: 'for давталт ашигла' },
          { type: 'hasText',    text: '.length',       hint: '.length ашигла' },
          { type: 'hasText',    text: 'console.log',   hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Бүр дайсны HP унших',
        description: `enemies массив үүсгэж for давталтаар бүр дайсны name болон hp-г log хийнэ үү.

Жишээ:
const enemies = [
  { name: "Goblin", hp: 50  },
  { name: "Orc",    hp: 100 },
  { name: "Dragon", hp: 200 },
]
for (let i = 0; i < enemies.length; i++) {
  console.log(enemies[i].name + " HP: " + enemies[i].hp)
}`,
        starterCode: `// for давталтаар бүр дайсны name болон hp харуулна уу
`,
        checks: [
          { type: 'hasText',    text: 'enemies',       hint: 'enemies массив үүсгэ' },
          { type: 'hasKeyword', keyword: 'for',         hint: 'for давталт ашигла' },
          { type: 'hasPattern', pattern: 'enemies\\[i\\]\\.name',
                                hint: 'enemies[i].name ашигла' },
          { type: 'hasPattern', pattern: 'enemies\\[i\\]\\.hp',
                                hint: 'enemies[i].hp ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Массивын утга өөрчлөх',
        description: `enemies массив үүсгэж for давталтаар бүр дайсны hp-г 10-аар бууруулна уу.
Өмнө болон дараа нь hp-г log хийнэ үү.

Жишээ:
const enemies = [
  { name: "Goblin", hp: 50  },
  { name: "Orc",    hp: 100 },
  { name: "Dragon", hp: 200 },
]
for (let i = 0; i < enemies.length; i++) {
  console.log("Before:", enemies[i].hp)
  enemies[i].hp -= 10
  console.log("After:", enemies[i].hp)
}`,
        starterCode: `// for давталтаар бүр дайсны hp-г бууруулна уу
`,
        checks: [
          { type: 'hasText',    text: 'enemies',       hint: 'enemies массив үүсгэ' },
          { type: 'hasKeyword', keyword: 'for',         hint: 'for давталт ашигла' },
          { type: 'hasPattern', pattern: 'enemies\\[i\\]\\.hp\\s*-=|enemies\\[i\\]\\.hp\\s*=.*-',
                                hint: 'enemies[i].hp -= 10 гэж бууруул' },
          { type: 'hasCount',   text: 'console.log', count: 2, hint: 'console.log-ийг 2+ удаа ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 3: TIMER + GAME LOOP
  // ══════════════════════════════════════════════════
  {
    title: 'Таймер + Game Loop',
    description: 'setInterval, clearInterval ашиглан game loop үүсгэх',
    orderIndex: 3,
    xpReward: 70,
    tasks: [
      {
        title: 'setInterval ашиглах',
        description: `setInterval ашиглан 1000ms (1 секунд) тутамд
"Tick!" гэж console.log хийнэ үү.

Жишээ:
let count = 0
const timer = setInterval(function() {
  count++
  console.log("Tick!", count)
  if (count >= 3) clearInterval(timer)
}, 1000)

Тайлбар:
- setInterval(функц, ms) нь тогтмол давтана
- clearInterval(timer) нь зогсооно`,
        starterCode: `// setInterval ашиглан 1000ms тутамд log хийнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'setInterval',    hint: 'setInterval ашигла' },
          { type: 'hasPattern', pattern: '1000',        hint: '1000ms (1 секунд) тогтоо' },
          { type: 'hasText',    text: 'console.log',    hint: 'console.log ашигла' },
          { type: 'hasText',    text: 'clearInterval',  hint: 'clearInterval ашиглан зогсоо' },
        ] as JsRule[],
      },
      {
        title: 'Game loop функц',
        description: `gameLoop нэртэй функц үүсгэнэ үү.
Дотор нь round хувьсагч нэмж console.log хийнэ үү.
setInterval ашиглан 500ms тутамд gameLoop-ийг дуудна уу.
3 удаа дуусгаад clearInterval хийнэ үү.

Жишээ:
let round = 0

function gameLoop() {
  round++
  console.log("Round:", round)
  if (round >= 3) clearInterval(timer)
}

const timer = setInterval(gameLoop, 500)`,
        starterCode: `// gameLoop функц болон setInterval үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function',   hint: 'function ашигла' },
          { type: 'hasText',    text: 'gameLoop',      hint: 'gameLoop нэртэй функц үүсгэ' },
          { type: 'hasText',    text: 'setInterval',   hint: 'setInterval ашигла' },
          { type: 'hasText',    text: 'clearInterval', hint: 'clearInterval ашигла' },
          { type: 'hasText',    text: 'console.log',   hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'HP-г цагаар бууруулах',
        description: `hp хувьсагч үүсгэж 100 утга өгнө үү.
setInterval ашиглан 1000ms тутамд hp-г 10-аар бууруулж log хийнэ үү.
hp <= 0 болоход clearInterval хийж "DEAD!" log хийнэ үү.

Жишээ:
let hp = 100
const timer = setInterval(function() {
  hp -= 10
  console.log("HP:", hp)
  if (hp <= 0) {
    clearInterval(timer)
    console.log("DEAD!")
  }
}, 1000)`,
        starterCode: `// hp-г setInterval ашиглан бууруулна уу
`,
        checks: [
          { type: 'hasText',    text: 'hp',             hint: 'hp хувьсагч үүсгэ' },
          { type: 'hasText',    text: 'setInterval',    hint: 'setInterval ашигла' },
          { type: 'hasPattern', pattern: 'hp\\s*-=',    hint: 'hp -= 10 гэж бууруул' },
          { type: 'hasKeyword', keyword: 'if',           hint: 'if нөхцөл ашигла' },
          { type: 'hasText',    text: 'clearInterval',  hint: 'clearInterval ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Interval зогсоох нөхцөл',
        description: `count хувьсагч үүсгэж setInterval дотор нэмнэ үү.
count >= 5 болоход clearInterval хийж "Loop finished!" log хийнэ үү.
Мөн gameOver = true утга өгнө үү.

Жишээ:
let count = 0
let gameOver = false

const timer = setInterval(function() {
  count++
  console.log("Count:", count)
  if (count >= 5) {
    clearInterval(timer)
    gameOver = true
    console.log("Loop finished!")
  }
}, 300)`,
        starterCode: `// count >= 5 болоход clearInterval хийнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'count',          hint: 'count хувьсагч үүсгэ' },
          { type: 'hasText',    text: 'setInterval',    hint: 'setInterval ашигла' },
          { type: 'hasKeyword', keyword: 'if',           hint: 'if нөхцөл ашигла' },
          { type: 'hasText',    text: 'clearInterval',  hint: 'clearInterval ашигла' },
          { type: 'hasText',    text: 'gameOver',       hint: 'gameOver хувьсагч ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Game state loop шинэчлэх',
        description: `score болон hp хувьсагч үүсгэнэ үү.
setInterval дотор score+10, hp-5 хийж аль нэг нөхцөл биелэхэд зогсооно уу:
- hp <= 0 → "DEAD!" log + clearInterval
- score >= 50 → "WIN!" log + clearInterval

Жишээ:
let score = 0
let hp = 100

const timer = setInterval(function() {
  score += 10
  hp -= 5
  console.log("Score:", score, "| HP:", hp)
  if (hp <= 0) { clearInterval(timer); console.log("DEAD!") }
  if (score >= 50) { clearInterval(timer); console.log("WIN!") }
}, 300)`,
        starterCode: `// score болон hp-г setInterval ашиглан шинэчилнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'score',          hint: 'score хувьсагч үүсгэ' },
          { type: 'hasText',    text: 'hp',             hint: 'hp хувьсагч үүсгэ' },
          { type: 'hasText',    text: 'setInterval',    hint: 'setInterval ашигла' },
          { type: 'hasCount',   text: 'clearInterval', count: 2, hint: 'clearInterval-ийг 2+ удаа ашигла' },
          { type: 'hasCount',   text: 'console.log', count: 2,   hint: 'console.log-ийг 2+ удаа ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 4: COLLISION – HIT SYSTEM
  // ══════════════════════════════════════════════════
  {
    title: 'Мөргөлдөөн – Hit System',
    description: 'Мөргөлдөөн шалгах, HP бууруулах, game over логик',
    orderIndex: 4,
    xpReward: 70,
    tasks: [
      {
        title: 'Hit функц үүсгэх',
        description: `hit нэртэй функц үүсгэж target болон damage параметр авна уу.
target.hp-г damage-аар бууруулж log хийнэ үү.

Жишээ:
function hit(target, damage) {
  target.hp -= damage
  console.log("Hit! HP remaining:", target.hp)
}

const enemy = { name: "Dragon", hp: 200 }
hit(enemy, 30)
console.log("Enemy HP:", enemy.hp)`,
        starterCode: `// hit(target, damage) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText',    text: 'hit',         hint: 'hit нэртэй функц үүсгэ' },
          { type: 'hasText',    text: 'target',      hint: 'target параметр нэмэ' },
          { type: 'hasText',    text: 'damage',      hint: 'damage параметр нэмэ' },
          { type: 'hasPattern', pattern: 'target\\.hp\\s*-=|target\\.hp\\s*=.*-',
                                hint: 'target.hp -= damage гэж бууруул' },
          { type: 'hasText',    text: 'console.log', hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Мөргөлдөөн шалгах',
        description: `isColliding нэртэй функц үүсгэж playerX, playerY, enemyX, enemyY параметр авна уу.
|playerX - enemyX| < 50 && |playerY - enemyY| < 50 нөхцөл биелэхэд
true буцааж "COLLISION!" log хийнэ үү, эсрэг тохиолдолд false буцаана.
Функцийг 2 удаа дуудаж туршина уу.

Жишээ:
function isColliding(playerX, playerY, enemyX, enemyY) {
  if (Math.abs(playerX - enemyX) < 50 && Math.abs(playerY - enemyY) < 50) {
    console.log("COLLISION!")
    return true
  }
  return false
}
console.log(isColliding(10, 10, 30, 30))
console.log(isColliding(0,  0,  200, 200))`,
        starterCode: `// isColliding(playerX, playerY, enemyX, enemyY) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function',       hint: 'function ашигла' },
          { type: 'hasText',    text: 'isColliding',       hint: 'isColliding нэртэй функц үүсгэ' },
          { type: 'hasKeyword', keyword: 'if',              hint: 'if нөхцөл ашигла' },
          { type: 'hasKeyword', keyword: 'return',          hint: 'return ашигла' },
          { type: 'hasText',    text: 'console.log',       hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Player HP бууруулах',
        description: `player объект болон takeDamage функц үүсгэнэ үү.
takeDamage нь player болон damage параметр авч player.hp-г бууруулна.
hp <= 0 болоход "Player is dead!" log хийнэ үү.
Функцийг 3 удаа дуудна уу.

Жишээ:
const player = { name: "Hero", hp: 100 }

function takeDamage(player, damage) {
  player.hp -= damage
  console.log("Player HP:", player.hp)
  if (player.hp <= 0) {
    console.log("Player is dead!")
  }
}

takeDamage(player, 30)
takeDamage(player, 40)
takeDamage(player, 50)`,
        starterCode: `// takeDamage(player, damage) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'player',           hint: 'player объект үүсгэ' },
          { type: 'hasKeyword', keyword: 'function',       hint: 'function ашигла' },
          { type: 'hasText',    text: 'takeDamage',       hint: 'takeDamage нэртэй функц үүсгэ' },
          { type: 'hasPattern', pattern: 'player\\.hp\\s*-=|player\\.hp\\s*=.*-',
                                hint: 'player.hp бууруул' },
          { type: 'hasKeyword', keyword: 'if',              hint: 'hp <= 0 нөхцөл шалга' },
          { type: 'hasCount',   text: 'takeDamage(', count: 3, hint: 'takeDamage()-ийг 3 удаа дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Enemy hit илрүүлэх',
        description: `playerAttack нэртэй функц үүсгэж player болон enemy параметр авна уу.
player.score-г enemy.damage-аар нэмж enemy.hp-г player.score/10-аар бууруулна уу.
Үр дүнг log хийнэ үү.
Функцийг 3 удаа дуудна уу.

Жишээ:
function playerAttack(player, enemy) {
  player.score += enemy.damage
  enemy.hp -= Math.floor(player.score / 10)
  console.log("Score:", player.score, "| Enemy HP:", enemy.hp)
}

const player = { name: "Hero", score: 0 }
const enemy  = { name: "Dragon", damage: 20, hp: 200 }

playerAttack(player, enemy)
playerAttack(player, enemy)
playerAttack(player, enemy)`,
        starterCode: `// playerAttack(player, enemy) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function',   hint: 'function ашигла' },
          { type: 'hasText',    text: 'playerAttack',  hint: 'playerAttack нэртэй функц үүсгэ' },
          { type: 'hasText',    text: 'player.score',  hint: 'player.score ашигла' },
          { type: 'hasText',    text: 'enemy.hp',      hint: 'enemy.hp ашигла' },
          { type: 'hasCount',   text: 'playerAttack(', count: 3, hint: 'playerAttack()-ийг 3 удаа дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Game over мөргөлдөөнөөр',
        description: `checkGameOver нэртэй функц үүсгэж player параметр авна уу.
player.hp <= 0 бол "GAME OVER! Final score: X" log хийж true буцаана.
Эсрэг тохиолдолд "Still alive! HP: X" log хийж false буцаана.

Жишээ:
function checkGameOver(player) {
  if (player.hp <= 0) {
    console.log("GAME OVER! Final score:", player.score)
    return true
  }
  console.log("Still alive! HP:", player.hp)
  return false
}

const player = { name: "Hero", hp: 0, score: 150 }
console.log(checkGameOver(player))`,
        starterCode: `// checkGameOver(player) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function',   hint: 'function ашигла' },
          { type: 'hasText',    text: 'checkGameOver', hint: 'checkGameOver нэртэй функц үүсгэ' },
          { type: 'hasText',    text: 'player.hp',     hint: 'player.hp шалга' },
          { type: 'hasKeyword', keyword: 'if',          hint: 'if нөхцөл ашигла' },
          { type: 'hasKeyword', keyword: 'return',      hint: 'return ашигла' },
          { type: 'hasText',    text: 'console.log',   hint: 'console.log ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 5: RANDOM SYSTEM
  // ══════════════════════════════════════════════════
  {
    title: 'Санамсаргүй систем (Random)',
    description: 'Math.random ашиглан санамсаргүй тоо, дайсан, үйл явдал үүсгэх',
    orderIndex: 5,
    xpReward: 70,
    tasks: [
      {
        title: 'Math.random ашиглах',
        description: `Math.random() ашиглан 3 удаа санамсаргүй тоо үүсгэж log хийнэ үү.
Мөн 1-10 хооронд бүхэл тоо гаргана уу.

Жишээ:
console.log(Math.random())
console.log(Math.random())
console.log(Math.random())

// 1-10 бүхэл тоо
const num = Math.floor(Math.random() * 10) + 1
console.log("Random 1-10:", num)

Тайлбар:
- Math.random() нь 0-1 хооронд float буцаана
- Math.floor() нь доошоо бүхэлчилнэ`,
        starterCode: `// Math.random ашиглан санамсаргүй тоо үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',  text: 'Math.random',       hint: 'Math.random() ашигла' },
          { type: 'hasText',  text: 'Math.floor',        hint: 'Math.floor() ашигла' },
          { type: 'hasCount', text: 'Math.random()', count: 3, hint: 'Math.random()-ийг 3+ удаа ашигла' },
          { type: 'hasText',  text: 'console.log',       hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Санамсаргүй дайсан гаргах',
        description: `ENEMY_TYPES массив үүсгэж ["Goblin", "Orc", "Dragon", "Troll"] гэж нэр нэмнэ үү.
spawnEnemy функц үүсгэж санамсаргүй нэр болон 50-200 хооронд hp тогтоогоод объект буцаана уу.
Функцийг 3 удаа дуудаж log хийнэ үү.

Жишээ:
const ENEMY_TYPES = ["Goblin", "Orc", "Dragon", "Troll"]

function spawnEnemy() {
  const name = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)]
  const hp   = Math.floor(Math.random() * 151) + 50  // 50-200
  return { name, hp }
}

console.log(spawnEnemy())
console.log(spawnEnemy())
console.log(spawnEnemy())`,
        starterCode: `// spawnEnemy() функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'ENEMY_TYPES',    hint: 'ENEMY_TYPES массив үүсгэ' },
          { type: 'hasKeyword', keyword: 'function',     hint: 'function ашигла' },
          { type: 'hasText',    text: 'spawnEnemy',      hint: 'spawnEnemy нэртэй функц үүсгэ' },
          { type: 'hasText',    text: 'Math.random',     hint: 'Math.random ашигла' },
          { type: 'hasKeyword', keyword: 'return',        hint: 'return ашиглан объект буцаа' },
          { type: 'hasCount',   text: 'spawnEnemy()', count: 3, hint: 'spawnEnemy()-ийг 3 удаа дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Санамсаргүй хохирол',
        description: `randomDamage нэртэй функц үүсгэж min болон max параметр авна уу.
min-max хооронд санамсаргүй бүхэл тоо буцааж "Damage: X" log хийнэ үү.
Функцийг (10, 50) болон (5, 30) утгаар дуудна уу.

Жишээ:
function randomDamage(min, max) {
  const dmg = Math.floor(Math.random() * (max - min + 1)) + min
  console.log("Damage:", dmg)
  return dmg
}

randomDamage(10, 50)
randomDamage(5,  30)`,
        starterCode: `// randomDamage(min, max) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function',      hint: 'function ашигла' },
          { type: 'hasText',    text: 'randomDamage',     hint: 'randomDamage нэртэй функц үүсгэ' },
          { type: 'hasText',    text: 'Math.random',      hint: 'Math.random ашигла' },
          { type: 'hasText',    text: 'Math.floor',       hint: 'Math.floor ашигла' },
          { type: 'hasKeyword', keyword: 'return',         hint: 'return ашигла' },
          { type: 'hasCount',   text: 'randomDamage(', count: 2, hint: 'randomDamage()-ийг 2 удаа дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Санамсаргүй байрлал',
        description: `randomPosition нэртэй функц үүсгэж width болон height параметр авна уу.
{x: ..., y: ...} объект буцааж log хийнэ үү.
Функцийг (800, 600) утгаар 3 удаа дуудна уу.

Жишээ:
function randomPosition(width, height) {
  return {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height)
  }
}

console.log(randomPosition(800, 600))
console.log(randomPosition(800, 600))
console.log(randomPosition(800, 600))`,
        starterCode: `// randomPosition(width, height) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function',       hint: 'function ашигла' },
          { type: 'hasText',    text: 'randomPosition',    hint: 'randomPosition нэртэй функц үүсгэ' },
          { type: 'hasText',    text: 'Math.random',       hint: 'Math.random ашигла' },
          { type: 'hasText',    text: 'x',                 hint: 'x шинж чанар нэмэ' },
          { type: 'hasText',    text: 'y',                 hint: 'y шинж чанар нэмэ' },
          { type: 'hasCount',   text: 'randomPosition(', count: 3, hint: '3 удаа дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Санамсаргүй үйл явдал',
        description: `GAME_EVENTS массив үүсгэж 4+ үйл явдал нэмнэ үү.
triggerEvent функц үүсгэж санамсаргүй үйл явдал сонгоод log хийнэ үү.
Функцийг 5 удаа дуудна уу.

Жишээ:
const GAME_EVENTS = [
  "Enemy spawned!",
  "Health potion found!",
  "Level up!",
  "Trap activated!",
  "Boss appearing!",
]

function triggerEvent() {
  const event = GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)]
  console.log("EVENT:", event)
  return event
}

for (let i = 0; i < 5; i++) triggerEvent()`,
        starterCode: `// GAME_EVENTS массив болон triggerEvent() үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'GAME_EVENTS',    hint: 'GAME_EVENTS массив үүсгэ' },
          { type: 'hasKeyword', keyword: 'function',     hint: 'function ашигла' },
          { type: 'hasText',    text: 'triggerEvent',    hint: 'triggerEvent нэртэй функц үүсгэ' },
          { type: 'hasText',    text: 'Math.random',     hint: 'Math.random ашигла' },
          { type: 'hasText',    text: 'console.log',     hint: 'console.log ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 6: GAME STATE
  // ══════════════════════════════════════════════════
  {
    title: 'Тоглоомын төлөв (Game State)',
    description: 'gameState хувьсагч ашиглан тоглоомын төлвийг удирдах',
    orderIndex: 6,
    xpReward: 80,
    tasks: [
      {
        title: 'gameState хувьсагч',
        description: `gameState нэртэй хувьсагч үүсгэж "idle" анхны утга өгнө үү.
console.log("State:", gameState) хийнэ үү.
Мөн score болон hp хувьсагч үүсгэж log хийнэ үү.

Жишээ:
let gameState = "idle"
let score = 0
let hp = 100

console.log("State:", gameState)
console.log("Score:", score, "HP:", hp)`,
        starterCode: `// gameState, score, hp хувьсагчдыг үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'gameState',   hint: 'gameState хувьсагч үүсгэ' },
          { type: 'hasKeyword', keyword: 'let',        hint: 'let ашигла' },
          { type: 'hasPattern', pattern: '["\']idle["\']', hint: '"idle" анхны утга өг' },
          { type: 'hasText',    text: 'score',        hint: 'score хувьсагч үүсгэ' },
          { type: 'hasText',    text: 'console.log',  hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: '"playing" төлөв',
        description: `gameState хувьсагч үүсгэж startGame функц дотор "playing" утга өгнө үү.
Мөн score болон hp хувьсагч reset хийнэ үү.
Функцийг дуудна уу.

Жишээ:
let gameState = "idle"
let score = 0
let hp = 100

function startGame() {
  gameState = "playing"
  score = 0
  hp = 100
  console.log("Game started! State:", gameState)
}

startGame()`,
        starterCode: `// startGame() функц болон "playing" төлөв үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'gameState',         hint: 'gameState хувьсагч үүсгэ' },
          { type: 'hasKeyword', keyword: 'function',        hint: 'function ашигла' },
          { type: 'hasText',    text: 'startGame',         hint: 'startGame нэртэй функц үүсгэ' },
          { type: 'hasPattern', pattern: '["\']playing["\']', hint: '"playing" утга өг' },
          { type: 'hasText',    text: 'console.log',       hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: '"gameOver" төлөв',
        description: `gameState болон hp хувьсагч үүсгэнэ үү.
endGame функц үүсгэж gameState = "gameOver" тавьж
"Game Over! Score: X" log хийнэ үү.
hp <= 0 болоход endGame дуудах нөхцөл нэмнэ үү.

Жишээ:
let gameState = "playing"
let hp = 0
let score = 75

function endGame() {
  gameState = "gameOver"
  console.log("Game Over! Score:", score)
}

if (hp <= 0) endGame()
console.log("State:", gameState)`,
        starterCode: `// endGame() функц болон "gameOver" төлөв үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'gameState',           hint: 'gameState хувьсагч үүсгэ' },
          { type: 'hasKeyword', keyword: 'function',          hint: 'function ашигла' },
          { type: 'hasText',    text: 'endGame',             hint: 'endGame нэртэй функц үүсгэ' },
          { type: 'hasPattern', pattern: '["\']gameOver["\']',hint: '"gameOver" утга өг' },
          { type: 'hasKeyword', keyword: 'if',                hint: 'if нөхцөл ашигла' },
          { type: 'hasText',    text: 'console.log',         hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: '"win" нөхцөл',
        description: `checkWinCondition нэртэй функц үүсгэж score болон kills параметр авна уу.
score >= 100 && kills >= 5 бол gameState = "win" тавьж
"🏆 YOU WIN!" log хийнэ үү.
Функцийг (120, 6) болон (80, 3) утгаар дуудна уу.

Жишээ:
let gameState = "playing"

function checkWinCondition(score, kills) {
  if (score >= 100 && kills >= 5) {
    gameState = "win"
    console.log("🏆 YOU WIN! Score:", score)
    return true
  }
  console.log("Not yet... Score:", score, "Kills:", kills)
  return false
}

checkWinCondition(120, 6)
checkWinCondition(80, 3)`,
        starterCode: `// checkWinCondition(score, kills) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'gameState',              hint: 'gameState хувьсагч үүсгэ' },
          { type: 'hasKeyword', keyword: 'function',             hint: 'function ашигла' },
          { type: 'hasText',    text: 'checkWinCondition',      hint: 'checkWinCondition нэртэй функц үүсгэ' },
          { type: 'hasPattern', pattern: '&&',                   hint: '&& логик ашигла' },
          { type: 'hasPattern', pattern: '["\']win["\']',        hint: '"win" утга өг' },
          { type: 'hasCount',   text: 'checkWinCondition(', count: 2, hint: '2 удаа дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Game reset',
        description: `resetGame нэртэй функц үүсгэж бүх хувьсагчийг анхны утгаруу буцааж
gameState = "idle" тавина уу.
Функцийн өмнө болон дараа state-г log хийнэ үү.

Жишээ:
let gameState = "gameOver"
let score = 150
let hp = 0
let kills = 7

function resetGame() {
  gameState = "idle"
  score = 0
  hp = 100
  kills = 0
  console.log("Game reset! State:", gameState)
}

console.log("Before:", gameState, score, hp)
resetGame()
console.log("After:", gameState, score, hp)`,
        starterCode: `// resetGame() функц үүсгэж бүгдийг reset хийнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function',        hint: 'function ашигла' },
          { type: 'hasText',    text: 'resetGame',          hint: 'resetGame нэртэй функц үүсгэ' },
          { type: 'hasText',    text: 'gameState',          hint: 'gameState ашигла' },
          { type: 'hasPattern', pattern: '["\']idle["\']',  hint: 'gameState = "idle" гэж reset хий' },
          { type: 'hasCount',   text: 'console.log', count: 2, hint: 'Before/After log хий' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 7: TASK SYSTEM – GAME CORE
  // ══════════════════════════════════════════════════
  {
    title: 'Game Core – Нэгтгэх',
    description: 'Progress tracker, XP систем болон бүгдийг нэгтгэсэн game core',
    orderIndex: 7,
    xpReward: 90,
    tasks: [
      {
        title: 'Дууссан task бүртгэх',
        description: `completedTasks нэртэй хоосон массив үүсгэнэ үү.
completeTask нэртэй функц үүсгэж taskName параметр авна уу.
taskName-ийг массивд нэмж "✓ Completed: X | Total: Y" log хийнэ үү.
Функцийг 3 удаа дуудна уу.

Жишээ:
const completedTasks = []

function completeTask(taskName) {
  completedTasks.push(taskName)
  console.log("✓ Completed:", taskName, "| Total:", completedTasks.length)
}

completeTask("Variables")
completeTask("Functions")
completeTask("DOM Select")`,
        starterCode: `// completedTasks массив болон completeTask() функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'completedTasks',   hint: 'completedTasks массив үүсгэ' },
          { type: 'hasPattern', pattern: '\\[\\s*\\]',    hint: '[] хоосон массив үүсгэ' },
          { type: 'hasKeyword', keyword: 'function',       hint: 'function ашигла' },
          { type: 'hasText',    text: 'completeTask',     hint: 'completeTask нэртэй функц үүсгэ' },
          { type: 'hasText',    text: '.push(',           hint: '.push() ашигла' },
          { type: 'hasCount',   text: 'completeTask(', count: 3, hint: '3 удаа дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Progress массивд хадгалах',
        description: `progress массив үүсгэнэ үү.
saveProgress нэртэй функц үүсгэж lesson болон score параметр авна уу.
{lesson, score, time: Date.now()} объект нэмж log хийнэ үү.
Функцийг 3 удаа дуудна уу.

Жишээ:
const progress = []

function saveProgress(lesson, score) {
  progress.push({ lesson, score, time: Date.now() })
  console.log("Saved:", lesson, "Score:", score)
}

saveProgress("Variables", 50)
saveProgress("Functions", 60)
saveProgress("DOM",       70)

console.log("Total progress:", progress.length)`,
        starterCode: `// progress массив болон saveProgress() функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'progress',          hint: 'progress массив үүсгэ' },
          { type: 'hasKeyword', keyword: 'function',        hint: 'function ашигла' },
          { type: 'hasText',    text: 'saveProgress',      hint: 'saveProgress нэртэй функц үүсгэ' },
          { type: 'hasText',    text: '.push(',            hint: '.push() ашигла' },
          { type: 'hasText',    text: 'Date.now()',        hint: 'Date.now() ашигла' },
          { type: 'hasCount',   text: 'saveProgress(', count: 3, hint: '3 удаа дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'XP систем',
        description: `xp болон level хувьсагч үүсгэнэ үү.
addXP нэртэй функц үүсгэж amount параметр авна уу.
xp += amount хийж xp >= 100 болоход level++ хийж xp = 0 тавьна уу.
"LEVEL UP!" log хийнэ үү.
Функцийг 15 удаа 10 XP-оор дуудна уу.

Жишээ:
let xp = 0
let level = 1

function addXP(amount) {
  xp += amount
  if (xp >= 100) {
    level++
    xp = 0
    console.log("LEVEL UP! Level:", level)
  }
  console.log("XP:", xp, "Level:", level)
}

for (let i = 0; i < 15; i++) addXP(10)`,
        starterCode: `// xp, level хувьсагч болон addXP() функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'xp',              hint: 'xp хувьсагч үүсгэ' },
          { type: 'hasText',    text: 'level',           hint: 'level хувьсагч үүсгэ' },
          { type: 'hasKeyword', keyword: 'function',      hint: 'function ашигла' },
          { type: 'hasText',    text: 'addXP',           hint: 'addXP нэртэй функц үүсгэ' },
          { type: 'hasPattern', pattern: 'xp\\s*\\+=',   hint: 'xp += amount ашигла' },
          { type: 'hasPattern', pattern: 'level\\s*\\+\\+|level\\s*\\+=',
                                hint: 'level++ ашигла' },
          { type: 'hasText',    text: 'console.log',     hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Дараагийн level нээх',
        description: `completedTasks массив болон currentLevel хувьсагч үүсгэнэ үү.
checkUnlock нэртэй функц үүсгэнэ үү.
completedTasks.length >= 5 болоход currentLevel++ хийж
"🔓 Level X unlocked!" log хийнэ үү.
Функцийг давтан дуудаж 5 task бүртгэнэ үү.

Жишээ:
const completedTasks = []
let currentLevel = 1

function checkUnlock() {
  if (completedTasks.length >= 5) {
    currentLevel++
    console.log("🔓 Level", currentLevel, "unlocked!")
    completedTasks.length = 0
  }
}

for (let i = 0; i < 5; i++) {
  completedTasks.push("Task " + (i + 1))
  checkUnlock()
}`,
        starterCode: `// completedTasks, currentLevel болон checkUnlock() үүсгэнэ үү
`,
        checks: [
          { type: 'hasText',    text: 'completedTasks',   hint: 'completedTasks массив үүсгэ' },
          { type: 'hasText',    text: 'currentLevel',     hint: 'currentLevel хувьсагч үүсгэ' },
          { type: 'hasKeyword', keyword: 'function',       hint: 'function ашигла' },
          { type: 'hasText',    text: 'checkUnlock',      hint: 'checkUnlock нэртэй функц үүсгэ' },
          { type: 'hasText',    text: '.length',          hint: '.length ашигла' },
          { type: 'hasKeyword', keyword: 'if',             hint: 'if нөхцөл ашигла' },
          { type: 'hasText',    text: 'console.log',      hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Game Core – Бүгдийг нэгтгэх',
        description: `Бүх сурсан зүйлсийг нэгтгэн game core бич:

1. player объект (name, hp, score, level)
2. enemies массив + 3 дайсан
3. gameState = "idle"
4. startGame функц → gameState = "playing"
5. attack функц → enemy.hp буруулах + player.score нэмэх
6. Давталтаар бүр дайснаа attack хийх
7. checkWin → score >= 50 бол gameState = "win"

Жишээ:
const player = { name: "Hero", hp: 100, score: 0, level: 1 }
const enemies = [
  { name: "Goblin", hp: 50 },
  { name: "Orc",    hp: 80 },
  { name: "Troll",  hp: 60 },
]
let gameState = "idle"

function startGame() { gameState = "playing"; console.log("▶ GAME START") }
function attack(enemy) { enemy.hp -= 20; player.score += 10; console.log("Hit!", enemy.name, "HP:", enemy.hp) }
function checkWin() { if (player.score >= 50) { gameState = "win"; console.log("🏆 WIN!") } }

startGame()
for (let i = 0; i < enemies.length; i++) { attack(enemies[i]); checkWin() }
console.log("Final state:", gameState, "| Score:", player.score)`,
        starterCode: `// player + enemies + gameState + startGame + attack + checkWin
`,
        checks: [
          { type: 'hasText',    text: 'player',        hint: 'player объект үүсгэ' },
          { type: 'hasText',    text: 'enemies',       hint: 'enemies массив үүсгэ' },
          { type: 'hasText',    text: 'gameState',     hint: 'gameState хувьсагч үүсгэ' },
          { type: 'hasKeyword', keyword: 'for',         hint: 'for давталт ашигла' },
          { type: 'hasText',    text: 'console.log',   hint: 'console.log ашигла' },
        ] as JsRule[],
      },
    ],
  },
]

// ── Override last task's setInterval check to be optional (for/while is fine too) ──
// The last task check for 'setInterval' is intentionally lenient — either setInterval or for loop works.

// ── Main seed ──────────────────────────────────────────────────────────
async function main() {
  console.log('🟣 JS Advanced course seed started...')

  let course = await prisma.course.findFirst({ where: { category: 'JS_ADV' } })
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'JavaScript – Advanced Game Logic',
        description: 'Objects, arrays, timers, collision, random, game state, and game core',
        category: 'JS_ADV',
        difficulty: 'INTERMEDIATE',
        xpReward: 700,
        orderIndex: 4,
        isActive: true,
      },
    })
    console.log('  ✓ Course created:', course.title)
  } else {
    console.log('  → Course found:', course.title)
  }

  for (const lessonData of LESSONS) {
    let lesson = await prisma.lesson.findFirst({
      where: { courseId: course.id, orderIndex: lessonData.orderIndex },
    })
    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: lessonData.title,
          content: lessonData.description,
          xpReward: lessonData.xpReward,
          orderIndex: lessonData.orderIndex,
        },
      })
      console.log(`  ✓ Lesson ${lessonData.orderIndex}: ${lesson.title}`)
    } else {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { title: lessonData.title, content: lessonData.description, xpReward: lessonData.xpReward },
      })
      console.log(`  → Lesson ${lessonData.orderIndex}: ${lesson.title} (updated)`)
    }

    for (let ti = 0; ti < lessonData.tasks.length; ti++) {
      const td = lessonData.tasks[ti]
      const existing = await prisma.task.findFirst({
        where: { lessonId: lesson.id, orderIndex: ti + 1 },
      })
      if (!existing) {
        await prisma.task.create({
          data: {
            lessonId: lesson.id,
            title: td.title,
            description: td.description,
            taskType: 'code',
            xpReward: 10,
            orderIndex: ti + 1,
            starterCode: td.starterCode,
            testCases: jsMeta(td.checks),
          },
        })
        console.log(`    ✓ Task ${ti + 1}: ${td.title}`)
      } else {
        await prisma.task.update({
          where: { id: existing.id },
          data: {
            title: td.title,
            description: td.description,
            starterCode: td.starterCode,
            testCases: jsMeta(td.checks),
          },
        })
        console.log(`    → Task ${ti + 1}: ${td.title} (updated)`)
      }
    }
  }

  console.log('\n✅ JS Advanced course seed complete!')
  console.log(`   Course: JavaScript – Advanced Game Logic`)
  console.log(`   Lessons: ${LESSONS.length}`)
  console.log(`   Tasks: ${LESSONS.reduce((a, l) => a + l.tasks.length, 0)}`)
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())