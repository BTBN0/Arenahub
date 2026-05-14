/**
 * Seed: CSS – GAME STYLE SYSTEM (Course 2)
 * Run: npx tsx prisma/seed-css-course.ts
 *
 * Creates/upserts Course 2 with 7 lessons × 5 tasks.
 * testCases format: { mode: "css", baseHtml: "...", checks: CssRule[] }
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Base HTML templates per lesson ────────────────────────────────────
const BASE = {
  basics: `<!DOCTYPE html>
<html>
<head></head>
<body>
  <h1 class="title">GAME WORLD</h1>
  <div id="gameBox">
    <p>Welcome to the game!</p>
  </div>
</body>
</html>`,

  gameArea: `<!DOCTYPE html>
<html>
<head></head>
<body>
  <div class="wrapper">
    <div class="game-area">
      <span>GAME</span>
    </div>
  </div>
</body>
</html>`,

  player: `<!DOCTYPE html>
<html>
<head></head>
<body>
  <div class="game-area">
    <div class="player"></div>
  </div>
</body>
</html>`,

  enemy: `<!DOCTYPE html>
<html>
<head></head>
<body>
  <div class="game-area">
    <div class="player"></div>
    <div class="enemy"></div>
  </div>
</body>
</html>`,

  ui: `<!DOCTYPE html>
<html>
<head></head>
<body>
  <div id="ui">
    <div id="hp">❤️ HP: 100</div>
    <div id="score">⭐ Score: 0</div>
  </div>
  <div class="game-area">
    <div class="player"></div>
  </div>
</body>
</html>`,

  button: `<!DOCTYPE html>
<html>
<head></head>
<body>
  <div class="menu">
    <h2>GAME MENU</h2>
    <button class="btn">START GAME</button>
    <button class="btn btn-secondary">SETTINGS</button>
    <button class="btn" disabled>LOCKED</button>
  </div>
</body>
</html>`,

  animation: `<!DOCTYPE html>
<html>
<head></head>
<body>
  <div class="game-area">
    <div class="player"></div>
    <div class="enemy"></div>
    <div class="score-popup">+100</div>
  </div>
</body>
</html>`,
}

// ── CSS starter codes ─────────────────────────────────────────────────
const CSS = {
  empty: `/* Style нэмнэ үү */\n`,

  bodyBg: `/* body-д background-color тохируулна */
body {

}`,

  bodyBgColor: `body {
  background-color: #1a1a2e;
  /* color: property нэмнэ үү */
}`,

  bodyFull: `body {
  background-color: #1a1a2e;
  color: white;
}

/* .title class нэмнэ үү */`,

  basicsL3: `body {
  background-color: #1a1a2e;
  color: white;
}
.title {
  font-size: 32px;
}

/* #gameBox-д style нэмнэ */`,

  basicsL4: `body {
  background-color: #1a1a2e;
  color: white;
}
.title {
  font-size: 32px;
  text-align: center;
}
#gameBox {
  background: #0d0d1a;
  padding: 20px;
}

/* text-align: center нэм */`,

  gameArea1: `/* game-area-д width болон height тохируулна */
.game-area {

}`,

  gameArea2: `.game-area {
  width: 400px;
  height: 400px;
  background: #0d0d1a;
}

/* .wrapper-д flexbox нэм */
.wrapper {

}`,

  gameArea3: `.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.game-area {
  width: 400px;
  height: 400px;
  background: #0d0d1a;
  /* border нэмнэ үү */
}`,

  gameArea4: `.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.game-area {
  width: 400px;
  height: 400px;
  border: 2px solid white;
  /* background gradient нэмнэ үү */
}`,

  gameArea5: `.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.game-area {
  width: 400px;
  height: 400px;
  border: 2px solid #00e5ff;
  background: linear-gradient(135deg, #0d0d1a, #1a1a3e);
  /* border-radius нэмнэ үү */
}`,

  player1: `/* .player class үүсгэнэ */
.player {

}`,

  player2: `.player {
  width: 50px;
  height: 50px;
  /* background-color: green нэмнэ үү */
}`,

  player3: `.game-area {
  width: 400px;
  height: 400px;
  background: #0d0d1a;
  position: relative;
}
.player {
  width: 50px;
  height: 50px;
  background-color: #00ff41;
  /* position: absolute нэмнэ үү */
}`,

  player4: `.game-area {
  width: 400px;
  height: 400px;
  background: #0d0d1a;
  position: relative;
}
.player {
  width: 50px;
  height: 50px;
  background-color: #00ff41;
  position: absolute;
  bottom: 20px;
  left: 20px;
  /* box-shadow нэмнэ үү */
}`,

  player5: `.game-area {
  width: 400px;
  height: 400px;
  background: #0d0d1a;
  position: relative;
}
.player {
  width: 50px;
  height: 50px;
  background-color: #00ff41;
  position: absolute;
  bottom: 20px;
  left: 20px;
  box-shadow: 0 0 20px #00ff41;
  /* animation нэмнэ үү */
}

/* @keyframes pulse үүсгэнэ */`,

  enemy1: `/* .enemy class үүсгэнэ */
.enemy {

}`,

  enemy2: `.enemy {
  background-color: #ff2244;
  /* width болон height нэмнэ үү (player-аас жижиг) */
}`,

  enemy3: `.enemy {
  width: 36px;
  height: 36px;
  background-color: #ff2244;
  /* border-radius нэмнэ үү */
}`,

  enemy4: `.enemy {
  width: 36px;
  height: 36px;
  background-color: #ff2244;
  border-radius: 4px;
  /* box-shadow glow effect нэмнэ үү */
}`,

  enemy5: `.game-area { width: 400px; height: 400px; background: #0d0d1a; position: relative; }
.enemy {
  width: 36px;
  height: 36px;
  background-color: #ff2244;
  border-radius: 4px;
  box-shadow: 0 0 16px #ff2244;
  /* animation нэмнэ үү */
}

/* @keyframes flicker үүсгэнэ */`,

  ui1: `/* #hp-д background-color нэмнэ */
#hp {

}`,

  ui2: `#hp {
  background-color: #00ff41;
  color: white;
  padding: 6px 12px;
}
/* #score-д position тохируулна */
#score {

}`,

  ui3: `#hp {
  background-color: #00ff41;
  color: white;
  padding: 6px 12px;
}
#score {
  color: #ffe600;
  padding: 6px 12px;
}
/* #ui-д position: fixed нэмнэ */
#ui {

}`,

  ui4: `#ui {
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  gap: 10px;
  padding: 10px;
  /* transparent background нэмнэ */
}
#hp { background-color: #00ff41; color: white; padding: 6px 12px; }
#score { color: #ffe600; padding: 6px 12px; }`,

  ui5: `#ui {
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  gap: 10px;
  padding: 10px;
  background: rgba(0,0,0,0.6);
}
#hp { background-color: #00ff41; color: white; padding: 6px 14px; border-radius: 4px; }
#score { color: #ffe600; padding: 6px 14px; }
/* padding болон gap тохируулна */`,

  btn1: `/* .btn class-д padding болон border-radius нэмнэ */
.btn {

}`,

  btn2: `.btn {
  padding: 12px 28px;
  border-radius: 6px;
  background: #1a1a3e;
  color: white;
  border: 2px solid #00e5ff;
  cursor: pointer;
}
/* .btn:hover effect нэмнэ */
.btn:hover {

}`,

  btn3: `.btn {
  padding: 12px 28px;
  border-radius: 6px;
  background: #1a1a3e;
  color: white;
  border: 2px solid #00e5ff;
  cursor: pointer;
  transition: all 0.2s;
}
.btn:hover { background: #2a2a5e; color: #00e5ff; }
/* .btn:active scale effect нэмнэ */
.btn:active {

}`,

  btn4: `.menu { display: flex; flex-direction: column; gap: 12px; align-items: center; padding: 40px; background: #0d0d1a; min-height: 100vh; }
.menu h2 { color: #00e5ff; font-size: 24px; }
.btn {
  padding: 12px 28px;
  border-radius: 6px;
  background: #1a1a3e;
  color: white;
  border: 2px solid #00e5ff;
  cursor: pointer;
  transition: all 0.2s;
  /* box-shadow neon glow нэмнэ */
}
.btn:hover { background: #2a2a5e; }
.btn:active { transform: scale(0.97); }`,

  btn5: `.menu { display: flex; flex-direction: column; gap: 12px; align-items: center; padding: 40px; background: #0d0d1a; min-height: 100vh; }
.menu h2 { color: #00e5ff; font-size: 24px; }
.btn {
  padding: 12px 28px;
  border-radius: 6px;
  background: #1a1a3e;
  color: white;
  border: 2px solid #00e5ff;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 12px rgba(0,229,255,0.4);
}
.btn:hover { filter: brightness(1.2); }
.btn:active { transform: scale(0.97); }
/* .btn:disabled style нэмнэ */`,

  anim1: `/* @keyframes float animation үүсгэнэ */`,

  anim2: `@keyframes float {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

.game-area {
  width: 400px;
  height: 400px;
  background: #0d0d1a;
  position: relative;
}
/* .player-д animation нэмнэ */
.player {
  width: 50px;
  height: 50px;
  background: #00ff41;
  position: absolute;
  bottom: 20px;
  left: 20px;
}`,

  anim3: `@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.game-area { width: 400px; height: 400px; background: #0d0d1a; position: relative; }
.player { width: 50px; height: 50px; background: #00ff41; position: absolute; bottom: 20px; left: 20px; animation: float 1s infinite; }
/* .enemy-д flicker animation нэмнэ */
/* @keyframes flicker үүсгэнэ */
.enemy {
  width: 36px;
  height: 36px;
  background: #ff2244;
  position: absolute;
  top: 20px;
  right: 20px;
}`,

  anim4: `@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.game-area { width: 400px; height: 400px; background: #0d0d1a; position: relative; }
.player { width: 50px; height: 50px; background: #00ff41; position: absolute; bottom: 20px; left: 20px; animation: float 1s infinite; }
.enemy { width: 36px; height: 36px; background: #ff2244; position: absolute; top: 20px; right: 20px; animation: flicker 0.8s infinite; }
/* button болон score-popup-д transition нэмнэ */
.score-popup {
  color: #ffe600;
  font-size: 24px;
  position: absolute;
  top: 50%;
  left: 50%;
}`,

  anim5: `@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
@keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes popup { 0% { opacity: 0; transform: translateY(0) scale(0.5); } 100% { opacity: 1; transform: translateY(-30px) scale(1); } }
.game-area { width: 400px; height: 400px; background: #0d0d1a; position: relative; display: flex; }
.player {
  width: 50px; height: 50px; background: #00ff41;
  position: absolute; bottom: 20px; left: 20px;
  animation: float 1s infinite;
  transition: transform 0.2s;
}
.enemy {
  width: 36px; height: 36px; background: #ff2244;
  border-radius: 4px; position: absolute; top: 20px; right: 20px;
  animation: flicker 0.8s infinite;
  transition: opacity 0.1s;
}
.score-popup {
  color: #ffe600; font-size: 24px; font-weight: bold;
  position: absolute; top: 50%; left: 50%;
  /* popup animation нэмнэ */
}`,
}

// ── Task definitions ──────────────────────────────────────────────────
const LESSONS = [
  // ── LESSON 1: CSS Basics ──────────────────────────────────────────
  {
    title: 'CSS Basics',
    content: 'CSS-ийн суурь: selector, property, value.',
    xpReward: 50,
    orderIndex: 0,
    tasks: [
      {
        title: 'Background Color',
        description: `Хуудасны background-ийг dark theme болго.

body selector ашиглаж:
• background-color property нэм
• Dark өнгө ашиглана (жишээ нь: #1a1a2e)

Syntax:
body {
  background-color: #1a1a2e;
}`,
        starterCode: CSS.bodyBg,
        testCases: {
          mode: 'css', baseHtml: BASE.basics,
          checks: [
            { type: 'hasSelector', selector: 'body', hint: 'body selector нэмнэ үү' },
            { type: 'selectorHasProp', selector: 'body', property: 'background-color', hint: 'background-color property нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Text Color',
        description: `Бүх текстийг цагаан болго.

body доторх color property нэм:
• color: white

Жишээ:
body {
  background-color: #1a1a2e;
  color: white;
}`,
        starterCode: CSS.bodyBgColor,
        testCases: {
          mode: 'css', baseHtml: BASE.basics,
          checks: [
            { type: 'selectorHasProp', selector: 'body', property: 'background-color', hint: 'background-color байх ёстой' },
            { type: 'hasProperty', property: 'color', hint: 'color property нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Class Selector',
        description: `.title class үүсгэж font-size тохируул.

• .title selector ашиглана
• font-size: 32px нэмнэ

Жишээ:
.title {
  font-size: 32px;
}

Class selector нь .нэр форматтай байна.`,
        starterCode: CSS.bodyFull,
        testCases: {
          mode: 'css', baseHtml: BASE.basics,
          checks: [
            { type: 'hasSelector', selector: '.title', hint: '.title class selector нэмнэ үү' },
            { type: 'selectorHasProp', selector: '.title', property: 'font-size', hint: 'font-size: 32px нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'ID Selector',
        description: `#gameBox-д style нэм.

• #gameBox id selector ашиглана
• background-color нэмнэ
• padding нэмнэ

Жишээ:
#gameBox {
  background-color: #0d0d1a;
  padding: 20px;
}

ID selector нь #нэр форматтай байна.`,
        starterCode: CSS.basicsL3,
        testCases: {
          mode: 'css', baseHtml: BASE.basics,
          checks: [
            { type: 'hasSelector', selector: '#gameBox', hint: '#gameBox id selector нэмнэ үү' },
            { type: 'selectorHasProp', selector: '#gameBox', property: 'background-color', hint: '#gameBox-д background-color нэмнэ үү' },
            { type: 'selectorHasProp', selector: '#gameBox', property: 'padding', hint: '#gameBox-д padding нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Center Text',
        description: `Текстийг голлуул.

text-align: center ашиглана.

Хаана ч нэмж болно — body, .title, эсвэл #gameBox дотор.

Жишээ:
body {
  text-align: center;
}`,
        starterCode: CSS.basicsL4,
        testCases: {
          mode: 'css', baseHtml: BASE.basics,
          checks: [
            { type: 'hasPropValue', property: 'text-align', value: 'center', hint: 'text-align: center нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 2: Game Area Style ─────────────────────────────────────
  {
    title: 'Game Area Style',
    content: 'Тоглоомын талбайн хэмжээ, байрлал болон хүрэмт тохируул.',
    xpReward: 50,
    orderIndex: 1,
    tasks: [
      {
        title: 'Game Container Size',
        description: `.game-area-д хэмжээ тохируул.

• width: 400px
• height: 400px

Жишээ:
.game-area {
  width: 400px;
  height: 400px;
  background: #0d0d1a;
}`,
        starterCode: CSS.gameArea1,
        testCases: {
          mode: 'css', baseHtml: BASE.gameArea,
          checks: [
            { type: 'hasSelector', selector: '.game-area', hint: '.game-area selector нэмнэ үү' },
            { type: 'selectorHasProp', selector: '.game-area', property: 'width', hint: 'width: 400px нэмнэ үү' },
            { type: 'selectorHasProp', selector: '.game-area', property: 'height', hint: 'height: 400px нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Flexbox Center',
        description: `Game area-г дэлгэцийн голд байрлуул.

.wrapper-д:
• display: flex
• justify-content: center
• align-items: center
• height: 100vh

Flexbox нь element-үүдийг хялбархан байрлуулна.`,
        starterCode: CSS.gameArea2,
        testCases: {
          mode: 'css', baseHtml: BASE.gameArea,
          checks: [
            { type: 'hasPropValue', property: 'display', value: 'flex', hint: 'display: flex нэмнэ үү' },
            { type: 'hasProperty', property: 'justify-content', hint: 'justify-content нэмнэ үү' },
            { type: 'hasProperty', property: 'align-items', hint: 'align-items нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Add Border',
        description: `Game area-д хүрэм нэм.

.game-area-д:
• border: 2px solid white

Жишээ:
.game-area {
  border: 2px solid white;
}

Нeon theme:
border: 2px solid #00e5ff;`,
        starterCode: CSS.gameArea3,
        testCases: {
          mode: 'css', baseHtml: BASE.gameArea,
          checks: [
            { type: 'hasProperty', property: 'border', hint: 'border нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Background Gradient',
        description: `Game area-д gradient background нэм.

linear-gradient ашиглана:

Жишээ:
background: linear-gradient(135deg, #0d0d1a, #1a1a3e);

Эсвэл:
background: linear-gradient(to bottom, #070d1a, #0d1a3e);`,
        starterCode: CSS.gameArea4,
        testCases: {
          mode: 'css', baseHtml: BASE.gameArea,
          checks: [
            { type: 'hasText', text: 'gradient', hint: 'background-д gradient нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Border Radius',
        description: `Game area-г дугуй булантай болго.

.game-area-д:
• border-radius: 12px

Илүү дугуй болгохдоо 50% ашиглана.

Жишээ:
.game-area {
  border-radius: 12px;
}`,
        starterCode: CSS.gameArea5,
        testCases: {
          mode: 'css', baseHtml: BASE.gameArea,
          checks: [
            { type: 'hasProperty', property: 'border-radius', hint: 'border-radius нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 3: Player Style ────────────────────────────────────────
  {
    title: 'Player Style',
    content: 'Тоглогчийн дүрийн CSS загварыг үүсгэ.',
    xpReward: 50,
    orderIndex: 2,
    tasks: [
      {
        title: 'Player Size',
        description: `.player class үүсгэж хэмжээ тохируул.

• width: 50px
• height: 50px

Жишээ:
.player {
  width: 50px;
  height: 50px;
}`,
        starterCode: CSS.player1,
        testCases: {
          mode: 'css', baseHtml: BASE.player,
          checks: [
            { type: 'hasSelector', selector: '.player', hint: '.player selector нэмнэ үү' },
            { type: 'selectorHasProp', selector: '.player', property: 'width', hint: 'width: 50px нэмнэ үү' },
            { type: 'selectorHasProp', selector: '.player', property: 'height', hint: 'height: 50px нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Player Color',
        description: `Player-д ногоон өнгө нэм.

.player-д:
• background-color: green
  эсвэл background-color: #00ff41

Жишээ:
.player {
  background-color: #00ff41;
}`,
        starterCode: CSS.player2,
        testCases: {
          mode: 'css', baseHtml: BASE.player,
          checks: [
            { type: 'selectorHasProp', selector: '.player', property: 'width', hint: 'width байх ёстой' },
            { type: 'selectorHasProp', selector: '.player', property: 'background-color', hint: 'background-color: green нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Absolute Position',
        description: `Player-г game area доторх байрлуул.

.player-д:
• position: absolute

.game-area-д:
• position: relative (player-ийн суурь болно)

Жишээ:
.player {
  position: absolute;
  bottom: 20px;
  left: 20px;
}`,
        starterCode: CSS.player3,
        testCases: {
          mode: 'css', baseHtml: BASE.player,
          checks: [
            { type: 'hasPropValue', property: 'position', value: 'absolute', hint: 'position: absolute нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Box Shadow',
        description: `Player-д гэрлийн сүүдэр нэм.

.player-д:
• box-shadow property

Жишээ:
box-shadow: 0 0 20px #00ff41;

Эсвэл:
box-shadow: 0 4px 15px rgba(0,255,65,0.5);`,
        starterCode: CSS.player4,
        testCases: {
          mode: 'css', baseHtml: BASE.player,
          checks: [
            { type: 'hasProperty', property: 'box-shadow', hint: 'box-shadow нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Pulse Animation',
        description: `Player-д pulse animation нэм.

1. @keyframes pulse үүсгэнэ
2. .player-д animation property нэмнэ

Жишээ:
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.1); }
}
.player {
  animation: pulse 1s infinite;
}`,
        starterCode: CSS.player5,
        testCases: {
          mode: 'css', baseHtml: BASE.player,
          checks: [
            { type: 'hasKeyframes', hint: '@keyframes animation үүсгэнэ үү' },
            { type: 'selectorHasProp', selector: '.player', property: 'animation', hint: '.player-д animation нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 4: Enemy Style ─────────────────────────────────────────
  {
    title: 'Enemy Style',
    content: 'Дайсны дүрийн CSS загварыг үүсгэ.',
    xpReward: 50,
    orderIndex: 3,
    tasks: [
      {
        title: 'Enemy Class',
        description: `.enemy class үүсгэж улаан өнгө нэм.

• background-color: red эсвэл #ff2244

Жишээ:
.enemy {
  background-color: #ff2244;
}`,
        starterCode: CSS.enemy1,
        testCases: {
          mode: 'css', baseHtml: BASE.enemy,
          checks: [
            { type: 'hasSelector', selector: '.enemy', hint: '.enemy selector нэмнэ үү' },
            { type: 'selectorHasProp', selector: '.enemy', property: 'background-color', hint: 'background-color: red нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Enemy Size',
        description: `Enemy-г player-аас жижиг болго.

.enemy-д:
• width: 36px (player 50px, enemy жижиг)
• height: 36px

Тоглоомд enemy ерөнхийдөө жижиг байна.`,
        starterCode: CSS.enemy2,
        testCases: {
          mode: 'css', baseHtml: BASE.enemy,
          checks: [
            { type: 'selectorHasProp', selector: '.enemy', property: 'width', hint: 'width нэмнэ үү (player-аас жижиг)' },
            { type: 'selectorHasProp', selector: '.enemy', property: 'height', hint: 'height нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Enemy Border Radius',
        description: `Enemy-д дугуй буланг нэм.

.enemy-д:
• border-radius: 4px эсвэл 50%

Жишээ:
.enemy {
  border-radius: 4px;
}`,
        starterCode: CSS.enemy3,
        testCases: {
          mode: 'css', baseHtml: BASE.enemy,
          checks: [
            { type: 'selectorHasProp', selector: '.enemy', property: 'border-radius', hint: 'border-radius нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Enemy Glow Effect',
        description: `Enemy-д улаан glow нэм.

.enemy-д:
• box-shadow: red glow

Жишээ:
box-shadow: 0 0 16px #ff2244;
эсвэл:
box-shadow: 0 0 20px rgba(255,34,68,0.8);`,
        starterCode: CSS.enemy4,
        testCases: {
          mode: 'css', baseHtml: BASE.enemy,
          checks: [
            { type: 'selectorHasProp', selector: '.enemy', property: 'box-shadow', hint: 'box-shadow glow нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Flicker Animation',
        description: `Enemy-д анивчих animation нэм.

1. @keyframes flicker үүсгэнэ:
@keyframes flicker {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

2. .enemy-д animation нэмнэ:
animation: flicker 0.8s infinite;`,
        starterCode: CSS.enemy5,
        testCases: {
          mode: 'css', baseHtml: BASE.enemy,
          checks: [
            { type: 'hasKeyframes', hint: '@keyframes animation үүсгэнэ үү' },
            { type: 'selectorHasProp', selector: '.enemy', property: 'animation', hint: '.enemy-д animation нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 5: UI Style (HP + Score) ──────────────────────────────
  {
    title: 'UI Style – HP + Score',
    content: 'Тоглоомын UI: HP болон Score элементүүдийн загварыг хийгээрэй.',
    xpReward: 50,
    orderIndex: 4,
    tasks: [
      {
        title: 'HP Bar Color',
        description: `#hp-д ногоон background нэм.

• background-color: green эсвэл #00ff41
• padding нэмнэ

Жишээ:
#hp {
  background-color: #00ff41;
  padding: 6px 12px;
  color: white;
}`,
        starterCode: CSS.ui1,
        testCases: {
          mode: 'css', baseHtml: BASE.ui,
          checks: [
            { type: 'hasSelector', selector: '#hp', hint: '#hp selector нэмнэ үү' },
            { type: 'selectorHasProp', selector: '#hp', property: 'background-color', hint: '#hp-д background-color нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Score Position',
        description: `#score-д position тохируул.

#score-д:
• position property нэмнэ
• right: 0 болон top: 0 нэмнэ

Жишээ:
#score {
  position: fixed;
  top: 10px;
  right: 10px;
  color: #ffe600;
}`,
        starterCode: CSS.ui2,
        testCases: {
          mode: 'css', baseHtml: BASE.ui,
          checks: [
            { type: 'hasSelector', selector: '#score', hint: '#score selector нэмнэ үү' },
            { type: 'selectorHasProp', selector: '#score', property: 'position', hint: '#score-д position нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Fixed Position',
        description: `#ui-г дэлгэцийн дээр тогтмол байрлуул.

#ui-д:
• position: fixed
• top: 0
• right: 0

Fixed position нь scroll хийхэд хуудсанд тогтвортой байна.`,
        starterCode: CSS.ui3,
        testCases: {
          mode: 'css', baseHtml: BASE.ui,
          checks: [
            { type: 'hasSelector', selector: '#ui', hint: '#ui selector нэмнэ үү' },
            { type: 'hasPropValue', property: 'position', value: 'fixed', hint: 'position: fixed нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Transparent Background',
        description: `UI-д transparent background нэм.

rgba() эсвэл transparent ашиглана.

Жишээ:
background: rgba(0, 0, 0, 0.6);
эсвэл:
background: transparent;

rgba(r, g, b, alpha) — alpha нь 0=тунгалаг, 1=бүрэн дүүрэн.`,
        starterCode: CSS.ui4,
        testCases: {
          mode: 'css', baseHtml: BASE.ui,
          checks: [
            { type: 'hasText', text: 'rgba', hint: 'background-д rgba() transparent нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Spacing System',
        description: `UI элементүүдийн зайг тохируул.

• padding нэм
• gap нэм (flex container дотор)
• margin нэм

Жишээ:
#ui {
  padding: 10px;
  gap: 12px;
}`,
        starterCode: CSS.ui5,
        testCases: {
          mode: 'css', baseHtml: BASE.ui,
          checks: [
            { type: 'hasProperty', property: 'padding', hint: 'padding нэмнэ үү' },
            { type: 'hasText', text: 'gap', hint: 'gap нэмнэ үү (эсвэл margin)' },
          ],
        },
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 6: Button Style ────────────────────────────────────────
  {
    title: 'Button Style',
    content: 'Товчны CSS загвар: hover, click, glow, disabled state.',
    xpReward: 50,
    orderIndex: 5,
    tasks: [
      {
        title: 'Basic Button Style',
        description: `.btn-д суурь загвар нэм.

Дараахыг нэм:
• padding: 12px 28px
• border-radius: 6px
• background болон color
• cursor: pointer

Жишээ:
.btn {
  padding: 12px 28px;
  border-radius: 6px;
  background: #1a1a3e;
  color: white;
  cursor: pointer;
}`,
        starterCode: CSS.btn1,
        testCases: {
          mode: 'css', baseHtml: BASE.button,
          checks: [
            { type: 'hasSelector', selector: '.btn', hint: '.btn selector нэмнэ үү' },
            { type: 'selectorHasProp', selector: '.btn', property: 'padding', hint: 'padding нэмнэ үү' },
            { type: 'selectorHasProp', selector: '.btn', property: 'border-radius', hint: 'border-radius нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Hover Effect',
        description: `Товч дээр mouse аваачихад өнгө өөрчлөгдөх хийнэ.

.btn:hover selector ашиглана:

Жишээ:
.btn:hover {
  background: #2a2a5e;
  color: #00e5ff;
}

:hover нь хэрэглэгч элемент дээр байхад идэвхждэг.`,
        starterCode: CSS.btn2,
        testCases: {
          mode: 'css', baseHtml: BASE.button,
          checks: [
            { type: 'hasSelector', selector: '.btn:hover', hint: '.btn:hover selector нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Click Animation',
        description: `Товч дарахад scale animation нэм.

.btn:active selector ашиглана:

Жишээ:
.btn:active {
  transform: scale(0.97);
}

:active нь товч дарагдаж байх үед идэвхждэг.`,
        starterCode: CSS.btn3,
        testCases: {
          mode: 'css', baseHtml: BASE.button,
          checks: [
            { type: 'hasSelector', selector: '.btn:active', hint: '.btn:active selector нэмнэ үү' },
            { type: 'hasText', text: 'scale', hint: 'transform: scale() нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Neon Glow Button',
        description: `Товчийг neon glow эффекттэй болго.

box-shadow ашиглана:

Жишээ:
box-shadow: 0 0 12px rgba(0,229,255,0.5);

Эсвэл text-shadow:
text-shadow: 0 0 8px #00e5ff;

Хоёуланг нь нэм!`,
        starterCode: CSS.btn4,
        testCases: {
          mode: 'css', baseHtml: BASE.button,
          checks: [
            { type: 'hasProperty', property: 'box-shadow', hint: 'box-shadow neon glow нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Disabled State',
        description: `Идэвхгүй товчны загвар нэм.

.btn:disabled эсвэл [disabled] selector ашиглана:

Жишээ:
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

disabled товч дарагдахгүй гэдгийг харуулна.`,
        starterCode: CSS.btn5,
        testCases: {
          mode: 'css', baseHtml: BASE.button,
          checks: [
            { type: 'hasText', text: 'disabled', hint: ':disabled эсвэл [disabled] selector нэмнэ үү' },
            { type: 'hasText', text: 'cursor', hint: 'cursor: not-allowed нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 7: Simple Animation ────────────────────────────────────
  {
    title: 'Simple Animation',
    content: '@keyframes болон animation property ашиглан хөдөлгөөн хийгээрэй.',
    xpReward: 100,
    orderIndex: 6,
    tasks: [
      {
        title: 'Create @keyframes',
        description: `@keyframes animation үүсгэ.

Syntax:
@keyframes animationName {
  0%   { /* эхний байдал */ }
  50%  { /* дунд байдал */ }
  100% { /* төгсгөлийн байдал */ }
}

Жишээ:
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}`,
        starterCode: CSS.anim1,
        testCases: {
          mode: 'css', baseHtml: BASE.animation,
          checks: [
            { type: 'hasKeyframes', hint: '@keyframes animation үүсгэнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Animate Player',
        description: `Player-д animation нэм.

1. @keyframes float animation байх ёстой
2. .player-д animation property нэм:

animation: float 1s infinite;

Жишээ:
.player {
  animation: float 1s ease-in-out infinite;
}`,
        starterCode: CSS.anim2,
        testCases: {
          mode: 'css', baseHtml: BASE.animation,
          checks: [
            { type: 'hasKeyframes', hint: '@keyframes animation байх ёстой' },
            { type: 'selectorHasProp', selector: '.player', property: 'animation', hint: '.player-д animation нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Blinking Enemy',
        description: `Enemy-д анивчих animation нэм.

1. @keyframes flicker үүсгэнэ:
@keyframes flicker {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}

2. .enemy-д animation нэмнэ:
animation: flicker 0.8s infinite;`,
        starterCode: CSS.anim3,
        testCases: {
          mode: 'css', baseHtml: BASE.animation,
          checks: [
            { type: 'hasKeyframes', hint: '@keyframes animation байх ёстой' },
            { type: 'selectorHasProp', selector: '.enemy', property: 'animation', hint: '.enemy-д animation нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Smooth Transitions',
        description: `Transition нэмж smooth animation хий.

transition property нэмнэ:

Жишээ:
.player {
  transition: transform 0.2s ease;
}

button {
  transition: all 0.3s ease;
}

transition нь CSS өөрчлөлтийг smooth болгоно.`,
        starterCode: CSS.anim4,
        testCases: {
          mode: 'css', baseHtml: BASE.animation,
          checks: [
            { type: 'hasProperty', property: 'transition', hint: 'transition property нэмнэ үү' },
          ],
        },
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Combine All Animations',
        description: `Бүх animation-г нэгтгэж дуусгаарай.

Дараах бүгд байх ёстой:
• @keyframes (дор хаяж 2)
• .player-д animation
• .enemy-д animation
• transition нэмсэн байна
• .score-popup-д popup animation

Энэ бол CSS Animation master шалгаруулалт!`,
        starterCode: CSS.anim5,
        testCases: {
          mode: 'css', baseHtml: BASE.animation,
          checks: [
            { type: 'hasKeyframes', hint: '@keyframes animation байх ёстой' },
            { type: 'selectorHasProp', selector: '.player', property: 'animation', hint: '.player-д animation байх ёстой' },
            { type: 'selectorHasProp', selector: '.enemy', property: 'animation', hint: '.enemy-д animation байх ёстой' },
            { type: 'hasProperty', property: 'transition', hint: 'transition property байх ёстой' },
          ],
        },
        xpReward: 10, orderIndex: 4,
      },
    ],
  },
]

// ── Seed function ─────────────────────────────────────────────────────
async function main() {
  console.log('🎨 CSS Course seed эхэлж байна...')

  let course = await prisma.course.findFirst({ where: { category: 'CSS' } })

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'CSS – GAME STYLE SYSTEM',
        description: 'Тоглоомын загварыг CSS-ээр дүрс, анимаци, layout ашиглан байгуулна.',
        category: 'CSS',
        difficulty: 'BEGINNER',
        xpReward: 450,
        orderIndex: 1,
        isActive: true,
      },
    })
    console.log(`✓ Course үүсгэлээ: ${course.title}`)
  } else {
    console.log(`✓ Course олдлоо: ${course.title}`)
  }

  for (const lessonData of LESSONS) {
    const { tasks: taskList, ...lessonFields } = lessonData

    let lesson = await prisma.lesson.findFirst({
      where: { courseId: course.id, title: lessonFields.title },
    })

    if (!lesson) {
      lesson = await prisma.lesson.create({ data: { ...lessonFields, courseId: course.id } })
      console.log(`  ✓ Lesson: ${lesson.title}`)
    } else {
      await prisma.lesson.update({ where: { id: lesson.id }, data: lessonFields })
      console.log(`  ↺ Lesson: ${lesson.title}`)
    }

    for (const taskData of taskList) {
      let task = await prisma.task.findFirst({
        where: { lessonId: lesson.id, title: taskData.title },
      })

      const payload = {
        title:       taskData.title,
        description: taskData.description,
        taskType:    'code',
        starterCode: taskData.starterCode,
        testCases:   taskData.testCases as object,
        xpReward:    taskData.xpReward,
        orderIndex:  taskData.orderIndex,
      }

      if (!task) {
        await prisma.task.create({ data: { ...payload, lessonId: lesson.id } })
        console.log(`    ✓ Task: ${taskData.title}`)
      } else {
        await prisma.task.update({ where: { id: task.id }, data: payload })
        console.log(`    ↺ Task: ${taskData.title}`)
      }
    }
  }

  const total = LESSONS.reduce((s, l) => s + l.tasks.length, 0)
  console.log(`\n✅ CSS Course seed дууслаа! ${LESSONS.length} lessons, ${total} tasks`)
}

main()
  .catch(e => { console.error('❌ Seed алдаа:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())