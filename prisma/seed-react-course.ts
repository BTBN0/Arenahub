/**
 * Seed: React – Game UI Components (Course 5)
 * Run: npx tsx prisma/seed-react-course.ts
 *
 * Creates/upserts Course 5 (REACT) with 7 lessons × 5 tasks.
 * testCases format: { mode: "react", checks: JsRule[] }
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

function reactMeta(checks: JsRule[]) {
  return JSON.parse(JSON.stringify({ mode: 'react', checks }))
}

// ── Lesson data ────────────────────────────────────────────────────────
const LESSONS = [

  // ══════════════════════════════════════════════════
  // LESSON 1: COMPONENT STRUCTURE
  // ══════════════════════════════════════════════════
  {
    title: 'Component бүтэц',
    description: 'React functional component үүсгэх, JSX буцаах, root-д render хийх',
    orderIndex: 1,
    xpReward: 60,
    tasks: [
      {
        title: 'Player component',
        description: `Player нэртэй functional component үүсгэнэ үү.
Тухайн component нь <div> буцаана.

Жишээ:
function Player() {
  return (
    <div>Player</div>
  )
}
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Player />)

Тайлбар:
- function нэр том үсгээр эхлэнэ (Player)
- return дотор JSX байна
- root.render() ашиглан харуулна`,
        starterCode: `// Player component үүсгэнэ үү
function Player() {
  return (
    <div></div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Player />)
`,
        checks: [
          { type: 'hasPattern', pattern: 'function\\s+Player', hint: 'function Player() гэж component үүсгэ' },
          { type: 'hasText', text: 'return', hint: 'return ашиглан JSX буцаа' },
          { type: 'hasText', text: 'ReactDOM.createRoot', hint: 'ReactDOM.createRoot ашиглан render хий' },
          { type: 'hasText', text: '<Player />', hint: '<Player /> гэж component ашигла' },
        ] as JsRule[],
      },
      {
        title: 'GameUI component',
        description: `GameUI нэртэй component үүсгэж, дотор нь <h1>ArenaHub</h1> текст харуулна уу.

Жишээ:
function GameUI() {
  return (
    <div>
      <h1>ArenaHub</h1>
    </div>
  )
}
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<GameUI />)

Тайлбар:
- h1 нь том гарчиг тэмдэглэгээ
- JSX дотор HTML тэмдэглэгээ ашиглаж болно`,
        starterCode: `// GameUI component үүсгэнэ үү
function GameUI() {
  return (
    <div>

    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<GameUI />)
`,
        checks: [
          { type: 'hasPattern', pattern: 'function\\s+GameUI', hint: 'function GameUI() гэж component үүсгэ' },
          { type: 'hasText', text: '<h1>', hint: '<h1> тэмдэглэгээ ашигла' },
          { type: 'hasText', text: 'ArenaHub', hint: 'ArenaHub текст харуул' },
          { type: 'hasText', text: '<GameUI />', hint: '<GameUI /> гэж render хий' },
        ] as JsRule[],
      },
      {
        title: 'Props дамжуулах',
        description: `Greeting component үүсгэж name props хүлээн авна уу.
<h2>Сайн уу, {name}!</h2> гэж харуулна.

Жишээ:
function Greeting({ name }) {
  return <h2>Сайн уу, {name}!</h2>
}
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Greeting name="Баатар" />)

Тайлбар:
- Props нь {} дотор JSX-д ашиглагдана
- Component-д утга дамжуулахдаа attribute маягаар бичнэ`,
        starterCode: `// Greeting component үүсгэнэ үү (name props хүлээн авна)
function Greeting({ name }) {
  return <h2>Сайн уу, {}!</h2>
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Greeting name="Баатар" />)
`,
        checks: [
          { type: 'hasPattern', pattern: 'function\\s+Greeting', hint: 'function Greeting() гэж component үүсгэ' },
          { type: 'hasText', text: 'name', hint: 'name props хүлээн ав' },
          { type: 'hasPattern', pattern: '\\{\\s*name\\s*\\}', hint: '{name} гэж props харуул' },
          { type: 'hasText', text: 'Сайн уу,', hint: 'Сайн уу, гэсэн текст байх ёстой' },
        ] as JsRule[],
      },
      {
        title: 'Хэд хэдэн element',
        description: `ScoreBoard component үүсгэж, дотор нь:
- <h2>Score: 100</h2>
- <p>Level: 1</p>
гэж харуулна уу.

Жишээ:
function ScoreBoard() {
  return (
    <div>
      <h2>Score: 100</h2>
      <p>Level: 1</p>
    </div>
  )
}

Тайлбар:
- JSX дотор олон element байвал нэг parent-д оруулна
- div нь нийтлэг parent болдог`,
        starterCode: `// ScoreBoard component үүсгэнэ үү
function ScoreBoard() {
  return (
    <div>

    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<ScoreBoard />)
`,
        checks: [
          { type: 'hasPattern', pattern: 'function\\s+ScoreBoard', hint: 'function ScoreBoard() гэж component үүсгэ' },
          { type: 'hasText', text: '<h2>', hint: '<h2> тэмдэглэгээ ашигла' },
          { type: 'hasText', text: '<p>', hint: '<p> тэмдэглэгээ ашигла' },
          { type: 'hasText', text: 'Score:', hint: 'Score: текст харуул' },
        ] as JsRule[],
      },
      {
        title: 'Component дотор Component',
        description: `Header болон App component үүсгэнэ үү.
App нь Header-г дотроо ашиглана.

Жишээ:
function Header() {
  return <header><h1>Game</h1></header>
}
function App() {
  return (
    <div>
      <Header />
      <p>Тоглоом эхлэнэ...</p>
    </div>
  )
}

Тайлбар:
- Component дотор өөр component ашиглаж болно
- Энэ нь component composition гэж нэрлэгдэнэ`,
        starterCode: `// Header болон App component үүсгэнэ үү
function Header() {
  return <header><h1>Game</h1></header>
}

function App() {
  return (
    <div>

    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
`,
        checks: [
          { type: 'hasPattern', pattern: 'function\\s+Header', hint: 'function Header() component үүсгэ' },
          { type: 'hasPattern', pattern: 'function\\s+App', hint: 'function App() component үүсгэ' },
          { type: 'hasText', text: '<Header', hint: 'App дотор <Header /> ашигла' },
          { type: 'hasText', text: '<App />', hint: '<App /> гэж render хий' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 2: STATE – HP + SCORE
  // ══════════════════════════════════════════════════
  {
    title: 'State – HP + Score',
    description: 'useState hook ашиглан HP болон score state удирдах',
    orderIndex: 2,
    xpReward: 60,
    tasks: [
      {
        title: 'Score state',
        description: `useState ашиглан score state үүсгэнэ үү. Анхны утга 0.
Товч дарахад score нэмэгдэнэ.

Жишээ:
function Game() {
  const [score, setScore] = useState(0)
  return (
    <div>
      <p>Score: {score}</p>
      <button onClick={() => setScore(score + 10)}>+10</button>
    </div>
  )
}

Тайлбар:
- useState(0) → анхны утга 0
- setScore() нь state-г шинэчилнэ
- onClick нь event listener`,
        starterCode: `function Game() {
  const [score, setScore] = useState(0)

  return (
    <div>
      <p>Score: {score}</p>
      <button onClick={() => setScore(score + 10)}>+10</button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Game />)
`,
        checks: [
          { type: 'hasText', text: 'useState', hint: 'useState hook ашигла' },
          { type: 'hasPattern', pattern: '\\[score,\\s*setScore\\]', hint: '[score, setScore] гэж destructure хий' },
          { type: 'hasText', text: 'setScore', hint: 'setScore ашиглан state шинэчил' },
          { type: 'hasText', text: 'onClick', hint: 'onClick event ашигла' },
        ] as JsRule[],
      },
      {
        title: 'HP state',
        description: `useState ашиглан hp state үүсгэнэ үү. Анхны утга 100.
"Damage" товч дарахад hp 10 хасагдана.

Жишээ:
function Player() {
  const [hp, setHp] = useState(100)
  return (
    <div>
      <p>HP: {hp}</p>
      <button onClick={() => setHp(hp - 10)}>Damage</button>
    </div>
  )
}

Тайлбар:
- hp - 10 нь hp-с 10 хасна
- HP 0-с бага болохгүй байвал if шалгалт нэм (сонголтоор)`,
        starterCode: `function Player() {
  const [hp, setHp] = useState(100)

  return (
    <div>
      <p>HP: {hp}</p>
      <button onClick={() => setHp(hp - 10)}>Damage</button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Player />)
`,
        checks: [
          { type: 'hasText', text: 'useState', hint: 'useState hook ашигла' },
          { type: 'hasPattern', pattern: '\\[hp,\\s*setHp\\]', hint: '[hp, setHp] гэж destructure хий' },
          { type: 'hasText', text: 'hp - 10', hint: 'hp - 10 гэж hp хасах' },
          { type: 'hasText', text: 'Damage', hint: 'Damage товч нэм' },
        ] as JsRule[],
      },
      {
        title: 'Score болон HP хамт',
        description: `GameStats component-д score болон hp гэсэн 2 state үүсгэнэ үү.
"+Score" товч → score + 10
"Damage" товч → hp - 10

Жишээ:
function GameStats() {
  const [score, setScore] = useState(0)
  const [hp, setHp] = useState(100)
  return (
    <div>
      <p>Score: {score} | HP: {hp}</p>
      <button onClick={() => setScore(score + 10)}>+Score</button>
      <button onClick={() => setHp(hp - 10)}>Damage</button>
    </div>
  )
}`,
        starterCode: `function GameStats() {
  const [score, setScore] = useState(0)
  const [hp, setHp] = useState(100)

  return (
    <div>
      <p>Score: {score} | HP: {hp}</p>
      <button onClick={() => setScore(score + 10)}>+Score</button>
      <button onClick={() => setHp(hp - 10)}>Damage</button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<GameStats />)
`,
        checks: [
          { type: 'hasCount', text: 'useState', count: 2, hint: 'useState-г 2 удаа ашигла (score, hp)' },
          { type: 'hasText', text: 'score', hint: 'score state байх ёстой' },
          { type: 'hasText', text: 'hp', hint: 'hp state байх ёстой' },
          { type: 'hasCount', text: 'button', count: 2, hint: '2 товч байх ёстой' },
        ] as JsRule[],
      },
      {
        title: 'Level state',
        description: `GameLevel component-д level state үүсгэж (анхны 1), score-с автоматаар level тооцно уу.
"Next Level" товч дарахад level нэмэгдэнэ.

Жишээ:
function GameLevel() {
  const [level, setLevel] = useState(1)
  return (
    <div>
      <p>Level: {level}</p>
      <button onClick={() => setLevel(level + 1)}>Next Level</button>
    </div>
  )
}`,
        starterCode: `function GameLevel() {
  const [level, setLevel] = useState(1)

  return (
    <div>
      <p>Level: {level}</p>
      <button onClick={() => setLevel(level + 1)}>Next Level</button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<GameLevel />)
`,
        checks: [
          { type: 'hasPattern', pattern: '\\[level,\\s*setLevel\\]', hint: '[level, setLevel] state үүсгэ' },
          { type: 'hasPattern', pattern: 'useState\\(1\\)', hint: 'level-ийн анхны утга 1 байх ёстой' },
          { type: 'hasText', text: 'setLevel', hint: 'setLevel ашиглан level шинэчил' },
          { type: 'hasText', text: 'Next Level', hint: 'Next Level товч нэм' },
        ] as JsRule[],
      },
      {
        title: 'Boolean state – Game Over',
        description: `GameOver component-д isGameOver boolean state үүсгэнэ үү.
isGameOver true бол "GAME OVER" харуулна, false бол "Тоглоом явж байна".
"Game Over" товч дарахад isGameOver true болно.

Жишээ:
function GameOver() {
  const [isGameOver, setIsGameOver] = useState(false)
  return (
    <div>
      {isGameOver ? <h2>GAME OVER</h2> : <p>Тоглоом явж байна</p>}
      <button onClick={() => setIsGameOver(true)}>Game Over</button>
    </div>
  )
}`,
        starterCode: `function GameOver() {
  const [isGameOver, setIsGameOver] = useState(false)

  return (
    <div>
      {isGameOver ? <h2>GAME OVER</h2> : <p>Тоглоом явж байна</p>}
      <button onClick={() => setIsGameOver(true)}>Game Over</button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<GameOver />)
`,
        checks: [
          { type: 'hasText', text: 'isGameOver', hint: 'isGameOver state үүсгэ' },
          { type: 'hasPattern', pattern: 'useState\\(false\\)', hint: 'анхны утга false байх ёстой' },
          { type: 'hasText', text: 'GAME OVER', hint: 'GAME OVER текст харуул' },
          { type: 'hasText', text: 'setIsGameOver', hint: 'setIsGameOver ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 3: GAME LOOP – useEffect
  // ══════════════════════════════════════════════════
  {
    title: 'Game Loop – useEffect',
    description: 'useEffect hook ашиглан game loop болон side effect удирдах',
    orderIndex: 3,
    xpReward: 70,
    tasks: [
      {
        title: 'useEffect танилцуулга',
        description: `useEffect ашиглан component mount болоход console.log("Тоглоом эхэллээ") хэвлэнэ үү.

Жишээ:
function Game() {
  useEffect(() => {
    console.log("Тоглоом эхэллээ")
  }, [])
  return <div>Game</div>
}

Тайлбар:
- useEffect(() => { ... }, []) нь mount болоход 1 удаа ажиллана
- [] хоосон array → dependency байхгүй`,
        starterCode: `function Game() {
  useEffect(() => {
    console.log("Тоглоом эхэллээ")
  }, [])

  return <div>Game started!</div>
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Game />)
`,
        checks: [
          { type: 'hasText', text: 'useEffect', hint: 'useEffect hook ашигла' },
          { type: 'hasText', text: 'console.log', hint: 'console.log ашигла' },
          { type: 'hasText', text: 'Тоглоом эхэллээ', hint: '"Тоглоом эхэллээ" хэвлэ' },
          { type: 'hasPattern', pattern: '\\[\\s*\\]', hint: '[] хоосон dependency array нэм' },
        ] as JsRule[],
      },
      {
        title: 'setInterval game loop',
        description: `useEffect дотор setInterval ашиглан score автоматаар нэмэгдэх game loop хийнэ үү.
Interval: 1000ms, score +1 нэмэгдэнэ.
Cleanup хийхэ clearInterval ашиглана.

Жишээ:
function AutoGame() {
  const [score, setScore] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setScore(prev => prev + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return <p>Score: {score}</p>
}

Тайлбар:
- setScore(prev => prev + 1) нь өмнөх утгаас нэмнэ
- return () => clearInterval(id) нь cleanup`,
        starterCode: `function AutoGame() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setScore(prev => prev + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return <p>Score: {score}</p>
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<AutoGame />)
`,
        checks: [
          { type: 'hasText', text: 'useEffect', hint: 'useEffect hook ашигла' },
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашиглан game loop хий' },
          { type: 'hasText', text: 'clearInterval', hint: 'clearInterval ашиглан cleanup хий' },
          { type: 'hasText', text: 'prev', hint: 'prev => prev + 1 маягаар state шинэчил' },
        ] as JsRule[],
      },
      {
        title: 'HP автомат хасалт',
        description: `useEffect дотор setInterval ашиглан hp автоматаар хасагдах тоглоом хийнэ үү.
500ms тутамд hp 5 хасагдана. HP 0-д хүрвэл "GAME OVER" харуулна.

Жишээ:
function HpGame() {
  const [hp, setHp] = useState(100)
  useEffect(() => {
    const id = setInterval(() => {
      setHp(prev => Math.max(0, prev - 5))
    }, 500)
    return () => clearInterval(id)
  }, [])
  return (
    <div>
      <p>HP: {hp}</p>
      {hp === 0 && <h2>GAME OVER</h2>}
    </div>
  )
}`,
        starterCode: `function HpGame() {
  const [hp, setHp] = useState(100)

  useEffect(() => {
    const id = setInterval(() => {
      setHp(prev => Math.max(0, prev - 5))
    }, 500)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <p>HP: {hp}</p>
      {hp === 0 && <h2>GAME OVER</h2>}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<HpGame />)
`,
        checks: [
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашигла' },
          { type: 'hasText', text: 'clearInterval', hint: 'clearInterval cleanup хий' },
          { type: 'hasText', text: 'Math.max', hint: 'Math.max ашиглан hp 0-с доош бүү яв' },
          { type: 'hasText', text: 'GAME OVER', hint: 'GAME OVER харуул' },
        ] as JsRule[],
      },
      {
        title: 'Dependency array',
        description: `useEffect-д dependency array ашиглан score өөрчлөгдөх бүрт level тооцоолно уу.
level = Math.floor(score / 10) + 1

Жишээ:
function LevelGame() {
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  useEffect(() => {
    setLevel(Math.floor(score / 10) + 1)
  }, [score])
  return (
    <div>
      <p>Score: {score} Level: {level}</p>
      <button onClick={() => setScore(score + 5)}>+5</button>
    </div>
  )
}

Тайлбар:
- [score] dependency array → score өөрчлөгдөх бүрт effect ажиллана`,
        starterCode: `function LevelGame() {
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    setLevel(Math.floor(score / 10) + 1)
  }, [score])

  return (
    <div>
      <p>Score: {score} Level: {level}</p>
      <button onClick={() => setScore(score + 5)}>+5</button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<LevelGame />)
`,
        checks: [
          { type: 'hasText', text: 'useEffect', hint: 'useEffect ашигла' },
          { type: 'hasText', text: 'Math.floor', hint: 'Math.floor ашиглан level тооц' },
          { type: 'hasPattern', pattern: '\\[score\\]', hint: '[score] dependency array нэм' },
          { type: 'hasText', text: 'setLevel', hint: 'setLevel ашиглан level шинэчил' },
        ] as JsRule[],
      },
      {
        title: 'Timer countdown',
        description: `Timer component-д 30-с эхлэн countdown хийнэ үү.
1000ms тутамд timer 1 хасагдана. 0 болоход "Цаг дууслаа!" харуулна.

Жишээ:
function Timer() {
  const [timer, setTimer] = useState(30)
  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => {
      setTimer(prev => prev - 1)
    }, 1000)
    return () => clearInterval(id)
  }, [timer])
  return (
    <div>
      <p>Хугацаа: {timer}</p>
      {timer === 0 && <h2>Цаг дууслаа!</h2>}
    </div>
  )
}`,
        starterCode: `function Timer() {
  const [timer, setTimer] = useState(30)

  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => {
      setTimer(prev => prev - 1)
    }, 1000)
    return () => clearInterval(id)
  }, [timer])

  return (
    <div>
      <p>Хугацаа: {timer}</p>
      {timer === 0 && <h2>Цаг дууслаа!</h2>}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Timer />)
`,
        checks: [
          { type: 'hasText', text: 'useState(30)', hint: 'timer-ийг 30-с эхлүүл' },
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашигла' },
          { type: 'hasText', text: 'clearInterval', hint: 'clearInterval cleanup хий' },
          { type: 'hasText', text: 'Цаг дууслаа!', hint: '"Цаг дууслаа!" харуул' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 4: ENEMY SYSTEM
  // ══════════════════════════════════════════════════
  {
    title: 'Enemy System',
    description: 'Array state болон .map() ашиглан дайсны систем хийх',
    orderIndex: 4,
    xpReward: 70,
    tasks: [
      {
        title: 'Enemy жагсаалт харуулах',
        description: `enemies array state үүсгэж .map() ашиглан жагсаалт харуулна уу.

Жишээ:
function EnemyList() {
  const [enemies, setEnemies] = useState(['Goblin', 'Orc', 'Dragon'])
  return (
    <ul>
      {enemies.map((e, i) => <li key={i}>{e}</li>)}
    </ul>
  )
}

Тайлбар:
- .map() нь array-г JSX элементүүдэд хөрвүүлнэ
- key prop нь React-д шаардлагатай`,
        starterCode: `function EnemyList() {
  const [enemies, setEnemies] = useState(['Goblin', 'Orc', 'Dragon'])

  return (
    <ul>
      {enemies.map((e, i) => <li key={i}>{e}</li>)}
    </ul>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<EnemyList />)
`,
        checks: [
          { type: 'hasText', text: 'useState', hint: 'useState ашигла' },
          { type: 'hasText', text: '.map(', hint: '.map() ашиглан дайснуудыг харуул' },
          { type: 'hasText', text: 'key', hint: 'key prop нэм' },
          { type: 'hasText', text: 'Goblin', hint: 'Goblin дайсан байх ёстой' },
        ] as JsRule[],
      },
      {
        title: 'Дайсан нэмэх',
        description: `"Add Enemy" товч дарахад шинэ дайсан нэмэгдэх функц хийнэ үү.
дайснуудын нэр: "Enemy 1", "Enemy 2", г.м.

Жишээ:
function EnemySpawner() {
  const [enemies, setEnemies] = useState([])
  const addEnemy = () => {
    setEnemies(prev => [...prev, 'Enemy ' + (prev.length + 1)])
  }
  return (
    <div>
      <button onClick={addEnemy}>Add Enemy</button>
      <ul>{enemies.map((e, i) => <li key={i}>{e}</li>)}</ul>
    </div>
  )
}

Тайлбар:
- [...prev, newItem] нь spread operator ашиглан шинэ item нэмнэ
- prev.length + 1 нь дараагийн дугаар`,
        starterCode: `function EnemySpawner() {
  const [enemies, setEnemies] = useState([])

  const addEnemy = () => {
    setEnemies(prev => [...prev, 'Enemy ' + (prev.length + 1)])
  }

  return (
    <div>
      <button onClick={addEnemy}>Add Enemy</button>
      <ul>{enemies.map((e, i) => <li key={i}>{e}</li>)}</ul>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<EnemySpawner />)
`,
        checks: [
          { type: 'hasText', text: 'setEnemies', hint: 'setEnemies ашиглан дайсан нэм' },
          { type: 'hasText', text: '...prev', hint: 'spread operator ...prev ашигла' },
          { type: 'hasText', text: 'Add Enemy', hint: 'Add Enemy товч нэм' },
          { type: 'hasText', text: '.map(', hint: '.map() ашиглан дайснуудыг харуул' },
        ] as JsRule[],
      },
      {
        title: 'Дайсан устгах',
        description: `"Kill" товч дарахад тухайн дайсныг жагсаалтаас устгана уу.
.filter() ашиглана.

Жишээ:
function EnemyBattle() {
  const [enemies, setEnemies] = useState(['Goblin', 'Orc', 'Dragon'])
  const killEnemy = (index) => {
    setEnemies(prev => prev.filter((_, i) => i !== index))
  }
  return (
    <ul>
      {enemies.map((e, i) => (
        <li key={i}>{e} <button onClick={() => killEnemy(i)}>Kill</button></li>
      ))}
    </ul>
  )
}

Тайлбар:
- .filter() нь нөхцөлийг хангасан элементүүдийг буцаана
- i !== index нь тухайн индексийг хасна`,
        starterCode: `function EnemyBattle() {
  const [enemies, setEnemies] = useState(['Goblin', 'Orc', 'Dragon'])

  const killEnemy = (index) => {
    setEnemies(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <ul>
      {enemies.map((e, i) => (
        <li key={i}>{e} <button onClick={() => killEnemy(i)}>Kill</button></li>
      ))}
    </ul>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<EnemyBattle />)
`,
        checks: [
          { type: 'hasText', text: '.filter(', hint: '.filter() ашиглан дайсан устга' },
          { type: 'hasText', text: 'killEnemy', hint: 'killEnemy функц үүсгэ' },
          { type: 'hasText', text: 'Kill', hint: 'Kill товч нэм' },
          { type: 'hasText', text: '!==', hint: 'i !== index шалгалт хий' },
        ] as JsRule[],
      },
      {
        title: 'Object enemy',
        description: `Дайснуудыг object маягаар хадгалж, id болон hp харуулна уу.

Жишээ:
function ObjectEnemy() {
  const [enemies, setEnemies] = useState([
    { id: 1, name: 'Goblin', hp: 50 },
    { id: 2, name: 'Orc', hp: 100 },
  ])
  return (
    <ul>
      {enemies.map(e => (
        <li key={e.id}>{e.name} – HP: {e.hp}</li>
      ))}
    </ul>
  )
}

Тайлбар:
- Object-д id, name, hp шинж чанар байна
- key={e.id} нь object-ийн id ашиглана`,
        starterCode: `function ObjectEnemy() {
  const [enemies, setEnemies] = useState([
    { id: 1, name: 'Goblin', hp: 50 },
    { id: 2, name: 'Orc', hp: 100 },
  ])

  return (
    <ul>
      {enemies.map(e => (
        <li key={e.id}>{e.name} – HP: {e.hp}</li>
      ))}
    </ul>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<ObjectEnemy />)
`,
        checks: [
          { type: 'hasText', text: 'id:', hint: 'object-д id байх ёстой' },
          { type: 'hasText', text: 'hp:', hint: 'object-д hp байх ёстой' },
          { type: 'hasText', text: 'e.name', hint: 'e.name харуул' },
          { type: 'hasText', text: 'e.hp', hint: 'e.hp харуул' },
        ] as JsRule[],
      },
      {
        title: 'Auto enemy spawn',
        description: `useEffect + setInterval ашиглан 2 секунд тутамд шинэ дайсан автоматаар гарах тоглоом хийнэ үү.

Жишээ:
function AutoSpawn() {
  const [enemies, setEnemies] = useState([])
  useEffect(() => {
    const id = setInterval(() => {
      setEnemies(prev => [...prev, { id: Date.now(), name: 'Enemy' }])
    }, 2000)
    return () => clearInterval(id)
  }, [])
  return (
    <div>
      <p>Дайснуудын тоо: {enemies.length}</p>
      <ul>{enemies.map(e => <li key={e.id}>{e.name}</li>)}</ul>
    </div>
  )
}`,
        starterCode: `function AutoSpawn() {
  const [enemies, setEnemies] = useState([])

  useEffect(() => {
    const id = setInterval(() => {
      setEnemies(prev => [...prev, { id: Date.now(), name: 'Enemy' }])
    }, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <p>Дайснуудын тоо: {enemies.length}</p>
      <ul>{enemies.map(e => <li key={e.id}>{e.name}</li>)}</ul>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<AutoSpawn />)
`,
        checks: [
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашиглан auto spawn хий' },
          { type: 'hasText', text: 'clearInterval', hint: 'clearInterval cleanup хий' },
          { type: 'hasText', text: 'Date.now()', hint: 'Date.now() ашиглан id үүсгэ' },
          { type: 'hasText', text: 'enemies.length', hint: 'enemies.length харуул' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 5: TASK SYSTEM – CORE
  // ══════════════════════════════════════════════════
  {
    title: 'Task System – Core',
    description: 'Array болон object state ашиглан task/quest систем хийх',
    orderIndex: 5,
    xpReward: 75,
    tasks: [
      {
        title: 'Task жагсаалт',
        description: `tasks array state үүсгэж, бүрийг жагсаалтад харуулна уу.
Бүр task-д id, title, done шинж байна.

Жишээ:
function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, title: '10 дайсан устга', done: false },
    { id: 2, title: '100 оноо цуглуул', done: false },
  ])
  return (
    <ul>
      {tasks.map(t => <li key={t.id}>{t.title}</li>)}
    </ul>
  )
}`,
        starterCode: `function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, title: '10 дайсан устга', done: false },
    { id: 2, title: '100 оноо цуглуул', done: false },
  ])

  return (
    <ul>
      {tasks.map(t => <li key={t.id}>{t.title}</li>)}
    </ul>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<TaskList />)
`,
        checks: [
          { type: 'hasText', text: 'useState', hint: 'useState ашигла' },
          { type: 'hasText', text: 'done:', hint: 'done шинж байх ёстой' },
          { type: 'hasText', text: '.map(', hint: '.map() ашиглан task жагсаалт харуул' },
          { type: 'hasText', text: 't.title', hint: 't.title харуул' },
        ] as JsRule[],
      },
      {
        title: 'Task дуусгах',
        description: `Task дарахад done утга toggle болдог систем хийнэ үү.
done true бол task-ийн текстэд strikethrough (line-through) хэрэглэнэ.

Жишээ:
function ToggleTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: '10 дайсан', done: false },
    { id: 2, title: '50 оноо', done: false },
  ])
  const toggle = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t))
  }
  return (
    <ul>
      {tasks.map(t => (
        <li key={t.id} onClick={() => toggle(t.id)}
          style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
          {t.title}
        </li>
      ))}
    </ul>
  )
}`,
        starterCode: `function ToggleTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: '10 дайсан', done: false },
    { id: 2, title: '50 оноо', done: false },
  ])

  const toggle = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t))
  }

  return (
    <ul>
      {tasks.map(t => (
        <li key={t.id} onClick={() => toggle(t.id)}
          style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
          {t.title}
        </li>
      ))}
    </ul>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<ToggleTasks />)
`,
        checks: [
          { type: 'hasText', text: 'toggle', hint: 'toggle функц үүсгэ' },
          { type: 'hasText', text: '!t.done', hint: '!t.done ашиглан toggle хий' },
          { type: 'hasText', text: 'line-through', hint: 'line-through style нэм' },
          { type: 'hasText', text: '...t,', hint: '{...t, done: !t.done} spread operator ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Task хугацаа',
        description: `Task-д xpReward харуулж, дуусгасан task-ийн XP-г нийтлэн харуулна уу.

Жишээ:
function XpTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: '10 дайсан', done: false, xp: 50 },
    { id: 2, title: '50 оноо', done: false, xp: 100 },
  ])
  const totalXp = tasks.filter(t => t.done).reduce((sum, t) => sum + t.xp, 0)
  const toggle = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t))
  }
  return (
    <div>
      <p>Нийт XP: {totalXp}</p>
      {tasks.map(t => (
        <div key={t.id} onClick={() => toggle(t.id)}>
          {t.title} (+{t.xp} XP) {t.done ? '✓' : '○'}
        </div>
      ))}
    </div>
  )
}`,
        starterCode: `function XpTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: '10 дайсан', done: false, xp: 50 },
    { id: 2, title: '50 оноо', done: false, xp: 100 },
  ])

  const totalXp = tasks.filter(t => t.done).reduce((sum, t) => sum + t.xp, 0)

  const toggle = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t))
  }

  return (
    <div>
      <p>Нийт XP: {totalXp}</p>
      {tasks.map(t => (
        <div key={t.id} onClick={() => toggle(t.id)}>
          {t.title} (+{t.xp} XP) {t.done ? '✓' : '○'}
        </div>
      ))}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<XpTasks />)
`,
        checks: [
          { type: 'hasText', text: 'xp:', hint: 'object-д xp шинж байх ёстой' },
          { type: 'hasText', text: '.filter(', hint: '.filter() ашигла' },
          { type: 'hasText', text: '.reduce(', hint: '.reduce() ашиглан XP нийлбэр тооц' },
          { type: 'hasText', text: 'totalXp', hint: 'totalXp харуул' },
        ] as JsRule[],
      },
      {
        title: 'Task нэмэх форм',
        description: `Input болон товч ашиглан шинэ task нэмэх форм хийнэ үү.

Жишээ:
function AddTask() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const addTask = () => {
    if (!input.trim()) return
    setTasks(prev => [...prev, { id: Date.now(), title: input, done: false }])
    setInput('')
  }
  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Task нэм..." />
      <button onClick={addTask}>Нэм</button>
      <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </div>
  )
}`,
        starterCode: `function AddTask() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')

  const addTask = () => {
    if (!input.trim()) return
    setTasks(prev => [...prev, { id: Date.now(), title: input, done: false }])
    setInput('')
  }

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Task нэм..." />
      <button onClick={addTask}>Нэм</button>
      <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<AddTask />)
`,
        checks: [
          { type: 'hasText', text: 'onChange', hint: 'onChange event ашиглан input удирда' },
          { type: 'hasText', text: 'e.target.value', hint: 'e.target.value ашигла' },
          { type: 'hasText', text: 'input.trim()', hint: 'input.trim() шалгалт хий' },
          { type: 'hasText', text: 'setInput(', hint: 'setInput ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Task progress bar',
        description: `Дуусгасан task-ийн хувийг progress bar маягаар харуулна уу.

Жишээ:
function TaskProgress() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Task 1', done: false },
    { id: 2, title: 'Task 2', done: false },
    { id: 3, title: 'Task 3', done: false },
  ])
  const done = tasks.filter(t => t.done).length
  const percent = Math.round((done / tasks.length) * 100)
  const toggle = (id) => setTasks(p => p.map(t => t.id===id ? {...t,done:!t.done} : t))
  return (
    <div>
      <div style={{width:'100%',background:'#eee',borderRadius:4}}>
        <div style={{width: percent + '%', background:'#61dafb', height:12, borderRadius:4}}></div>
      </div>
      <p>{percent}% дуусгасан</p>
      {tasks.map(t => <div key={t.id} onClick={() => toggle(t.id)}>{t.title}</div>)}
    </div>
  )
}`,
        starterCode: `function TaskProgress() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Task 1', done: false },
    { id: 2, title: 'Task 2', done: false },
    { id: 3, title: 'Task 3', done: false },
  ])

  const done = tasks.filter(t => t.done).length
  const percent = Math.round((done / tasks.length) * 100)

  const toggle = (id) => setTasks(p => p.map(t => t.id === id ? {...t, done: !t.done} : t))

  return (
    <div>
      <div style={{width:'100%', background:'#eee', borderRadius:4}}>
        <div style={{width: percent + '%', background:'#61dafb', height:12, borderRadius:4}}></div>
      </div>
      <p>{percent}% дуусгасан</p>
      {tasks.map(t => <div key={t.id} onClick={() => toggle(t.id)}>{t.title}</div>)}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<TaskProgress />)
`,
        checks: [
          { type: 'hasText', text: 'percent', hint: 'percent тооц' },
          { type: 'hasText', text: 'Math.round', hint: 'Math.round ашигла' },
          { type: 'hasText', text: "percent + '%'", hint: "width: percent + '%' style нэм" },
          { type: 'hasText', text: 'tasks.length', hint: 'tasks.length ашигла' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 6: AUTO GAME – NO KEYBOARD
  // ══════════════════════════════════════════════════
  {
    title: 'Auto Game – Товчгүй',
    description: 'setInterval болон state ашиглан автомат явагддаг тоглоом хийх',
    orderIndex: 6,
    xpReward: 80,
    tasks: [
      {
        title: 'Автомат score',
        description: `setInterval ашиглан score 500ms тутамд +5 нэмэгддэг автомат тоглоом хийнэ үү.
"Start/Stop" товчоор идэвхжүүлнэ.

Жишээ:
function AutoScore() {
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setScore(p => p + 5), 500)
    return () => clearInterval(id)
  }, [running])
  return (
    <div>
      <p>Score: {score}</p>
      <button onClick={() => setRunning(r => !r)}>{running ? 'Stop' : 'Start'}</button>
    </div>
  )
}`,
        starterCode: `function AutoScore() {
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setScore(p => p + 5), 500)
    return () => clearInterval(id)
  }, [running])

  return (
    <div>
      <p>Score: {score}</p>
      <button onClick={() => setRunning(r => !r)}>{running ? 'Stop' : 'Start'}</button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<AutoScore />)
`,
        checks: [
          { type: 'hasText', text: 'running', hint: 'running state үүсгэ' },
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашигла' },
          { type: 'hasText', text: 'clearInterval', hint: 'clearInterval cleanup хий' },
          { type: 'hasText', text: '!running', hint: '!running шалгалт хий' },
        ] as JsRule[],
      },
      {
        title: 'HP + Heal товч',
        description: `HP автоматаар хасагдаж, "Heal" товч дарахад HP нэмэгддэг тоглоом хийнэ үү.

Жишээ:
function HealGame() {
  const [hp, setHp] = useState(100)
  useEffect(() => {
    const id = setInterval(() => setHp(p => Math.max(0, p - 3)), 800)
    return () => clearInterval(id)
  }, [])
  return (
    <div>
      <p>HP: {hp}/100</p>
      <button onClick={() => setHp(p => Math.min(100, p + 20))}>Heal +20</button>
      {hp === 0 && <h2>Dead!</h2>}
    </div>
  )
}`,
        starterCode: `function HealGame() {
  const [hp, setHp] = useState(100)

  useEffect(() => {
    const id = setInterval(() => setHp(p => Math.max(0, p - 3)), 800)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <p>HP: {hp}/100</p>
      <button onClick={() => setHp(p => Math.min(100, p + 20))}>Heal +20</button>
      {hp === 0 && <h2>Dead!</h2>}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<HealGame />)
`,
        checks: [
          { type: 'hasText', text: 'Math.max(0', hint: 'Math.max(0, ...) ашиглан HP 0-с доош бүү яв' },
          { type: 'hasText', text: 'Math.min(100', hint: 'Math.min(100, ...) ашиглан HP 100-с дээш бүү яв' },
          { type: 'hasText', text: 'Heal', hint: 'Heal товч нэм' },
          { type: 'hasText', text: 'Dead!', hint: 'hp 0 болоход Dead! харуул' },
        ] as JsRule[],
      },
      {
        title: 'Score + Level auto',
        description: `Score автоматаар нэмэгдэж, score 100 тутамд level нэмэгддэг тоглоом хийнэ үү.

Жишээ:
function LevelAutoGame() {
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setScore(p => p + 2), 300)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    setLevel(Math.floor(score / 100) + 1)
  }, [score])
  return (
    <div>
      <p>Score: {score}</p>
      <p>Level: {level}</p>
    </div>
  )
}`,
        starterCode: `function LevelAutoGame() {
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    const id = setInterval(() => setScore(p => p + 2), 300)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setLevel(Math.floor(score / 100) + 1)
  }, [score])

  return (
    <div>
      <p>Score: {score}</p>
      <p>Level: {level}</p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<LevelAutoGame />)
`,
        checks: [
          { type: 'hasCount', text: 'useEffect', count: 2, hint: 'useEffect-г 2 удаа ашигла' },
          { type: 'hasText', text: 'setLevel', hint: 'setLevel ашиглан level шинэчил' },
          { type: 'hasText', text: 'Math.floor', hint: 'Math.floor ашигла' },
          { type: 'hasPattern', pattern: '\\[score\\]', hint: '[score] dependency array нэм' },
        ] as JsRule[],
      },
      {
        title: 'Random enemy hit',
        description: `1 секунд тутамд random дайсан hp-г хасах тоглоом хийнэ үү.
Хасах хэмжээ: Math.floor(Math.random() * 10) + 1

Жишээ:
function RandomHit() {
  const [hp, setHp] = useState(100)
  const [lastHit, setLastHit] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      const dmg = Math.floor(Math.random() * 10) + 1
      setLastHit(dmg)
      setHp(p => Math.max(0, p - dmg))
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div>
      <p>HP: {hp}</p>
      <p>Сүүлийн hit: -{lastHit}</p>
      {hp === 0 && <h2>Defeated!</h2>}
    </div>
  )
}`,
        starterCode: `function RandomHit() {
  const [hp, setHp] = useState(100)
  const [lastHit, setLastHit] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      const dmg = Math.floor(Math.random() * 10) + 1
      setLastHit(dmg)
      setHp(p => Math.max(0, p - dmg))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <p>HP: {hp}</p>
      <p>Сүүлийн hit: -{lastHit}</p>
      {hp === 0 && <h2>Defeated!</h2>}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<RandomHit />)
`,
        checks: [
          { type: 'hasText', text: 'Math.random()', hint: 'Math.random() ашигла' },
          { type: 'hasText', text: 'Math.floor', hint: 'Math.floor ашигла' },
          { type: 'hasText', text: 'lastHit', hint: 'lastHit state үүсгэ' },
          { type: 'hasText', text: 'Defeated!', hint: 'Defeated! харуул' },
        ] as JsRule[],
      },
      {
        title: 'Restart товч',
        description: `Game over болоход "Restart" товч харагдаж, дарахад тоглоом шинэлэгддэг систем хийнэ үү.

Жишээ:
function RestartGame() {
  const [hp, setHp] = useState(100)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  useEffect(() => {
    if (over) return
    const id = setInterval(() => {
      setScore(p => p + 5)
      setHp(p => {
        const next = Math.max(0, p - 8)
        if (next === 0) setOver(true)
        return next
      })
    }, 800)
    return () => clearInterval(id)
  }, [over])
  const restart = () => { setHp(100); setScore(0); setOver(false) }
  return (
    <div>
      {over ? (
        <div><h2>Game Over! Score: {score}</h2><button onClick={restart}>Restart</button></div>
      ) : (
        <div><p>HP: {hp}</p><p>Score: {score}</p></div>
      )}
    </div>
  )
}`,
        starterCode: `function RestartGame() {
  const [hp, setHp] = useState(100)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)

  useEffect(() => {
    if (over) return
    const id = setInterval(() => {
      setScore(p => p + 5)
      setHp(p => {
        const next = Math.max(0, p - 8)
        if (next === 0) setOver(true)
        return next
      })
    }, 800)
    return () => clearInterval(id)
  }, [over])

  const restart = () => { setHp(100); setScore(0); setOver(false) }

  return (
    <div>
      {over ? (
        <div><h2>Game Over! Score: {score}</h2><button onClick={restart}>Restart</button></div>
      ) : (
        <div><p>HP: {hp}</p><p>Score: {score}</p></div>
      )}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<RestartGame />)
`,
        checks: [
          { type: 'hasText', text: 'restart', hint: 'restart функц үүсгэ' },
          { type: 'hasText', text: 'setOver(false)', hint: 'setOver(false) ашиглан game restart хий' },
          { type: 'hasText', text: 'Restart', hint: 'Restart товч нэм' },
          { type: 'hasText', text: 'Game Over!', hint: 'Game Over! харуул' },
        ] as JsRule[],
      },
    ],
  },

  // ══════════════════════════════════════════════════
  // LESSON 7: FINAL UI – GAME DASHBOARD
  // ══════════════════════════════════════════════════
  {
    title: 'Final UI – Game Dashboard',
    description: 'Бүх мэдлэгийг нэгтгэн бүрэн game dashboard хийх',
    orderIndex: 7,
    xpReward: 90,
    tasks: [
      {
        title: 'Stats panel',
        description: `HP, Score, Level харуулах StatsPanel component хийнэ үү.
Props-оор утгуудыг хүлээн авна.

Жишээ:
function StatsPanel({ hp, score, level }) {
  return (
    <div style={{display:'flex', gap:16, padding:8, background:'#111', color:'#fff'}}>
      <span>HP: {hp}</span>
      <span>Score: {score}</span>
      <span>Level: {level}</span>
    </div>
  )
}
function App() {
  return <StatsPanel hp={100} score={0} level={1} />
}`,
        starterCode: `function StatsPanel({ hp, score, level }) {
  return (
    <div style={{display:'flex', gap:16, padding:8, background:'#111', color:'#fff'}}>
      <span>HP: {hp}</span>
      <span>Score: {score}</span>
      <span>Level: {level}</span>
    </div>
  )
}

function App() {
  return <StatsPanel hp={100} score={0} level={1} />
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
`,
        checks: [
          { type: 'hasPattern', pattern: 'function\\s+StatsPanel', hint: 'StatsPanel component үүсгэ' },
          { type: 'hasText', text: 'hp, score, level', hint: 'hp, score, level props хүлээн ав' },
          { type: 'hasText', text: '{hp}', hint: '{hp} харуул' },
          { type: 'hasText', text: '{level}', hint: '{level} харуул' },
        ] as JsRule[],
      },
      {
        title: 'Enemy count display',
        description: `Дайснуудын тоо болон нэрсийг харуулах EnemyPanel component хийнэ үү.
"Kill All" товч дарахад бүх дайсан устана.

Жишээ:
function EnemyPanel() {
  const [enemies, setEnemies] = useState(['Goblin', 'Orc', 'Troll'])
  return (
    <div>
      <h3>Дайснууд: {enemies.length}</h3>
      <ul>{enemies.map((e, i) => <li key={i}>{e}</li>)}</ul>
      <button onClick={() => setEnemies([])}>Kill All</button>
    </div>
  )
}`,
        starterCode: `function EnemyPanel() {
  const [enemies, setEnemies] = useState(['Goblin', 'Orc', 'Troll'])

  return (
    <div>
      <h3>Дайснууд: {enemies.length}</h3>
      <ul>{enemies.map((e, i) => <li key={i}>{e}</li>)}</ul>
      <button onClick={() => setEnemies([])}>Kill All</button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<EnemyPanel />)
`,
        checks: [
          { type: 'hasPattern', pattern: 'function\\s+EnemyPanel', hint: 'EnemyPanel component үүсгэ' },
          { type: 'hasText', text: 'enemies.length', hint: 'enemies.length харуул' },
          { type: 'hasText', text: 'setEnemies([])', hint: 'setEnemies([]) ашиглан Kill All хий' },
          { type: 'hasText', text: 'Kill All', hint: 'Kill All товч нэм' },
        ] as JsRule[],
      },
      {
        title: 'Mini game loop',
        description: `StatsPanel + auto game loop нэгтгэсэн mini game хийнэ үү.
Score 500ms тутамд нэмэгдэж, level тооцогдоно.

Жишээ:
function MiniGame() {
  const [score, setScore] = useState(0)
  const level = Math.floor(score / 100) + 1
  useEffect(() => {
    const id = setInterval(() => setScore(p => p + 3), 500)
    return () => clearInterval(id)
  }, [])
  return (
    <div>
      <div style={{background:'#222', color:'#61dafb', padding:8}}>
        Score: {score} | Level: {level}
      </div>
      <p>Тоглоом явж байна...</p>
    </div>
  )
}`,
        starterCode: `function MiniGame() {
  const [score, setScore] = useState(0)
  const level = Math.floor(score / 100) + 1

  useEffect(() => {
    const id = setInterval(() => setScore(p => p + 3), 500)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <div style={{background:'#222', color:'#61dafb', padding:8}}>
        Score: {score} | Level: {level}
      </div>
      <p>Тоглоом явж байна...</p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<MiniGame />)
`,
        checks: [
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашигла' },
          { type: 'hasText', text: 'Math.floor', hint: 'Math.floor ашиглан level тооц' },
          { type: 'hasText', text: '{score}', hint: 'score харуул' },
          { type: 'hasText', text: '{level}', hint: 'level харуул' },
        ] as JsRule[],
      },
      {
        title: 'Full dashboard',
        description: `HP auto хасагдаж, score auto нэмэгдэж, дайсан auto spawn болох full dashboard хийнэ үү.

Жишээ:
function Dashboard() {
  const [hp, setHp] = useState(100)
  const [score, setScore] = useState(0)
  const [enemies, setEnemies] = useState([])
  useEffect(() => {
    const id = setInterval(() => {
      setScore(p => p + 5)
      setHp(p => Math.max(0, p - 2))
      setEnemies(p => p.length < 5 ? [...p, 'Enemy'] : p)
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div>
      <p>HP: {hp} | Score: {score}</p>
      <p>Дайснууд: {enemies.length}</p>
    </div>
  )
}`,
        starterCode: `function Dashboard() {
  const [hp, setHp] = useState(100)
  const [score, setScore] = useState(0)
  const [enemies, setEnemies] = useState([])

  useEffect(() => {
    const id = setInterval(() => {
      setScore(p => p + 5)
      setHp(p => Math.max(0, p - 2))
      setEnemies(p => p.length < 5 ? [...p, 'Enemy'] : p)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <p>HP: {hp} | Score: {score}</p>
      <p>Дайснууд: {enemies.length}</p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Dashboard />)
`,
        checks: [
          { type: 'hasCount', text: 'useState', count: 3, hint: 'useState-г 3 удаа ашигла (hp, score, enemies)' },
          { type: 'hasText', text: 'setInterval', hint: 'setInterval ашигла' },
          { type: 'hasText', text: 'enemies.length', hint: 'enemies.length харуул' },
          { type: 'hasText', text: 'Math.max(0', hint: 'Math.max(0, ...) ашигла' },
        ] as JsRule[],
      },
      {
        title: 'Эцсийн тоглоом',
        description: `Бүх функцийг нэгтгэсэн эцсийн тоглоом хийнэ үү:
- HP auto хасагдана
- Score auto нэмэгдэнэ
- HP 0 болоход Game Over харагдана
- Restart товч тоглоомыг шинэлдэг
- Heal товч HP нэмдэг

Хамгийн бүрэн, ажиллагаатай component хийгээрэй!`,
        starterCode: `function FinalGame() {
  const [hp, setHp] = useState(100)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)

  useEffect(() => {
    if (over) return
    const id = setInterval(() => {
      setScore(p => p + 10)
      setHp(p => {
        const next = Math.max(0, p - 5)
        if (next === 0) setOver(true)
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [over])

  const restart = () => { setHp(100); setScore(0); setOver(false) }
  const heal = () => setHp(p => Math.min(100, p + 20))

  return (
    <div style={{padding:16, fontFamily:'monospace'}}>
      {over ? (
        <div>
          <h2 style={{color:'red'}}>GAME OVER</h2>
          <p>Final Score: {score}</p>
          <button onClick={restart}>Restart</button>
        </div>
      ) : (
        <div>
          <p>HP: {hp}/100</p>
          <p>Score: {score}</p>
          <button onClick={heal}>Heal +20</button>
        </div>
      )}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<FinalGame />)
`,
        checks: [
          { type: 'hasText', text: 'over', hint: 'game over state үүсгэ' },
          { type: 'hasText', text: 'restart', hint: 'restart функц үүсгэ' },
          { type: 'hasText', text: 'heal', hint: 'heal функц үүсгэ' },
          { type: 'hasText', text: 'GAME OVER', hint: 'GAME OVER харуул' },
        ] as JsRule[],
      },
    ],
  },
]

// ── Main seed function ────────────────────────────────────────────────────
async function main() {
  console.log('Seeding React – Game UI Components course...')

  let course = await prisma.course.findFirst({ where: { category: 'REACT' } })

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'React – Game UI Components',
        description: 'JSX, useState, useEffect, component composition ашиглан game UI хийх',
        category: 'REACT',
        difficulty: 'INTERMEDIATE',
        xpReward: 800,
        imageUrl: '/courses/react.png',
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
            testCases: reactMeta(taskData.checks),
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
            testCases: reactMeta(taskData.checks),
          },
        })
        console.log('    Updated task:', task.title)
      }
    }
  }

  console.log('Done! React course seeded successfully.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())