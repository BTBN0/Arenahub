/**
 * Seed: Node.js & Express – Backend API (Course 7)
 * Run: npx tsx prisma/seed-node-course.ts
 *
 * Creates/upserts Course 7 (NODE) with 7 lessons × 5 tasks.
 * testCases format: { mode: "node", checks: JsRule[] }
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

function nodeMeta(checks: JsRule[]) {
  return JSON.parse(JSON.stringify({ mode: 'node', checks }))
}

// ── Lesson data ────────────────────────────────────────────────────────
const LESSONS = [

  // ══════════════════════════════════════════════════
  // LESSON 1: SERVER SETUP
  // ══════════════════════════════════════════════════
  {
    title: 'Server Setup',
    description: 'Express сервер үүсгэх, PORT-д listen хийх',
    orderIndex: 1,
    xpReward: 60,
    tasks: [
      {
        title: 'Express require',
        description: `express module-г require ашиглан импортлоно уу.

Жишээ:
const express = require('express')

Тайлбар:
- Node.js-д module импортлохдоо require() ашигладаг
- express нь backend server хийх хамгийн түгээмэл framework`,
        starterCode: `// express-г импортол
const express = require('express')
`,
        checks: [
          { type: 'hasText', text: "require('express')", hint: "require('express') ашигла" },
          { type: 'hasText', text: 'express', hint: 'express хувьсагч үүсгэ' },
        ] as JsRule[],
      },
      {
        title: 'App үүсгэх',
        description: `express() дуудаж app объект үүсгэнэ үү.

Жишээ:
const express = require('express')
const app = express()

Тайлбар:
- express() нь application instance буцаана
- app гэсэн нэрийг ихэвчлэн ашиглана`,
        starterCode: `const express = require('express')
// app үүсгэнэ үү
const app = express()
`,
        checks: [
          { type: 'hasText', text: "require('express')", hint: "require('express') ашигла" },
          { type: 'hasText', text: 'app = express()', hint: 'const app = express() гэж app үүсгэ' },
        ] as JsRule[],
      },
      {
        title: 'Server listen',
        description: `app.listen() ашиглан сервер 3000 порт дээр ажиллуулна уу.

Жишээ:
const PORT = 3000
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})

Тайлбар:
- listen() нь тухайн порт дээр хүлээж эхлэнэ
- Callback нь сервер амжилттай эхэлсэн үед дуудагдана`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

// Сервер listen хийнэ үү
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'app.listen', hint: 'app.listen() ашигла' },
          { type: 'hasText', text: 'PORT', hint: 'PORT хувьсагч ашигла' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашиглан мэдэгдэл хэвлэ' },
        ] as JsRule[],
      },
      {
        title: 'Root route',
        description: `GET "/" route нэмнэ үү. "Hello World" мэдэгдэл буцаана.

Жишээ:
app.get('/', (req, res) => {
  res.send('Hello World')
})

Тайлбар:
- app.get(path, handler) нь GET request-г хүлээн авна
- req = request, res = response
- res.send() нь тексттэй хариу илгээнэ`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

// GET "/" route нэмнэ үү
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: "app.get('/'", hint: "app.get('/') route нэм" },
          { type: 'hasText', text: 'res.send', hint: 'res.send() ашиглан хариу илгээ' },
          { type: 'hasText', text: 'app.listen', hint: 'app.listen() ашигла' },
        ] as JsRule[],
      },
      {
        title: 'JSON хариу',
        description: `GET "/" route-с JSON объект буцаана уу.
{ message: "server running" }

Жишээ:
app.get('/', (req, res) => {
  res.json({ message: 'server running' })
})

Тайлбар:
- res.json() нь JSON хариу илгээнэ
- Content-Type: application/json автоматаар тохируулагдана`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.get('/', (req, res) => {
  res.json({ message: 'server running' })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'res.json', hint: 'res.json() ашиглан JSON хариу илгээ' },
          { type: 'hasText', text: 'message', hint: 'message key байх ёстой' },
          { type: 'hasText', text: 'server running', hint: '"server running" утга байх ёстой' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 2: BASIC API ROUTES
  // ══════════════════════════════════════════════════
  {
    title: 'Basic API Routes',
    description: 'GET болон POST route үүсгэж JSON хариу илгээх',
    orderIndex: 2,
    xpReward: 65,
    tasks: [
      {
        title: 'GET /api/status',
        description: `GET /api/status route үүсгэнэ үү.
{ status: "ok" } JSON буцаана.

Жишээ:
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' })
})

Тайлбар:
- /api/ угтвар нь REST API-ийн нийтлэг дадал
- status route нь сервер амьд эсэхийг шалгадаг`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

// GET /api/status route нэмнэ үү
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: "app.get('/api/status'", hint: "app.get('/api/status') route нэм" },
          { type: 'hasText', text: 'res.json', hint: 'res.json() ашигла' },
          { type: 'hasText', text: 'status', hint: 'status key байх ёстой' },
        ] as JsRule[],
      },
      {
        title: 'Status объект',
        description: `GET /api/status route-с илүү дэлгэрэнгүй JSON буцаана уу.
{ status: "ok", version: "1.0", uptime: 0 }

Жишээ:
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0',
    uptime: process.uptime ? process.uptime() : 0
  })
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0',
    uptime: 0
  })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'status', hint: 'status key байх ёстой' },
          { type: 'hasText', text: 'version', hint: 'version key байх ёстой' },
          { type: 'hasText', text: 'uptime', hint: 'uptime key байх ёстой' },
          { type: 'hasText', text: 'res.json', hint: 'res.json() ашигла' },
        ] as JsRule[],
      },
      {
        title: 'POST /api/data',
        description: `POST /api/data route үүсгэнэ үү.
express.json() middleware нэмнэ.
{ success: true } буцаана.

Жишээ:
app.use(express.json())

app.post('/api/data', (req, res) => {
  res.json({ success: true })
})

Тайлбар:
- express.json() нь request body-г JSON маягаар уншина
- POST нь data илгээхэд ашиглагдана`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

// POST /api/data route нэмнэ үү
app.post('/api/data', (req, res) => {
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'app.use(express.json())', hint: 'express.json() middleware нэм' },
          { type: 'hasText', text: "app.post('/api/data'", hint: "app.post('/api/data') route нэм" },
          { type: 'hasText', text: 'success', hint: 'success key байх ёстой' },
        ] as JsRule[],
      },
      {
        title: 'Request body',
        description: `POST /api/data route дотор req.body-г ашиглан хүлээн авсан өгөгдлийг буцаана уу.

Жишээ:
app.post('/api/data', (req, res) => {
  const body = req.body
  res.json({ success: true, received: body })
})

Тайлбар:
- req.body нь POST request-ийн body өгөгдлийг агуулна
- express.json() middleware байх ёстой`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

app.post('/api/data', (req, res) => {
  const body = req.body
  res.json({ success: true, received: body })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'req.body', hint: 'req.body ашигла' },
          { type: 'hasText', text: 'received', hint: 'received key-д body-г буцаа' },
          { type: 'hasText', text: 'success', hint: 'success: true буцаа' },
        ] as JsRule[],
      },
      {
        title: 'GET болон POST хамт',
        description: `GET /api/status болон POST /api/data хоёуланг нэгэн зэрэг хийнэ үү.

Жишээ:
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' })
})
app.post('/api/data', (req, res) => {
  res.json({ success: true, data: req.body })
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/data', (req, res) => {
  res.json({ success: true, data: req.body })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: "app.get('/api/status'", hint: "GET /api/status route нэм" },
          { type: 'hasText', text: "app.post('/api/data'", hint: "POST /api/data route нэм" },
          { type: 'hasCount', text: 'res.json', count: 2, hint: 'res.json()-г 2 удаа ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 3: MEMORY DATA (NO DB)
  // ══════════════════════════════════════════════════
  {
    title: 'Memory Data (DB-гүй)',
    description: 'Array-д өгөгдөл хадгалж API-гаар удирдах (in-memory database)',
    orderIndex: 3,
    xpReward: 70,
    tasks: [
      {
        title: 'In-memory array',
        description: `Server дотор games array үүсгэж анхны 2 item нэмнэ үү.

Жишээ:
const games = [
  { id: 1, name: 'ArenaHub', score: 0 },
  { id: 2, name: 'Battle Game', score: 100 },
]

Тайлбар:
- In-memory array нь өгөгдлийн сан ашиглахгүйгээр өгөгдөл хадгалах аргa
- Server дахин эхлэхэд өгөгдөл алга болно`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

// In-memory games array үүсгэнэ үү
const games = [
  { id: 1, name: 'ArenaHub', score: 0 },
  { id: 2, name: 'Battle Game', score: 100 },
]

app.get('/api/games', (req, res) => {
  res.json(games)
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'const games = [', hint: 'games array үүсгэ' },
          { type: 'hasText', text: 'id:', hint: 'id шинж байх ёстой' },
          { type: 'hasText', text: 'name:', hint: 'name шинж байх ёстой' },
          { type: 'hasText', text: "app.get('/api/games'", hint: "GET /api/games route нэм" },
        ] as JsRule[],
      },
      {
        title: 'Өгөгдөл нэмэх',
        description: `POST /api/games route-д шинэ game нэмэх логик хийнэ үү.
req.body-с нэр авч array-д push хийнэ.

Жишээ:
app.post('/api/games', (req, res) => {
  const newGame = {
    id: games.length + 1,
    name: req.body.name,
    score: 0
  }
  games.push(newGame)
  res.json({ success: true, game: newGame })
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const games = [
  { id: 1, name: 'ArenaHub', score: 0 },
]

app.get('/api/games', (req, res) => {
  res.json(games)
})

// POST /api/games route нэмнэ үү
app.post('/api/games', (req, res) => {
  const newGame = {
    id: games.length + 1,
    name: req.body.name,
    score: 0
  }
  games.push(newGame)
  res.json({ success: true, game: newGame })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: "app.post('/api/games'", hint: "POST /api/games route нэм" },
          { type: 'hasText', text: 'games.push', hint: 'games.push() ашиглан нэм' },
          { type: 'hasText', text: 'req.body.name', hint: 'req.body.name ашигла' },
          { type: 'hasText', text: 'success', hint: 'success: true буцаа' },
        ] as JsRule[],
      },
      {
        title: 'GET all данс',
        description: `GET /api/games route бүх games-г буцаадаг болно.
Мөн games-ийн тоог хамт буцаана.

Жишээ:
app.get('/api/games', (req, res) => {
  res.json({
    count: games.length,
    games: games
  })
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const games = [
  { id: 1, name: 'ArenaHub', score: 0 },
  { id: 2, name: 'Battle Game', score: 100 },
]

app.get('/api/games', (req, res) => {
  res.json({
    count: games.length,
    games: games
  })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'count', hint: 'count key нэм' },
          { type: 'hasText', text: 'games.length', hint: 'games.length ашигла' },
          { type: 'hasText', text: 'games: games', hint: 'games array-г буцаа' },
        ] as JsRule[],
      },
      {
        title: 'ID-р хайх',
        description: `GET /api/games/:id route үүсгэж тухайн id-тэй game-г буцаана уу.
Олдохгүй бол 404 буцаана.

Жишээ:
app.get('/api/games/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const game = games.find(g => g.id === id)
  if (!game) return res.status(404).json({ error: 'Not found' })
  res.json(game)
})

Тайлбар:
- :id нь dynamic параметр
- req.params.id нь URL-с параметр авна
- .find() нь нөхцөлийг хангасан эхний элемент буцаана`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const games = [
  { id: 1, name: 'ArenaHub', score: 0 },
  { id: 2, name: 'Battle Game', score: 100 },
]

// GET /api/games/:id route нэмнэ үү
app.get('/api/games/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const game = games.find(g => g.id === id)
  if (!game) return res.status(404).json({ error: 'Not found' })
  res.json(game)
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: '/api/games/:id', hint: '/:id dynamic параметр ашигла' },
          { type: 'hasText', text: 'req.params.id', hint: 'req.params.id ашигла' },
          { type: 'hasText', text: '.find(', hint: '.find() ашиглан хай' },
          { type: 'hasText', text: 'status(404)', hint: '404 status буцаа' },
        ] as JsRule[],
      },
      {
        title: 'Score шинэчлэх',
        description: `PUT /api/games/:id/score route үүсгэж game-ийн score-г шинэчлэнэ үү.

Жишээ:
app.put('/api/games/:id/score', (req, res) => {
  const id = parseInt(req.params.id)
  const game = games.find(g => g.id === id)
  if (!game) return res.status(404).json({ error: 'Not found' })
  game.score = req.body.score
  res.json({ success: true, game })
})

Тайлбар:
- PUT нь бүхэл өгөгдлийг шинэчлэхэд ашиглагдана
- game объектыг шууд өөрчилж болно (reference)`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const games = [
  { id: 1, name: 'ArenaHub', score: 0 },
  { id: 2, name: 'Battle Game', score: 100 },
]

// PUT /api/games/:id/score route нэмнэ үү
app.put('/api/games/:id/score', (req, res) => {
  const id = parseInt(req.params.id)
  const game = games.find(g => g.id === id)
  if (!game) return res.status(404).json({ error: 'Not found' })
  game.score = req.body.score
  res.json({ success: true, game })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: "app.put(", hint: 'app.put() route нэм' },
          { type: 'hasText', text: 'game.score = req.body.score', hint: 'game.score-г req.body.score-оор шинэчил' },
          { type: 'hasText', text: 'success', hint: 'success: true буцаа' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 4: ENEMY API
  // ══════════════════════════════════════════════════
  {
    title: 'Enemy API',
    description: 'Дайсны систем API: CRUD operations in-memory',
    orderIndex: 4,
    xpReward: 70,
    tasks: [
      {
        title: 'Enemy array',
        description: `enemies in-memory array үүсгэж GET /api/enemies route нэмнэ үү.

Жишээ:
const enemies = [
  { id: 1, name: 'Goblin', hp: 50, alive: true },
  { id: 2, name: 'Orc', hp: 100, alive: true },
]
app.get('/api/enemies', (req, res) => {
  res.json(enemies)
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

// enemies array үүсгэнэ үү
const enemies = [
  { id: 1, name: 'Goblin', hp: 50, alive: true },
  { id: 2, name: 'Orc', hp: 100, alive: true },
]

app.get('/api/enemies', (req, res) => {
  res.json(enemies)
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'const enemies = [', hint: 'enemies array үүсгэ' },
          { type: 'hasText', text: 'hp:', hint: 'hp шинж байх ёстой' },
          { type: 'hasText', text: "app.get('/api/enemies'", hint: "GET /api/enemies route нэм" },
        ] as JsRule[],
      },
      {
        title: 'Шинэ дайсан нэмэх',
        description: `POST /api/enemies route-д шинэ дайсан нэмэх логик хийнэ үү.

Жишээ:
app.post('/api/enemies', (req, res) => {
  const enemy = {
    id: enemies.length + 1,
    name: req.body.name,
    hp: req.body.hp || 50,
    alive: true
  }
  enemies.push(enemy)
  res.json({ success: true, enemy })
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const enemies = [
  { id: 1, name: 'Goblin', hp: 50, alive: true },
]

app.get('/api/enemies', (req, res) => {
  res.json(enemies)
})

// POST /api/enemies route нэмнэ үү
app.post('/api/enemies', (req, res) => {
  const enemy = {
    id: enemies.length + 1,
    name: req.body.name,
    hp: req.body.hp || 50,
    alive: true
  }
  enemies.push(enemy)
  res.json({ success: true, enemy })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: "app.post('/api/enemies'", hint: "POST /api/enemies route нэм" },
          { type: 'hasText', text: 'enemies.push', hint: 'enemies.push() ашигла' },
          { type: 'hasText', text: 'req.body.name', hint: 'req.body.name ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Дайсан устгах',
        description: `DELETE /api/enemies/:id route-д дайсан устгах логик хийнэ үү.
.filter() ашиглана.

Жишээ:
app.delete('/api/enemies/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const before = enemies.length
  enemies = enemies.filter(e => e.id !== id)
  if (enemies.length === before) {
    return res.status(404).json({ error: 'Not found' })
  }
  res.json({ success: true, deleted: id })
})

Тайлбар:
- let ашиглах хэрэгтэй (const биш) enemies дахин оноохын тулд
- .filter() нь тухайн id-г хасна`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

let enemies = [
  { id: 1, name: 'Goblin', hp: 50, alive: true },
  { id: 2, name: 'Orc', hp: 100, alive: true },
]

app.get('/api/enemies', (req, res) => {
  res.json(enemies)
})

// DELETE /api/enemies/:id route нэмнэ үү
app.delete('/api/enemies/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const before = enemies.length
  enemies = enemies.filter(e => e.id !== id)
  if (enemies.length === before) {
    return res.status(404).json({ error: 'Not found' })
  }
  res.json({ success: true, deleted: id })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'app.delete(', hint: 'app.delete() route нэм' },
          { type: 'hasText', text: '.filter(', hint: '.filter() ашиглан устга' },
          { type: 'hasText', text: 'req.params.id', hint: 'req.params.id ашигла' },
          { type: 'hasText', text: 'deleted', hint: 'deleted key буцаа' },
        ] as JsRule[],
      },
      {
        title: 'Enemy HP шинэчлэх',
        description: `PATCH /api/enemies/:id/hp route-д enemy-ийн HP-г шинэчлэх логик хийнэ үү.
HP 0 болоход alive: false болно.

Жишээ:
app.patch('/api/enemies/:id/hp', (req, res) => {
  const id = parseInt(req.params.id)
  const enemy = enemies.find(e => e.id === id)
  if (!enemy) return res.status(404).json({ error: 'Not found' })
  enemy.hp = Math.max(0, enemy.hp - req.body.damage)
  if (enemy.hp === 0) enemy.alive = false
  res.json({ success: true, enemy })
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const enemies = [
  { id: 1, name: 'Goblin', hp: 50, alive: true },
  { id: 2, name: 'Orc', hp: 100, alive: true },
]

// PATCH /api/enemies/:id/hp route нэмнэ үү
app.patch('/api/enemies/:id/hp', (req, res) => {
  const id = parseInt(req.params.id)
  const enemy = enemies.find(e => e.id === id)
  if (!enemy) return res.status(404).json({ error: 'Not found' })
  enemy.hp = Math.max(0, enemy.hp - req.body.damage)
  if (enemy.hp === 0) enemy.alive = false
  res.json({ success: true, enemy })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'app.patch(', hint: 'app.patch() route нэм' },
          { type: 'hasText', text: 'Math.max(0', hint: 'Math.max(0, ...) ашигла' },
          { type: 'hasText', text: 'enemy.alive = false', hint: 'HP 0 болоход alive = false болго' },
          { type: 'hasText', text: 'req.body.damage', hint: 'req.body.damage ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Enemy CRUD бүрэн',
        description: `enemies-ийн бүрэн CRUD (GET, POST, DELETE, PATCH) нэгтгэсэн API хийнэ үү.

Шалгавар:
- GET /api/enemies — бүх дайснуудыг буцаана
- POST /api/enemies — шинэ дайсан нэмнэ
- DELETE /api/enemies/:id — дайсан устгана
- PATCH /api/enemies/:id/hp — HP шинэчилнэ`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

let enemies = [
  { id: 1, name: 'Goblin', hp: 50, alive: true },
]

app.get('/api/enemies', (req, res) => {
  res.json(enemies)
})

app.post('/api/enemies', (req, res) => {
  const e = { id: Date.now(), name: req.body.name, hp: req.body.hp || 50, alive: true }
  enemies.push(e)
  res.json({ success: true, enemy: e })
})

app.delete('/api/enemies/:id', (req, res) => {
  const id = parseInt(req.params.id)
  enemies = enemies.filter(e => e.id !== id)
  res.json({ success: true })
})

app.patch('/api/enemies/:id/hp', (req, res) => {
  const id = parseInt(req.params.id)
  const enemy = enemies.find(e => e.id === id)
  if (!enemy) return res.status(404).json({ error: 'Not found' })
  enemy.hp = Math.max(0, enemy.hp - (req.body.damage || 10))
  if (enemy.hp === 0) enemy.alive = false
  res.json({ success: true, enemy })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: "app.get('/api/enemies'", hint: "GET /api/enemies нэм" },
          { type: 'hasText', text: "app.post('/api/enemies'", hint: "POST /api/enemies нэм" },
          { type: 'hasText', text: 'app.delete(', hint: 'DELETE route нэм' },
          { type: 'hasText', text: 'app.patch(', hint: 'PATCH route нэм' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 5: TASK API – GAME CORE
  // ══════════════════════════════════════════════════
  {
    title: 'Task API – Game Core',
    description: 'Тоглоомын даалгаврын API: XP, progress tracking',
    orderIndex: 5,
    xpReward: 75,
    tasks: [
      {
        title: 'Tasks array',
        description: `tasks in-memory array үүсгэж GET /api/tasks route нэмнэ үү.
Бүр task-д id, title, xp, done шинж байна.

Жишээ:
const tasks = [
  { id: 1, title: '10 дайсан устга', xp: 50, done: false },
  { id: 2, title: '100 оноо цуглуул', xp: 100, done: false },
]`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const tasks = [
  { id: 1, title: '10 дайсан устга', xp: 50, done: false },
  { id: 2, title: '100 оноо цуглуул', xp: 100, done: false },
  { id: 3, title: 'Level 5 хүрэх', xp: 200, done: false },
]

app.get('/api/tasks', (req, res) => {
  res.json(tasks)
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'const tasks = [', hint: 'tasks array үүсгэ' },
          { type: 'hasText', text: 'xp:', hint: 'xp шинж байх ёстой' },
          { type: 'hasText', text: 'done:', hint: 'done шинж байх ёстой' },
          { type: 'hasText', text: "app.get('/api/tasks'", hint: "GET /api/tasks route нэм" },
        ] as JsRule[],
      },
      {
        title: 'Task дуусгах',
        description: `POST /api/tasks/:id/complete route-д task дуусгах логик хийнэ үү.
done: true болгож, XP-г буцаана.

Жишээ:
app.post('/api/tasks/:id/complete', (req, res) => {
  const id = parseInt(req.params.id)
  const task = tasks.find(t => t.id === id)
  if (!task) return res.status(404).json({ error: 'Not found' })
  if (task.done) return res.json({ message: 'Already done', xp: 0 })
  task.done = true
  res.json({ success: true, xpEarned: task.xp })
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const tasks = [
  { id: 1, title: '10 дайсан устга', xp: 50, done: false },
  { id: 2, title: '100 оноо цуглуул', xp: 100, done: false },
]

app.get('/api/tasks', (req, res) => {
  res.json(tasks)
})

// POST /api/tasks/:id/complete route нэмнэ үү
app.post('/api/tasks/:id/complete', (req, res) => {
  const id = parseInt(req.params.id)
  const task = tasks.find(t => t.id === id)
  if (!task) return res.status(404).json({ error: 'Not found' })
  if (task.done) return res.json({ message: 'Already done', xp: 0 })
  task.done = true
  res.json({ success: true, xpEarned: task.xp })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: '/complete', hint: '/complete route нэм' },
          { type: 'hasText', text: 'task.done = true', hint: 'task.done = true болго' },
          { type: 'hasText', text: 'xpEarned', hint: 'xpEarned буцаа' },
          { type: 'hasText', text: 'Already done', hint: 'давтан дуусгахыг шалга' },
        ] as JsRule[],
      },
      {
        title: 'XP тооцоолох',
        description: `GET /api/tasks/progress route-д нийт XP болон хувийг буцаана уу.

Жишээ:
app.get('/api/tasks/progress', (req, res) => {
  const done = tasks.filter(t => t.done)
  const totalXp = done.reduce((sum, t) => sum + t.xp, 0)
  const percent = Math.round((done.length / tasks.length) * 100)
  res.json({ done: done.length, total: tasks.length, percent, totalXp })
})

Тайлбар:
- .filter() нь дуусгасан task-уудыг авна
- .reduce() нь XP нийлбэр тооцно`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const tasks = [
  { id: 1, title: '10 дайсан устга', xp: 50, done: true },
  { id: 2, title: '100 оноо цуглуул', xp: 100, done: false },
  { id: 3, title: 'Level 5 хүрэх', xp: 200, done: false },
]

// GET /api/tasks/progress route нэмнэ үү
app.get('/api/tasks/progress', (req, res) => {
  const done = tasks.filter(t => t.done)
  const totalXp = done.reduce((sum, t) => sum + t.xp, 0)
  const percent = Math.round((done.length / tasks.length) * 100)
  res.json({ done: done.length, total: tasks.length, percent, totalXp })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: '/progress', hint: '/progress route нэм' },
          { type: 'hasText', text: '.filter(', hint: '.filter() ашигла' },
          { type: 'hasText', text: '.reduce(', hint: '.reduce() ашиглан XP тооц' },
          { type: 'hasText', text: 'percent', hint: 'percent буцаа' },
        ] as JsRule[],
      },
      {
        title: 'Leaderboard endpoint',
        description: `GET /api/leaderboard route-д score-оор эрэмбэлсэн players жагсаалт буцаана уу.

Жишээ:
const players = [
  { id: 1, name: 'Player1', score: 150 },
  { id: 2, name: 'Player2', score: 300 },
  { id: 3, name: 'Player3', score: 75 },
]
app.get('/api/leaderboard', (req, res) => {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  res.json(sorted)
})

Тайлбар:
- [...players] нь original array-г өөрчлөхгүйн тулд copy хийнэ
- .sort((a, b) => b.score - a.score) нь буурах дарааллаар эрэмбэлнэ`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const players = [
  { id: 1, name: 'Player1', score: 150 },
  { id: 2, name: 'Player2', score: 300 },
  { id: 3, name: 'Player3', score: 75 },
]

// GET /api/leaderboard route нэмнэ үү
app.get('/api/leaderboard', (req, res) => {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  res.json(sorted)
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: '/leaderboard', hint: '/leaderboard route нэм' },
          { type: 'hasText', text: '.sort(', hint: '.sort() ашиглан эрэмбэл' },
          { type: 'hasText', text: 'b.score - a.score', hint: 'буурах дарааллаар эрэмбэл' },
          { type: 'hasText', text: 'res.json', hint: 'res.json() ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Full game API',
        description: `Tasks болон players-ийн нэгдсэн API: progress + leaderboard хийнэ үү.

Шалгавар:
- GET /api/tasks
- POST /api/tasks/:id/complete
- GET /api/tasks/progress
- GET /api/leaderboard`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const tasks = [
  { id: 1, title: 'Kill 10 enemies', xp: 50, done: false },
  { id: 2, title: 'Reach level 5', xp: 100, done: false },
]

const players = [
  { id: 1, name: 'Hero', score: 200 },
  { id: 2, name: 'Warrior', score: 350 },
]

app.get('/api/tasks', (req, res) => {
  res.json(tasks)
})

app.post('/api/tasks/:id/complete', (req, res) => {
  const id = parseInt(req.params.id)
  const task = tasks.find(t => t.id === id)
  if (!task) return res.status(404).json({ error: 'Not found' })
  task.done = true
  res.json({ success: true, xpEarned: task.xp })
})

app.get('/api/tasks/progress', (req, res) => {
  const done = tasks.filter(t => t.done).length
  res.json({ done, total: tasks.length, percent: Math.round((done / tasks.length) * 100) })
})

app.get('/api/leaderboard', (req, res) => {
  res.json([...players].sort((a, b) => b.score - a.score))
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: "app.get('/api/tasks'", hint: "GET /api/tasks нэм" },
          { type: 'hasText', text: '/complete', hint: '/complete route нэм' },
          { type: 'hasText', text: '/progress', hint: '/progress route нэм' },
          { type: 'hasText', text: '/leaderboard', hint: '/leaderboard route нэм' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 6: FRONTEND ↔ BACKEND (FETCH)
  // ══════════════════════════════════════════════════
  {
    title: 'Frontend ↔ Backend (Fetch)',
    description: 'Frontend-с fetch() ашиглан backend API-тай холбогдох',
    orderIndex: 6,
    xpReward: 80,
    tasks: [
      {
        title: 'fetch GET',
        description: `fetch ашиглан GET request хийх кодыг бичнэ үү.
(Энэ нь frontend JS кодын жишээ)

Жишээ:
async function getStatus() {
  const res = await fetch('/api/status')
  const data = await res.json()
  console.log(data)
}
getStatus()

Тайлбар:
- fetch() нь HTTP request хийдэг browser API
- await ашиглан async/await маягаар ажиллана
- res.json() нь JSON хариуг авна`,
        starterCode: `// Frontend fetch code
async function getStatus() {
  const res = await fetch('/api/status')
  const data = await res.json()
  console.log('Status:', data)
}

getStatus()
`,
        checks: [
          { type: 'hasText', text: 'fetch(', hint: 'fetch() ашигла' },
          { type: 'hasText', text: 'await', hint: 'await ашигла' },
          { type: 'hasText', text: 'res.json()', hint: 'res.json() ашиглан JSON ав' },
          { type: 'hasText', text: 'async', hint: 'async function ашигла' },
        ] as JsRule[],
      },
      {
        title: 'fetch болон error handling',
        description: `fetch-д try/catch ашиглан error handling нэмнэ үү.

Жишээ:
async function fetchData(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP error: ' + res.status)
    const data = await res.json()
    return data
  } catch (err) {
    console.error('Fetch error:', err.message)
    return null
  }
}

Тайлбар:
- res.ok нь status 200-299 бол true
- try/catch нь network error барина`,
        starterCode: `async function fetchData(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP error: ' + res.status)
    const data = await res.json()
    return data
  } catch (err) {
    console.error('Fetch error:', err.message)
    return null
  }
}

fetchData('/api/status').then(d => console.log(d))
`,
        checks: [
          { type: 'hasText', text: 'try {', hint: 'try/catch нэм' },
          { type: 'hasText', text: 'catch', hint: 'catch ашигла' },
          { type: 'hasText', text: 'res.ok', hint: 'res.ok шалгалт хий' },
          { type: 'hasText', text: 'throw new Error', hint: 'error throw хий' },
        ] as JsRule[],
      },
      {
        title: 'POST fetch',
        description: `POST fetch ашиглан data илгээх функц хийнэ үү.

Жишээ:
async function postData(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

Тайлбар:
- method: 'POST' гэж зааж өгнө
- headers-д 'Content-Type': 'application/json' байх ёстой
- body: JSON.stringify(data) маягаар сериализаци хийнэ`,
        starterCode: `async function postData(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

postData('/api/data', { name: 'test', value: 42 })
  .then(d => console.log('Response:', d))
`,
        checks: [
          { type: 'hasText', text: "method: 'POST'", hint: "method: 'POST' тохируул" },
          { type: 'hasText', text: "'Content-Type': 'application/json'", hint: "Content-Type header нэм" },
          { type: 'hasText', text: 'JSON.stringify', hint: 'JSON.stringify(body) ашигла' },
          { type: 'hasText', text: 'headers', hint: 'headers тохируул' },
        ] as JsRule[],
      },
      {
        title: 'Enemies fetch',
        description: `Backend-с enemies жагсаалт авч харуулах функц хийнэ үү.

Жишээ:
async function loadEnemies() {
  const data = await fetchData('/api/enemies')
  if (!data) return
  data.forEach(enemy => {
    console.log(enemy.name + ' HP:' + enemy.hp)
  })
}

Тайлбар:
- fetchData() нь өмнөх task-ийн функц
- forEach() нь array-г давтана`,
        starterCode: `async function fetchData(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return res.json()
  } catch (e) {
    console.error(e.message)
    return null
  }
}

async function loadEnemies() {
  const data = await fetchData('/api/enemies')
  if (!data) return
  data.forEach(enemy => {
    console.log(enemy.name + ' HP:' + enemy.hp)
  })
}

loadEnemies()
`,
        checks: [
          { type: 'hasText', text: 'loadEnemies', hint: 'loadEnemies функц үүсгэ' },
          { type: 'hasText', text: '/api/enemies', hint: '/api/enemies endpoint-г ашигла' },
          { type: 'hasText', text: '.forEach(', hint: '.forEach() ашиглан давта' },
          { type: 'hasText', text: 'enemy.name', hint: 'enemy.name харуул' },
        ] as JsRule[],
      },
      {
        title: 'Full fetch flow',
        description: `Статус авах, дайсан нэмэх, жагсаалт авах бүрэн fetch flow хийнэ үү.

Шалгавар:
- getStatus() — GET /api/status
- addEnemy(name) — POST /api/enemies
- getEnemies() — GET /api/enemies
Бүгдийг дуудах`,
        starterCode: `async function getStatus() {
  const res = await fetch('/api/status')
  const data = await res.json()
  console.log('Status:', JSON.stringify(data))
}

async function addEnemy(name) {
  const res = await fetch('/api/enemies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, hp: 50 })
  })
  const data = await res.json()
  console.log('Added:', JSON.stringify(data))
}

async function getEnemies() {
  const res = await fetch('/api/enemies')
  const data = await res.json()
  console.log('Enemies:', JSON.stringify(data))
}

getStatus()
addEnemy('Dragon')
getEnemies()
`,
        checks: [
          { type: 'hasText', text: 'getStatus', hint: 'getStatus функц үүсгэ' },
          { type: 'hasText', text: 'addEnemy', hint: 'addEnemy функц үүсгэ' },
          { type: 'hasText', text: 'getEnemies', hint: 'getEnemies функц үүсгэ' },
          { type: 'hasCount', text: 'fetch(', count: 3, hint: 'fetch()-г 3 удаа ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 7: GAME AUTO SYSTEM (SERVER SIDE)
  // ══════════════════════════════════════════════════
  {
    title: 'Game Auto System (Server)',
    description: 'setInterval ашиглан server-side автомат тоглоомын логик хийх',
    orderIndex: 7,
    xpReward: 90,
    tasks: [
      {
        title: 'Server-side interval',
        description: `setInterval ашиглан server дотор автомат logic хийнэ үү.
Тоолуур 1 секунд тутамд нэмэгдэж GET /api/tick-д буцаана.

Жишээ:
let tick = 0
setInterval(() => {
  tick++
}, 1000)

app.get('/api/tick', (req, res) => {
  res.json({ tick })
})

Тайлбар:
- setInterval() нь server дотор мөн ажилладаг
- tick нь global state болж route-д хаяж ашиглагдана`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

let tick = 0

// setInterval дотор tick нэмэгдэх болно
setInterval(() => {
  tick++
}, 1000)

app.get('/api/tick', (req, res) => {
  res.json({ tick })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашигла' },
          { type: 'hasText', text: 'tick', hint: 'tick хувьсагч ашигла' },
          { type: 'hasText', text: "app.get('/api/tick'", hint: "GET /api/tick route нэм" },
        ] as JsRule[],
      },
      {
        title: 'Auto enemy spawn',
        description: `setInterval ашиглан 3 секунд тутамд шинэ дайсан автоматаар үүсдэг систем хийнэ үү.

Жишээ:
const enemies = []
let spawnId = 1

setInterval(() => {
  enemies.push({ id: spawnId++, name: 'Auto Enemy', hp: 50, alive: true })
  if (enemies.length > 10) enemies.shift()
}, 3000)

app.get('/api/enemies', (req, res) => {
  res.json({ count: enemies.length, enemies })
})

Тайлбар:
- enemies.shift() нь хамгийн эхний элементийг хасна (10-с хэтрэхгүй байлгана)`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

const enemies = []
let spawnId = 1

// Auto spawn: 3 секунд тутамд шинэ дайсан нэм
setInterval(() => {
  enemies.push({ id: spawnId++, name: 'Auto Enemy', hp: 50, alive: true })
  if (enemies.length > 10) enemies.shift()
}, 3000)

app.get('/api/enemies', (req, res) => {
  res.json({ count: enemies.length, enemies })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашигла' },
          { type: 'hasText', text: 'enemies.push', hint: 'enemies.push() ашиглан auto spawn хий' },
          { type: 'hasText', text: 'enemies.shift()', hint: 'enemies.shift() ашиглан хязгаарла' },
          { type: 'hasText', text: 'enemies.length', hint: 'enemies.length буцаа' },
        ] as JsRule[],
      },
      {
        title: 'Auto score',
        description: `setInterval ашиглан score автоматаар нэмэгдэх систем хийнэ үү.
GET /api/score-д score болон level буцаана.

Жишээ:
let score = 0
setInterval(() => { score += 5 }, 1000)

app.get('/api/score', (req, res) => {
  const level = Math.floor(score / 100) + 1
  res.json({ score, level })
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

let score = 0

// Auto score: 1 секунд тутамд +5
setInterval(() => { score += 5 }, 1000)

app.get('/api/score', (req, res) => {
  const level = Math.floor(score / 100) + 1
  res.json({ score, level })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашигла' },
          { type: 'hasText', text: 'score +=', hint: 'score += ашиглан нэм' },
          { type: 'hasText', text: 'Math.floor', hint: 'Math.floor ашиглан level тооц' },
          { type: 'hasText', text: "app.get('/api/score'", hint: "GET /api/score route нэм" },
        ] as JsRule[],
      },
      {
        title: 'Auto HP decrease',
        description: `setInterval ашиглан player-ийн HP автоматаар хасагдах систем хийнэ үү.
HP 0 болоход gameOver: true болно.

Жишээ:
let hp = 100
let gameOver = false

setInterval(() => {
  if (gameOver) return
  hp = Math.max(0, hp - 5)
  if (hp === 0) gameOver = true
}, 500)

app.get('/api/player', (req, res) => {
  res.json({ hp, gameOver })
})

app.post('/api/player/heal', (req, res) => {
  hp = Math.min(100, hp + 20)
  gameOver = false
  res.json({ hp, gameOver })
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

let hp = 100
let gameOver = false

// Auto damage: 500ms тутамд HP хасна
setInterval(() => {
  if (gameOver) return
  hp = Math.max(0, hp - 5)
  if (hp === 0) gameOver = true
}, 500)

app.get('/api/player', (req, res) => {
  res.json({ hp, gameOver })
})

app.post('/api/player/heal', (req, res) => {
  hp = Math.min(100, hp + 20)
  gameOver = false
  res.json({ hp, gameOver })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'gameOver', hint: 'gameOver state үүсгэ' },
          { type: 'hasText', text: 'Math.max(0', hint: 'Math.max(0, ...) ашигла' },
          { type: 'hasText', text: "app.get('/api/player'", hint: "GET /api/player route нэм" },
          { type: 'hasText', text: '/heal', hint: '/heal route нэм' },
        ] as JsRule[],
      },
      {
        title: 'Бүрэн backend simulation',
        description: `Дайсан auto spawn, score auto нэмэгдэх, HP auto хасагдах бүрэн backend тоглоом хийнэ үү.

Шалгавар:
- Auto enemy spawn (setInterval)
- Auto score (setInterval)
- Auto HP decrease (setInterval)
- GET /api/game — бүх state-г нэгтгэн буцаана
- POST /api/game/restart — тоглоом шинэлдэг`,
        starterCode: `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

let score = 0
let hp = 100
let gameOver = false
let enemies = []
let spawnId = 1

// Auto score
setInterval(() => {
  if (!gameOver) score += 2
}, 500)

// Auto HP decrease
setInterval(() => {
  if (gameOver) return
  hp = Math.max(0, hp - 3)
  if (hp === 0) gameOver = true
}, 800)

// Auto enemy spawn
setInterval(() => {
  if (!gameOver) {
    enemies.push({ id: spawnId++, name: 'Enemy', hp: 30 })
    if (enemies.length > 5) enemies.shift()
  }
}, 2000)

app.get('/api/game', (req, res) => {
  res.json({ score, hp, gameOver, enemies: enemies.length })
})

app.post('/api/game/restart', (req, res) => {
  score = 0; hp = 100; gameOver = false; enemies = []
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasCount', text: 'setInterval', count: 3, hint: 'setInterval-г 3 удаа ашигла' },
          { type: 'hasText', text: "app.get('/api/game'", hint: "GET /api/game route нэм" },
          { type: 'hasText', text: '/restart', hint: '/restart route нэм' },
          { type: 'hasText', text: 'gameOver', hint: 'gameOver state удирда' },
        ] as JsRule[],
      },
    ],
  },
]

// ── Main seed function ────────────────────────────────────────────────────
async function main() {
  console.log('Seeding Node.js & Express – Backend API course...')

  let course = await prisma.course.findFirst({ where: { category: 'NODE' } })

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'Node.js & Express – Backend API',
        description: 'Express сервер, REST API, in-memory data, auto game system хийх',
        category: 'NODE',
        difficulty: 'INTERMEDIATE',
        xpReward: 900,
        imageUrl: '/courses/node.png',
        isPublished: true,
      },
    })
    console.log('Created course:', course.id)
  } else {
    console.log('Course already exists:', course.id)
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
          description: lessonData.description,
          orderIndex: lessonData.orderIndex,
          xpReward: lessonData.xpReward,
        },
      })
      console.log('  Created lesson:', lesson.title)
    } else {
      lesson = await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          title: lessonData.title,
          description: lessonData.description,
          xpReward: lessonData.xpReward,
        },
      })
      console.log('  Updated lesson:', lesson.title)
    }

    for (let i = 0; i < lessonData.tasks.length; i++) {
      const taskData = lessonData.tasks[i]
      const orderIndex = i + 1

      let task = await prisma.task.findFirst({
        where: { lessonId: lesson.id, orderIndex },
      })

      if (!task) {
        task = await prisma.task.create({
          data: {
            lessonId: lesson.id,
            title: taskData.title,
            description: taskData.description,
            starterCode: taskData.starterCode,
            testCases: nodeMeta(taskData.checks),
            orderIndex,
            xpReward: 20,
          },
        })
        console.log('    Created task:', task.title)
      } else {
        task = await prisma.task.update({
          where: { id: task.id },
          data: {
            title: taskData.title,
            description: taskData.description,
            starterCode: taskData.starterCode,
            testCases: nodeMeta(taskData.checks),
          },
        })
        console.log('    Updated task:', task.title)
      }
    }
  }

  console.log('Done! Node.js course seeded successfully.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())