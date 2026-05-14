/**
 * Seed: Fullstack & DevOps – Deploy & Scale (Course 8)
 * Run: npx tsx prisma/seed-fullstack-course.ts
 *
 * Creates/upserts Course 8 (FULLSTACK) with 7 lessons × 5 tasks.
 * testCases format: { mode: "fullstack", checks: JsRule[] }
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

function fsMeta(checks: JsRule[]) {
  return JSON.parse(JSON.stringify({ mode: 'fullstack', checks }))
}

// ── Lesson data ────────────────────────────────────────────────────────
const LESSONS = [

  // ══════════════════════════════════════════════════
  // LESSON 1: BUILD FRONTEND
  // ══════════════════════════════════════════════════
  {
    title: 'Build Frontend',
    description: 'Frontend production build систем тохируулах, package.json, build script',
    orderIndex: 1,
    xpReward: 70,
    tasks: [
      {
        title: 'package.json бүтэц',
        description: `package.json файлын үндсэн бүтцийг үүсгэнэ үү.
name, version, scripts, dependencies шинж байна.

Жишээ:
const packageJson = {
  name: "my-game",
  version: "1.0.0",
  scripts: {
    start: "node server.js",
    build: "npm run compile",
    dev: "nodemon server.js"
  },
  dependencies: {
    express: "^4.18.2"
  }
}
console.log(JSON.stringify(packageJson, null, 2))

Тайлбар:
- scripts дотор start, build, dev байх ёстой
- dependencies-д ашиглах package-уудаа нэм`,
        starterCode: `const packageJson = {
  name: "arena-game",
  version: "1.0.0",
  scripts: {
    start: "node server.js",
    build: "npm run compile",
    dev: "nodemon server.js"
  },
  dependencies: {
    express: "^4.18.2",
    dotenv: "^16.0.3"
  }
}
console.log(JSON.stringify(packageJson, null, 2))
`,
        checks: [
          { type: 'hasText', text: '"scripts"', hint: 'scripts хэсэг нэм' },
          { type: 'hasText', text: '"build"', hint: 'build script нэм' },
          { type: 'hasText', text: '"start"', hint: 'start script нэм' },
          { type: 'hasText', text: '"dependencies"', hint: 'dependencies нэм' },
        ] as JsRule[],
      },
      {
        title: 'Build script',
        description: `npm run build командыг дуурайлган build процессыг кодлоно уу.
Build steps:
1. Clean old files
2. Compile
3. Optimize

Жишээ:
const steps = [
  { step: 1, name: 'Cleaning old build...', cmd: 'rm -rf dist' },
  { step: 2, name: 'Compiling...', cmd: 'node compile.js' },
  { step: 3, name: 'Optimizing assets...', cmd: 'npm run optimize' },
]

async function runBuild() {
  console.log('> npm run build')
  for (const s of steps) {
    console.log('[' + s.step + '/3] ' + s.name)
    await new Promise(r => setTimeout(r, 100))
  }
  console.log('✓ Build completed')
}
runBuild()`,
        starterCode: `const steps = [
  { step: 1, name: 'Cleaning old build...', cmd: 'rm -rf dist' },
  { step: 2, name: 'Compiling...', cmd: 'node compile.js' },
  { step: 3, name: 'Optimizing assets...', cmd: 'npm run optimize' },
]

async function runBuild() {
  console.log('> npm run build')
  for (const s of steps) {
    console.log('[' + s.step + '/3] ' + s.name)
  }
  console.log('✓ Build completed')
}

runBuild()
`,
        checks: [
          { type: 'hasText', text: 'npm run build', hint: '"npm run build" command нэм' },
          { type: 'hasText', text: 'Build completed', hint: '"Build completed" мэдэгдэл нэм' },
          { type: 'hasText', text: 'runBuild', hint: 'runBuild функц үүсгэ' },
          { type: 'hasText', text: 'build', hint: 'build логик байх ёстой' },
        ] as JsRule[],
      },
      {
        title: 'Build error засах',
        description: `Дараах broken build-ийг засна уу.
Missing module болон syntax error засах хэрэгтэй.

Zasах зүйлс:
1. require-ийн нэрийг засах: 'expresss' → 'express'
2. const app = express() дуудлагыг засах
3. PORT-ийн утгыг тохируулах

Жишээ засварласан кодын структур:
const express = require('express') // s нэмэлт байсан
const app = express()
const PORT = 3000
app.listen(PORT, () => console.log('Running on ' + PORT))`,
        starterCode: `// ЗАСАХ: 'expresss' → 'express' гэж засна уу
const express = require('express')

// ЗАСАХ: app үүсгэнэ үү
const app = express()

// ЗАСАХ: PORT тохируулна уу
const PORT = 3000

app.get('/', (req, res) => {
  res.json({ status: 'build fixed' })
})

app.listen(PORT, () => {
  console.log('Running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: "require('express')", hint: "require('express') засна уу (expresss биш)" },
          { type: 'hasText', text: 'app = express()', hint: 'const app = express() нэм' },
          { type: 'hasText', text: 'PORT = 3000', hint: 'PORT = 3000 тохируул' },
          { type: 'hasText', text: 'app.listen', hint: 'app.listen() нэм' },
        ] as JsRule[],
      },
      {
        title: 'Production optimize',
        description: `Production build-д оновчлолт нэмнэ үү.
NODE_ENV=production тохируулж, compression болон caching нэмнэ.

Жишээ:
process.env.NODE_ENV = 'production'

const buildConfig = {
  minify: true,
  sourceMaps: false,
  compression: 'gzip',
  caching: true,
  outputDir: 'dist'
}

console.log('Building with optimization:')
console.log(JSON.stringify(buildConfig, null, 2))
console.log('✓ Production build ready')`,
        starterCode: `process.env.NODE_ENV = 'production'

const buildConfig = {
  minify: true,
  sourceMaps: false,
  compression: 'gzip',
  caching: true,
  outputDir: 'dist'
}

console.log('Building with optimization:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log(JSON.stringify(buildConfig, null, 2))
console.log('✓ Production build ready')
`,
        checks: [
          { type: 'hasText', text: "NODE_ENV = 'production'", hint: "NODE_ENV = 'production' тохируул" },
          { type: 'hasText', text: 'minify', hint: 'minify option нэм' },
          { type: 'hasText', text: 'compression', hint: 'compression нэм' },
          { type: 'hasText', text: 'outputDir', hint: 'outputDir тохируул' },
        ] as JsRule[],
      },
      {
        title: 'Build pipeline бүрэн',
        description: `Install → Build → Optimize → Verify бүрэн build pipeline хийнэ үү.

Жишээ:
async function fullBuildPipeline() {
  const phases = [
    { name: 'Installing dependencies', cmd: 'npm install' },
    { name: 'Running build', cmd: 'npm run build' },
    { name: 'Optimizing for production', cmd: 'NODE_ENV=production' },
    { name: 'Verifying build output', cmd: 'ls dist/' },
  ]
  for (const phase of phases) {
    console.log('→ ' + phase.name + '...')
  }
  console.log('✓ Build pipeline complete')
  console.log('Ready to deploy!')
}
fullBuildPipeline()`,
        starterCode: `async function fullBuildPipeline() {
  const phases = [
    { name: 'Installing dependencies', cmd: 'npm install' },
    { name: 'Running build', cmd: 'npm run build' },
    { name: 'Optimizing for production', cmd: 'NODE_ENV=production' },
    { name: 'Verifying build output', cmd: 'ls dist/' },
  ]

  for (const phase of phases) {
    console.log('→ ' + phase.name + '...')
  }

  console.log('✓ Build pipeline complete')
  console.log('Ready to deploy!')
}

fullBuildPipeline()
`,
        checks: [
          { type: 'hasText', text: 'npm install', hint: '"npm install" phase нэм' },
          { type: 'hasText', text: 'npm run build', hint: '"npm run build" phase нэм' },
          { type: 'hasText', text: 'Build pipeline complete', hint: '"Build pipeline complete" хэвлэ' },
          { type: 'hasText', text: 'for (', hint: 'for loop ашиглан phases давта' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 2: ENV + PORT
  // ══════════════════════════════════════════════════
  {
    title: 'ENV + PORT Configuration',
    description: 'Environment variables, .env файл, process.env ашиглах',
    orderIndex: 2,
    xpReward: 70,
    tasks: [
      {
        title: '.env файл үүсгэх',
        description: `.env файлын бүтцийг кодлоно уу.
PORT, API_URL, NODE_ENV, DB_URL хувьсагч нэмнэ.

Жишээ:
// .env файлын агуулга:
const envConfig = \`
PORT=3000
API_URL=https://api.example.com
NODE_ENV=development
DB_URL=mongodb://localhost:27017/gamedb
SECRET_KEY=my-secret-key
\`
console.log('ENV CONFIG:')
console.log(envConfig)

Тайлбар:
- .env файл нь KEY=VALUE маягтай
- Production-д .env-г git-д оруулахгүй (.gitignore)`,
        starterCode: `// .env файлын бүтцийг дуурайна
const envConfig = \`
PORT=3000
API_URL=https://api.example.com
NODE_ENV=development
DB_URL=mongodb://localhost:27017/gamedb
SECRET_KEY=my-secret-key
\`

console.log('ENV CONFIG:')
console.log(envConfig.trim())
`,
        checks: [
          { type: 'hasText', text: 'PORT=3000', hint: 'PORT=3000 нэм' },
          { type: 'hasText', text: 'API_URL=', hint: 'API_URL нэм' },
          { type: 'hasText', text: 'NODE_ENV=', hint: 'NODE_ENV нэм' },
          { type: 'hasText', text: 'DB_URL=', hint: 'DB_URL нэм' },
        ] as JsRule[],
      },
      {
        title: 'process.env ашиглах',
        description: `Express server дотор process.env ашиглан config уншина уу.

Жишээ:
require('dotenv').config()
const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000
const API_URL = process.env.API_URL || 'http://localhost:3000'
const ENV = process.env.NODE_ENV || 'development'

app.listen(PORT, () => {
  console.log('Server: ' + ENV + ' mode, port ' + PORT)
})

Тайлбар:
- process.env.KEY нь тухайн environment хувьсагчийг уншина
- || 3000 нь fallback default утга`,
        starterCode: `require('dotenv').config()
const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000
const API_URL = process.env.API_URL || 'http://localhost:3000'
const ENV = process.env.NODE_ENV || 'development'

app.get('/api/config', (req, res) => {
  res.json({ env: ENV, port: PORT, apiUrl: API_URL })
})

app.listen(PORT, () => {
  console.log('Server: ' + ENV + ' mode, port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'process.env.PORT', hint: 'process.env.PORT ашигла' },
          { type: 'hasText', text: 'process.env.NODE_ENV', hint: 'process.env.NODE_ENV ашигла' },
          { type: 'hasText', text: 'process.env.API_URL', hint: 'process.env.API_URL ашигла' },
          { type: 'hasText', text: "require('dotenv')", hint: "require('dotenv').config() нэм" },
        ] as JsRule[],
      },
      {
        title: 'NODE_ENV дэмжлэг',
        description: `Development болон production environment-г ялгаж тохируулна уу.

Жишээ:
const ENV = process.env.NODE_ENV || 'development'
const isDev = ENV === 'development'
const isProd = ENV === 'production'

const config = {
  development: {
    port: 3000, debug: true, db: 'localhost:27017'
  },
  production: {
    port: process.env.PORT, debug: false, db: process.env.DB_URL
  }
}

const currentConfig = config[ENV] || config.development
console.log('Config:', ENV, JSON.stringify(currentConfig))`,
        starterCode: `const ENV = process.env.NODE_ENV || 'development'
const isDev = ENV === 'development'
const isProd = ENV === 'production'

const config = {
  development: {
    port: 3000,
    debug: true,
    db: 'localhost:27017/gamedb'
  },
  production: {
    port: process.env.PORT,
    debug: false,
    db: process.env.DB_URL
  }
}

const currentConfig = config[ENV] || config.development
console.log('Active ENV:', ENV)
console.log('Config:', JSON.stringify(currentConfig, null, 2))
`,
        checks: [
          { type: 'hasText', text: "NODE_ENV || 'development'", hint: "NODE_ENV || 'development' fallback нэм" },
          { type: 'hasText', text: 'isDev', hint: 'isDev хувьсагч үүсгэ' },
          { type: 'hasText', text: 'isProd', hint: 'isProd хувьсагч үүсгэ' },
          { type: 'hasText', text: 'production', hint: 'production config нэм' },
        ] as JsRule[],
      },
      {
        title: 'Dynamic port',
        description: `Server динамик PORT дээр listen хийх болгоно уу.
process.env.PORT || 3000 ашиглана.

Жишээ:
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({ message: 'Running', port: PORT })
})

app.listen(PORT, () => {
  console.log('Dynamic port: ' + PORT)
})

Тайлбар:
- process.env.PORT нь Render/Heroku-ийн автомат порт
- || 3000 нь local development-д ашиглана`,
        starterCode: `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({ message: 'Running', port: PORT, env: process.env.NODE_ENV || 'dev' })
})

app.listen(PORT, () => {
  console.log('Server on dynamic port: ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'process.env.PORT || 3000', hint: 'process.env.PORT || 3000 ашигла' },
          { type: 'hasText', text: 'app.listen(PORT', hint: 'app.listen(PORT) ашигла' },
          { type: 'hasText', text: 'dynamic port', hint: '"dynamic port" log нэм' },
        ] as JsRule[],
      },
      {
        title: 'Бүрэн env config',
        description: `Хатуу кодлогдсон утгагүй бүрэн environment config тохируулна уу.
Бүх утга process.env-с уншигдах ёстой.

Жишээ:
require('dotenv').config()
const express = require('express')
const app = express()

const config = {
  port: process.env.PORT || 3000,
  apiUrl: process.env.API_URL || '/api',
  env: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DB_URL || 'mongodb://localhost/dev',
  secret: process.env.SECRET_KEY || 'dev-secret',
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: config.env })
})

app.listen(config.port, () => {
  console.log('✓ Server ready, env=' + config.env)
})`,
        starterCode: `require('dotenv').config()
const express = require('express')
const app = express()

const config = {
  port: process.env.PORT || 3000,
  apiUrl: process.env.API_URL || '/api',
  env: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DB_URL || 'mongodb://localhost/dev',
  secret: process.env.SECRET_KEY || 'dev-secret',
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: config.env, port: config.port })
})

app.listen(config.port, () => {
  console.log('✓ Server ready, env=' + config.env + ', port=' + config.port)
})
`,
        checks: [
          { type: 'hasCount', text: 'process.env', count: 4, hint: 'process.env-г 4+ удаа ашигла' },
          { type: 'hasText', text: '/api/health', hint: '/api/health route нэм' },
          { type: 'hasText', text: "require('dotenv')", hint: "dotenv нэм" },
          { type: 'hasText', text: 'config.port', hint: 'config объект ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 3: DEPLOY – GIT + RENDER
  // ══════════════════════════════════════════════════
  {
    title: 'Deploy – Git + Render',
    description: 'Git workflow, push to GitHub, deploy to Render/Vercel',
    orderIndex: 3,
    xpReward: 75,
    tasks: [
      {
        title: 'Git init + commit',
        description: `Git repository үүсгэж эхний commit хийнэ үү.
git командуудыг дуурайлган кодлоно уу.

Жишээ:
const gitCommands = [
  'git init',
  'git add .',
  'git commit -m "Initial commit: ArenaHub game backend"',
]

console.log('Initializing Git repository...')
gitCommands.forEach(cmd => console.log('$ ' + cmd))
console.log('✓ Git repository created')

Тайлбар:
- git init нь шинэ repo үүсгэнэ
- git add . нь бүх файлыг stage хийнэ
- git commit нь snapshot үүсгэнэ`,
        starterCode: `const gitCommands = [
  'git init',
  'git add .',
  'git commit -m "Initial commit: ArenaHub game backend"',
]

console.log('Initializing Git repository...')
gitCommands.forEach(cmd => console.log('$ ' + cmd))
console.log('✓ Git repository created')
console.log('Branch: main')
`,
        checks: [
          { type: 'hasText', text: 'git init', hint: '"git init" команд нэм' },
          { type: 'hasText', text: 'git add', hint: '"git add" команд нэм' },
          { type: 'hasText', text: 'git commit', hint: '"git commit" команд нэм' },
          { type: 'hasText', text: 'Git repository created', hint: '"Git repository created" хэвлэ' },
        ] as JsRule[],
      },
      {
        title: '.gitignore үүсгэх',
        description: `.gitignore файлыг үүсгэнэ үү.
node_modules, .env, dist, .next-г ignore хийнэ.

Жишээ:
const gitignoreContent = \`
node_modules/
.env
.env.local
dist/
.next/
build/
*.log
.DS_Store
\`
console.log('.gitignore content:')
console.log(gitignoreContent.trim())
console.log('✓ .gitignore created')

Тайлбар:
- node_modules нь том учир ignore хийнэ
- .env нь нууц учир git-д оруулахгүй`,
        starterCode: `const gitignoreContent = \`
node_modules/
.env
.env.local
dist/
.next/
build/
*.log
.DS_Store
\`

console.log('.gitignore content:')
console.log(gitignoreContent.trim())
console.log('')
console.log('✓ .gitignore created - protecting sensitive files')
`,
        checks: [
          { type: 'hasText', text: 'node_modules/', hint: 'node_modules/ нэм' },
          { type: 'hasText', text: '.env', hint: '.env нэм' },
          { type: 'hasText', text: 'dist/', hint: 'dist/ нэм' },
          { type: 'hasText', text: '.gitignore created', hint: '".gitignore created" хэвлэ' },
        ] as JsRule[],
      },
      {
        title: 'GitHub remote + push',
        description: `Remote origin тохируулж GitHub-д push хийнэ үү.

Жишээ:
const deploySteps = [
  'git remote add origin https://github.com/user/arena-game.git',
  'git branch -M main',
  'git push -u origin main',
]

console.log('Pushing to GitHub...')
deploySteps.forEach(cmd => console.log('$ ' + cmd))
console.log('✓ Pushed to GitHub')
console.log('Remote: https://github.com/user/arena-game')

Тайлбар:
- git remote add origin нь GitHub URL-г холбоно
- git push нь local code-г remote-д илгээнэ`,
        starterCode: `const deploySteps = [
  'git remote add origin https://github.com/user/arena-game.git',
  'git branch -M main',
  'git push -u origin main',
]

console.log('Pushing to GitHub...')
deploySteps.forEach(cmd => console.log('$ ' + cmd))
console.log('✓ Pushed to GitHub')
console.log('Remote: https://github.com/user/arena-game')
`,
        checks: [
          { type: 'hasText', text: 'git remote add origin', hint: '"git remote add origin" нэм' },
          { type: 'hasText', text: 'git push', hint: '"git push" нэм' },
          { type: 'hasText', text: 'github.com', hint: 'GitHub URL нэм' },
          { type: 'hasText', text: 'Pushed to GitHub', hint: '"Pushed to GitHub" хэвлэ' },
        ] as JsRule[],
      },
      {
        title: 'Render deploy config',
        description: `Render.com deployment config файл үүсгэнэ үү.
render.yaml болон start command тохируулна.

Жишээ:
const renderConfig = {
  services: [
    {
      type: 'web',
      name: 'arena-game-api',
      env: 'node',
      plan: 'free',
      buildCommand: 'npm install',
      startCommand: 'node server.js',
      envVars: [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'PORT', value: '3000' },
      ]
    }
  ]
}
console.log('render.yaml:')
console.log(JSON.stringify(renderConfig, null, 2))
console.log('✓ Render config ready')`,
        starterCode: `const renderConfig = {
  services: [
    {
      type: 'web',
      name: 'arena-game-api',
      env: 'node',
      plan: 'free',
      buildCommand: 'npm install',
      startCommand: 'node server.js',
      envVars: [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'PORT', value: '3000' },
        { key: 'API_URL', value: 'https://arena-game-api.onrender.com' },
      ]
    }
  ]
}

console.log('render.yaml:')
console.log(JSON.stringify(renderConfig, null, 2))
console.log('✓ Render config ready to deploy')
`,
        checks: [
          { type: 'hasText', text: 'buildCommand', hint: 'buildCommand нэм' },
          { type: 'hasText', text: 'startCommand', hint: 'startCommand нэм' },
          { type: 'hasText', text: 'node server.js', hint: '"node server.js" start command нэм' },
          { type: 'hasText', text: 'Render config ready', hint: '"Render config ready" хэвлэ' },
        ] as JsRule[],
      },
      {
        title: 'Production URL шалгах',
        description: `Deployment амжилтын мэдэгдэл болон production URL харуулна уу.

Жишээ:
async function deployToRender() {
  console.log('Deploying to Render...')
  await new Promise(r => setTimeout(r, 500))
  console.log('→ Building...')
  await new Promise(r => setTimeout(r, 500))
  console.log('→ Uploading...')
  const deployedUrl = 'https://arena-game-api.onrender.com'
  console.log('✓ Deployed successfully!')
  console.log('🌐 URL: ' + deployedUrl)
  console.log('Health: ' + deployedUrl + '/api/health')
}
deployToRender()`,
        starterCode: `async function deployToRender() {
  console.log('Deploying to Render...')
  console.log('→ Building...')
  console.log('→ Starting server...')

  const deployedUrl = 'https://arena-game-api.onrender.com'

  console.log('✓ Deployed successfully!')
  console.log('URL: ' + deployedUrl)
  console.log('Health: ' + deployedUrl + '/api/health')
  console.log('Status: LIVE')
}

deployToRender()
`,
        checks: [
          { type: 'hasText', text: 'deployToRender', hint: 'deployToRender функц үүсгэ' },
          { type: 'hasText', text: 'Deployed successfully', hint: '"Deployed successfully" хэвлэ' },
          { type: 'hasText', text: 'onrender.com', hint: 'onrender.com URL нэм' },
          { type: 'hasText', text: '/api/health', hint: 'health URL нэм' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 4: LIVE API TEST
  // ══════════════════════════════════════════════════
  {
    title: 'Live API Testing',
    description: 'Production API тест хийх: GET, POST, error handling, health check',
    orderIndex: 4,
    xpReward: 75,
    tasks: [
      {
        title: 'GET endpoint тест',
        description: `fetch ашиглан GET /api/status тест хийнэ үү.
Status 200 байвал pass.

Жишээ:
async function testGetStatus() {
  try {
    const res = await fetch('/api/status')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    console.log('✓ GET /api/status → 200 OK')
    console.log('Response:', JSON.stringify(data))
  } catch (err) {
    console.error('✗ Test failed:', err.message)
  }
}
testGetStatus()`,
        starterCode: `async function testGetStatus() {
  try {
    const res = await fetch('/api/status')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    console.log('✓ GET /api/status → 200 OK')
    console.log('Response:', JSON.stringify(data))
  } catch (err) {
    console.error('✗ Test failed:', err.message)
  }
}

testGetStatus()
`,
        checks: [
          { type: 'hasText', text: 'fetch(', hint: 'fetch() ашигла' },
          { type: 'hasText', text: '/api/status', hint: '/api/status URL ашигла' },
          { type: 'hasText', text: 'res.ok', hint: 'res.ok шалгалт хий' },
          { type: 'hasText', text: 'try {', hint: 'try/catch ашигла' },
        ] as JsRule[],
      },
      {
        title: 'POST endpoint тест',
        description: `fetch ашиглан POST request илгээж response шалгана уу.

Жишээ:
async function testPostData() {
  const body = { name: 'test-player', score: 100 }
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  console.log('✓ POST /api/data → ' + res.status)
  console.log('Response:', JSON.stringify(data))
  return data.success === true
}
testPostData()`,
        starterCode: `async function testPostData() {
  const body = { name: 'test-player', score: 100 }

  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = await res.json()
  console.log('✓ POST /api/data → ' + res.status)
  console.log('Sent:', JSON.stringify(body))
  console.log('Received:', JSON.stringify(data))
  return data.success === true
}

testPostData()
`,
        checks: [
          { type: 'hasText', text: "method: 'POST'", hint: "method: 'POST' тохируул" },
          { type: 'hasText', text: "'Content-Type': 'application/json'", hint: 'Content-Type header нэм' },
          { type: 'hasText', text: 'JSON.stringify(body)', hint: 'JSON.stringify(body) ашигла' },
          { type: 'hasText', text: 'data.success', hint: 'data.success шалга' },
        ] as JsRule[],
      },
      {
        title: 'API error handling',
        description: `API алдааг try/catch-р барих болон retry логик нэмнэ үү.

Жишээ:
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return await res.json()
    } catch (err) {
      console.warn('Attempt ' + (i+1) + ' failed:', err.message)
      if (i === retries - 1) throw err
    }
  }
}

fetchWithRetry('/api/status')
  .then(d => console.log('✓ Success:', JSON.stringify(d)))
  .catch(e => console.error('✗ All retries failed:', e.message))`,
        starterCode: `async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return await res.json()
    } catch (err) {
      console.warn('Attempt ' + (i + 1) + ' failed:', err.message)
      if (i === retries - 1) throw err
    }
  }
}

fetchWithRetry('/api/status')
  .then(d => console.log('✓ Success:', JSON.stringify(d)))
  .catch(e => console.error('✗ All retries failed:', e.message))
`,
        checks: [
          { type: 'hasText', text: 'fetchWithRetry', hint: 'fetchWithRetry функц үүсгэ' },
          { type: 'hasText', text: 'retries', hint: 'retries параметр нэм' },
          { type: 'hasText', text: 'try {', hint: 'try/catch ашигла' },
          { type: 'hasText', text: 'All retries failed', hint: '"All retries failed" error мэдэгдэл нэм' },
        ] as JsRule[],
      },
      {
        title: 'Health check endpoint',
        description: `API-ийн /api/health endpoint байгаа эсэхийг шалгах тест хийнэ үү.
Server, DB, memory статус мэдээлэл буцаана.

Жишээ:
// Server-ийн health endpoint:
const express = require('express')
const app = express()

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    memory: process.memoryUsage ? process.memoryUsage().heapUsed : 0,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  })
})

app.listen(3000, () => console.log('Health check active'))`,
        starterCode: `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: 0,
    memory: 0,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log('Health check active on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: '/api/health', hint: '/api/health route нэм' },
          { type: 'hasText', text: "status: 'ok'", hint: "status: 'ok' буцаа" },
          { type: 'hasText', text: 'timestamp', hint: 'timestamp нэм' },
          { type: 'hasText', text: 'env:', hint: 'env key нэм' },
        ] as JsRule[],
      },
      {
        title: 'Бүрэн API test suite',
        description: `GET, POST, health check бүгдийг нэгтгэсэн API test suite хийнэ үү.

Жишээ:
async function runApiTests() {
  const tests = [
    { name: 'GET /api/health', url: '/api/health', method: 'GET' },
    { name: 'GET /api/status', url: '/api/status', method: 'GET' },
    { name: 'POST /api/data', url: '/api/data', method: 'POST', body: { test: true } },
  ]
  let passed = 0
  for (const t of tests) {
    try {
      const res = await fetch(t.url, { method: t.method, ... })
      console.log('✓ ' + t.name + ' → ' + res.status)
      passed++
    } catch (e) {
      console.log('✗ ' + t.name + ' → FAIL')
    }
  }
  console.log(passed + '/' + tests.length + ' tests passed')
}
runApiTests()`,
        starterCode: `async function runApiTests() {
  const tests = [
    { name: 'GET /api/health', url: '/api/health', method: 'GET' },
    { name: 'GET /api/status', url: '/api/status', method: 'GET' },
    { name: 'POST /api/data', url: '/api/data', method: 'POST',
      body: { test: true } },
  ]

  let passed = 0
  for (const t of tests) {
    try {
      const opts = { method: t.method }
      if (t.body) {
        opts.headers = { 'Content-Type': 'application/json' }
        opts.body = JSON.stringify(t.body)
      }
      const res = await fetch(t.url, opts)
      console.log('✓ ' + t.name + ' → ' + res.status)
      passed++
    } catch (e) {
      console.log('✗ ' + t.name + ' → FAIL: ' + e.message)
    }
  }
  console.log(passed + '/' + tests.length + ' tests passed')
}

runApiTests()
`,
        checks: [
          { type: 'hasText', text: 'runApiTests', hint: 'runApiTests функц үүсгэ' },
          { type: 'hasText', text: '/api/health', hint: '/api/health тест нэм' },
          { type: 'hasCount', text: 'fetch(', count: 1, hint: 'fetch() ашигла' },
          { type: 'hasText', text: 'tests passed', hint: '"tests passed" үр дүн харуул' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 5: FULLSTACK GAME LOGIC
  // ══════════════════════════════════════════════════
  {
    title: 'Fullstack Game Logic',
    description: 'Frontend + Backend + DB бүрэн холбосон game систем',
    orderIndex: 5,
    xpReward: 80,
    tasks: [
      {
        title: 'Frontend ↔ Backend sync',
        description: `Frontend fetch-ээр backend-с game data авч харуулна уу.

Жишээ:
// Backend (server.js):
const gameState = { score: 0, level: 1, players: [] }
app.get('/api/game', (req, res) => res.json(gameState))

// Frontend (client.js):
async function syncGameState() {
  const state = await fetch('/api/game').then(r => r.json())
  console.log('Score:', state.score)
  console.log('Level:', state.level)
  return state
}
setInterval(syncGameState, 2000)`,
        starterCode: `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

// Backend game state
const gameState = {
  score: 0,
  level: 1,
  players: [],
  enemies: 0
}

app.get('/api/game', (req, res) => {
  res.json(gameState)
})

// Simulate frontend sync
async function syncGameState() {
  const state = gameState // normally: await fetch('/api/game').then(r => r.json())
  console.log('Synced → Score:', state.score, 'Level:', state.level)
}

setInterval(() => {
  gameState.score += 10
  syncGameState()
}, 1000)

app.listen(PORT, () => {
  console.log('Fullstack game running on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'gameState', hint: 'gameState объект үүсгэ' },
          { type: 'hasText', text: '/api/game', hint: '/api/game route нэм' },
          { type: 'hasText', text: 'syncGameState', hint: 'syncGameState функц үүсгэ' },
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашиглан sync хий' },
        ] as JsRule[],
      },
      {
        title: 'In-memory DB simulation',
        description: `Database-ийг дуурайлган in-memory store хийнэ үү.
CRUD operations нэмнэ.

Жишээ:
class GameDB {
  constructor() { this.store = {} }
  set(key, value) { this.store[key] = value; return true }
  get(key) { return this.store[key] || null }
  delete(key) { delete this.store[key]; return true }
  all() { return this.store }
}

const db = new GameDB()
db.set('player:1', { name: 'Hero', score: 0, hp: 100 })
db.set('player:2', { name: 'Warrior', score: 50, hp: 80 })
console.log('DB:', JSON.stringify(db.all()))`,
        starterCode: `class GameDB {
  constructor() { this.store = {} }
  set(key, value) { this.store[key] = value; return true }
  get(key) { return this.store[key] || null }
  delete(key) { delete this.store[key]; return true }
  all() { return this.store }
  count() { return Object.keys(this.store).length }
}

const db = new GameDB()
db.set('player:1', { name: 'Hero', score: 0, hp: 100 })
db.set('player:2', { name: 'Warrior', score: 50, hp: 80 })
db.set('enemy:1', { name: 'Goblin', hp: 50 })

console.log('DB entries:', db.count())
console.log('DB:', JSON.stringify(db.all(), null, 2))
`,
        checks: [
          { type: 'hasText', text: 'class GameDB', hint: 'GameDB class үүсгэ' },
          { type: 'hasText', text: 'this.store', hint: 'this.store ашигла' },
          { type: 'hasText', text: 'db.set(', hint: 'db.set() ашигла' },
          { type: 'hasText', text: 'db.all()', hint: 'db.all() ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Score sync системл',
        description: `Backend score-г client polling-оор real-time шинэчилдэг систем хийнэ үү.

Жишээ:
const express = require('express')
const app = express()

let globalScore = 0
setInterval(() => { globalScore += 5 }, 500)

app.get('/api/score', (req, res) => {
  res.json({ score: globalScore, level: Math.floor(globalScore / 100) + 1 })
})

// Client polling simulation:
let lastScore = 0
const poll = setInterval(async () => {
  const data = await fetch('/api/score').then(r => r.json())
  if (data.score !== lastScore) {
    console.log('Score updated:', data.score)
    lastScore = data.score
  }
}, 1000)`,
        starterCode: `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

let globalScore = 0

// Backend: auto increment score
setInterval(() => { globalScore += 5 }, 500)

app.get('/api/score', (req, res) => {
  res.json({
    score: globalScore,
    level: Math.floor(globalScore / 100) + 1
  })
})

// Simulate client polling
let lastScore = 0
setInterval(() => {
  // normally: await fetch('/api/score').then(r => r.json())
  const data = { score: globalScore, level: Math.floor(globalScore / 100) + 1 }
  if (data.score !== lastScore) {
    console.log('Score synced:', data.score, 'Level:', data.level)
    lastScore = data.score
  }
}, 1000)

app.listen(PORT, () => {
  console.log('Score sync server running')
})
`,
        checks: [
          { type: 'hasText', text: 'globalScore', hint: 'globalScore хувьсагч үүсгэ' },
          { type: 'hasText', text: '/api/score', hint: '/api/score route нэм' },
          { type: 'hasCount', text: 'setInterval', count: 2, hint: 'setInterval-г 2 удаа ашигла' },
          { type: 'hasText', text: 'Score synced', hint: '"Score synced" log нэм' },
        ] as JsRule[],
      },
      {
        title: 'Enemy sync системл',
        description: `Server-controlled enemy state-г client-д sync хийдэг систем хийнэ үү.

Жишээ:
let enemies = []
let enemyId = 1

// Auto spawn enemies
setInterval(() => {
  enemies.push({ id: enemyId++, hp: 50, alive: true })
  if (enemies.length > 5) enemies.shift()
}, 2000)

// Client sync simulation
setInterval(() => {
  const alive = enemies.filter(e => e.alive).length
  console.log('Enemies alive:', alive + '/' + enemies.length)
}, 1000)`,
        starterCode: `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

let enemies = []
let enemyId = 1

// Server: auto spawn enemies
setInterval(() => {
  enemies.push({ id: enemyId++, name: 'Enemy', hp: 50, alive: true })
  if (enemies.length > 5) enemies.shift()
}, 2000)

app.get('/api/enemies', (req, res) => {
  res.json({ count: enemies.length, enemies })
})

// Simulate client sync
setInterval(() => {
  const alive = enemies.filter(e => e.alive).length
  console.log('Enemies alive:', alive + '/' + enemies.length)
}, 1000)

app.listen(PORT, () => {
  console.log('Enemy sync server running')
})
`,
        checks: [
          { type: 'hasText', text: 'enemies = []', hint: 'enemies array үүсгэ' },
          { type: 'hasText', text: 'enemies.push', hint: 'enemies.push() ашигла' },
          { type: 'hasText', text: '/api/enemies', hint: '/api/enemies route нэм' },
          { type: 'hasText', text: 'Enemies alive:', hint: '"Enemies alive:" log нэм' },
        ] as JsRule[],
      },
      {
        title: 'Бүрэн fullstack',
        description: `Frontend + Backend + DB + API бүрэн архитектур хийнэ үү.

Шалгавар:
- Express server (backend)
- In-memory DB (persistence layer)
- /api/health, /api/game routes
- setInterval game loop (backend)
- Client simulation (polling)`,
        starterCode: `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// ── In-memory DB ──────────────────────────
const db = {
  players: [{ id: 1, name: 'Hero', score: 0, hp: 100 }],
  enemies: [],
  settings: { maxEnemies: 5, spawnRate: 2000 }
}

// ── Auto game loop ───────────────────────
let score = 0
let enemyId = 1

setInterval(() => {
  score += 5
  db.players[0].score = score
}, 500)

setInterval(() => {
  if (db.enemies.length < db.settings.maxEnemies) {
    db.enemies.push({ id: enemyId++, hp: 50, alive: true })
  }
}, db.settings.spawnRate)

// ── API Routes ───────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'dev' })
})

app.get('/api/game', (req, res) => {
  res.json({
    players: db.players,
    enemies: db.enemies.length,
    score
  })
})

// ── Client simulation ────────────────────
setInterval(() => {
  const state = { players: db.players, enemies: db.enemies.length, score }
  console.log('State sync → score:', score, 'enemies:', db.enemies.length)
}, 1000)

app.listen(PORT, () => {
  console.log('Fullstack game server on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: '/api/health', hint: '/api/health route нэм' },
          { type: 'hasText', text: '/api/game', hint: '/api/game route нэм' },
          { type: 'hasCount', text: 'setInterval', count: 3, hint: 'setInterval-г 3 удаа ашигла' },
          { type: 'hasText', text: 'State sync', hint: '"State sync" log нэм' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 6: MULTIPLAYER LIVE
  // ══════════════════════════════════════════════════
  {
    title: 'Multiplayer Live Sync',
    description: 'Real-time multiplayer: socket events, shared state, WebSocket',
    orderIndex: 6,
    xpReward: 85,
    tasks: [
      {
        title: 'Shared player state',
        description: `Олон тоглогчийн хуваалцсан state үүсгэнэ үү.

Жишээ:
const players = new Map()

function addPlayer(id, name) {
  players.set(id, { id, name, score: 0, hp: 100, online: true })
  console.log('Player joined:', name, '| Total:', players.size)
}

function removePlayer(id) {
  const p = players.get(id)
  players.delete(id)
  console.log('Player left:', p?.name, '| Total:', players.size)
}

addPlayer('p1', 'Hero')
addPlayer('p2', 'Warrior')
addPlayer('p3', 'Mage')
console.log('Players:', JSON.stringify([...players.values()]))`,
        starterCode: `const players = new Map()

function addPlayer(id, name) {
  players.set(id, { id, name, score: 0, hp: 100, online: true })
  console.log('Player joined:', name, '| Total:', players.size)
}

function removePlayer(id) {
  const p = players.get(id)
  players.delete(id)
  console.log('Player left:', p?.name, '| Total:', players.size)
}

addPlayer('p1', 'Hero')
addPlayer('p2', 'Warrior')
addPlayer('p3', 'Mage')

console.log('Active players:', players.size)
console.log(JSON.stringify([...players.values()], null, 2))
`,
        checks: [
          { type: 'hasText', text: 'new Map()', hint: 'Map() ашигла' },
          { type: 'hasText', text: 'players.set(', hint: 'players.set() ашигла' },
          { type: 'hasText', text: 'players.delete(', hint: 'players.delete() ашигла' },
          { type: 'hasText', text: 'players.size', hint: 'players.size ашигла' },
        ] as JsRule[],
      },
      {
        title: 'User sync simulation',
        description: `setInterval ашиглан тоглогчдын state-г тогтмол синхрончилдог систем хийнэ үү.

Жишээ:
const players = new Map([
  ['p1', { name: 'Hero', score: 0 }],
  ['p2', { name: 'Warrior', score: 0 }],
])

// Auto score increment per player
setInterval(() => {
  players.forEach((p, id) => {
    p.score += Math.floor(Math.random() * 10) + 1
  })
}, 500)

// Broadcast state every second
setInterval(() => {
  const state = [...players.entries()].map(([id, p]) => ({
    id, name: p.name, score: p.score
  }))
  console.log('Broadcast:', JSON.stringify(state))
}, 1000)`,
        starterCode: `const players = new Map([
  ['p1', { name: 'Hero', score: 0 }],
  ['p2', { name: 'Warrior', score: 0 }],
])

// Auto score per player
setInterval(() => {
  players.forEach((p) => {
    p.score += Math.floor(Math.random() * 10) + 1
  })
}, 500)

// Broadcast state
setInterval(() => {
  const state = [...players.entries()].map(([id, p]) => ({
    id, name: p.name, score: p.score
  }))
  console.log('Broadcast:', JSON.stringify(state))
}, 1000)
`,
        checks: [
          { type: 'hasText', text: 'players.forEach', hint: 'players.forEach() ашигла' },
          { type: 'hasCount', text: 'setInterval', count: 2, hint: 'setInterval-г 2 удаа ашигла' },
          { type: 'hasText', text: 'Broadcast:', hint: '"Broadcast:" log нэм' },
          { type: 'hasText', text: 'Math.random()', hint: 'Math.random() ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Socket event simulation',
        description: `Socket.io-ийн event системийг дуурайлган EventEmitter хийнэ үү.

Жишээ:
class GameSocket {
  constructor() { this.listeners = {} }
  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(fn)
  }
  emit(event, data) {
    console.log('socket.emit:', event, JSON.stringify(data))
    ;(this.listeners[event] || []).forEach(fn => fn(data))
  }
}

const socket = new GameSocket()
socket.on('player:join', (d) => console.log(d.name + ' joined the game'))
socket.on('score:update', (d) => console.log('Score updated:', d.score))

socket.emit('player:join', { id: 'p1', name: 'Hero' })
socket.emit('score:update', { id: 'p1', score: 150 })`,
        starterCode: `class GameSocket {
  constructor() { this.listeners = {} }

  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(fn)
  }

  emit(event, data) {
    console.log('socket.emit:', event, JSON.stringify(data))
    ;(this.listeners[event] || []).forEach(fn => fn(data))
  }
}

const socket = new GameSocket()

socket.on('player:join', (d) => console.log(d.name + ' joined the game'))
socket.on('score:update', (d) => console.log('Score updated:', d.score))
socket.on('player:leave', (d) => console.log(d.name + ' left'))

socket.emit('player:join', { id: 'p1', name: 'Hero' })
socket.emit('score:update', { id: 'p1', score: 150 })
socket.emit('player:leave', { id: 'p2', name: 'Warrior' })
`,
        checks: [
          { type: 'hasText', text: 'class GameSocket', hint: 'GameSocket class үүсгэ' },
          { type: 'hasText', text: 'socket.on(', hint: 'socket.on() event listener нэм' },
          { type: 'hasText', text: 'socket.emit(', hint: 'socket.emit() event дуудах нэм' },
          { type: 'hasText', text: 'player:join', hint: '"player:join" event нэм' },
        ] as JsRule[],
      },
      {
        title: 'Shared enemy system',
        description: `Бүх тоглогчдод хуваалцсан дайсны систем хийнэ үү.
Нэг тоглогч дайсан устгахад бусад тоглогчид харагдана.

Жишээ:
const sharedEnemies = new Map()
let nextId = 1

function spawnEnemy() {
  const id = 'e' + nextId++
  sharedEnemies.set(id, { id, hp: 50, alive: true })
  console.log('Enemy spawned:', id, '| Total:', sharedEnemies.size)
}

function killEnemy(id) {
  const e = sharedEnemies.get(id)
  if (e) { e.alive = false; console.log('Enemy killed:', id) }
}

// Simulate multiplayer enemy system
setInterval(spawnEnemy, 1000)
setTimeout(() => killEnemy('e1'), 1500)`,
        starterCode: `const sharedEnemies = new Map()
let nextId = 1

function spawnEnemy() {
  const id = 'e' + nextId++
  sharedEnemies.set(id, { id, hp: 50, alive: true })
  console.log('Enemy spawned:', id, '| Total:', sharedEnemies.size)
}

function killEnemy(id) {
  const e = sharedEnemies.get(id)
  if (e) {
    e.alive = false
    console.log('Enemy killed:', id)
  }
}

// Auto spawn
setInterval(spawnEnemy, 1000)

// Simulate player killing an enemy
setTimeout(() => {
  killEnemy('e1')
  console.log('Active enemies:', [...sharedEnemies.values()].filter(e => e.alive).length)
}, 1500)
`,
        checks: [
          { type: 'hasText', text: 'sharedEnemies', hint: 'sharedEnemies Map үүсгэ' },
          { type: 'hasText', text: 'spawnEnemy', hint: 'spawnEnemy функц үүсгэ' },
          { type: 'hasText', text: 'killEnemy', hint: 'killEnemy функц үүсгэ' },
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашиглан auto spawn хий' },
        ] as JsRule[],
      },
      {
        title: 'Бүрэн multiplayer',
        description: `Бүх тоглогч хуваалцсан ертөнц дэх бүрэн multiplayer систем хийнэ үү.

Шалгавар:
- Player map (нэмэх, хасах)
- Shared enemies
- Socket events simulation
- Score broadcast
- Game state sync`,
        starterCode: `// ── Shared World State ───────────────────
const world = {
  players: new Map(),
  enemies: new Map(),
  score: { total: 0 }
}

// ── Socket simulation ─────────────────────
class GameSocket {
  constructor() { this.listeners = {} }
  on(e, fn) { (this.listeners[e] = this.listeners[e] || []).push(fn) }
  emit(e, d) { (this.listeners[e] || []).forEach(fn => fn(d)) }
}
const socket = new GameSocket()

// ── Events ────────────────────────────────
socket.on('player:join', ({ id, name }) => {
  world.players.set(id, { name, score: 0, hp: 100 })
  console.log(name + ' joined | Players:', world.players.size)
})

socket.on('enemy:kill', ({ playerId, enemyId }) => {
  world.enemies.delete(enemyId)
  const p = world.players.get(playerId)
  if (p) { p.score += 10; world.score.total += 10 }
  console.log('Enemy killed | Total score:', world.score.total)
})

// ── Auto systems ──────────────────────────
let enemyId = 1
setInterval(() => {
  world.enemies.set('e' + enemyId, { hp: 50 })
  enemyId++
}, 1500)

// Broadcast world state
setInterval(() => {
  console.log('World: players=' + world.players.size +
    ' enemies=' + world.enemies.size +
    ' score=' + world.score.total)
}, 1000)

// ── Simulation ────────────────────────────
socket.emit('player:join', { id: 'p1', name: 'Hero' })
socket.emit('player:join', { id: 'p2', name: 'Warrior' })
setTimeout(() => socket.emit('enemy:kill', { playerId: 'p1', enemyId: 'e1' }), 2000)
`,
        checks: [
          { type: 'hasText', text: 'world.players', hint: 'world.players Map ашигла' },
          { type: 'hasText', text: 'socket.on(', hint: 'socket.on() event нэм' },
          { type: 'hasText', text: 'socket.emit(', hint: 'socket.emit() ашигла' },
          { type: 'hasText', text: 'World:', hint: '"World:" broadcast log нэм' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 7: FINAL AUTO GAME
  // ══════════════════════════════════════════════════
  {
    title: 'Final Auto Game – Production',
    description: 'Бүх системийг нэгтгэсэн production-ready fullstack game simulation',
    orderIndex: 7,
    xpReward: 95,
    tasks: [
      {
        title: 'Auto server loop',
        description: `Server-side setInterval loop ашиглан game тик системийг хийнэ үү.
Tick 100ms тутамд гарна, game state шинэчлэгдэнэ.

Жишээ:
let tick = 0
const TICK_RATE = 100

setInterval(() => {
  tick++
  if (tick % 10 === 0) {
    console.log('Tick:', tick, '| Time:', (tick * TICK_RATE / 1000).toFixed(1) + 's')
  }
}, TICK_RATE)`,
        starterCode: `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

let tick = 0
const TICK_RATE = 100

// Server game loop
setInterval(() => {
  tick++
  if (tick % 10 === 0) {
    console.log('Tick:', tick, '| Time:', (tick * TICK_RATE / 1000).toFixed(1) + 's')
  }
}, TICK_RATE)

app.get('/api/tick', (req, res) => {
  res.json({ tick, time: (tick * TICK_RATE / 1000).toFixed(1) })
})

app.listen(PORT, () => {
  console.log('Server loop started on port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'TICK_RATE', hint: 'TICK_RATE constant үүсгэ' },
          { type: 'hasText', text: 'setInterval', hint: 'setInterval game loop нэм' },
          { type: 'hasText', text: '/api/tick', hint: '/api/tick route нэм' },
          { type: 'hasText', text: 'Server loop started', hint: '"Server loop started" log нэм' },
        ] as JsRule[],
      },
      {
        title: 'Auto score backend',
        description: `Backend-д auto score нэмэгдэх систем хийж leaderboard буцаана уу.

Жишээ:
const players = [
  { id: 1, name: 'Hero', score: 0 },
  { id: 2, name: 'Warrior', score: 0 },
]

setInterval(() => {
  players.forEach(p => {
    p.score += Math.floor(Math.random() * 5) + 1
  })
}, 500)

app.get('/api/leaderboard', (req, res) => {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  res.json(sorted)
})`,
        starterCode: `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const players = [
  { id: 1, name: 'Hero', score: 0 },
  { id: 2, name: 'Warrior', score: 0 },
  { id: 3, name: 'Mage', score: 0 },
]

// Auto score
setInterval(() => {
  players.forEach(p => {
    p.score += Math.floor(Math.random() * 5) + 1
  })
}, 500)

// Broadcast leaderboard
setInterval(() => {
  const top = [...players].sort((a, b) => b.score - a.score)
  console.log('Leaderboard:', top.map(p => p.name + ':' + p.score).join(', '))
}, 2000)

app.get('/api/leaderboard', (req, res) => {
  res.json([...players].sort((a, b) => b.score - a.score))
})

app.listen(PORT, () => {
  console.log('Auto score server running')
})
`,
        checks: [
          { type: 'hasText', text: 'players.forEach', hint: 'players.forEach() ашигла' },
          { type: 'hasText', text: '/api/leaderboard', hint: '/api/leaderboard route нэм' },
          { type: 'hasText', text: '.sort((a, b) => b.score - a.score)', hint: 'score-оор эрэмбэл' },
          { type: 'hasText', text: 'Leaderboard:', hint: '"Leaderboard:" log нэм' },
        ] as JsRule[],
      },
      {
        title: 'Auto enemy generation',
        description: `Random stat-тай дайснуудыг автоматаар үүсгэдэг систем хийнэ үү.

Жишээ:
const ENEMY_TYPES = ['Goblin', 'Orc', 'Dragon', 'Troll']

function spawnRandomEnemy() {
  return {
    id: Date.now(),
    name: ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)],
    hp: Math.floor(Math.random() * 100) + 20,
    speed: Math.floor(Math.random() * 5) + 1,
    alive: true
  }
}

const enemies = []
setInterval(() => {
  const e = spawnRandomEnemy()
  enemies.push(e)
  console.log('Spawned:', e.name, 'HP:', e.hp)
}, 1000)`,
        starterCode: `const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const ENEMY_TYPES = ['Goblin', 'Orc', 'Dragon', 'Troll']

function spawnRandomEnemy() {
  return {
    id: Date.now(),
    name: ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)],
    hp: Math.floor(Math.random() * 100) + 20,
    speed: Math.floor(Math.random() * 5) + 1,
    alive: true
  }
}

const enemies = []

setInterval(() => {
  const e = spawnRandomEnemy()
  enemies.push(e)
  if (enemies.length > 10) enemies.shift()
  console.log('Spawned:', e.name, 'HP:', e.hp, '| Total:', enemies.length)
}, 1000)

app.get('/api/enemies', (req, res) => {
  res.json({ count: enemies.length, enemies })
})

app.listen(PORT, () => {
  console.log('Enemy generator running')
})
`,
        checks: [
          { type: 'hasText', text: 'ENEMY_TYPES', hint: 'ENEMY_TYPES array үүсгэ' },
          { type: 'hasText', text: 'spawnRandomEnemy', hint: 'spawnRandomEnemy функц үүсгэ' },
          { type: 'hasText', text: 'Math.random()', hint: 'Math.random() ашигла' },
          { type: 'hasText', text: '/api/enemies', hint: '/api/enemies route нэм' },
        ] as JsRule[],
      },
      {
        title: 'Auto frontend polling',
        description: `Frontend polling ашиглан backend state автоматаар шинэчлэгддэг систем хийнэ үү.

Жишээ:
// Polling client simulation
class GameClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl
    this.state = { score: 0, enemies: 0, level: 1 }
    this.pollInterval = null
  }

  startPolling(intervalMs = 1000) {
    this.pollInterval = setInterval(async () => {
      // const data = await fetch(this.serverUrl + '/api/game').then(r => r.json())
      const data = this.state // mock
      console.log('UI update:', JSON.stringify(data))
    }, intervalMs)
  }

  stopPolling() {
    clearInterval(this.pollInterval)
  }
}

const client = new GameClient('http://localhost:3000')
client.startPolling(1000)`,
        starterCode: `class GameClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl
    this.state = { score: 0, enemies: 0, level: 1 }
    this.pollInterval = null
  }

  startPolling(intervalMs = 1000) {
    this.pollInterval = setInterval(() => {
      // Simulate fetching: const data = await fetch(this.serverUrl + '/api/game').then(r=>r.json())
      this.state.score += 5
      this.state.level = Math.floor(this.state.score / 100) + 1
      console.log('UI update → score:', this.state.score, 'level:', this.state.level)
    }, intervalMs)
  }

  stopPolling() {
    clearInterval(this.pollInterval)
    console.log('Polling stopped')
  }
}

const client = new GameClient('http://localhost:3000')
client.startPolling(1000)
setTimeout(() => client.stopPolling(), 3000)
`,
        checks: [
          { type: 'hasText', text: 'class GameClient', hint: 'GameClient class үүсгэ' },
          { type: 'hasText', text: 'startPolling', hint: 'startPolling функц үүсгэ' },
          { type: 'hasText', text: 'stopPolling', hint: 'stopPolling функц үүсгэ' },
          { type: 'hasText', text: 'UI update', hint: '"UI update" log нэм' },
        ] as JsRule[],
      },
      {
        title: '🏆 FULLSTACK MASTER',
        description: `Бүх системийг нэгтгэсэн эцсийн production simulation хийнэ үү.

Нэгтгэх ёстой системүүд:
✓ Express backend + ENV config
✓ In-memory DB (GameDB class)
✓ Auto game loop (score, enemies)
✓ REST API routes (/api/health, /api/game, /api/leaderboard)
✓ Multiplayer socket simulation
✓ Frontend polling client
✓ Deploy config simulation

Энэ бол таны FULLSTACK MASTER шалгавар!
Бүх хэсгийг нэгтгэж бүрэн ажиллагаатай систем үүсгэнэ үү.`,
        starterCode: `require('dotenv').config && require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const ENV = process.env.NODE_ENV || 'development'

app.use(express.json())

// ── In-memory DB ──────────────────────────────
class GameDB {
  constructor() { this.store = {} }
  set(k, v) { this.store[k] = v }
  get(k) { return this.store[k] }
  all() { return this.store }
}
const db = new GameDB()

// ── Game State ────────────────────────────────
let score = 0
let tick = 0
const players = new Map()
const enemies = new Map()
let enemyId = 1

players.set('p1', { name: 'Hero', score: 0, hp: 100 })
players.set('p2', { name: 'Warrior', score: 0, hp: 100 })

// ── Auto Game Loop ────────────────────────────
setInterval(() => {
  tick++
  score += 5
  players.forEach(p => { p.score += 2 })
}, 500)

setInterval(() => {
  enemies.set('e' + enemyId++, { hp: 50, alive: true })
  if (enemies.size > 5) enemies.delete(enemies.keys().next().value)
}, 2000)

// ── Broadcast ─────────────────────────────────
setInterval(() => {
  console.log('[Tick ' + tick + '] Score:', score,
    '| Players:', players.size,
    '| Enemies:', enemies.size)
}, 1000)

// ── API Routes ────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: ENV, tick })
})

app.get('/api/game', (req, res) => {
  res.json({ score, tick, players: players.size, enemies: enemies.size })
})

app.get('/api/leaderboard', (req, res) => {
  const board = [...players.values()].sort((a, b) => b.score - a.score)
  res.json(board)
})

// ── Deploy simulation ──────────────────────────
const deployConfig = {
  buildCommand: 'npm install',
  startCommand: 'node server.js',
  env: { NODE_ENV: 'production', PORT: '3000' }
}
console.log('Deploy config ready:', JSON.stringify(deployConfig))

// ── Git simulation ────────────────────────────
const gitLog = ['git init', 'git add .', 'git commit -m "FULLSTACK MASTER"', 'git push']
gitLog.forEach(cmd => console.log('$ ' + cmd))

app.listen(PORT, () => {
  console.log('🏆 FULLSTACK MASTER COMPLETED')
  console.log('Server: ' + ENV + ' mode, port ' + PORT)
})
`,
        checks: [
          { type: 'hasText', text: 'class GameDB', hint: 'GameDB class нэм' },
          { type: 'hasText', text: 'FULLSTACK MASTER COMPLETED', hint: '"FULLSTACK MASTER COMPLETED" хэвлэ' },
          { type: 'hasText', text: '/api/leaderboard', hint: '/api/leaderboard route нэм' },
          { type: 'hasText', text: 'git commit', hint: 'git commit нэм' },
        ] as JsRule[],
      },
    ],
  },
]

// ── Main seed function ────────────────────────────────────────────────────
async function main() {
  console.log('Seeding Fullstack & DevOps – Deploy & Scale course...')

  let course = await prisma.course.findFirst({ where: { category: 'FULLSTACK' } })

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'Fullstack & DevOps – Deploy & Scale',
        description: 'Build process, ENV config, Git deploy, API testing, multiplayer, production simulation',
        category: 'FULLSTACK',
        difficulty: 'ADVANCED',
        xpReward: 1000,
        imageUrl: '/courses/fullstack.png',
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
            testCases: fsMeta(taskData.checks),
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
            testCases: fsMeta(taskData.checks),
          },
        })
        console.log('    Updated task:', task.title)
      }
    }
  }

  console.log('Done! Fullstack course seeded successfully.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())