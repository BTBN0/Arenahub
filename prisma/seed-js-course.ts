/**
 * Seed: JavaScript – REAL GAME LOGIC (Course 3)
 * Run: npx tsx prisma/seed-js-course.ts
 *
 * Creates/upserts Course 3 (JS) with 7 lessons × 5 tasks.
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

// ── Lesson data ────────────────────────────────────────────────────────
const LESSONS = [

  // ══════════════════════════════════════════════════
  // LESSON 1: VARIABLES
  // ══════════════════════════════════════════════════
  {
    title: 'Хувьсагч (Variables)',
    description: 'JavaScript-ийн хувьсагч, let болон const ашиглах',
    orderIndex: 1,
    xpReward: 50,
    tasks: [
      {
        title: 'Score хувьсагч',
        description: `let ашиглан score хувьсагч үүсгэж 0 утга өгнө үү.

Жишээ:
let score = 0

Тайлбар:
- let нь хувьсах утгад ашиглагдана
- score = 0 нь анхны утга`,
        starterCode: `// score хувьсагч үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'let', hint: 'let ашигла' },
          { type: 'hasText', text: 'score', hint: 'score нэртэй хувьсагч үүсгэ' },
          { type: 'hasPattern', pattern: 'score\\s*=\\s*0', hint: 'score = 0 гэж утга өг' },
        ] as JsRule[],
      },
      {
        title: 'PlayerName хувьсагч',
        description: `let ашиглан playerName хувьсагч үүсгэж "Hero" утга өгнө үү.

Жишээ:
let playerName = "Hero"

Тайлбар:
- Текст утгыг "" хашилтанд бичнэ
- Хувьсагчийн нэр camelCase байна`,
        starterCode: `// playerName хувьсагч үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'let', hint: 'let ашигла' },
          { type: 'hasText', text: 'playerName', hint: 'playerName нэртэй хувьсагч үүсгэ' },
          { type: 'hasPattern', pattern: 'playerName\\s*=\\s*["\']', hint: 'playerName-д текст утга өг' },
        ] as JsRule[],
      },
      {
        title: 'const ашиглах',
        description: `const ашиглан MAX_HP тогтмол үүсгэж 100 утга өгнө үү.
Дараа нь let ашиглан hp хувьсагч үүсгэж MAX_HP утга өгнө үү.

Жишээ:
const MAX_HP = 100
let hp = MAX_HP

Тайлбар:
- const нь өөрчлөгдөхгүй тогтмолд ашиглагдана
- let нь өөрчлөгдөх хувьсагчид ашиглагдана`,
        starterCode: `// MAX_HP тогтмол болон hp хувьсагч үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'const', hint: 'const ашиглан MAX_HP үүсгэ' },
          { type: 'hasText', text: 'MAX_HP', hint: 'MAX_HP нэртэй тогтмол үүсгэ' },
          { type: 'hasKeyword', keyword: 'let', hint: 'let ашиглан hp хувьсагч үүсгэ' },
          { type: 'hasText', text: 'hp', hint: 'hp хувьсагч үүсгэ' },
        ] as JsRule[],
      },
      {
        title: 'Утга шинэчлэх',
        description: `coins хувьсагч үүсгэж 5 утга өгнө үү.
Дараа нь coins-т 10 нэмнэ үү.

Жишээ:
let coins = 5
coins = coins + 10
console.log(coins) // 15

Тайлбар:
- coins = coins + 10 нь утгыг шинэчилнэ
- console.log() нь утгыг харуулна`,
        starterCode: `// coins хувьсагч үүсгэж, утгыг шинэчилнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'let', hint: 'let ашиглан coins үүсгэ' },
          { type: 'hasText', text: 'coins', hint: 'coins хувьсагч үүсгэ' },
          { type: 'hasPattern', pattern: 'coins\\s*=\\s*coins\\s*\\+', hint: 'coins = coins + ... гэж шинэчил' },
          { type: 'hasText', text: 'console.log', hint: 'console.log(coins) ашиглан харуул' },
        ] as JsRule[],
      },
      {
        title: 'Хувьсагч console-д харуулах',
        description: `Дараах хувьсагчдыг үүсгэж console.log()-оор харуулна уу:
- level = 1
- xp = 0
- gold = 100

Жишээ:
let level = 1
let xp = 0
let gold = 100
console.log("Level:", level)
console.log("XP:", xp)
console.log("Gold:", gold)`,
        starterCode: `// level, xp, gold хувьсагчдыг үүсгэж харуулна уу
`,
        checks: [
          { type: 'hasText', text: 'level', hint: 'level хувьсагч үүсгэ' },
          { type: 'hasText', text: 'xp', hint: 'xp хувьсагч үүсгэ' },
          { type: 'hasText', text: 'gold', hint: 'gold хувьсагч үүсгэ' },
          { type: 'hasCount', text: 'console.log', count: 3, hint: 'console.log-ийг 3 удаа ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 2: FUNCTIONS
  // ══════════════════════════════════════════════════
  {
    title: 'Функц (Functions)',
    description: 'Функц үүсгэх, дуудах, параметр ашиглах',
    orderIndex: 2,
    xpReward: 60,
    tasks: [
      {
        title: 'Функц үүсгэх',
        description: `greet нэртэй функц үүсгэж, дотор нь console.log("Welcome to the game!") бичнэ үү.
Дараа нь функцийг дуудна уу.

Жишээ:
function greet() {
  console.log("Welcome to the game!")
}
greet()`,
        starterCode: `// greet функц үүсгэж дуудна уу
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function түлхүүр үгийг ашигла' },
          { type: 'hasText', text: 'greet', hint: 'greet нэртэй функц үүсгэ' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашигла' },
          { type: 'hasPattern', pattern: 'greet\\(\\)', hint: 'greet() гэж дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Параметртэй функц',
        description: `attack нэртэй функц үүсгэж, damage параметр авна уу.
Функцийн дотор console.log("Attack! Damage:", damage) бичнэ үү.
50 утгаар дуудна уу.

Жишээ:
function attack(damage) {
  console.log("Attack! Damage:", damage)
}
attack(50)`,
        starterCode: `// attack(damage) функц үүсгэж дуудна уу
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'attack', hint: 'attack нэртэй функц үүсгэ' },
          { type: 'hasText', text: 'damage', hint: 'damage параметр нэмэ' },
          { type: 'hasPattern', pattern: 'attack\\(\\s*\\d+\\s*\\)', hint: 'attack(50) гэж тоогоор дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Return утга буцаах',
        description: `calculateScore нэртэй функц үүсгэж, level болон bonus параметр авна уу.
level * 100 + bonus гэж тооцоолж return-оор буцаана уу.
Дараа нь функцийн үр дүнг console.log()-оор харуулна уу.

Жишээ:
function calculateScore(level, bonus) {
  return level * 100 + bonus
}
console.log(calculateScore(3, 50)) // 350`,
        starterCode: `// calculateScore функц үүсгэж return ашигла
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'calculateScore', hint: 'calculateScore нэртэй функц үүсгэ' },
          { type: 'hasKeyword', keyword: 'return', hint: 'return ашиглан утга буцаа' },
          { type: 'hasText', text: 'console.log', hint: 'console.log-оор үр дүн харуул' },
        ] as JsRule[],
      },
      {
        title: 'Функц дуудах',
        description: `showStatus нэртэй функц үүсгэж, name болон score параметр авна уу.
"Player: " + name + " | Score: " + score гэж console.log хийнэ үү.
"Hero" болон 250 утгаар дуудна уу.

Жишээ:
function showStatus(name, score) {
  console.log("Player: " + name + " | Score: " + score)
}
showStatus("Hero", 250)`,
        starterCode: `// showStatus(name, score) функц үүсгэж дуудна уу
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'showStatus', hint: 'showStatus нэртэй функц үүсгэ' },
          { type: 'hasText', text: 'name', hint: 'name параметр нэмэ' },
          { type: 'hasText', text: 'score', hint: 'score параметр нэмэ' },
          { type: 'hasPattern', pattern: 'showStatus\\(', hint: 'showStatus() гэж дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Game action функц',
        description: `playerAttack нэртэй функц үүсгэж enemy болон power параметр авна уу.
"" + enemy + " attacked! Power: " + power + " | Total XP: " + (power * 10) гэж log хийнэ үү.
Дараа нь "Dragon" болон 15 утгаар дуудна уу.

Жишээ:
function playerAttack(enemy, power) {
  console.log(enemy + " attacked! Power: " + power)
  return power * 10
}
console.log("XP:", playerAttack("Dragon", 15))`,
        starterCode: `// playerAttack(enemy, power) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'playerAttack', hint: 'playerAttack нэртэй функц үүсгэ' },
          { type: 'hasText', text: 'enemy', hint: 'enemy параметр нэмэ' },
          { type: 'hasText', text: 'power', hint: 'power параметр нэмэ' },
          { type: 'hasPattern', pattern: 'playerAttack\\(', hint: 'playerAttack() гэж дуудна уу' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 3: DOM SELECT
  // ══════════════════════════════════════════════════
  {
    title: 'DOM Сонгох (DOM Select)',
    description: 'querySelector, getElementById ашиглан DOM элемент сонгох',
    orderIndex: 3,
    xpReward: 60,
    tasks: [
      {
        title: 'querySelector ашиглах',
        description: `document.querySelector() ашиглан "#score" ID-тэй элемент сонгоно уу.
Үр дүнг console.log()-оор харуулна уу.

Жишээ:
const el = document.querySelector("#score")
console.log(el)

Тайлбар:
- document нь HTML-ийн бүтцийг агуулна
- querySelector("#id") нь ID-аар сонгоно
- querySelector(".class") нь классаар сонгоно`,
        starterCode: `// querySelector ашиглан #score сонгоно уу
`,
        checks: [
          { type: 'hasText', text: 'document.querySelector', hint: 'document.querySelector() ашигла' },
          { type: 'hasText', text: '#score', hint: '"#score" гэж сонго' },
          { type: 'hasText', text: 'console.log', hint: 'console.log-оор харуул' },
        ] as JsRule[],
      },
      {
        title: 'getElementById ашиглах',
        description: `document.getElementById() ашиглан "hp" ID-тэй элемент сонгоно уу.
Үр дүнг console.log()-оор харуулна уу.

Жишээ:
const hpEl = document.getElementById("hp")
console.log(hpEl)

Тайлбар:
- getElementById нь зөвхөн ID-аар сонгоно
- querySelector-аас хурдан ажилладаг`,
        starterCode: `// getElementById ашиглан "hp" сонгоно уу
`,
        checks: [
          { type: 'hasText', text: 'document.getElementById', hint: 'document.getElementById() ашигла' },
          { type: 'hasPattern', pattern: 'getElementById\\(["\']hp["\']\\)', hint: '"hp" ID-аар сонго' },
          { type: 'hasText', text: 'console.log', hint: 'console.log-оор харуул' },
        ] as JsRule[],
      },
      {
        title: 'querySelectorAll ашиглах',
        description: `document.querySelectorAll() ашиглан ".enemy" классаар бүх элемент сонгоно уу.
Сонгосон элементийн тоог console.log()-оор харуулна уу.

Жишээ:
const enemies = document.querySelectorAll(".enemy")
console.log("Enemy count:", enemies.length)`,
        starterCode: `// querySelectorAll ашиглан .enemy элементүүд сонгоно уу
`,
        checks: [
          { type: 'hasText', text: 'querySelectorAll', hint: 'querySelectorAll() ашигла' },
          { type: 'hasText', text: '.enemy', hint: '".enemy" классаар сонго' },
          { type: 'hasText', text: '.length', hint: '.length ашиглан тоог хар' },
          { type: 'hasText', text: 'console.log', hint: 'console.log-оор харуул' },
        ] as JsRule[],
      },
      {
        title: 'Элементийг хувьсагчид хадгалах',
        description: `const ашиглан scoreEl хувьсагч үүсгэж "#score" элемент хадгалана уу.
Мөн hpEl хувьсагч үүсгэж "#hp" элемент хадгалана уу.
Хоёуланг нь console.log()-оор харуулна уу.

Жишээ:
const scoreEl = document.querySelector("#score")
const hpEl = document.querySelector("#hp")
console.log(scoreEl, hpEl)`,
        starterCode: `// scoreEl болон hpEl хувьсагчид элемент хадгална уу
`,
        checks: [
          { type: 'hasKeyword', keyword: 'const', hint: 'const ашигла' },
          { type: 'hasText', text: 'scoreEl', hint: 'scoreEl хувьсагч үүсгэ' },
          { type: 'hasText', text: 'hpEl', hint: 'hpEl хувьсагч үүсгэ' },
          { type: 'hasText', text: 'querySelector', hint: 'querySelector ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Олон элемент сонгох',
        description: `Дараах элементүүдийг сонгож хувьсагчид хадгална уу:
- titleEl = document.querySelector("h1")
- btnEl = document.querySelector(".btn")
- inputs = document.querySelectorAll("input")
Бүгдийг console.log-оор харуулна уу.

Жишээ:
const titleEl = document.querySelector("h1")
const btnEl = document.querySelector(".btn")
const inputs = document.querySelectorAll("input")
console.log(titleEl, btnEl, inputs.length)`,
        starterCode: `// titleEl, btnEl, inputs хувьсагчдыг үүсгэнэ үү
`,
        checks: [
          { type: 'hasText', text: 'titleEl', hint: 'titleEl хувьсагч үүсгэ' },
          { type: 'hasText', text: 'btnEl', hint: 'btnEl хувьсагч үүсгэ' },
          { type: 'hasText', text: 'inputs', hint: 'inputs хувьсагч үүсгэ' },
          { type: 'hasText', text: 'querySelectorAll', hint: 'querySelectorAll ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 4: DOM UPDATE
  // ══════════════════════════════════════════════════
  {
    title: 'DOM Шинэчлэх (DOM Update)',
    description: 'textContent, innerHTML ашиглан DOM элемент шинэчлэх',
    orderIndex: 4,
    xpReward: 70,
    tasks: [
      {
        title: 'textContent өөрчлөх',
        description: `document.querySelector("#title") ашиглан h1 элемент сонгоно уу.
.textContent = "GAME STARTED!" гэж текст өөрчилнө үү.
console.log ашиглан шинэ текстийг харуулна уу.

Жишээ:
const title = document.querySelector("#title")
title.textContent = "GAME STARTED!"
console.log(title.textContent)`,
        starterCode: `// #title элементийн textContent-ийг өөрчилнө үү
`,
        checks: [
          { type: 'hasText', text: 'querySelector', hint: 'querySelector ашиглан элемент сонго' },
          { type: 'hasText', text: 'textContent', hint: '.textContent ашигла' },
          { type: 'hasPattern', pattern: 'textContent\\s*=', hint: 'textContent-д утга өг' },
          { type: 'hasText', text: 'console.log', hint: 'console.log-оор харуул' },
        ] as JsRule[],
      },
      {
        title: 'innerHTML өөрчлөх',
        description: `document.querySelector("#info") ашиглан элемент сонгоно уу.
.innerHTML = "<b>HP:</b> 100 | <b>Score:</b> 0" гэж HTML агуулга өөрчилнө үү.
console.log ашиглан innerHTML-ийг харуулна уу.

Жишээ:
const info = document.querySelector("#info")
info.innerHTML = "<b>HP:</b> 100 | <b>Score:</b> 0"
console.log(info.innerHTML)`,
        starterCode: `// #info элементийн innerHTML-ийг өөрчилнө үү
`,
        checks: [
          { type: 'hasText', text: 'querySelector', hint: 'querySelector ашигла' },
          { type: 'hasText', text: 'innerHTML', hint: '.innerHTML ашигла' },
          { type: 'hasPattern', pattern: 'innerHTML\\s*=', hint: 'innerHTML-д утга өг' },
          { type: 'hasText', text: 'console.log', hint: 'console.log-оор харуул' },
        ] as JsRule[],
      },
      {
        title: 'Score UI шинэчлэх',
        description: `updateScore нэртэй функц үүсгэж, newScore параметр авна уу.
Функцийн дотор:
1. const el = document.querySelector("#score") ашиглан элемент сонго
2. el.textContent = "Score: " + newScore гэж шинэчил
3. console.log гэж log хий
Функцийг 150 утгаар дуудна уу.

Жишээ:
function updateScore(newScore) {
  const el = document.querySelector("#score")
  el.textContent = "Score: " + newScore
  console.log("Score updated:", newScore)
}
updateScore(150)`,
        starterCode: `// updateScore(newScore) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'updateScore', hint: 'updateScore нэртэй функц үүсгэ' },
          { type: 'hasText', text: 'querySelector', hint: 'querySelector ашигла' },
          { type: 'hasText', text: 'textContent', hint: 'textContent ашигла' },
          { type: 'hasPattern', pattern: 'updateScore\\(\\s*\\d+', hint: 'updateScore(150) гэж дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'HP UI шинэчлэх',
        description: `updateHP нэртэй функц үүсгэж, hp параметр авна уу.
Функцийн дотор "#hp" элементийн textContent-ийг "HP: " + hp гэж шинэчилнэ үү.
Функцийг 75 утгаар дуудна уу.

Жишээ:
function updateHP(hp) {
  const hpEl = document.querySelector("#hp")
  hpEl.textContent = "HP: " + hp
  console.log("HP:", hp)
}
updateHP(75)`,
        starterCode: `// updateHP(hp) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'updateHP', hint: 'updateHP нэртэй функц үүсгэ' },
          { type: 'hasText', text: '#hp', hint: '"#hp" элемент сонго' },
          { type: 'hasText', text: 'textContent', hint: 'textContent ашигла' },
          { type: 'hasPattern', pattern: 'updateHP\\(\\s*\\d+', hint: 'updateHP(75) гэж дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Live UI refresh систем',
        description: `refreshUI нэртэй функц үүсгэж, score болон hp параметр авна уу.
Функцийн дотор:
1. "#score" элементийн textContent-ийг шинэчил
2. "#hp" элементийн textContent-ийг шинэчил
3. console.log("UI refreshed") хий
Функцийг 200 болон 80 утгаар дуудна уу.

Жишээ:
function refreshUI(score, hp) {
  document.querySelector("#score").textContent = "Score: " + score
  document.querySelector("#hp").textContent = "HP: " + hp
  console.log("UI refreshed")
}
refreshUI(200, 80)`,
        starterCode: `// refreshUI(score, hp) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'refreshUI', hint: 'refreshUI нэртэй функц үүсгэ' },
          { type: 'hasCount', text: 'textContent', count: 2, hint: 'textContent-ийг 2 удаа ашигла' },
          { type: 'hasCount', text: 'querySelector', count: 2, hint: 'querySelector-ийг 2 удаа ашигла' },
          { type: 'hasPattern', pattern: 'refreshUI\\(', hint: 'refreshUI() гэж дуудна уу' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 5: EVENTS
  // ══════════════════════════════════════════════════
  {
    title: 'Үйлдэл (Events)',
    description: 'addEventListener ашиглан click, input үйлдэл бүртгэх',
    orderIndex: 5,
    xpReward: 70,
    tasks: [
      {
        title: 'Click event нэмэх',
        description: `document.querySelector("#btn") ашиглан товч сонгоно уу.
addEventListener("click", ...) ашиглан click үйлдэл нэмнэ үү.
Click хийхэд console.log("Button clicked!") хийнэ үү.

Жишээ:
const btn = document.querySelector("#btn")
btn.addEventListener("click", function() {
  console.log("Button clicked!")
})`,
        starterCode: `// #btn дарахад console.log хийнэ үү
`,
        checks: [
          { type: 'hasText', text: 'addEventListener', hint: 'addEventListener ашигла' },
          { type: 'hasPattern', pattern: 'addEventListener\\(\\s*["\']click["\']', hint: '"click" event нэмэ' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Button event listener',
        description: `startBtn нэртэй хувьсагч үүсгэж "#startBtn" элемент хадгална уу.
addEventListener ашиглан click event нэмнэ үү.
Click хийхэд "Game Started!" console.log хийнэ үү.

Жишээ:
const startBtn = document.querySelector("#startBtn")
startBtn.addEventListener("click", function() {
  console.log("Game Started!")
})`,
        starterCode: `// startBtn-д click event нэмнэ үү
`,
        checks: [
          { type: 'hasText', text: 'startBtn', hint: 'startBtn хувьсагч үүсгэ' },
          { type: 'hasText', text: 'addEventListener', hint: 'addEventListener ашигла' },
          { type: 'hasPattern', pattern: 'addEventListener\\(\\s*["\']click["\']', hint: '"click" event нэмэ' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Input event',
        description: `document.querySelector("#nameInput") ашиглан input сонгоно уу.
"input" event listener нэмнэ үү.
Хэрэглэгч бичих бүрт event.target.value-г console.log хийнэ үү.

Жишээ:
const nameInput = document.querySelector("#nameInput")
nameInput.addEventListener("input", function(event) {
  console.log("Typing:", event.target.value)
})`,
        starterCode: `// #nameInput-д input event нэмнэ үү
`,
        checks: [
          { type: 'hasText', text: 'querySelector', hint: 'querySelector ашигла' },
          { type: 'hasText', text: 'addEventListener', hint: 'addEventListener ашигла' },
          { type: 'hasPattern', pattern: 'addEventListener\\(\\s*["\']input["\']', hint: '"input" event нэмэ' },
          { type: 'hasText', text: 'event.target.value', hint: 'event.target.value ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Олон event систем',
        description: `Дараах 2 event нэмнэ үү:
1. "#attackBtn"-д click event — console.log("Attacked!")
2. "#defendBtn"-д click event — console.log("Defended!")

Жишээ:
document.querySelector("#attackBtn").addEventListener("click", function() {
  console.log("Attacked!")
})
document.querySelector("#defendBtn").addEventListener("click", function() {
  console.log("Defended!")
})`,
        starterCode: `// attackBtn болон defendBtn-д click event нэмнэ үү
`,
        checks: [
          { type: 'hasCount', text: 'addEventListener', count: 2, hint: 'addEventListener-ийг 2 удаа ашигла' },
          { type: 'hasText', text: 'attackBtn', hint: 'attackBtn-д event нэмэ' },
          { type: 'hasText', text: 'defendBtn', hint: 'defendBtn-д event нэмэ' },
          { type: 'hasCount', text: 'console.log', count: 2, hint: 'console.log-ийг 2 удаа ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Game start trigger',
        description: `startGame нэртэй функц үүсгэнэ үү.
Дотор нь console.log("🎮 GAME STARTED!") хийнэ үү.
"#startGame" товчинд click event нэмж startGame функцийг дуудна уу.

Жишээ:
function startGame() {
  console.log("🎮 GAME STARTED!")
}
document.querySelector("#startGame").addEventListener("click", startGame)`,
        starterCode: `// startGame функц болон #startGame click event үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'startGame', hint: 'startGame нэртэй функц үүсгэ' },
          { type: 'hasText', text: 'addEventListener', hint: 'addEventListener ашигла' },
          { type: 'hasPattern', pattern: 'addEventListener\\(\\s*["\']click["\']', hint: '"click" event нэмэ' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 6: CONDITIONS (IF)
  // ══════════════════════════════════════════════════
  {
    title: 'Нөхцөл (Conditions)',
    description: 'if/else нөхцөлт мэдэгдэл ашиглах',
    orderIndex: 6,
    xpReward: 80,
    tasks: [
      {
        title: 'Энгийн if',
        description: `score хувьсагч үүсгэж 100 утга өгнө үү.
if ашиглан score > 50 бол console.log("High score!") хийнэ үү.

Жишээ:
let score = 100
if (score > 50) {
  console.log("High score!")
}`,
        starterCode: `// score хувьсагч болон if нөхцөл бичнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'let', hint: 'let ашиглан score үүсгэ' },
          { type: 'hasText', text: 'score', hint: 'score хувьсагч үүсгэ' },
          { type: 'hasKeyword', keyword: 'if', hint: 'if нөхцөл ашигла' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'if/else ашиглах',
        description: `hp хувьсагч үүсгэж 30 утга өгнө үү.
if/else ашиглан:
- hp > 50 бол: console.log("Alive!")
- else: console.log("Low HP!")

Жишээ:
let hp = 30
if (hp > 50) {
  console.log("Alive!")
} else {
  console.log("Low HP!")
}`,
        starterCode: `// hp хувьсагч болон if/else бичнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'let', hint: 'let ашигла' },
          { type: 'hasText', text: 'hp', hint: 'hp хувьсагч үүсгэ' },
          { type: 'hasKeyword', keyword: 'if', hint: 'if ашигла' },
          { type: 'hasKeyword', keyword: 'else', hint: 'else ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Score нөхцөл шалгах',
        description: `checkScore нэртэй функц үүсгэж score параметр авна уу.
- score >= 100 бол: "PERFECT!" log хий
- score >= 50 бол: "GOOD!" log хий
- else: "TRY AGAIN" log хий
Функцийг 120, 70, 20 утгаар 3 удаа дуудна уу.

Жишээ:
function checkScore(score) {
  if (score >= 100) {
    console.log("PERFECT!")
  } else if (score >= 50) {
    console.log("GOOD!")
  } else {
    console.log("TRY AGAIN")
  }
}
checkScore(120)
checkScore(70)
checkScore(20)`,
        starterCode: `// checkScore(score) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'checkScore', hint: 'checkScore нэртэй функц үүсгэ' },
          { type: 'hasKeyword', keyword: 'if', hint: 'if ашигла' },
          { type: 'hasKeyword', keyword: 'else', hint: 'else ашигла' },
          { type: 'hasCount', text: 'checkScore(', count: 3, hint: 'checkScore()-ийг 3 удаа дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Game over нөхцөл',
        description: `checkGameOver нэртэй функц үүсгэж hp параметр авна уу.
- hp <= 0 бол: console.log("GAME OVER!") хийж true буцаа
- else: console.log("Still alive: " + hp) хийж false буцаа
Функцийг 0 болон 50 утгаар дуудна уу.

Жишээ:
function checkGameOver(hp) {
  if (hp <= 0) {
    console.log("GAME OVER!")
    return true
  } else {
    console.log("Still alive:", hp)
    return false
  }
}
console.log(checkGameOver(0))
console.log(checkGameOver(50))`,
        starterCode: `// checkGameOver(hp) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'checkGameOver', hint: 'checkGameOver нэртэй функц үүсгэ' },
          { type: 'hasKeyword', keyword: 'if', hint: 'if ашигла' },
          { type: 'hasKeyword', keyword: 'return', hint: 'return ашигла' },
          { type: 'hasPattern', pattern: 'checkGameOver\\(\\s*0', hint: 'checkGameOver(0) гэж дуудна уу' },
        ] as JsRule[],
      },
      {
        title: 'Win нөхцөл',
        description: `checkWin нэртэй функц үүсгэж score болон level параметр авна уу.
- score >= 500 && level >= 5 бол: console.log("YOU WIN! 🏆")
- score >= 300 бол: console.log("Almost there!")
- else: console.log("Keep going...")
Функцийг (600, 5), (350, 3), (100, 1) утгаар дуудна уу.

Жишээ:
function checkWin(score, level) {
  if (score >= 500 && level >= 5) {
    console.log("YOU WIN! 🏆")
  } else if (score >= 300) {
    console.log("Almost there!")
  } else {
    console.log("Keep going...")
  }
}`,
        starterCode: `// checkWin(score, level) функц үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'function', hint: 'function ашигла' },
          { type: 'hasText', text: 'checkWin', hint: 'checkWin нэртэй функц үүсгэ' },
          { type: 'hasPattern', pattern: '&&', hint: '&& (AND) логик ашигла' },
          { type: 'hasKeyword', keyword: 'if', hint: 'if ашигла' },
          { type: 'hasKeyword', keyword: 'else', hint: 'else ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 7: LOOPS
  // ══════════════════════════════════════════════════
  {
    title: 'Давталт (Loops)',
    description: 'for болон while давталт ашиглах',
    orderIndex: 7,
    xpReward: 80,
    tasks: [
      {
        title: 'For давталт',
        description: `for давталт ашиглан 1-с 5 хүртэл тоог console.log хийнэ үү.

Жишээ:
for (let i = 1; i <= 5; i++) {
  console.log("Round:", i)
}

Тайлбар:
- for (эхлэл; нөхцөл; алхам) {...}
- i++ нь i = i + 1 гэсэн утгатай`,
        starterCode: `// for давталт ашиглан 1-5 хүртэл log хийнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'for', hint: 'for давталт ашигла' },
          { type: 'hasKeyword', keyword: 'let', hint: 'let ашигла' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'While давталт',
        description: `while давталт ашиглан countdown хийнэ үү.
count = 5 гэж эхэлж, 0 болтол count-г log хийгээд count-- хийнэ үү.

Жишээ:
let count = 5
while (count >= 0) {
  console.log("Count:", count)
  count--
}`,
        starterCode: `// while давталт ашиглан countdown хийнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'let', hint: 'let ашиглан count үүсгэ' },
          { type: 'hasText', text: 'count', hint: 'count хувьсагч ашигла' },
          { type: 'hasKeyword', keyword: 'while', hint: 'while давталт ашигла' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Array давтах',
        description: `heroes массив үүсгэж ["Warrior", "Mage", "Archer"] гэж утга өгнө үү.
for давталт ашиглан бүр элементийг log хийнэ үү.

Жишээ:
const heroes = ["Warrior", "Mage", "Archer"]
for (let i = 0; i < heroes.length; i++) {
  console.log("Hero:", heroes[i])
}`,
        starterCode: `// heroes массив үүсгэж for давталтаар харуулна уу
`,
        checks: [
          { type: 'hasText', text: 'heroes', hint: 'heroes массив үүсгэ' },
          { type: 'hasPattern', pattern: '\\[', hint: 'массивыг [] ашиглан үүсгэ' },
          { type: 'hasKeyword', keyword: 'for', hint: 'for давталт ашигла' },
          { type: 'hasText', text: '.length', hint: '.length ашигла' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Дайснуудыг үүсгэх',
        description: `for давталт ашиглан 1-с 4 хүртэл "Enemy #N" гэж enemy үүсгэнэ үү.
Бүр дайсны нэр болон HP-г log хийнэ үү.

Жишээ:
for (let i = 1; i <= 4; i++) {
  const enemyName = "Enemy #" + i
  const enemyHP = i * 25
  console.log(enemyName + " | HP: " + enemyHP)
}`,
        starterCode: `// for давталтаар 4 enemy үүсгэнэ үү
`,
        checks: [
          { type: 'hasKeyword', keyword: 'for', hint: 'for давталт ашигла' },
          { type: 'hasText', text: 'enemy', hint: 'enemy гэсэн нэр ашигла' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашигла' },
          { type: 'hasPattern', pattern: 'i\\s*<=?\\s*4', hint: '4 хүртэл давтана уу' },
        ] as JsRule[],
      },
      {
        title: 'Dynamic UI давталтаар',
        description: `items массив үүсгэж ["Sword", "Shield", "Potion", "Map"] гэж утга өгнө үү.
for давталт ашиглан бүр item-ийг "<li>" + item + "</li>" гэж log хийнэ үү.
Эцэст нь "Total items: " + items.length гэж log хийнэ үү.

Жишээ:
const items = ["Sword", "Shield", "Potion", "Map"]
for (let i = 0; i < items.length; i++) {
  console.log("<li>" + items[i] + "</li>")
}
console.log("Total items:", items.length)`,
        starterCode: `// items массив болон for давталтаар UI үүсгэнэ үү
`,
        checks: [
          { type: 'hasText', text: 'items', hint: 'items массив үүсгэ' },
          { type: 'hasKeyword', keyword: 'for', hint: 'for давталт ашигла' },
          { type: 'hasText', text: '.length', hint: '.length ашигла' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашигла' },
          { type: 'hasPattern', pattern: '\\bTotal items', hint: '"Total items:" log хий' },
        ] as JsRule[],
      },
    ],
  },
]

// ── Main seed ──────────────────────────────────────────────────────────
async function main() {
  console.log('🟡 JS course seed started...')

  // Find or create course
  let course = await prisma.course.findFirst({ where: { category: 'JS' } })
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'JavaScript – REAL GAME LOGIC',
        description: 'JavaScript fundamentals: variables, functions, DOM, events, conditions, and loops',
        category: 'JS',
        difficulty: 'BEGINNER',
        xpReward: 600,
        orderIndex: 3,
        isActive: true,
      },
    })
    console.log('  ✓ Course created:', course.title)
  } else {
    console.log('  → Course found:', course.title)
  }

  for (const lessonData of LESSONS) {
    // Find or create lesson
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
      console.log(`  ✓ Lesson ${lessonData.orderIndex} created: ${lesson.title}`)
    } else {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { title: lessonData.title, content: lessonData.description, xpReward: lessonData.xpReward },
      })
      console.log(`  → Lesson ${lessonData.orderIndex} found: ${lesson.title}`)
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

  console.log('\n✅ JS course seed complete!')
  console.log(`   Course: JavaScript – REAL GAME LOGIC`)
  console.log(`   Lessons: ${LESSONS.length}`)
  console.log(`   Tasks: ${LESSONS.reduce((a, l) => a + l.tasks.length, 0)}`)
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())