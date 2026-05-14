import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

type Task = {
  title: string
  descriptions: string[]
  variants: string[][]
  answers: number[]
  xpReward: number
  taskType?: string
  starterCode?: string
  testCases?: string
}

const quiz = (
  title: string,
  d1: string, d2: string, d3: string,
  o1: string[], o2: string[], o3: string[],
  a1: number, a2: number, a3: number,
  xp = 20
): Task => ({
  title, descriptions: [d1, d2, d3],
  variants: [o1, o2, o3], answers: [a1, a2, a3], xpReward: xp,
})

const code = (
  title: string,
  desc: string,
  solution: string,
  tests: { input: unknown; expected: unknown; label: string; type?: string }[],
  xp = 30
): Task => {
  // Detect if it's HTML/CSS or JS
  const trimmed = solution.trim()
  const isHTML = trimmed.startsWith('<') || trimmed.startsWith('<!')
  const isCSS = !isHTML && (trimmed.includes('{') && trimmed.includes('}') && !trimmed.includes('function'))

  const starter = ''  // editor хоосон эхэлнэ

  return {
    title,
    descriptions: [desc, desc, desc],
    variants: [[''], [''], ['']],
    answers: [0, 0, 0],
    xpReward: xp,
    taskType: 'code',
    starterCode: starter,
    testCases: JSON.stringify(tests),
  }
}

const ROADMAP: {
  courseTitle: string; category: string; difficulty: string; orderIndex: number;
  lessons: { title: string; orderIndex: number; xpReward: number; tasks: Task[] }[]
}[] = [
  {
    courseTitle: 'HTML – GAME WORLD FOUNDATION',
    category: 'frontend', difficulty: 'BEGINNER', orderIndex: 1,
    lessons: [

      { title: 'Basic HTML Structure', orderIndex: 1, xpReward: 80, tasks: [
        code('HTML basic бүтэц',
          'DOCTYPE, html, head(title), body бүтэц бич.',
          `<!DOCTYPE html>
<html>
<head>
  <title>Game</title>
</head>
<body>
</body>
</html>`,
          [{input:null, expected:'<!DOCTYPE html><html><head><title>Game</title></head><body></body></html>', label:'html structure', type:'html'}], 25),

        code('h1 гарчиг нэм',
          'body дотор h1 "🎮 My Game" гарчиг нэм.',
          `<h1>🎮 My Game</h1>`,
          [{input:null, expected:'<h1>🎮 My Game</h1>', label:'h1 title', type:'html'}], 20),

        code('p текст нэм',
          '"Welcome to the game" гэсэн paragraph нэм.',
          `<p>Welcome to the game</p>`,
          [{input:null, expected:'<p>Welcome to the game</p>', label:'paragraph', type:'html'}], 20),

        code('div container үүсгэ',
          'id="game" div container үүсгэ.',
          `<div id="game"></div>`,
          [{input:null, expected:'<div id="game"></div>', label:'game div', type:'html'}], 20),

        code('meta charset нэм',
          'UTF-8 charset meta tag нэм.',
          `<meta charset="UTF-8">`,
          [{input:null, expected:'<meta charset="UTF-8">', label:'meta charset', type:'html'}], 20),
      ]},

      { title: 'Images + Elements', orderIndex: 2, xpReward: 80, tasks: [
        code('зураг нэм',
          'player.png зураг нэм.',
          `<img src="player.png">`,
          [{input:null, expected:'<img src="player.png">', label:'img tag', type:'html'}], 20),

        code('width height тохируул',
          'player.png зургийн хэмжээг 50x50 болго.',
          `<img src="player.png" width="50" height="50">`,
          [{input:null, expected:'<img src="player.png" width="50" height="50">', label:'img size', type:'html'}], 20),

        code('enemy зураг нэм',
          'enemy.png зураг нэм.',
          `<img src="enemy.png">`,
          [{input:null, expected:'<img src="enemy.png">', label:'enemy img', type:'html'}], 20),

        code('alt text нэм',
          'player.png зурагт alt="player" нэм.',
          `<img src="player.png" alt="player">`,
          [{input:null, expected:'<img src="player.png" alt="player">', label:'alt text', type:'html'}], 20),

        code('div дотор зураг',
          'id="game" div дотор player.png зураг байрлуул.',
          `<div id="game">
  <img src="player.png">
</div>`,
          [{input:null, expected:'<div id="game"><img src="player.png"></div>', label:'img in div', type:'html'}], 25),
      ]},

      { title: 'Button + Input', orderIndex: 3, xpReward: 80, tasks: [
        code('button нэм',
          '"Start" гэсэн button нэм.',
          `<button>Start</button>`,
          [{input:null, expected:'<button>Start</button>', label:'button', type:'html'}], 15),

        code('input field',
          'text type input field нэм.',
          `<input type="text">`,
          [{input:null, expected:'<input type="text">', label:'input', type:'html'}], 15),

        code('placeholder нэм',
          '"Enter name" placeholder-тай input нэм.',
          `<input type="text" placeholder="Enter name">`,
          [{input:null, expected:'<input type="text" placeholder="Enter name">', label:'placeholder', type:'html'}], 20),

        code('button click function',
          'startGame() функцийг дуудах button нэм.',
          `<button onclick="startGame()">Start</button>`,
          [{input:null, expected:'<button onclick="startGame()">Start</button>', label:'onclick', type:'html'}], 20),

        code('script tag нэм',
          'Хоосон script tag нэм.',
          `<script></script>`,
          [{input:null, expected:'<script></script>', label:'script tag', type:'html'}], 15),
      ]},

      { title: 'Game UI Structure', orderIndex: 4, xpReward: 80, tasks: [
        code('score харуулах',
          'id="score" span-тай Score paragraph нэм.',
          `<p>Score: <span id="score">0</span></p>`,
          [{input:null, expected:'<p>Score: <span id="score">0</span></p>', label:'score span', type:'html'}], 20),

        code('HP харуулах',
          'id="hp" span-тай HP paragraph нэм.',
          `<p>HP: <span id="hp">100</span></p>`,
          [{input:null, expected:'<p>HP: <span id="hp">100</span></p>', label:'hp span', type:'html'}], 20),

        code('game area div',
          'id="game" div үүсгэ.',
          `<div id="game"></div>`,
          [{input:null, expected:'<div id="game"></div>', label:'game area', type:'html'}], 15),

        code('player div',
          'id="player" div үүсгэ.',
          `<div id="player"></div>`,
          [{input:null, expected:'<div id="player"></div>', label:'player div', type:'html'}], 15),

        code('enemy div',
          'id="enemy" div үүсгэ.',
          `<div id="enemy"></div>`,
          [{input:null, expected:'<div id="enemy"></div>', label:'enemy div', type:'html'}], 15),
      ]},

      { title: 'Links + Navigation', orderIndex: 5, xpReward: 80, tasks: [
        code('link нэм',
          '"Play Game" гэсэн game.html link нэм.',
          `<a href="game.html">Play Game</a>`,
          [{input:null, expected:'<a href="game.html">Play Game</a>', label:'link', type:'html'}], 20),

        code('new tab нээ',
          'game.html-г шинэ tab-д нээх link нэм.',
          `<a href="game.html" target="_blank">Play</a>`,
          [{input:null, expected:'<a href="game.html" target="_blank">Play</a>', label:'new tab', type:'html'}], 20),

        code('image link',
          'play.png зургийг game.html руу link болго.',
          `<a href="game.html">
  <img src="play.png">
</a>`,
          [{input:null, expected:'<a href="game.html"><img src="play.png"></a>', label:'image link', type:'html'}], 25),

        code('button link',
          'button дарахад game.html руу явах onclick нэм.',
          `<button onclick="location.href=\'game.html\'">Play</button>`,
          [{input:null, expected:'<button>Play</button>', label:'btn tag', type:'html'}], 25),

        code('home link',
          '"Home" гэсэн index.html link нэм.',
          `<a href="index.html">Home</a>`,
          [{input:null, expected:'<a href="index.html">Home</a>', label:'home link', type:'html'}], 15),
      ]},

      { title: 'Forms – Player Name', orderIndex: 6, xpReward: 80, tasks: [
        code('form үүсгэ',
          'Хоосон form tag үүсгэ.',
          `<form></form>`,
          [{input:null, expected:'<form></form>', label:'form', type:'html'}], 15),

        code('input name',
          'name="player" text input нэм.',
          `<input type="text" name="player">`,
          [{input:null, expected:'<input type="text" name="player">', label:'input name', type:'html'}], 20),

        code('submit button',
          '"Start" submit button нэм.',
          `<button type="submit">Start</button>`,
          [{input:null, expected:'<button type="submit">Start</button>', label:'submit', type:'html'}], 20),

        code('label нэм',
          '"Player Name" label нэм.',
          `<label>Player Name</label>`,
          [{input:null, expected:'<label>Player Name</label>', label:'label', type:'html'}], 15),

        code('required input',
          'required attribute-тай text input нэм.',
          `<input type="text" required>`,
          [{input:null, expected:'<input type="text" required>', label:'required', type:'html'}], 20),
      ]},

      { title: 'Full Game Page', orderIndex: 7, xpReward: 200, tasks: [
        code('h1 + score + hp',
          'h1 "🎮 Game", HP span, Score span нэм.',
          `<h1>🎮 Game</h1>
<p>HP: <span id="hp">100</span></p>
<p>Score: <span id="score">0</span></p>`,
          [{input:null, expected:'<h1>🎮 Game</h1><p>HP: <span id="hp">100</span></p><p>Score: <span id="score">0</span></p>', label:'hud', type:'html'}], 30),

        code('game + player + enemy',
          'id="game" div дотор player болон enemy div байрлуул.',
          `<div id="game">
  <div id="player"></div>
  <div id="enemy"></div>
</div>`,
          [{input:null, expected:'<div id="game"><div id="player"></div><div id="enemy"></div></div>', label:'game layout', type:'html'}], 30),

        code('Start button + script',
          'startGame() дуудах button болон script tag нэм.',
          `<button onclick="startGame()">Start</button>
<script>
function startGame(){
  alert("Game Start!");
}
</script>`,
          [{input:null, expected:'<button onclick="startGame()">Start</button><script></script>', label:'btn+script', type:'html'}], 35),

        code('head section',
          'DOCTYPE, html, head(title "Game", meta charset), body нэм.',
          `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Game</title>
</head>
<body>
</body>
</html>`,
          [{input:null, expected:'<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Game</title></head><body></body></html>', label:'full head', type:'html'}], 35),

        code('FULL GAME PAGE',
          'Бүрэн game page бич: DOCTYPE + head + body(h1, hp, score, game div, player, enemy, button, script).',
          `<!DOCTYPE html>
<html>
<head>
  <title>Game</title>
</head>
<body>
<h1>🎮 Game</h1>
<p>HP: <span id="hp">100</span></p>
<p>Score: <span id="score">0</span></p>
<div id="game">
  <div id="player"></div>
  <div id="enemy"></div>
</div>
<button onclick="startGame()">Start</button>
<script>
function startGame(){
  alert("Game Start!");
}
</script>
</body>
</html>`,
          [{input:null, expected:'<!DOCTYPE html><html><head><title>Game</title></head><body><h1>🎮 Game</h1><p>HP: <span id="hp">100</span></p><p>Score: <span id="score">0</span></p><div id="game"><div id="player"></div><div id="enemy"></div></div><button onclick="startGame()">Start</button><script>function startGame(){alert("Game Start!");}</script></body></html>', label:'full page', type:'html'}], 50),
      ]},

    ]
  },
  {
    courseTitle: 'CSS – GAME STYLE SYSTEM',
    category: 'frontend', difficulty: 'BEGINNER', orderIndex: 2,
    lessons: [

      { title: 'CSS Basics', orderIndex: 1, xpReward: 80, tasks: [
        code('body background хар болго',
          'body-н background-г хар болго.',
          `body { background: black; }`,
          [{input:null, expected:'body { background: black; }', label:'bg black', type:'css'}], 20),
        code('text цагаан болго',
          'body-н text өнгийг цагаан болго.',
          `body { color: white; }`,
          [{input:null, expected:'body { color: white; }', label:'white text', type:'css'}], 20),
        code('font өөрчлөх',
          'body-д monospace font тохируул.',
          `body { font-family: monospace; }`,
          [{input:null, expected:'body { font-family: monospace; }', label:'monospace', type:'css'}], 20),
        code('h1 төвд байрлуулах',
          'h1 гарчгийг голд байрлуул.',
          `h1 { text-align: center; }`,
          [{input:null, expected:'h1 { text-align: center; }', label:'center h1', type:'css'}], 20),
        code('margin устгах',
          'body-н margin-г устга.',
          `body { margin: 0; }`,
          [{input:null, expected:'body { margin: 0; }', label:'no margin', type:'css'}], 20),
      ]},

      { title: 'Game Area Style', orderIndex: 2, xpReward: 80, tasks: [
        code('#game хэмжээ',
          '#game div-д width:500px, height:300px тохируул.',
          `#game { width: 500px; height: 300px; }`,
          [{input:null, expected:'#game { width: 500px; height: 300px; }', label:'game size', type:'css'}], 20),
        code('center болгох',
          '#game-г margin: auto-аар голд байрлуул.',
          `#game { margin: auto; }`,
          [{input:null, expected:'#game { margin: auto; }', label:'centered', type:'css'}], 20),
        code('background нэм',
          '#game-д #111 background нэм.',
          `#game { background: #111; }`,
          [{input:null, expected:'#game { background: #111; }', label:'dark bg', type:'css'}], 20),
        code('border нэм',
          '#game-д 2px solid white border нэм.',
          `#game { border: 2px solid white; }`,
          [{input:null, expected:'#game { border: 2px solid white; }', label:'border', type:'css'}], 20),
        code('position relative',
          '#game-д position: relative тохируул.',
          `#game { position: relative; }`,
          [{input:null, expected:'#game { position: relative; }', label:'relative', type:'css'}], 20),
      ]},

      { title: 'Player Style', orderIndex: 3, xpReward: 80, tasks: [
        code('#player хэмжээ',
          '#player-д width:40px, height:40px тохируул.',
          `#player { width: 40px; height: 40px; }`,
          [{input:null, expected:'#player { width: 40px; height: 40px; }', label:'player size', type:'css'}], 20),
        code('өнгө ногоон',
          '#player-н background-г lime болго.',
          `#player { background: lime; }`,
          [{input:null, expected:'#player { background: lime; }', label:'lime', type:'css'}], 20),
        code('absolute байрлал',
          '#player-д position: absolute тохируул.',
          `#player { position: absolute; }`,
          [{input:null, expected:'#player { position: absolute; }', label:'absolute', type:'css'}], 20),
        code('эхний байрлал',
          '#player-г left:10px, top:100px байрлалд тавь.',
          `#player { left: 10px; top: 100px; }`,
          [{input:null, expected:'#player { left: 10px; top: 100px; }', label:'position', type:'css'}], 25),
        code('border нэм',
          '#player-д 2px solid white border нэм.',
          `#player { border: 2px solid white; }`,
          [{input:null, expected:'#player { border: 2px solid white; }', label:'border', type:'css'}], 20),
      ]},

      { title: 'Enemy Style', orderIndex: 4, xpReward: 80, tasks: [
        code('#enemy хэмжээ',
          '#enemy-д width:40px, height:40px тохируул.',
          `#enemy { width: 40px; height: 40px; }`,
          [{input:null, expected:'#enemy { width: 40px; height: 40px; }', label:'enemy size', type:'css'}], 20),
        code('өнгө улаан',
          '#enemy-н background-г red болго.',
          `#enemy { background: red; }`,
          [{input:null, expected:'#enemy { background: red; }', label:'red', type:'css'}], 20),
        code('position absolute',
          '#enemy-д position: absolute тохируул.',
          `#enemy { position: absolute; }`,
          [{input:null, expected:'#enemy { position: absolute; }', label:'absolute', type:'css'}], 20),
        code('баруун талд байрлуулах',
          '#enemy-г right:10px, top:100px байрлалд тавь.',
          `#enemy { right: 10px; top: 100px; }`,
          [{input:null, expected:'#enemy { right: 10px; top: 100px; }', label:'right pos', type:'css'}], 25),
        code('border',
          '#enemy-д 2px solid white border нэм.',
          `#enemy { border: 2px solid white; }`,
          [{input:null, expected:'#enemy { border: 2px solid white; }', label:'border', type:'css'}], 20),
      ]},

      { title: 'UI Style – HP + Score', orderIndex: 5, xpReward: 80, tasks: [
        code('text center',
          'p-г голд байрлуул.',
          `p { text-align: center; }`,
          [{input:null, expected:'p { text-align: center; }', label:'center', type:'css'}], 15),
        code('font томсгох',
          'p-н font-size-г 20px болго.',
          `p { font-size: 20px; }`,
          [{input:null, expected:'p { font-size: 20px; }', label:'20px', type:'css'}], 15),
        code('span өнгө',
          'span-н өнгийг yellow болго.',
          `span { color: yellow; }`,
          [{input:null, expected:'span { color: yellow; }', label:'yellow', type:'css'}], 20),
        code('HP улаан',
          '#hp-н өнгийг red болго.',
          `#hp { color: red; }`,
          [{input:null, expected:'#hp { color: red; }', label:'hp red', type:'css'}], 20),
        code('Score ногоон',
          '#score-н өнгийг lime болго.',
          `#score { color: lime; }`,
          [{input:null, expected:'#score { color: lime; }', label:'score lime', type:'css'}], 20),
      ]},

      { title: 'Button Style', orderIndex: 6, xpReward: 80, tasks: [
        code('button background + color',
          'button-д black background, white color тохируул.',
          `button { background: black; color: white; }`,
          [{input:null, expected:'button { background: black; color: white; }', label:'btn style', type:'css'}], 20),
        code('border',
          'button-д 2px solid white border нэм.',
          `button { border: 2px solid white; }`,
          [{input:null, expected:'button { border: 2px solid white; }', label:'border', type:'css'}], 20),
        code('padding',
          'button-д padding: 10px нэм.',
          `button { padding: 10px; }`,
          [{input:null, expected:'button { padding: 10px; }', label:'padding', type:'css'}], 20),
        code('hover эффект',
          'button:hover-д white background, black color нэм.',
          `button:hover { background: white; color: black; }`,
          [{input:null, expected:'button:hover { background: white; color: black; }', label:'hover', type:'css'}], 25),
        code('center',
          'button-г display:block, margin:auto-аар голд байрлуул.',
          `button { display: block; margin: auto; }`,
          [{input:null, expected:'button { display: block; margin: auto; }', label:'centered', type:'css'}], 20),
      ]},

      { title: 'Simple Animation', orderIndex: 7, xpReward: 200, tasks: [
        code('move keyframe',
          'left 400px-ээс 0 хүртэл move animation үүсгэ.',
          `@keyframes move { from { left: 400px; } to { left: 0; } }`,
          [{input:null, expected:'@keyframes move { from { left: 400px; } to { left: 0; } }', label:'move anim', type:'css'}], 30),
        code('animation apply',
          '#enemy-д move animation 2s linear infinite тохируул.',
          `#enemy { animation: move 2s linear infinite; }`,
          [{input:null, expected:'#enemy { animation: move 2s linear infinite; }', label:'apply move', type:'css'}], 30),
        code('blink keyframe',
          '0%-100% opacity 1→0→1 blink animation үүсгэ.',
          `@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }`,
          [{input:null, expected:'@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }', label:'blink anim', type:'css'}], 35),
        code('blink apply',
          '#player-д blink 1s infinite animation тохируул.',
          `#player { animation: blink 1s infinite; }`,
          [{input:null, expected:'#player { animation: blink 1s infinite; }', label:'apply blink', type:'css'}], 30),
        code('game fade',
          '#game-д blink 2s infinite animation тохируул.',
          `#game { animation: blink 2s infinite; }`,
          [{input:null, expected:'#game { animation: blink 2s infinite; }', label:'game fade', type:'css'}], 25),
      ]},

    ]
  },
  {
    courseTitle: 'JavaScript – REAL GAME LOGIC',
    category: 'frontend', difficulty: 'BEGINNER', orderIndex: 3,
    lessons: [

      { title: 'Variables', orderIndex: 1, xpReward: 80, tasks: [
        code('score хувьсагч үүсгэ',
          'score = 0 хувьсагч зарла.',
          `let score = 0;`,
          [{input:null, expected:0, label:'score = 0'}], 20),
        code('hp = 100',
          'hp = 100 хувьсагч зарла.',
          `let hp = 100;`,
          [{input:null, expected:100, label:'hp = 100'}], 20),
        code('playerName string',
          'playerName = "Hero" string хувьсагч зарла.',
          `let playerName = "Hero";`,
          [{input:null, expected:'Hero', label:'playerName'}], 20),
        code('enemyCount = 3',
          'enemyCount = 3 хувьсагч зарла.',
          `let enemyCount = 3;`,
          [{input:null, expected:3, label:'enemyCount'}], 20),
        code('boolean alive',
          'alive = true boolean хувьсагч зарла.',
          `let alive = true;`,
          [{input:null, expected:true, label:'alive = true'}], 20),
      ]},

      { title: 'Functions', orderIndex: 2, xpReward: 80, tasks: [
        code('startGame function',
          'startGame() function үүсгэ. "Game Start" буцаана.',
          `function startGame() {
  return "Game Start";
}`,
          [{input:null, expected:'Game Start', label:'Game Start'}], 25),
        code('addScore function',
          'addScore(score) function нь score + 10 буцаана.',
          `function addScore(score) {
  return score + 10;
}`,
          [{input:0, expected:10, label:'0→10'}, {input:90, expected:100, label:'90→100'}], 25),
        code('damage function',
          'damage(hp) function нь hp - 20 буцаана.',
          `function damage(hp) {
  return hp - 20;
}`,
          [{input:100, expected:80, label:'100→80'}, {input:20, expected:0, label:'20→0'}], 25),
        code('resetGame function',
          'resetGame() нь {score:0, hp:100} буцаана.',
          `function resetGame() {
  return { score: 0, hp: 100 };
}`,
          [{input:null, expected:{score:0, hp:100}, label:'reset state'}], 25),
        code('logStatus function',
          'logStatus(score, hp) нь "Score: X HP: Y" string буцаана.',
          `function logStatus(score, hp) {
  return "Score: " + score + " HP: " + hp;
}`,
          [{input:[5, 80], expected:'Score: 5 HP: 80', label:'log status'}], 25),
      ]},

      { title: 'DOM Select', orderIndex: 3, xpReward: 80, tasks: [
        code('#score элемент авах',
          'getElementById ашиглан "#score" selector буцаана.',
          `function getScore() {
  return document.getElementById("score");
}`,
          [{input:null, expected:'#score', label:'selector'}], 20),
        code('#hp элемент авах',
          'getElementById ашиглан "#hp" selector буцаана.',
          `function getHp() {
  return "#hp";
}`,
          [{input:null, expected:'#hp', label:'#hp'}], 20),
        code('#player элемент',
          'getElementById("player") code string буцаана.',
          `function getPlayer() {
  return 'document.getElementById("player")';
}`,
          [{input:null, expected:'document.getElementById("player")', label:'getElementById'}], 25),
        code('#enemy элемент',
          'getElementById("enemy") code string буцаана.',
          `function getEnemy() {
  return 'document.getElementById("enemy")';
}`,
          [{input:null, expected:'document.getElementById("enemy")', label:'getElementById'}], 25),
        code('querySelector',
          'querySelector("#game") code string буцаана.',
          `function getGame() {
  return 'document.querySelector("#game")';
}`,
          [{input:null, expected:'document.querySelector("#game")', label:'querySelector'}], 25),
      ]},

      { title: 'DOM Update', orderIndex: 4, xpReward: 80, tasks: [
        code('score update',
          'updateScore(score) нь "scoreEl.innerText = " + score буцаана.',
          `function updateScore(score) {
  return "scoreEl.innerText = " + score;
}`,
          [{input:10, expected:'scoreEl.innerText = 10', label:'update score'}], 20),
        code('hp update',
          'updateHp(hp) нь "hpEl.innerText = " + hp буцаана.',
          `function updateHp(hp) {
  return "hpEl.innerText = " + hp;
}`,
          [{input:80, expected:'hpEl.innerText = 80', label:'update hp'}], 20),
        code('player move right',
          'moveRight(px) нь px + "px" CSS string буцаана.',
          `function moveRight(px) {
  return px + "px";
}`,
          [{input:100, expected:'100px', label:'100px'}, {input:0, expected:'0px', label:'0px'}], 25),
        code('enemy hide',
          'hideEnemy() нь "none" буцаана (display style).',
          `function hideEnemy() {
  return "none";
}`,
          [{input:null, expected:'none', label:'display none'}], 20),
        code('enemy show',
          'showEnemy() нь "block" буцаана (display style).',
          `function showEnemy() {
  return "block";
}`,
          [{input:null, expected:'block', label:'display block'}], 20),
      ]},

      { title: 'Events', orderIndex: 5, xpReward: 80, tasks: [
        code('button click handler',
          'handleClick() нь "clicked" буцаана.',
          `function handleClick() {
  return "clicked";
}`,
          [{input:null, expected:'clicked', label:'click'}], 20),
        code('addEventListener code',
          'eventCode(event, fn) нь event listener code string буцаана.',
          `function eventCode(event, fn) {
  return 'document.addEventListener("' + event + '", ' + fn + ')';
}`,
          [{input:['click','handleClick'], expected:'document.addEventListener("click", handleClick)', label:'event listener'}], 25),
        code('keydown event',
          'onKeyDown(key) нь "keydown: " + key буцаана.',
          `function onKeyDown(key) {
  return "keydown: " + key;
}`,
          [{input:'ArrowLeft', expected:'keydown: ArrowLeft', label:'keydown'}, {input:' ', expected:'keydown:  ', label:'space'}], 25),
        code('space key detect',
          'isJump(key) нь key === " " бол "jump", үгүй бол "none" буцаана.',
          `function isJump(key) {
  if (key === " ") return "jump";
  return "none";
}`,
          [{input:' ', expected:'jump', label:'space=jump'}, {input:'a', expected:'none', label:'a=none'}], 25),
        code('button hover',
          'onHover(el) нь "hover: " + el буцаана.',
          `function onHover(el) {
  return "hover: " + el;
}`,
          [{input:'btn', expected:'hover: btn', label:'hover btn'}], 20),
      ]},

      { title: 'Conditions (if)', orderIndex: 6, xpReward: 80, tasks: [
        code('hp <= 0 game over',
          'checkDead(hp) нь hp <= 0 бол "Game Over", үгүй бол "alive" буцаана.',
          `function checkDead(hp) {
  if (hp <= 0) return "Game Over";
  return "alive";
}`,
          [{input:0, expected:'Game Over', label:'0=dead'}, {input:-10, expected:'Game Over', label:'-10=dead'}, {input:50, expected:'alive', label:'50=alive'}], 25),
        code('score > 100 win',
          'checkWin(score) нь score > 100 бол "Win", үгүй бол "playing" буцаана.',
          `function checkWin(score) {
  if (score > 100) return "Win";
  return "playing";
}`,
          [{input:101, expected:'Win', label:'>100 win'}, {input:100, expected:'playing', label:'100=playing'}], 25),
        code('enemy hit',
          'onHit(hit, score) нь hit бол score + 10, үгүй бол score буцаана.',
          `function onHit(hit, score) {
  if (hit) return score + 10;
  return score;
}`,
          [{input:[true, 0], expected:10, label:'hit +10'}, {input:[false, 5], expected:5, label:'miss'}], 25),
        code('hp бага warning',
          'hpWarning(hp) нь hp < 30 бол "Low HP", үгүй бол "OK" буцаана.',
          `function hpWarning(hp) {
  if (hp < 30) return "Low HP";
  return "OK";
}`,
          [{input:20, expected:'Low HP', label:'20=low'}, {input:30, expected:'OK', label:'30=ok'}], 25),
        code('alive шалгах',
          'checkAlive(alive) нь alive бол "Playing", үгүй бол "Dead" буцаана.',
          `function checkAlive(alive) {
  if (alive) return "Playing";
  return "Dead";
}`,
          [{input:true, expected:'Playing', label:'alive'}, {input:false, expected:'Dead', label:'dead'}], 25),
      ]},

      { title: 'Loop', orderIndex: 7, xpReward: 200, tasks: [
        code('for loop count',
          'countEnemies(n) нь "enemy" n удаа давтаж array буцаана.',
          `function countEnemies(n) {
  let result = [];
  for (let i = 0; i < n; i++) {
    result.push("enemy");
  }
  return result;
}`,
          [{input:3, expected:['enemy','enemy','enemy'], label:'3 enemies'}, {input:5, expected:['enemy','enemy','enemy','enemy','enemy'], label:'5 enemies'}], 30),
        code('array forEach sum',
          'sumScores(arr) нь array-н нийт утгыг буцаана.',
          `function sumScores(arr) {
  let total = 0;
  arr.forEach(x => total += x);
  return total;
}`,
          [{input:[[1,2,3]], expected:6, label:'sum 1+2+3=6'}, {input:[[10,20,30]], expected:60, label:'sum=60'}], 30),
        code('spawn enemy loop',
          'spawnEnemies(count) нь 0-с count хүртэл id-тэй enemy array буцаана.',
          `function spawnEnemies(count) {
  let enemies = [];
  for (let i = 0; i < count; i++) {
    enemies.push({ id: i, hp: 100 });
  }
  return enemies;
}`,
          [{input:3, expected:[{id:0,hp:100},{id:1,hp:100},{id:2,hp:100}], label:'3 enemies'}], 35),
        code('while loop countdown',
          'countdown(start) нь start-с 0 хүртэл array буцаана.',
          `function countdown(start) {
  let result = [];
  let n = start;
  while (n >= 0) {
    result.push(n);
    n--;
  }
  return result;
}`,
          [{input:3, expected:[3,2,1,0], label:'3,2,1,0'}, {input:0, expected:[0], label:'[0]'}], 35),
        code('FULL GAME LOOP',
          'gameLoop(state) нь нэг frame update хийнэ: score+1, hp check.',
          `function gameLoop(state) {
  let { score, hp, alive } = state;
  if (!alive) return state;
  score += 1;
  if (hp <= 0) alive = false;
  return { score, hp, alive };
}`,
          [{input:{score:0,hp:100,alive:true}, expected:{score:1,hp:100,alive:true}, label:'tick'}, {input:{score:5,hp:0,alive:true}, expected:{score:6,hp:0,alive:false}, label:'die'}], 50),
      ]},

    ]
  },
  {
    courseTitle: 'Advanced JS – Game Logic',
    category: 'frontend', difficulty: 'INTERMEDIATE', orderIndex: 4,
    lessons: [

      { title: 'Object – Player / Enemy', orderIndex: 1, xpReward: 80, tasks: [
        code('player object үүсгэ',
          'name, hp, score fields-тай player object буцаана.',
          `function solution() {
  let player = { name: "Hero", hp: 100, score: 0 };
  return player;
}`,
          [{input:null, expected:{name:'Hero', hp:100, score:0}, label:'player object'}], 20),
        code('enemy object',
          'hp, damage fields-тай enemy object буцаана.',
          `function solution() {
  let enemy = { hp: 50, damage: 10 };
  return enemy;
}`,
          [{input:null, expected:{hp:50, damage:10}, label:'enemy object'}], 20),
        code('player score нэмэх',
          'player.score += 10 хийгээд шинэ score буцаана.',
          `function solution(score) {
  return score + 10;
}`,
          [{input:0, expected:10, label:'0→10'}, {input:90, expected:100, label:'90→100'}], 20),
        code('enemy damage авах',
          'enemy.hp -= 10 хийгээд шинэ hp буцаана.',
          `function solution(hp) {
  return hp - 10;
}`,
          [{input:50, expected:40, label:'50→40'}, {input:10, expected:0, label:'10→0'}], 20),
        code('player hp шалгах',
          'player.hp <= 0 бол "dead", үгүй бол "alive" буцаана.',
          `function solution(hp) {
  if (hp <= 0) return "dead";
  return "alive";
}`,
          [{input:0, expected:'dead', label:'0=dead'}, {input:100, expected:'alive', label:'100=alive'}], 25),
      ]},

      { title: 'Array – Multiple Enemies', orderIndex: 2, xpReward: 80, tasks: [
        code('enemies array үүсгэ',
          'Хоосон enemies array буцаана.',
          `function solution() {
  let enemies = [];
  return enemies;
}`,
          [{input:null, expected:[], label:'empty array'}], 15),
        code('enemy push',
          'enemies array-д {hp:50} нэмж буцаана.',
          `function solution(enemies) {
  enemies.push({ hp: 50 });
  return enemies;
}`,
          [{input:[[]], expected:[{hp:50}], label:'push one'}, {input:[[{hp:50}]], expected:[{hp:50},{hp:50}], label:'push two'}], 25),
        code('enemies hp авах',
          'enemies array-аас бүх hp-г array болгоно.',
          `function solution(enemies) {
  return enemies.map(e => e.hp);
}`,
          [{input:[[{hp:50},{hp:30},{hp:80}]], expected:[50,30,80], label:'hp list'}], 25),
        code('enemy splice',
          'enemies[0]-г устгаж үлдсэн array буцаана.',
          `function solution(enemies) {
  enemies.splice(0, 1);
  return enemies;
}`,
          [{input:[[{hp:50},{hp:30}]], expected:[{hp:30}], label:'remove first'}], 25),
        code('enemy count',
          'enemies.length буцаана.',
          `function solution(enemies) {
  return enemies.length;
}`,
          [{input:[[{hp:50},{hp:30},{hp:80}]], expected:3, label:'count 3'}, {input:[[]], expected:0, label:'empty'}], 20),
      ]},

      { title: 'Timer + Game Loop', orderIndex: 3, xpReward: 100, tasks: [
        code('game loop interval ms',
          'gameLoop(fps) нь 1000/fps буцаана (ms per frame).',
          `function solution(fps) {
  return Math.floor(1000 / fps);
}`,
          [{input:60, expected:16, label:'60fps=16ms'}, {input:10, expected:100, label:'10fps=100ms'}], 20),
        code('enemy spawn тоолох',
          'spawnEvery(ms, totalMs) нь хэдэн удаа spawn болохыг буцаана.',
          `function solution(ms, totalMs) {
  return Math.floor(totalMs / ms);
}`,
          [{input:[2000, 10000], expected:5, label:'5 spawns'}, {input:[1000, 5000], expected:5, label:'5 times'}], 25),
        code('hp бууруулах tick',
          'tickHp(hp, loss, ticks) нь ticks frame дараа hp буцаана.',
          `function solution(hp, loss, ticks) {
  return Math.max(0, hp - loss * ticks);
}`,
          [{input:[100, 1, 10], expected:90, label:'100-10=90'}, {input:[5, 1, 10], expected:0, label:'clamp 0'}], 25),
        code('clearInterval simulate',
          'shouldStop(hp) нь hp <= 0 бол true (stop loop) буцаана.',
          `function solution(hp) {
  return hp <= 0;
}`,
          [{input:0, expected:true, label:'stop'}, {input:50, expected:false, label:'continue'}], 20),
        code('game over stop',
          'gameStep(state) нь hp<=0 бол running=false болгоно.',
          `function solution(state) {
  if (state.hp <= 0) return { ...state, running: false };
  return { ...state, hp: state.hp - 1 };
}`,
          [{input:{hp:0, running:true}, expected:{hp:0, running:false}, label:'stop'}, {input:{hp:10, running:true}, expected:{hp:9, running:true}, label:'tick'}], 30),
      ]},

      { title: 'Collision – Hit System', orderIndex: 4, xpReward: 100, tasks: [
        code('x === x collision',
          'isHit(px, ex) нь x байрлал тэнцүү бол true буцаана.',
          `function solution(px, ex) {
  return px === ex;
}`,
          [{input:[10, 10], expected:true, label:'hit'}, {input:[10, 20], expected:false, label:'miss'}], 20),
        code('hit үед damage',
          'applyDamage(hit, hp) нь hit бол hp-10, үгүй бол hp буцаана.',
          `function solution(hit, hp) {
  if (hit) return hp - 10;
  return hp;
}`,
          [{input:[true, 100], expected:90, label:'-10'}, {input:[false, 100], expected:100, label:'no dmg'}], 25),
        code('hp 0 үед remove',
          'isAlive(hp) нь hp > 0 буцаана.',
          `function solution(hp) {
  return hp > 0;
}`,
          [{input:0, expected:false, label:'dead'}, {input:1, expected:true, label:'alive'}], 20),
        code('score нэмэх',
          'addScore(score, points) нь score + points буцаана.',
          `function solution(score, points) {
  return score + points;
}`,
          [{input:[0, 10], expected:10, label:'+10'}, {input:[90, 10], expected:100, label:'100'}], 20),
        code('multiple collision',
          'checkEnemies(player, enemies) нь мөргөлдсөн enemy тоог буцаана.',
          `function solution(player, enemies) {
  return enemies.filter(e => Math.abs(e.x - player.x) < 20 && Math.abs(e.y - player.y) < 20).length;
}`,
          [{input:[{x:10,y:10}, [{x:15,y:15},{x:100,y:100},{x:12,y:8}]], expected:2, label:'2 hits'}, {input:[{x:0,y:0}, [{x:100,y:100}]], expected:0, label:'no hit'}], 35),
      ]},

      { title: 'Random System', orderIndex: 5, xpReward: 80, tasks: [
        code('random 0-1',
          'isRandom(n) нь 0 <= n < 1 буцаана.',
          `function solution(n) {
  return n >= 0 && n < 1;
}`,
          [{input:0.5, expected:true, label:'0.5 valid'}, {input:1, expected:false, label:'1 invalid'}], 15),
        code('0-100 random range',
          'inRange(n) нь 0 <= n <= 100 буцаана.',
          `function solution(n) {
  return n >= 0 && n <= 100;
}`,
          [{input:50, expected:true, label:'50 ok'}, {input:101, expected:false, label:'101 out'}], 20),
        code('enemy random position',
          'randomPos(seed, max) нь 0-max хооронд integer буцаана (seed % max).',
          `function solution(seed, max) {
  return seed % max;
}`,
          [{input:[7, 400], expected:7, label:'7%400=7'}, {input:[401, 400], expected:1, label:'401%400=1'}], 25),
        code('spawn count',
          'spawnCount(seed, max) нь seed ашиглан 0-max хооронд тоо буцаана.',
          `function solution(seed, max) {
  return seed % max;
}`,
          [{input:[7, 4], expected:3, label:'7%4=3'}, {input:[10, 3], expected:1, label:'10%3=1'}], 25),
        code('random damage',
          'randomDamage(seed) нь 1-20 хооронд damage буцаана.',
          `function solution(seed) {
  return (seed % 20) + 1;
}`,
          [{input:0, expected:1, label:'min=1'}, {input:19, expected:20, label:'max=20'}, {input:20, expected:1, label:'wrap'}], 25),
      ]},

      { title: 'Game State', orderIndex: 6, xpReward: 80, tasks: [
        code('gameRunning variable',
          'initState() нь {running: true} буцаана.',
          `function solution() {
  return { running: true };
}`,
          [{input:null, expected:{running:true}, label:'running'}], 15),
        code('pause game',
          'pause(state) нь running=false болгоно.',
          `function solution(state) {
  return { ...state, running: false };
}`,
          [{input:{running:true, score:0}, expected:{running:false, score:0}, label:'paused'}], 20),
        code('resume game',
          'resume(state) нь running=true болгоно.',
          `function solution(state) {
  return { ...state, running: true };
}`,
          [{input:{running:false, score:5}, expected:{running:true, score:5}, label:'resumed'}], 20),
        code('state check',
          'canUpdate(running) нь running=false бол false буцаана.',
          `function solution(running) {
  if (!running) return false;
  return true;
}`,
          [{input:false, expected:false, label:'paused=skip'}, {input:true, expected:true, label:'running=update'}], 20),
        code('restart game',
          'restart(state) нь hp=100, score=0, running=true болгоно.',
          `function solution(state) {
  return { ...state, hp: 100, score: 0, running: true };
}`,
          [{input:{hp:0, score:50, running:false}, expected:{hp:100, score:0, running:true}, label:'restart'}], 30),
      ]},

      { title: 'Task System – Game Core', orderIndex: 7, xpReward: 200, tasks: [
        code('task array',
          'tasks array үүсгэж буцаана.',
          `function solution() {
  return ["let x=10", "console.log(1)", "x + y"];
}`,
          [{input:null, expected:["let x=10","console.log(1)","x + y"], label:'tasks'}], 20),
        code('random task авах',
          'getTask(tasks, seed) нь seed ашиглан tasks array-аас нэг task буцаана.',
          `function solution(tasks, seed) {
  return tasks[seed % tasks.length];
}`,
          [{input:[["a","b","c"], 0], expected:'a', label:'first'}, {input:[["a","b","c"], 2], expected:'c', label:'third'}], 25),
        code('input шалгах',
          'checkAnswer(answer, expected) нь таарвал true, таараагүй бол false.',
          `function solution(answer, expected) {
  return answer.trim() === expected.trim();
}`,
          [{input:['let x = 10','let x = 10'], expected:true, label:'correct'}, {input:['let x=10','let x = 10'], expected:false, label:'wrong'}], 30),
        code('зөв → enemy устгах',
          'onCorrect(enemies) нь эхний enemy-г устгаж буцаана.',
          `function solution(enemies) {
  return enemies.slice(1);
}`,
          [{input:[[{hp:50},{hp:30}]], expected:[{hp:30}], label:'enemy removed'}, {input:[[{hp:50}]], expected:[], label:'all gone'}], 35),
        code('FULL TASK BATTLE',
          'taskBattle(state, correct) нь зөв бол enemy устгана, буруу бол hp-20.',
          `function solution(state, correct) {
  if (correct) {
    return {
      ...state,
      enemies: state.enemies.slice(1),
      score: state.score + 10,
    };
  }
  return {
    ...state,
    hp: Math.max(0, state.hp - 20),
    wrongCount: state.wrongCount + 1,
  };
}`,
          [
            {input:[{hp:100, score:0, enemies:[{id:1},{id:2}], wrongCount:0}, true], expected:{hp:100, score:10, enemies:[{id:2}], wrongCount:0}, label:'correct'},
            {input:[{hp:100, score:0, enemies:[{id:1}], wrongCount:0}, false], expected:{hp:80, score:0, enemies:[{id:1}], wrongCount:1}, label:'wrong -20hp'},
          ], 50),
      ]},

    ]
  },
  {
    courseTitle: 'React – Game UI System',
    category: 'frontend', difficulty: 'INTERMEDIATE', orderIndex: 5,
    lessons: [

      { title: 'Component Structure', orderIndex: 1, xpReward: 80, tasks: [
        code('App component',
          'App component нь "Game" текст буцаана.',
          `function solution() {
  function App() { return "Game"; }
  return App();
}`,
          [{input:null, expected:'Game', label:'App returns Game'}], 20),
        code('Game component',
          'Game component нь "Play" текст буцаана.',
          `function solution() {
  function Game() { return "Play"; }
  return Game();
}`,
          [{input:null, expected:'Play', label:'Game returns Play'}], 20),
        code('Component дуудах',
          'parentComponent(child) нь "<" + child + " />" буцаана.',
          `function solution(child) {
  return "<" + child + " />";
}`,
          [{input:'Game', expected:'<Game />', label:'<Game />'}, {input:'Player', expected:'<Player />', label:'<Player />'}], 20),
        code('JSX layout',
          'layout(title, component) нь JSX string буцаана.',
          `function solution(title, component) {
  return "<h1>" + title + "</h1><" + component + " />";
}`,
          [{input:['🎮 Game','Game'], expected:'<h1>🎮 Game</h1><Game />', label:'layout'}], 25),
        code('Component export',
          'exportDefault(name) нь "export default " + name буцаана.',
          `function solution(name) {
  return "export default " + name;
}`,
          [{input:'Game', expected:'export default Game', label:'export'}], 20),
      ]},

      { title: 'State – HP + Score', orderIndex: 2, xpReward: 80, tasks: [
        code('hp state initial',
          'initHp() нь hp initial value буцаана.',
          `function solution() {
  const hp = 100;
  return hp;
}`,
          [{input:null, expected:100, label:'hp=100'}], 20),
        code('score state initial',
          'initScore() нь score initial value буцаана.',
          `function solution() {
  const score = 0;
  return score;
}`,
          [{input:null, expected:0, label:'score=0'}], 20),
        code('damage state update',
          'damage(hp, amount) нь hp - amount буцаана (min 0).',
          `function solution(hp, amount) {
  return Math.max(0, hp - amount);
}`,
          [{input:[100, 10], expected:90, label:'-10'}, {input:[5, 10], expected:0, label:'clamp 0'}], 25),
        code('addScore state update',
          'addScore(score, points) нь score + points буцаана.',
          `function solution(score, points) {
  return score + points;
}`,
          [{input:[0, 10], expected:10, label:'+10'}, {input:[90, 10], expected:100, label:'100'}], 25),
        code('State UI display',
          'hpScoreUI(hp, score) нь display string буцаана.',
          `function solution(hp, score) {
  return "HP: " + hp + " Score: " + score;
}`,
          [{input:[100, 0], expected:'HP: 100 Score: 0', label:'initial'}, {input:[80, 30], expected:'HP: 80 Score: 30', label:'ingame'}], 25),
      ]},

      { title: 'Game Loop – useEffect', orderIndex: 3, xpReward: 100, tasks: [
        code('useEffect deps',
          'effectDeps() нь [] буцаана (once on mount).',
          `function solution() {
  return [];
}`,
          [{input:null, expected:[], label:'empty deps'}], 15),
        code('loop interval ms',
          'loopMs(fps) нь 1000/fps буцаана.',
          `function solution(fps) {
  return Math.floor(1000 / fps);
}`,
          [{input:60, expected:16, label:'60fps'}, {input:10, expected:100, label:'10fps'}], 20),
        code('hp auto decrease',
          'tickHp(hp) нь hp - 1 буцаана (auto decrease).',
          `function solution(hp) {
  return hp - 1;
}`,
          [{input:100, expected:99, label:'tick'}, {input:1, expected:0, label:'last tick'}], 20),
        code('enemy spawn',
          'spawnEnemy(enemies) нь {hp:50} нэмсэн шинэ array буцаана.',
          `function solution(enemies) {
  return [...enemies, { hp: 50 }];
}`,
          [{input:[[]], expected:[{hp:50}], label:'first spawn'}, {input:[[{hp:50}]], expected:[{hp:50},{hp:50}], label:'second'}], 25),
        code('cleanup return',
          'cleanup() нь "clearInterval called" буцаана.',
          `function solution() {
  return "clearInterval called";
}`,
          [{input:null, expected:'clearInterval called', label:'cleanup'}], 20),
      ]},

      { title: 'Enemy System', orderIndex: 4, xpReward: 80, tasks: [
        code('enemies initial state',
          'initEnemies() нь хоосон array буцаана.',
          `function solution() {
  return [];
}`,
          [{input:null, expected:[], label:'empty'}], 15),
        code('enemy нэмэх',
          'addEnemy(enemies) нь {hp:50} нэмсэн array буцаана.',
          `function solution(enemies) {
  return [...enemies, { hp: 50 }];
}`,
          [{input:[[]], expected:[{hp:50}], label:'add one'}], 20),
        code('enemies render data',
          'renderEnemies(enemies) нь emoji array буцаана.',
          `function solution(enemies) {
  return enemies.map(() => "👾");
}`,
          [{input:[[{hp:50},{hp:30}]], expected:['👾','👾'], label:'2 enemies'}], 25),
        code('enemy устгах',
          'removeFirst(enemies) нь эхний enemy-г хасна.',
          `function solution(enemies) {
  return enemies.slice(1);
}`,
          [{input:[[{hp:50},{hp:30}]], expected:[{hp:30}], label:'removed'}, {input:[[{hp:50}]], expected:[], label:'empty'}], 25),
        code('enemy count display',
          'enemyCount(enemies) нь "Enemies: " + length буцаана.',
          `function solution(enemies) {
  return "Enemies: " + enemies.length;
}`,
          [{input:[[{hp:50},{hp:30}]], expected:'Enemies: 2', label:'count 2'}], 20),
      ]},

      { title: 'Task System – Core', orderIndex: 5, xpReward: 100, tasks: [
        code('tasks array',
          'getTasks() нь ["let x=10","console.log(1)","x + y"] буцаана.',
          `function solution() {
  return ["let x=10", "console.log(1)", "x + y"];
}`,
          [{input:null, expected:["let x=10","console.log(1)","x + y"], label:'tasks'}], 20),
        code('task state',
          'getTask(tasks, idx) нь tasks[idx] буцаана.',
          `function solution(tasks, idx) {
  return tasks[idx] || "";
}`,
          [{input:[["a","b","c"], 1], expected:'b', label:'idx=1'}, {input:[["a"], 5], expected:'', label:'out of range'}], 25),
        code('random task',
          'randomTask(tasks, seed) нь tasks[seed % length] буцаана.',
          `function solution(tasks, seed) {
  return tasks[seed % tasks.length];
}`,
          [{input:[["a","b","c"], 0], expected:'a', label:'first'}, {input:[["a","b","c"], 2], expected:'c', label:'third'}], 25),
        code('input state',
          'initInput() нь хоосон string буцаана.',
          `function solution() {
  return "";
}`,
          [{input:null, expected:'', label:'empty input'}], 15),
        code('шалгах logic',
          'checkTask(input, task, score, hp) нь зөв бол score+10, буруу бол hp-20.',
          `function solution(input, task, score, hp) {
  if (input === task) return { score: score + 10, hp };
  return { score, hp: Math.max(0, hp - 20) };
}`,
          [{input:['let x=10','let x=10',0,100], expected:{score:10,hp:100}, label:'correct'}, {input:['wrong','let x=10',0,100], expected:{score:0,hp:80}, label:'wrong -20hp'}], 35),
      ]},

      { title: 'Auto Game – No Keyboard', orderIndex: 6, xpReward: 100, tasks: [
        code('correct → clear enemies',
          'onCorrect(state) нь enemies хоосолж score нэмнэ.',
          `function solution(state) {
  return { ...state, enemies: [], score: state.score + 10 };
}`,
          [{input:{enemies:[{hp:50},{hp:30}], score:0, hp:100}, expected:{enemies:[], score:10, hp:100}, label:'cleared'}], 25),
        code('wrong → damage',
          'onWrong(state) нь hp-10 хийнэ.',
          `function solution(state) {
  return { ...state, hp: Math.max(0, state.hp - 10) };
}`,
          [{input:{hp:100, score:0}, expected:{hp:90, score:0}, label:'-10hp'}, {input:{hp:5, score:0}, expected:{hp:0, score:0}, label:'clamp'}], 25),
        code('enemy auto attack tick',
          'enemyAttack(hp, enemies) нь enemies тоо * 5 hp хасна.',
          `function solution(hp, enemies) {
  return Math.max(0, hp - enemies.length * 5);
}`,
          [{input:[100, [{hp:50},{hp:50}]], expected:90, label:'2 enemies -10'}, {input:[100, []], expected:100, label:'no enemies'}], 30),
        code('submit function',
          'submit(input, task, score) нь зөв бол score+10, буруу бол score буцаана.',
          `function solution(input, task, score) {
  if (input === task) return score + 10;
  return score;
}`,
          [{input:['x=10','x=10',0], expected:10, label:'correct'}, {input:['wrong','x=10',5], expected:5, label:'wrong'}], 25),
        code('auto loop state',
          'autoTick(state) нь нэг frame: hp-1, enemy attack.',
          `function solution(state) {
  const dmg = state.enemies.length * 2;
  return { ...state, hp: Math.max(0, state.hp - 1 - dmg) };
}`,
          [{input:{hp:100, enemies:[], score:0}, expected:{hp:99, enemies:[], score:0}, label:'no enemy'}, {input:{hp:100, enemies:[{hp:50}], score:0}, expected:{hp:97, enemies:[{hp:50}], score:0}, label:'1 enemy -3'}], 30),
      ]},

      { title: 'Final UI', orderIndex: 7, xpReward: 200, tasks: [
        code('task UI',
          'taskDisplay(task) нь "Task: " + task буцаана.',
          `function solution(task) {
  return "Task: " + task;
}`,
          [{input:'let x=10', expected:'Task: let x=10', label:'task display'}], 20),
        code('input onChange',
          'handleInput(value) нь value буцаана (controlled input).',
          `function solution(value) {
  return value;
}`,
          [{input:'hello', expected:'hello', label:'input value'}], 15),
        code('submit button',
          'canSubmit(input) нь input хоосон биш бол true буцаана.',
          `function solution(input) {
  return input.trim().length > 0;
}`,
          [{input:'code', expected:true, label:'has input'}, {input:'', expected:false, label:'empty'}], 20),
        code('game over UI',
          'isGameOver(hp) нь hp <= 0 бол "Game Over", үгүй бол null буцаана.',
          `function solution(hp) {
  if (hp <= 0) return "Game Over";
  return null;
}`,
          [{input:0, expected:'Game Over', label:'dead'}, {input:50, expected:null, label:'alive'}], 25),
        code('WIN + FULL UI STATE',
          'uiState(hp, score) нь бүрэн UI state object буцаана.',
          `function solution(hp, score) {
  return {
    hpText: "HP: " + hp,
    scoreText: "Score: " + score,
    isGameOver: hp <= 0,
    isWin: score >= 100,
    status: hp <= 0 ? "Game Over" : score >= 100 ? "Win!" : "Playing",
  };
}`,
          [
            {input:[100, 0], expected:{hpText:'HP: 100',scoreText:'Score: 0',isGameOver:false,isWin:false,status:'Playing'}, label:'playing'},
            {input:[0, 50], expected:{hpText:'HP: 0',scoreText:'Score: 50',isGameOver:true,isWin:false,status:'Game Over'}, label:'dead'},
            {input:[50, 100], expected:{hpText:'HP: 50',scoreText:'Score: 100',isGameOver:false,isWin:true,status:'Win!'}, label:'win'},
          ], 50),
      ]},

    ]
  },
  {
    courseTitle: 'Backend – Game Server',
    category: 'backend', difficulty: 'INTERMEDIATE', orderIndex: 6,
    lessons: [

      { title: 'Server Setup', orderIndex: 1, xpReward: 80, tasks: [
        code('express import',
          'requireExpress() нь "const express = require(\"express\")" буцаана.',
          `function solution() {
  return 'const express = require("express")';
}`,
          [{input:null, expected:'const express = require("express")', label:'require'}], 20),
        code('app үүсгэх',
          'createApp() нь "const app = express()" буцаана.',
          `function solution() {
  return 'const app = express()';
}`,
          [{input:null, expected:'const app = express()', label:'create app'}], 20),
        code('port тохируулах',
          'setPort(port) нь "const PORT = " + port буцаана.',
          `function solution(port) {
  return 'const PORT = ' + port;
}`,
          [{input:3000, expected:'const PORT = 3000', label:'PORT=3000'}], 20),
        code('server асаах',
          'listenCode(port) нь listen code string буцаана.',
          `function solution(port) {
  return 'app.listen(' + port + ', ()=>console.log("Server running"))';
}`,
          [{input:3000, expected:'app.listen(3000, ()=>console.log("Server running"))', label:'listen'}], 25),
        code('json middleware',
          'middlewareCode() нь express.json() middleware code буцаана.',
          `function solution() {
  return 'app.use(express.json())';
}`,
          [{input:null, expected:'app.use(express.json())', label:'json middleware'}], 20),
      ]},

      { title: 'Basic API Routes', orderIndex: 2, xpReward: 80, tasks: [
        code('GET / route',
          'getRoot(path, msg) нь GET route response буцаана.',
          `function solution(path, msg) {
  return { method: 'GET', path, response: msg };
}`,
          [{input:['/', 'Game API'], expected:{method:'GET', path:'/', response:'Game API'}, label:'GET /'}], 20),
        code('GET /status',
          'statusResponse() нь {status:"ok"} буцаана.',
          `function solution() {
  return { status: 'ok' };
}`,
          [{input:null, expected:{status:'ok'}, label:'status ok'}], 20),
        code('POST /start',
          'startGame() нь {game:"started"} буцаана.',
          `function solution() {
  return { game: 'started' };
}`,
          [{input:null, expected:{game:'started'}, label:'started'}], 20),
        code('GET /score',
          'scoreResponse(score) нь {score} буцаана.',
          `function solution(score) {
  return { score };
}`,
          [{input:0, expected:{score:0}, label:'score 0'}, {input:100, expected:{score:100}, label:'score 100'}], 20),
        code('POST /damage',
          'damageResponse(amount) нь {hp: -amount} буцаана.',
          `function solution(amount) {
  return { hp: -amount };
}`,
          [{input:10, expected:{hp:-10}, label:'-10hp'}], 25),
      ]},

      { title: 'Memory Data (No DB)', orderIndex: 3, xpReward: 100, tasks: [
        code('player object',
          'initPlayer() нь {hp:100, score:0} буцаана.',
          `function solution() {
  return { hp: 100, score: 0 };
}`,
          [{input:null, expected:{hp:100, score:0}, label:'init player'}], 20),
        code('GET /player response',
          'getPlayer(player) нь player object буцаана.',
          `function solution(player) {
  return player;
}`,
          [{input:{hp:100, score:0}, expected:{hp:100, score:0}, label:'player data'}], 20),
        code('score update',
          'addScore(player) нь score + 10 болгосон player буцаана.',
          `function solution(player) {
  return { ...player, score: player.score + 10 };
}`,
          [{input:{hp:100, score:0}, expected:{hp:100, score:10}, label:'+10 score'}], 25),
        code('damage hp',
          'hitPlayer(player) нь hp - 20 болгосон player буцаана.',
          `function solution(player) {
  return { ...player, hp: Math.max(0, player.hp - 20) };
}`,
          [{input:{hp:100, score:5}, expected:{hp:80, score:5}, label:'-20hp'}, {input:{hp:10, score:5}, expected:{hp:0, score:5}, label:'clamp'}], 25),
        code('reset player',
          'resetPlayer() нь {hp:100, score:0} буцаана.',
          `function solution() {
  return { hp: 100, score: 0 };
}`,
          [{input:null, expected:{hp:100, score:0}, label:'reset'}], 20),
      ]},

      { title: 'Enemy API', orderIndex: 4, xpReward: 80, tasks: [
        code('enemies array',
          'initEnemies() нь хоосон array буцаана.',
          `function solution() {
  return [];
}`,
          [{input:null, expected:[], label:'empty'}], 15),
        code('spawn enemy',
          'spawnEnemy(enemies) нь {hp:50} нэмсэн array буцаана.',
          `function solution(enemies) {
  return [...enemies, { hp: 50 }];
}`,
          [{input:[[]], expected:[{hp:50}], label:'spawned'}, {input:[[{hp:50}]], expected:[{hp:50},{hp:50}], label:'2 enemies'}], 25),
        code('get enemies',
          'getEnemies(enemies) нь enemies array буцаана.',
          `function solution(enemies) {
  return enemies;
}`,
          [{input:[[{hp:50},{hp:30}]], expected:[{hp:50},{hp:30}], label:'get list'}], 20),
        code('kill enemy',
          'killEnemy(enemies) нь эхний enemy-г хасна.',
          `function solution(enemies) {
  return enemies.slice(1);
}`,
          [{input:[[{hp:50},{hp:30}]], expected:[{hp:30}], label:'killed'}, {input:[[{hp:50}]], expected:[], label:'empty'}], 25),
        code('enemy count',
          'enemyCount(enemies) нь {count: length} буцаана.',
          `function solution(enemies) {
  return { count: enemies.length };
}`,
          [{input:[[{hp:50},{hp:30}]], expected:{count:2}, label:'count 2'}, {input:[[]], expected:{count:0}, label:'0'}], 20),
      ]},

      { title: 'Task API – Game Core', orderIndex: 5, xpReward: 100, tasks: [
        code('task list',
          'getTasks() нь task array буцаана.',
          `function solution() {
  return ["let x=10", "console.log(1)", "x + y"];
}`,
          [{input:null, expected:["let x=10","console.log(1)","x + y"], label:'tasks'}], 20),
        code('random task',
          'randomTask(tasks, seed) нь tasks[seed % length] буцаана.',
          `function solution(tasks, seed) {
  return { task: tasks[seed % tasks.length] };
}`,
          [{input:[["a","b","c"], 1], expected:{task:'b'}, label:'task b'}, {input:[["x","y"], 2], expected:{task:'x'}, label:'task x'}], 25),
        code('check answer',
          'checkAnswer(answer, tasks, player, enemies) нь зөв бол score+10, буруу бол hp-20.',
          `function solution(answer, tasks, player, enemies) {
  if (tasks.includes(answer)) {
    return { correct: true, player: { ...player, score: player.score + 10 }, enemies: enemies.slice(1) };
  }
  return { correct: false, player: { ...player, hp: Math.max(0, player.hp - 20) }, enemies };
}`,
          [
            {input:['let x=10',["let x=10","y"],{hp:100,score:0},[{hp:50}]], expected:{correct:true,player:{hp:100,score:10},enemies:[]}, label:'correct'},
            {input:['wrong',["let x=10"],{hp:100,score:0},[{hp:50}]], expected:{correct:false,player:{hp:80,score:0},enemies:[{hp:50}]}, label:'wrong'},
          ], 35),
        code('success response',
          'successRes(score) нь {result:"ok", score} буцаана.',
          `function solution(score) {
  return { result: 'ok', score };
}`,
          [{input:10, expected:{result:'ok', score:10}, label:'ok response'}], 20),
        code('fail response',
          'failRes(hp) нь {result:"fail", hp} буцаана.',
          `function solution(hp) {
  return { result: 'fail', hp };
}`,
          [{input:80, expected:{result:'fail', hp:80}, label:'fail response'}], 20),
      ]},

      { title: 'Frontend ↔ Backend (Fetch)', orderIndex: 6, xpReward: 100, tasks: [
        code('GET player fetch',
          'fetchCode(path) нь fetch GET request code буцаана.',
          `function solution(path) {
  return 'fetch("' + path + '").then(r=>r.json())';
}`,
          [{input:'/player', expected:'fetch("/player").then(r=>r.json())', label:'fetch player'}], 20),
        code('POST answer fetch',
          'postFetch(path, data) нь POST fetch options object буцаана.',
          `function solution(path, data) {
  return {
    url: path,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}`,
          [{input:['/answer', {answer:'let x=10'}], expected:{url:'/answer',method:'POST',headers:{'Content-Type':'application/json'},body:'{"answer":"let x=10"}'}, label:'post fetch'}], 30),
        code('GET task fetch',
          'fetchTask(path) нь fetch path буцаана.',
          `function solution(path) {
  return 'fetch("' + path + '").then(r=>r.json()).then(d=>setTask(d.task))';
}`,
          [{input:'/task', expected:'fetch("/task").then(r=>r.json()).then(d=>setTask(d.task))', label:'fetch task'}], 25),
        code('spawn enemy fetch',
          'spawnFetch() нь POST /enemy fetch code буцаана.',
          `function solution() {
  return 'fetch("/enemy", {method:"POST"})';
}`,
          [{input:null, expected:'fetch("/enemy", {method:"POST"})', label:'spawn fetch'}], 20),
        code('API response handle',
          'handleResponse(res) нь status 200 бол data, үгүй бол null буцаана.',
          `function solution(res) {
  if (res.status === 200) return res.data;
  return null;
}`,
          [{input:{status:200, data:{score:100}}, expected:{score:100}, label:'ok'}, {input:{status:404, data:null}, expected:null, label:'error'}], 25),
      ]},

      { title: 'Game Auto System (Server Side)', orderIndex: 7, xpReward: 200, tasks: [
        code('enemy auto spawn',
          'spawnInterval(enemies, n) нь n удаа {hp:50} нэмсэн array буцаана.',
          `function solution(enemies, n) {
  const result = [...enemies];
  for (let i = 0; i < n; i++) result.push({ hp: 50 });
  return result;
}`,
          [{input:[[], 3], expected:[{hp:50},{hp:50},{hp:50}], label:'3 spawned'}, {input:[[{hp:50}], 1], expected:[{hp:50},{hp:50}], label:'add 1'}], 30),
        code('player auto damage',
          'autoTick(player, dmg) нь hp - dmg болгосон player буцаана.',
          `function solution(player, dmg) {
  return { ...player, hp: Math.max(0, player.hp - dmg) };
}`,
          [{input:[{hp:100, score:0}, 5], expected:{hp:95, score:0}, label:'-5hp'}, {input:[{hp:3, score:0}, 5], expected:{hp:0, score:0}, label:'clamp'}], 25),
        code('game over check',
          'checkGameOver(player) нь hp<=0 бол {over:true}, үгүй бол {over:false}.',
          `function solution(player) {
  return { over: player.hp <= 0 };
}`,
          [{input:{hp:0}, expected:{over:true}, label:'dead'}, {input:{hp:50}, expected:{over:false}, label:'alive'}], 25),
        code('score auto tick',
          'scoreTick(player, ticks) нь score + ticks болгосон player буцаана.',
          `function solution(player, ticks) {
  return { ...player, score: player.score + ticks };
}`,
          [{input:[{hp:100, score:0}, 5], expected:{hp:100, score:5}, label:'+5 score'}], 25),
        code('FULL GAME SERVER TICK',
          'serverTick(state) нь нэг server tick: score+1, enemy attack, spawn check.',
          `function solution(state) {
  const dmg = state.enemies.length * 2;
  const hp = Math.max(0, state.player.hp - dmg);
  const score = state.player.score + 1;
  const alive = hp > 0;
  return {
    player: { ...state.player, hp, score },
    enemies: state.enemies,
    alive,
    tick: state.tick + 1,
  };
}`,
          [
            {input:{player:{hp:100,score:0},enemies:[],alive:true,tick:0}, expected:{player:{hp:100,score:1},enemies:[],alive:true,tick:1}, label:'no enemies'},
            {input:{player:{hp:100,score:0},enemies:[{hp:50},{hp:50}],alive:true,tick:0}, expected:{player:{hp:96,score:1},enemies:[{hp:50},{hp:50}],alive:true,tick:1}, label:'2 enemies -4hp'},
          ], 50),
      ]},

    ]
  },
  {
    courseTitle: 'Database + Multiplayer',
    category: 'backend', difficulty: 'INTERMEDIATE', orderIndex: 7,
    lessons: [

      { title: 'SQL Table Setup', orderIndex: 1, xpReward: 80, tasks: [
        code('players table үүсгэ',
          'id, name, score column-тай players table үүсгэ.',
          `CREATE TABLE players (
  id INTEGER PRIMARY KEY,
  name TEXT,
  score INTEGER
);`,
          [{input:{tables:{}}, expected:'CREATE TABLE players (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  score INTEGER\n);', label:'create table', type:'sql_ddl'}], 25),

        code('hp column нэм',
          'players table-д hp INTEGER DEFAULT 100 нэм.',
          `ALTER TABLE players ADD COLUMN hp INTEGER DEFAULT 100;`,
          [{input:{tables:{}}, expected:'ALTER TABLE players ADD COLUMN hp INTEGER DEFAULT 100;', label:'add hp', type:'sql_ddl'}], 20),

        code('x, y column нэм',
          'players table-д x, y INTEGER DEFAULT 0 нэм.',
          `ALTER TABLE players ADD COLUMN x INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN y INTEGER DEFAULT 0;`,
          [{input:{tables:{}}, expected:'ALTER TABLE players ADD COLUMN x INTEGER DEFAULT 0; ALTER TABLE players ADD COLUMN y INTEGER DEFAULT 0;', label:'add x y', type:'sql_ddl'}], 20),

        code('created_at нэм',
          'players table-д created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP нэм.',
          `ALTER TABLE players ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`,
          [{input:{tables:{}}, expected:'ALTER TABLE players ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;', label:'created_at', type:'sql_ddl'}], 20),

        code('name UNIQUE index',
          'players.name-д unique index үүсгэ.',
          `CREATE UNIQUE INDEX idx_name ON players(name);`,
          [{input:{tables:{}}, expected:'CREATE UNIQUE INDEX idx_name ON players(name);', label:'unique index', type:'sql_ddl'}], 20),
      ]},

      { title: 'INSERT Data', orderIndex: 2, xpReward: 80, tasks: [
        code('player нэмэх',
          "players table-д name='player1', score=0 нэм.",
          `INSERT INTO players (name, score) VALUES ('player1', 0);`,
          [{input:{tables:{players:[]}}, expected:[{name:'player1',score:0}], label:'insert p1', type:'sql_insert'}], 20),

        code('олон player нэмэх',
          'p1(10), p2(20), p3(30) score-тай 3 player нэм.',
          `INSERT INTO players (name, score) VALUES
('p1', 10), ('p2', 20), ('p3', 30);`,
          [{input:{tables:{players:[]}}, expected:[{name:'p1',score:10},{name:'p2',score:20},{name:'p3',score:30}], label:'multi insert', type:'sql_insert'}], 25),

        code('hp-тэй insert',
          "name='p4', score=40, hp=80 player нэм.",
          `INSERT INTO players (name, score, hp) VALUES ('p4', 40, 80);`,
          [{input:{tables:{players:[]}}, expected:[{name:'p4',score:40,hp:80}], label:'with hp', type:'sql_insert'}], 20),

        code('position-тэй insert',
          "name='p5', x=10, y=20 player нэм.",
          `INSERT INTO players (name, x, y) VALUES ('p5', 10, 20);`,
          [{input:{tables:{players:[]}}, expected:[{name:'p5',x:10,y:20}], label:'with pos', type:'sql_insert'}], 20),

        code('Бүх fields insert',
          "id=1, name='hero', score=100, hp=100 player нэм.",
          `INSERT INTO players (id, name, score, hp) VALUES (1, 'hero', 100, 100);`,
          [{input:{tables:{players:[]}}, expected:[{id:1,name:'hero',score:100,hp:100}], label:'full insert', type:'sql_insert'}], 25),
      ]},

      { title: 'SELECT Queries', orderIndex: 3, xpReward: 100, tasks: [
        code('бүх player авах',
          'players table-н бүх мөрийг сонго.',
          `SELECT * FROM players;`,
          [{input:{tables:{players:[{id:1,name:'p1',score:100,hp:80},{id:2,name:'p2',score:50,hp:100}]}}, expected:[{id:1,name:'p1',score:100,hp:80},{id:2,name:'p2',score:50,hp:100}], label:'all players', type:'sql'}], 20),

        code('top 5 leaderboard',
          'Score буурах дарааллаар top 5 player.',
          `SELECT * FROM players ORDER BY score DESC LIMIT 5;`,
          [{input:{tables:{players:[{id:1,name:'A',score:100},{id:2,name:'B',score:200},{id:3,name:'C',score:150},{id:4,name:'D',score:50},{id:5,name:'E',score:180},{id:6,name:'F',score:120}]}}, expected:[{id:2,name:'B',score:200},{id:5,name:'E',score:180},{id:3,name:'C',score:150},{id:6,name:'F',score:120},{id:1,name:'A',score:100}], label:'top 5', type:'sql'}], 30),

        code('hp < 50 шүүлт',
          'HP 50-аас бага players-г сонго.',
          `SELECT * FROM players WHERE hp < 50;`,
          [{input:{tables:{players:[{id:1,name:'p1',score:100,hp:80},{id:2,name:'p2',score:50,hp:30},{id:3,name:'p3',score:75,hp:20}]}}, expected:[{id:2,name:'p2',score:50,hp:30},{id:3,name:'p3',score:75,hp:20}], label:'low hp', type:'sql'}], 25),

        code('name-аар авах',
          "name='p1' болох player-г ол.",
          `SELECT * FROM players WHERE name = 'p1';`,
          [{input:{tables:{players:[{id:1,name:'p1',score:100},{id:2,name:'p2',score:50}]}}, expected:[{id:1,name:'p1',score:100}], label:'by name', type:'sql'}], 25),

        code('players тоолох',
          'players table-н нийт мөр тоолох.',
          `SELECT COUNT(*) FROM players;`,
          [{input:{tables:{players:[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}]}}, expected:[{count:3}], label:'count 3', type:'sql'}], 25),
      ]},

      { title: 'UPDATE Queries', orderIndex: 4, xpReward: 100, tasks: [
        code('score + 10',
          "p1 player-н score-г 10-аар нэм.",
          `function solution(players, name) {
  return players.map(p => p.name === name ? { ...p, score: p.score + 10 } : p);
}`,
          [{input:[[{name:'p1',score:50},{name:'p2',score:30}],'p1'], expected:[{name:'p1',score:60},{name:'p2',score:30}], label:'score+10'}], 25),

        code('hp - 20',
          'Player hp-г 20-оор хас (min 0).',
          `function solution(players, name) {
  return players.map(p => p.name === name ? { ...p, hp: Math.max(0, p.hp - 20) } : p);
}`,
          [{input:[[{name:'p1',hp:100},{name:'p2',hp:10}],'p1'], expected:[{name:'p1',hp:80},{name:'p2',hp:10}], label:'-20hp'}], 25),

        code('position update',
          'Player x, y байрлалыг шинэчлэ.',
          `function solution(players, name, x, y) {
  return players.map(p => p.name === name ? { ...p, x, y } : p);
}`,
          [{input:[[{name:'p1',x:0,y:0}],'p1',100,200], expected:[{name:'p1',x:100,y:200}], label:'move'}], 25),

        code('бүгдийн hp reset',
          'Бүх players-н hp-г 100 болго.',
          `function solution(players) {
  return players.map(p => ({ ...p, hp: 100 }));
}`,
          [{input:[[{name:'p1',hp:20},{name:'p2',hp:50}]], expected:[{name:'p1',hp:100},{name:'p2',hp:100}], label:'reset all hp'}], 25),

        code('low hp boost',
          'HP 50-аас бага players-н hp-г +20 нэм.',
          `function solution(players) {
  return players.map(p => p.hp < 50 ? { ...p, hp: Math.min(100, p.hp + 20) } : p);
}`,
          [{input:[[{name:'p1',hp:30},{name:'p2',hp:80}]], expected:[{name:'p1',hp:50},{name:'p2',hp:80}], label:'boost low hp'}], 30),
      ]},

      { title: 'DELETE Queries', orderIndex: 5, xpReward: 100, tasks: [
        code('player устгах',
          'Нэрээр player-г устга.',
          `function solution(players, name) {
  return players.filter(p => p.name !== name);
}`,
          [{input:[[{name:'p1'},{name:'p2'}],'p1'], expected:[{name:'p2'}], label:'delete p1'}], 20),

        code('hp <= 0 устгах',
          'HP 0 буюу түүнээс бага players-г устга.',
          `function solution(players) {
  return players.filter(p => p.hp > 0);
}`,
          [{input:[[{name:'p1',hp:100},{name:'p2',hp:0},{name:'p3',hp:-5}]], expected:[{name:'p1',hp:100}], label:'remove dead'}], 20),

        code('score < 10 устгах',
          'Score 10-аас бага players-г устга.',
          `function solution(players) {
  return players.filter(p => p.score >= 10);
}`,
          [{input:[[{name:'p1',score:5},{name:'p2',score:15},{name:'p3',score:0}]], expected:[{name:'p2',score:15}], label:'remove low'}], 20),

        code('бүгдийг устгах',
          'Бүх players-г устга.',
          `function solution(players) {
  return [];
}`,
          [{input:[[{name:'p1'},{name:'p2'}]], expected:[], label:'clear all'}], 20),

        code('bottom players устгах',
          'Score хамгийн бага limit тоог устга.',
          `function solution(players, limit) {
  return [...players].sort((a,b) => b.score - a.score).slice(0, players.length - limit);
}`,
          [{input:[[{name:'A',score:100},{name:'B',score:50},{name:'C',score:75},{name:'D',score:10}],2], expected:[{name:'A',score:100},{name:'C',score:75}], label:'remove bottom 2'}], 30),
      ]},

      { title: 'API + DB Connect', orderIndex: 6, xpReward: 120, tasks: [
        code('GET /players',
          'getAllPlayers(players) нь бүх players буцаана.',
          `function solution(players) {
  return { ok: true, data: players };
}`,
          [{input:[{name:'Bat',score:100},{name:'Bold',score:50}], expected:{ok:true,data:[{name:'Bat',score:100},{name:'Bold',score:50}]}, label:'get players'}], 25),

        code('POST /player',
          'createPlayer(players, name) нь шинэ player нэмнэ.',
          `function solution(players, name) {
  if (players.find(p => p.name === name)) return { ok: false, error: 'exists' };
  return { ok: true, players: [...players, { name, score: 0, hp: 100, x: 0, y: 0 }] };
}`,
          [{input:[[],  'Bat'], expected:{ok:true,players:[{name:'Bat',score:0,hp:100,x:0,y:0}]}, label:'create'}, {input:[[{name:'Bat'}],'Bat'], expected:{ok:false,error:'exists'}, label:'duplicate'}], 30),

        code('PUT /move',
          'movePlayer(players, name, x, y) нь байрлал шинэчилж {ok:true} буцаана.',
          `function solution(players, name, x, y) {
  return { ok: true, players: players.map(p => p.name === name ? { ...p, x, y } : p) };
}`,
          [{input:[[{name:'Bat',x:0,y:0}],'Bat',100,200], expected:{ok:true,players:[{name:'Bat',x:100,y:200}]}, label:'moved'}], 25),

        code('GET /leaderboard',
          'leaderboard(players) нь top 5 score буурах дарааллаар буцаана.',
          `function solution(players) {
  return [...players].sort((a,b) => b.score - a.score).slice(0,5);
}`,
          [{input:[[{name:'A',score:100},{name:'B',score:200},{name:'C',score:150}]], expected:[{name:'B',score:200},{name:'C',score:150},{name:'A',score:100}], label:'leaderboard'}], 25),

        code('DELETE /player/:name',
          'deletePlayer(players, name) нь player устгаж {ok:true} буцаана.',
          `function solution(players, name) {
  return { ok: true, players: players.filter(p => p.name !== name) };
}`,
          [{input:[[{name:'Bat'},{name:'Bold'}],'Bat'], expected:{ok:true,players:[{name:'Bold'}]}, label:'deleted'}], 25),
      ]},

      { title: 'Multiplayer Sync', orderIndex: 7, xpReward: 200, tasks: [
        code('POST /join',
          'joinGame(players, name) нь player нэмж {joined:true} буцаана.',
          `function solution(players, name) {
  if (players.find(p => p.name === name)) return { joined: false, error: 'already joined' };
  return { joined: true, players: [...players, { name, x: 0, y: 0, score: 0, hp: 100 }] };
}`,
          [{input:[[],  'Bat'], expected:{joined:true,players:[{name:'Bat',x:0,y:0,score:0,hp:100}]}, label:'joined'}, {input:[[{name:'Bat'}],'Bat'], expected:{joined:false,error:'already joined'}, label:'already in'}], 35),

        code('POST /move',
          'moveInGame(players, name, x, y) нь байрлал шинэчилж {moved:true} буцаана.',
          `function solution(players, name, x, y) {
  return { moved: true, players: players.map(p => p.name === name ? { ...p, x, y } : p) };
}`,
          [{input:[[{name:'Bat',x:0,y:0}],'Bat',50,80], expected:{moved:true,players:[{name:'Bat',x:50,y:80}]}, label:'moved'}], 30),

        code('GET /state',
          'getGameState(players) нь name, x, y харуулна.',
          `function solution(players) {
  return players.map(p => ({ name: p.name, x: p.x, y: p.y }));
}`,
          [{input:[[{name:'Bat',x:10,y:20,score:5,hp:100},{name:'Bold',x:50,y:80,score:3,hp:80}]], expected:[{name:'Bat',x:10,y:20},{name:'Bold',x:50,y:80}], label:'state'}], 30),

        code('POST /leave',
          'leaveGame(players, name) нь player хасч {left:true} буцаана.',
          `function solution(players, name) {
  return { left: true, players: players.filter(p => p.name !== name) };
}`,
          [{input:[[{name:'Bat'},{name:'Bold'}],'Bat'], expected:{left:true,players:[{name:'Bold'}]}, label:'left'}], 25),

        code('FULL MULTIPLAYER ENGINE',
          'multiGame(players, event) нь join/move/leave/count бүгдийг шийдэнэ.',
          `function solution(players, event) {
  switch(event.type) {
    case 'join':
      if (players.find(p=>p.name===event.name)) return { players, error:'exists' };
      return { players: [...players, {name:event.name,x:0,y:0,score:0,hp:100}] };
    case 'move':
      return { players: players.map(p=>p.name===event.name?{...p,x:event.x,y:event.y}:p) };
    case 'leave':
      return { players: players.filter(p=>p.name!==event.name) };
    case 'count':
      return { count: players.length };
    default: return { players };
  }
}`,
          [
            {input:[[],{type:'join',name:'Bat'}], expected:{players:[{name:'Bat',x:0,y:0,score:0,hp:100}]}, label:'join'},
            {input:[[{name:'Bat',x:0,y:0,score:0,hp:100}],{type:'move',name:'Bat',x:50,y:80}], expected:{players:[{name:'Bat',x:50,y:80,score:0,hp:100}]}, label:'move'},
            {input:[[{name:'Bat'},{name:'Bold'}],{type:'count'}], expected:{count:2}, label:'count'},
          ], 50),
      ]},

    ]
  },

  {
    courseTitle: 'Deployment + Final Game',
    category: 'backend', difficulty: 'ADVANCED', orderIndex: 8,
    lessons: [

      { title: 'Build Frontend', orderIndex: 1, xpReward: 80, tasks: [
        code('build command',
          'buildCmd() нь npm build командыг буцаана.',
          `function solution() {
  return 'npm run build';
}`,
          [{input:null, expected:'npm run build', label:'build cmd'}], 20),

        code('static middleware',
          'staticCode(folder) нь express.static code буцаана.',
          `function solution(folder) {
  return 'app.use(express.static("' + folder + '"))';
}`,
          [{input:'build', expected:'app.use(express.static("build"))', label:'static build'}], 20),

        code('index.html route',
          'indexRoute(dir) нь sendFile code буцаана.',
          `function solution(dir) {
  return 'res.sendFile(' + dir + ' + "/build/index.html")';
}`,
          [{input:'__dirname', expected:'res.sendFile(__dirname + "/build/index.html")', label:'send index'}], 25),

        code('path require',
          'requirePath() нь path require code буцаана.',
          `function solution() {
  return 'const path = require("path")';
}`,
          [{input:null, expected:'const path = require("path")', label:'require path'}], 20),

        code('path.join',
          'joinPath(parts) нь path.join(...parts) code буцаана.',
          `function solution(parts) {
  return 'path.join(' + parts.map(p => JSON.stringify(p)).join(', ') + ')';
}`,
          [{input:['__dirname','build','index.html'], expected:'path.join("__dirname", "build", "index.html")', label:'path join'}], 25),
      ]},

      { title: 'ENV + PORT', orderIndex: 2, xpReward: 80, tasks: [
        code('env port',
          'envPort(fallback) нь process.env.PORT || fallback буцаана.',
          `function solution(fallback) {
  return 'const PORT = process.env.PORT || ' + fallback;
}`,
          [{input:3000, expected:'const PORT = process.env.PORT || 3000', label:'env port'}], 20),

        code('dotenv config',
          'dotenvCode() нь dotenv config code буцаана.',
          `function solution() {
  return 'require("dotenv").config()';
}`,
          [{input:null, expected:'require("dotenv").config()', label:'dotenv'}], 20),

        code('.env file content',
          'envFile(port) нь .env file content буцаана.',
          `function solution(port) {
  return 'PORT=' + port;
}`,
          [{input:3000, expected:'PORT=3000', label:'.env'}], 20),

        code('listen with env',
          'listenEnv() нь process.env.PORT listen code буцаана.',
          `function solution() {
  return 'app.listen(process.env.PORT)';
}`,
          [{input:null, expected:'app.listen(process.env.PORT)', label:'listen env'}], 20),

        code('log port',
          'logPort(port) нь "Running on " + port буцаана.',
          `function solution(port) {
  return 'Running on ' + port;
}`,
          [{input:3000, expected:'Running on 3000', label:'log port'}], 20),
      ]},

      { title: 'Deploy – Git + Render', orderIndex: 3, xpReward: 80, tasks: [
        code('package.json start script',
          'startScript() нь start script object буцаана.',
          `function solution() {
  return { start: 'node server.js' };
}`,
          [{input:null, expected:{start:'node server.js'}, label:'start script'}], 20),

        code('git init',
          'gitInit() нь "git init" буцаана.',
          `function solution() {
  return 'git init';
}`,
          [{input:null, expected:'git init', label:'git init'}], 15),

        code('git commit',
          'gitCommit(msg) нь git commit command буцаана.',
          `function solution(msg) {
  return 'git add . && git commit -m "' + msg + '"';
}`,
          [{input:'deploy', expected:'git add . && git commit -m "deploy"', label:'commit'}], 25),

        code('git remote add',
          'gitRemote(url) нь git remote add command буцаана.',
          `function solution(url) {
  return 'git remote add origin ' + url;
}`,
          [{input:'https://github.com/user/repo.git', expected:'git remote add origin https://github.com/user/repo.git', label:'remote add'}], 25),

        code('git push',
          'gitPush(branch) нь git push command буцаана.',
          `function solution(branch) {
  return 'git push origin ' + branch;
}`,
          [{input:'main', expected:'git push origin main', label:'push main'}], 20),
      ]},

      { title: 'Live API Test', orderIndex: 4, xpReward: 100, tasks: [
        code('fetch live API',
          'fetchUrl(base, path) нь full URL буцаана.',
          `function solution(base, path) {
  return 'fetch("' + base + path + '")';
}`,
          [{input:['https://api.onrender.com','/player'], expected:'fetch("https://api.onrender.com/player")', label:'fetch url'}], 20),

        code('POST live fetch',
          'postLive(url, data) нь POST fetch options object буцаана.',
          `function solution(url, data) {
  return {
    url,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}`,
          [{input:['https://api.onrender.com/answer',{answer:'test'}], expected:{url:'https://api.onrender.com/answer',method:'POST',headers:{'Content-Type':'application/json'},body:'{"answer":"test"}'}, label:'post live'}], 30),

        code('GET leaderboard',
          'leaderboardFetch(path) нь fetch + json parse code буцаана.',
          `function solution(path) {
  return 'fetch("' + path + '").then(r=>r.json())';
}`,
          [{input:'/leaderboard', expected:'fetch("/leaderboard").then(r=>r.json())', label:'leaderboard fetch'}], 20),

        code('error handle',
          'fetchWithCatch(url) нь fetch + catch code буцаана.',
          `function solution(url) {
  return 'fetch("' + url + '").catch(e=>console.log(e))';
}`,
          [{input:'/api', expected:'fetch("/api").catch(e=>console.log(e))', label:'catch error'}], 25),

        code('async await fetch',
          'asyncFetch(url) нь async/await code буцаана.',
          `function solution(url) {
  return 'const res = await fetch("' + url + '"); const data = await res.json()';
}`,
          [{input:'/api', expected:'const res = await fetch("/api"); const data = await res.json()', label:'async fetch'}], 30),
      ]},

      { title: 'Final Game Logic – Fullstack', orderIndex: 5, xpReward: 120, tasks: [
        code('task fetch result',
          'taskFetchResult(taskObj) нь task string буцаана.',
          `function solution(taskObj) {
  return taskObj.task;
}`,
          [{input:{task:'let x=10'}, expected:'let x=10', label:'get task'}], 20),

        code('submit answer',
          'submitAnswer(answer) нь POST body object буцаана.',
          `function solution(answer) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer }),
  };
}`,
          [{input:'let x=10', expected:{method:'POST',headers:{'Content-Type':'application/json'},body:'{"answer":"let x=10"}'}, label:'submit'}], 25),

        code('update UI from server',
          'updateFromServer(playerData, state) нь hp, score state шинэчилнэ.',
          `function solution(playerData, state) {
  return { ...state, hp: playerData.hp, score: playerData.score };
}`,
          [{input:[{hp:80,score:50},{hp:100,score:0,enemies:[]}], expected:{hp:80,score:50,enemies:[]}, label:'ui update'}], 25),

        code('enemy sync',
          'syncEnemies(enemyData) нь enemies state болгоно.',
          `function solution(enemyData) {
  return enemyData.map(e => ({ hp: e.hp }));
}`,
          [{input:[[{id:1,hp:50,x:10},{id:2,hp:30,x:50}]], expected:[{hp:50},{hp:30}], label:'synced'}], 25),

        code('auto refresh state',
          'autoRefresh(player, interval) нь refresh config object буцаана.',
          `function solution(player, interval) {
  return { player, interval, active: true, nextTick: interval };
}`,
          [{input:[{hp:80,score:5}, 1000], expected:{player:{hp:80,score:5},interval:1000,active:true,nextTick:1000}, label:'refresh config'}], 30),
      ]},

      { title: 'Multiplayer Live', orderIndex: 6, xpReward: 120, tasks: [
        code('join game request',
          'joinRequest(name) нь POST /join body object буцаана.',
          `function solution(name) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  };
}`,
          [{input:'player1', expected:{method:'POST',headers:{'Content-Type':'application/json'},body:'{"name":"player1"}'}, label:'join req'}], 25),

        code('move request',
          'moveRequest(name, x, y) нь POST /move body object буцаана.',
          `function solution(name, x, y) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, x, y }),
  };
}`,
          [{input:['player1', 10, 20], expected:{method:'POST',headers:{'Content-Type':'application/json'},body:'{"name":"player1","x":10,"y":20}'}, label:'move req'}], 25),

        code('state авах',
          'parseState(stateData) нь player name, x, y array буцаана.',
          `function solution(stateData) {
  return stateData.map(p => ({ name: p.name, x: p.x, y: p.y }));
}`,
          [{input:[[{name:'p1',x:10,y:20,hp:100},{name:'p2',x:50,y:80,hp:80}]], expected:[{name:'p1',x:10,y:20},{name:'p2',x:50,y:80}], label:'state'}], 25),

        code('leave request',
          'leaveRequest(name) нь POST /leave body object буцаана.',
          `function solution(name) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  };
}`,
          [{input:'player1', expected:{method:'POST',headers:{'Content-Type':'application/json'},body:'{"name":"player1"}'}, label:'leave req'}], 20),

        code('player render',
          'renderPlayers(state) нь display array буцаана.',
          `function solution(state) {
  return state.map(p => p.name + ' (' + p.x + ',' + p.y + ')');
}`,
          [{input:[[{name:'Bat',x:10,y:20},{name:'Bold',x:50,y:80}]], expected:['Bat (10,20)','Bold (50,80)'], label:'render'}], 25),
      ]},

      { title: 'Final Auto Game', orderIndex: 7, xpReward: 300, tasks: [
        code('correct → enemy kill',
          'onCorrect(state) нь enemies[0] устгаж score+10 болгоно.',
          `function solution(state) {
  return { ...state, enemies: state.enemies.slice(1), score: state.score + 10 };
}`,
          [{input:{enemies:[{hp:50},{hp:30}],score:0,hp:100}, expected:{enemies:[{hp:30}],score:10,hp:100}, label:'kill enemy'}], 30),

        code('wrong → damage',
          'onWrong(state) нь hp-20 болгоно.',
          `function solution(state) {
  return { ...state, hp: Math.max(0, state.hp - 20) };
}`,
          [{input:{enemies:[{hp:50}],score:0,hp:100}, expected:{enemies:[{hp:50}],score:0,hp:80}, label:'-20hp'}], 25),

        code('auto game loop tick',
          'autoTick(state) нь hp-1, enemies attack хийнэ.',
          `function solution(state) {
  const enemyDmg = state.enemies.length * 2;
  return { ...state, hp: Math.max(0, state.hp - 1 - enemyDmg) };
}`,
          [{input:{hp:100,enemies:[],score:0}, expected:{hp:99,enemies:[],score:0}, label:'no enemy'}, {input:{hp:100,enemies:[{hp:50}],score:0}, expected:{hp:97,enemies:[{hp:50}],score:0}, label:'1 enemy -3'}], 35),

        code('win condition',
          'checkWin(score, target) нь score >= target бол true.',
          `function solution(score, target) {
  return score >= target;
}`,
          [{input:[100,100], expected:true, label:'win'}, {input:[99,100], expected:false, label:'not yet'}], 25),

        code('FULL FINAL GAME',
          'finalGame(state, event) нь complete fullstack game logic.',
          `function solution(state, event) {
  switch(event.type) {
    case 'correct':
      return { ...state, enemies: state.enemies.slice(1), score: state.score + 10, result: 'correct' };
    case 'wrong':
      return { ...state, hp: Math.max(0, state.hp - 20), result: 'wrong' };
    case 'tick': {
      const dmg = state.enemies.length * 2;
      const hp = Math.max(0, state.hp - 1 - dmg);
      return { ...state, hp, alive: hp > 0, win: state.score >= 100 };
    }
    case 'spawn':
      return { ...state, enemies: [...state.enemies, { hp: 50 }] };
    case 'reset':
      return { hp: 100, score: 0, enemies: [], alive: true, win: false };
    default: return state;
  }
}`,
          [
            {input:[{hp:100,score:0,enemies:[{hp:50}],alive:true,win:false},{type:'correct'}], expected:{hp:100,score:10,enemies:[],alive:true,win:false,result:'correct'}, label:'correct'},
            {input:[{hp:100,score:0,enemies:[],alive:true,win:false},{type:'tick'}], expected:{hp:99,enemies:[],alive:true,win:false,score:0}, label:'tick'},
            {input:[{hp:100,score:0,enemies:[],alive:true,win:false},{type:'reset'}], expected:{hp:100,score:0,enemies:[],alive:true,win:false}, label:'reset'},
          ], 100),
      ]},

    ]
  },
]

async function main() {
  for (const courseData of ROADMAP) {
    let course: any
    try {
      course = await prisma.course.upsert({
        where: { id: `course-${courseData.orderIndex}` },
        update: { title: courseData.courseTitle, category: courseData.category },
        create: {
          id: `course-${courseData.orderIndex}`,
          title: courseData.courseTitle,
          description: `${courseData.courseTitle} — Fullstack Developer Roadmap`,
          category: courseData.category,
          difficulty: courseData.difficulty as any,
          xpReward: 200,
          orderIndex: courseData.orderIndex,
        }
      })
      console.log(`  📚 Course: ${courseData.courseTitle}`)
    } catch(e: any) {
      console.error(`❌ Course ${courseData.courseTitle}:`, e.message)
      continue
    }

    for (const lessonData of courseData.lessons) {
      let lesson: any
      try {
        const lessonId = `lesson-${courseData.orderIndex}-${lessonData.orderIndex}`
        lesson = await prisma.lesson.upsert({
          where: { id: lessonId },
          update: { title: lessonData.title, xpReward: lessonData.xpReward },
          create: {
            id: lessonId,
            courseId: course.id,
            title: lessonData.title,
            content: lessonData.title,
            xpReward: lessonData.xpReward,
            orderIndex: lessonData.orderIndex,
          }
        })
      } catch(e: any) {
        console.error(`  ❌ Lesson ${lessonData.title}:`, e.message)
        continue
      }

      let taskCount = 0
      for (let i = 0; i < lessonData.tasks.length; i++) {
        const t = lessonData.tasks[i]
        const taskId = `task-${courseData.orderIndex}-${lessonData.orderIndex}-${i + 1}`
        const isCode = t.taskType === 'code'
        try {
          await prisma.task.upsert({
            where: { id: taskId },
            update: {
              title: t.title,
              description: isCode ? t.descriptions[0] : t.descriptions.join('|||'),
              options: isCode ? null : JSON.stringify(t.variants),
              starterCode: isCode ? (t.starterCode || null) : JSON.stringify(t.answers),
              testCases: t.testCases || null,
              xpReward: t.xpReward,
              taskType: (t.taskType || 'quiz') as any,
            },
            create: {
              id: taskId,
              lessonId: lesson.id,
              title: t.title,
              description: isCode ? t.descriptions[0] : t.descriptions.join('|||'),
              options: isCode ? null : JSON.stringify(t.variants),
              starterCode: isCode ? (t.starterCode || null) : JSON.stringify(t.answers),
              testCases: t.testCases || null,
              xpReward: t.xpReward,
              orderIndex: i + 1,
              taskType: (t.taskType || 'quiz') as any,
            }
          })
          taskCount++
        } catch(e: any) {
          console.error(`    ❌ Task ${t.title}:`, e.message)
        }
      }
      console.log(`    ✅ ${lessonData.title}: ${taskCount}/${lessonData.tasks.length} tasks`)
    }
    console.log(`✅ ${courseData.courseTitle}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
