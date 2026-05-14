const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

const translations = {
  // ── Lesson 1: HTML ──────────────────────────────────────────────
  'task-1-1-1': { titleEn: 'HTML basic structure',      descriptionEn: 'Write DOCTYPE, html, head(title), body structure.' },
  'task-1-1-2': { titleEn: 'Add h1 heading',            descriptionEn: 'Add h1 "🎮 My Game" heading inside body.' },
  'task-1-1-3': { titleEn: 'Add paragraph',             descriptionEn: 'Add a paragraph "Welcome to the game".' },
  'task-1-1-4': { titleEn: 'Create div container',      descriptionEn: 'Create a div container with id="game".' },
  'task-1-1-5': { titleEn: 'Add meta charset',          descriptionEn: 'Add UTF-8 charset meta tag.' },

  'task-1-2-1': { titleEn: 'Add image',                 descriptionEn: 'Add a player.png image.' },
  'task-1-2-2': { titleEn: 'Set width & height',        descriptionEn: 'Set player.png image size to 50x50.' },
  'task-1-2-3': { titleEn: 'Add enemy image',           descriptionEn: 'Add an enemy.png image.' },
  'task-1-2-4': { titleEn: 'Add alt text',              descriptionEn: 'Add alt="player" to the player.png image.' },
  'task-1-2-5': { titleEn: 'Image inside div',          descriptionEn: 'Place player.png image inside the id="game" div.' },

  'task-1-3-1': { titleEn: 'Add button',                descriptionEn: 'Add a button with text "Start".' },
  'task-1-3-2': { titleEn: 'Input field',               descriptionEn: 'Add a text type input field.' },
  'task-1-3-3': { titleEn: 'Add placeholder',           descriptionEn: 'Add an input with placeholder "Enter name".' },
  'task-1-3-4': { titleEn: 'Button click function',     descriptionEn: 'Add a button that calls startGame() on click.' },
  'task-1-3-5': { titleEn: 'Add script tag',            descriptionEn: 'Add an empty script tag.' },

  'task-1-4-1': { titleEn: 'Show score',                descriptionEn: 'Add a Score paragraph with id="score" span.' },
  'task-1-4-2': { titleEn: 'Show HP',                   descriptionEn: 'Add an HP paragraph with id="hp" span.' },
  'task-1-4-3': { titleEn: 'Game area div',             descriptionEn: 'Create a div with id="game".' },
  'task-1-4-4': { titleEn: 'Player div',                descriptionEn: 'Create a div with id="player".' },
  'task-1-4-5': { titleEn: 'Enemy div',                 descriptionEn: 'Create a div with id="enemy".' },

  'task-1-5-1': { titleEn: 'Add link',                  descriptionEn: 'Add a "Play Game" link to game.html.' },
  'task-1-5-2': { titleEn: 'Open new tab',              descriptionEn: 'Add a link to game.html that opens in a new tab.' },
  'task-1-5-3': { titleEn: 'Image link',                descriptionEn: 'Make play.png image a link to game.html.' },
  'task-1-5-4': { titleEn: 'Button link',               descriptionEn: 'Add onclick to button that navigates to game.html.' },
  'task-1-5-5': { titleEn: 'Home link',                 descriptionEn: 'Add a "Home" link to index.html.' },

  'task-1-6-1': { titleEn: 'Create form',               descriptionEn: 'Create an empty form tag.' },
  'task-1-6-2': { titleEn: 'Name input',                descriptionEn: 'Add a text input with name="player".' },
  'task-1-6-3': { titleEn: 'Submit button',             descriptionEn: 'Add a "Start" submit button.' },
  'task-1-6-4': { titleEn: 'Add label',                 descriptionEn: 'Add a "Player Name" label.' },
  'task-1-6-5': { titleEn: 'Required input',            descriptionEn: 'Add a text input with the required attribute.' },

  'task-1-7-1': { titleEn: 'h1 + score + hp',          descriptionEn: 'Add h1 "🎮 Game", HP span, and Score span.' },
  'task-1-7-2': { titleEn: 'Game + player + enemy',    descriptionEn: 'Place player and enemy divs inside id="game" div.' },
  'task-1-7-3': { titleEn: 'Start button + script',    descriptionEn: 'Add a button calling startGame() and a script tag.' },
  'task-1-7-4': { titleEn: 'Head section',             descriptionEn: 'Add DOCTYPE, html, head(title "Game", meta charset), body.' },
  'task-1-7-5': { titleEn: 'FULL GAME PAGE',           descriptionEn: 'Write a complete game page: DOCTYPE + head + body(h1, hp, score, game div, player, enemy, button, script).' },

  // ── Lesson 2: CSS ───────────────────────────────────────────────
  'task-2-1-1': { titleEn: 'Black body background',    descriptionEn: 'Set body background to black.' },
  'task-2-1-2': { titleEn: 'White text',               descriptionEn: 'Set body text color to white.' },
  'task-2-1-3': { titleEn: 'Change font',              descriptionEn: 'Set body to monospace font.' },
  'task-2-1-4': { titleEn: 'Center h1',                descriptionEn: 'Center the h1 heading.' },
  'task-2-1-5': { titleEn: 'Remove margin',            descriptionEn: 'Remove body margin.' },

  'task-2-2-1': { titleEn: '#game size',               descriptionEn: 'Set #game div to width:500px, height:300px.' },
  'task-2-2-2': { titleEn: 'Center game',              descriptionEn: 'Center #game with margin: auto.' },
  'task-2-2-3': { titleEn: 'Add background',          descriptionEn: 'Add #111 background to #game.' },
  'task-2-2-4': { titleEn: 'Add border',               descriptionEn: 'Add 2px solid white border to #game.' },
  'task-2-2-5': { titleEn: 'Position relative',        descriptionEn: 'Set #game to position: relative.' },

  'task-2-3-1': { titleEn: '#player size',             descriptionEn: 'Set #player to width:40px, height:40px.' },
  'task-2-3-2': { titleEn: 'Green color',              descriptionEn: 'Set #player background to lime.' },
  'task-2-3-3': { titleEn: 'Absolute position',        descriptionEn: 'Set #player to position: absolute.' },
  'task-2-3-4': { titleEn: 'Initial position',         descriptionEn: 'Place #player at left:10px, top:100px.' },
  'task-2-3-5': { titleEn: 'Add border',               descriptionEn: 'Add 2px solid white border to #player.' },

  'task-2-4-1': { titleEn: '#enemy size',              descriptionEn: 'Set #enemy to width:40px, height:40px.' },
  'task-2-4-2': { titleEn: 'Red color',                descriptionEn: 'Set #enemy background to red.' },
  'task-2-4-3': { titleEn: 'Position absolute',        descriptionEn: 'Set #enemy to position: absolute.' },
  'task-2-4-4': { titleEn: 'Place on right',           descriptionEn: 'Place #enemy at right:10px, top:100px.' },
  'task-2-4-5': { titleEn: 'Add border',               descriptionEn: 'Add 2px solid white border to #enemy.' },

  'task-2-5-1': { titleEn: 'Text center',              descriptionEn: 'Center align the paragraph.' },
  'task-2-5-2': { titleEn: 'Larger font',              descriptionEn: 'Set paragraph font-size to 20px.' },
  'task-2-5-3': { titleEn: 'Span color',               descriptionEn: 'Set span color to yellow.' },
  'task-2-5-4': { titleEn: 'HP red',                   descriptionEn: 'Set #hp color to red.' },
  'task-2-5-5': { titleEn: 'Score green',              descriptionEn: 'Set #score color to lime.' },

  'task-2-6-1': { titleEn: 'Button background + color', descriptionEn: 'Set button to black background, white color.' },
  'task-2-6-2': { titleEn: 'Border',                   descriptionEn: 'Add 2px solid white border to button.' },
  'task-2-6-3': { titleEn: 'Padding',                  descriptionEn: 'Add padding: 10px to button.' },
  'task-2-6-4': { titleEn: 'Hover effect',             descriptionEn: 'Add button:hover with white background, black color.' },
  'task-2-6-5': { titleEn: 'Center button',            descriptionEn: 'Center button with display:block, margin:auto.' },

  'task-2-7-1': { titleEn: 'Move keyframe',            descriptionEn: 'Create a move animation from left 400px to 0.' },
  'task-2-7-2': { titleEn: 'Apply animation',          descriptionEn: 'Apply move animation 2s linear infinite to #enemy.' },
  'task-2-7-3': { titleEn: 'Blink keyframe',           descriptionEn: 'Create a blink animation: opacity 1→0→1 from 0% to 100%.' },
  'task-2-7-4': { titleEn: 'Apply blink',              descriptionEn: 'Apply blink 1s infinite animation to #player.' },
  'task-2-7-5': { titleEn: 'Game fade',                descriptionEn: 'Apply blink 2s infinite animation to #game.' },

  // ── Lesson 3: JavaScript ────────────────────────────────────────
  'task-3-1-1': { titleEn: 'Create score variable',    descriptionEn: 'Declare a variable score = 0.' },
  'task-3-1-2': { titleEn: 'hp = 100',                 descriptionEn: 'Declare a variable hp = 100.' },
  'task-3-1-3': { titleEn: 'playerName string',        descriptionEn: 'Declare a string variable playerName = "Hero".' },
  'task-3-1-4': { titleEn: 'enemyCount = 3',           descriptionEn: 'Declare a variable enemyCount = 3.' },
  'task-3-1-5': { titleEn: 'Boolean alive',            descriptionEn: 'Declare a boolean variable alive = true.' },

  'task-3-2-1': { titleEn: 'startGame function',       descriptionEn: 'Create a startGame() function that returns "Game Start".' },
  'task-3-2-2': { titleEn: 'addScore function',        descriptionEn: 'Create addScore(score) that returns score + 10.' },
  'task-3-2-3': { titleEn: 'damage function',          descriptionEn: 'Create damage(hp) that returns hp - 20.' },
  'task-3-2-4': { titleEn: 'resetGame function',       descriptionEn: 'Create resetGame() that returns {score:0, hp:100}.' },
  'task-3-2-5': { titleEn: 'logStatus function',       descriptionEn: 'Create logStatus(score, hp) that returns "Score: X HP: Y".' },

  'task-3-3-1': { titleEn: 'Get #score element',       descriptionEn: 'Return the "#score" selector string using getElementById.' },
  'task-3-3-2': { titleEn: 'Get #hp element',          descriptionEn: 'Return the "#hp" selector string using getElementById.' },
  'task-3-3-3': { titleEn: '#player element',          descriptionEn: 'Return the getElementById("player") code string.' },
  'task-3-3-4': { titleEn: '#enemy element',           descriptionEn: 'Return the getElementById("enemy") code string.' },
  'task-3-3-5': { titleEn: 'querySelector',            descriptionEn: 'Return the querySelector("#game") code string.' },

  'task-3-4-1': { titleEn: 'Update score',             descriptionEn: 'updateScore(score) returns "scoreEl.innerText = " + score.' },
  'task-3-4-2': { titleEn: 'Update hp',                descriptionEn: 'updateHp(hp) returns "hpEl.innerText = " + hp.' },
  'task-3-4-3': { titleEn: 'Move player right',        descriptionEn: 'moveRight(px) returns px + "px" CSS string.' },
  'task-3-4-4': { titleEn: 'Hide enemy',               descriptionEn: 'hideEnemy() returns "none" (display style).' },
  'task-3-4-5': { titleEn: 'Show enemy',               descriptionEn: 'showEnemy() returns "block" (display style).' },

  'task-3-5-1': { titleEn: 'Button click handler',     descriptionEn: 'handleClick() returns "clicked".' },
  'task-3-5-2': { titleEn: 'addEventListener code',    descriptionEn: 'eventCode(event, fn) returns event listener code string.' },
  'task-3-5-3': { titleEn: 'Keydown event',            descriptionEn: 'onKeyDown(key) returns "keydown: " + key.' },
  'task-3-5-4': { titleEn: 'Space key detect',         descriptionEn: 'isJump(key) returns "jump" if key is " ", otherwise "none".' },
  'task-3-5-5': { titleEn: 'Button hover',             descriptionEn: 'onHover(el) returns "hover: " + el.' },

  'task-3-6-1': { titleEn: 'hp <= 0 game over',        descriptionEn: 'checkDead(hp) returns "Game Over" if hp <= 0, else "alive".' },
  'task-3-6-2': { titleEn: 'Score > 100 win',          descriptionEn: 'checkWin(score) returns "Win" if score > 100, else "playing".' },
  'task-3-6-3': { titleEn: 'Enemy hit',                descriptionEn: 'onHit(hit, score) returns score + 10 if hit, else score.' },
  'task-3-6-4': { titleEn: 'Low HP warning',           descriptionEn: 'hpWarning(hp) returns "Low HP" if hp < 30, else "OK".' },
  'task-3-6-5': { titleEn: 'Check alive',              descriptionEn: 'checkAlive(alive) returns "Playing" if alive, else "Dead".' },

  'task-3-7-1': { titleEn: 'For loop count',           descriptionEn: 'countEnemies(n) returns array with "enemy" repeated n times.' },
  'task-3-7-2': { titleEn: 'Array forEach sum',        descriptionEn: 'sumScores(arr) returns the total sum of the array.' },
  'task-3-7-3': { titleEn: 'Spawn enemy loop',         descriptionEn: 'spawnEnemies(count) returns array of enemies with id 0 to count.' },
  'task-3-7-4': { titleEn: 'While loop countdown',     descriptionEn: 'countdown(start) returns array counting down from start to 0.' },
  'task-3-7-5': { titleEn: 'FULL GAME LOOP',           descriptionEn: 'gameLoop(state) performs one frame update: score+1, hp check.' },

  // ── Lesson 4: Objects & Arrays ──────────────────────────────────
  'task-4-1-1': { titleEn: 'Create player object',     descriptionEn: 'Return a player object with name, hp, score fields.' },
  'task-4-1-2': { titleEn: 'Enemy object',             descriptionEn: 'Return an enemy object with hp, damage fields.' },
  'task-4-1-3': { titleEn: 'Add player score',         descriptionEn: 'Do player.score += 10 and return the new score.' },
  'task-4-1-4': { titleEn: 'Enemy takes damage',       descriptionEn: 'Do enemy.hp -= 10 and return the new hp.' },
  'task-4-1-5': { titleEn: 'Check player hp',          descriptionEn: 'Return "dead" if player.hp <= 0, else "alive".' },

  'task-4-2-1': { titleEn: 'Create enemies array',     descriptionEn: 'Return an empty enemies array.' },
  'task-4-2-2': { titleEn: 'Push enemy',               descriptionEn: 'Push {hp:50} to enemies array and return it.' },
  'task-4-2-3': { titleEn: 'Get enemies hp',           descriptionEn: 'Return array of all hp values from enemies array.' },
  'task-4-2-4': { titleEn: 'Splice enemy',             descriptionEn: 'Remove enemies[0] and return remaining array.' },
  'task-4-2-5': { titleEn: 'Enemy count',              descriptionEn: 'Return enemies.length.' },

  'task-4-3-1': { titleEn: 'Game loop interval ms',    descriptionEn: 'gameLoop(fps) returns 1000/fps (ms per frame).' },
  'task-4-3-2': { titleEn: 'Count enemy spawns',       descriptionEn: 'spawnEvery(ms, totalMs) returns how many times to spawn.' },
  'task-4-3-3': { titleEn: 'HP decrease tick',         descriptionEn: 'tickHp(hp, loss, ticks) returns hp after ticks frames.' },
  'task-4-3-4': { titleEn: 'Simulate clearInterval',   descriptionEn: 'shouldStop(hp) returns true if hp <= 0 (stop loop).' },
  'task-4-3-5': { titleEn: 'Game over stop',           descriptionEn: 'gameStep(state) sets running=false if hp <= 0.' },

  'task-4-4-1': { titleEn: 'x === x collision',        descriptionEn: 'isHit(px, ex) returns true if x positions are equal.' },
  'task-4-4-2': { titleEn: 'Damage on hit',            descriptionEn: 'applyDamage(hit, hp) returns hp-10 if hit, else hp.' },
  'task-4-4-3': { titleEn: 'Remove when hp 0',         descriptionEn: 'isAlive(hp) returns hp > 0.' },
  'task-4-4-4': { titleEn: 'Add score',                descriptionEn: 'addScore(score, points) returns score + points.' },
  'task-4-4-5': { titleEn: 'Multiple collision',       descriptionEn: 'checkEnemies(player, enemies) returns number of colliding enemies.' },

  'task-4-5-1': { titleEn: 'Random 0-1',               descriptionEn: 'isRandom(n) returns whether 0 <= n < 1.' },
  'task-4-5-2': { titleEn: '0-100 random range',       descriptionEn: 'inRange(n) returns whether 0 <= n <= 100.' },
  'task-4-5-3': { titleEn: 'Enemy random position',    descriptionEn: 'randomPos(seed, max) returns integer between 0 and max (seed % max).' },
  'task-4-5-4': { titleEn: 'Spawn count',              descriptionEn: 'spawnCount(seed, max) returns number between 0 and max using seed.' },
  'task-4-5-5': { titleEn: 'Random damage',            descriptionEn: 'randomDamage(seed) returns damage between 1 and 20.' },

  'task-4-6-1': { titleEn: 'gameRunning variable',     descriptionEn: 'initState() returns {running: true}.' },
  'task-4-6-2': { titleEn: 'Pause game',               descriptionEn: 'pause(state) sets running=false.' },
  'task-4-6-3': { titleEn: 'Resume game',              descriptionEn: 'resume(state) sets running=true.' },
  'task-4-6-4': { titleEn: 'State check',              descriptionEn: 'canUpdate(running) returns false when running=false.' },
  'task-4-6-5': { titleEn: 'Restart game',             descriptionEn: 'restart(state) sets hp=100, score=0, running=true.' },

  'task-4-7-1': { titleEn: 'Task array',               descriptionEn: 'Create and return a tasks array.' },
  'task-4-7-2': { titleEn: 'Get random task',          descriptionEn: 'getTask(tasks, seed) returns one task from array using seed.' },
  'task-4-7-3': { titleEn: 'Check input',              descriptionEn: 'checkAnswer(answer, expected) returns true if match, false if not.' },
  'task-4-7-4': { titleEn: 'Correct → remove enemy',  descriptionEn: 'onCorrect(enemies) removes the first enemy and returns array.' },
  'task-4-7-5': { titleEn: 'FULL TASK BATTLE',         descriptionEn: 'taskBattle(state, correct) removes enemy if correct, else hp-20.' },

  // ── Lesson 5: React ─────────────────────────────────────────────
  'task-5-1-1': { titleEn: 'App component',            descriptionEn: 'App component returns "Game" text.' },
  'task-5-1-2': { titleEn: 'Game component',           descriptionEn: 'Game component returns "Play" text.' },
  'task-5-1-3': { titleEn: 'Call component',           descriptionEn: 'parentComponent(child) returns "<" + child + " />".' },
  'task-5-1-4': { titleEn: 'JSX layout',               descriptionEn: 'layout(title, component) returns a JSX string.' },
  'task-5-1-5': { titleEn: 'Component export',         descriptionEn: 'exportDefault(name) returns "export default " + name.' },

  'task-5-2-1': { titleEn: 'hp state initial',         descriptionEn: 'initHp() returns the hp initial value.' },
  'task-5-2-2': { titleEn: 'score state initial',      descriptionEn: 'initScore() returns the score initial value.' },
  'task-5-2-3': { titleEn: 'damage state update',      descriptionEn: 'damage(hp, amount) returns hp - amount (min 0).' },
  'task-5-2-4': { titleEn: 'addScore state update',    descriptionEn: 'addScore(score, points) returns score + points.' },
  'task-5-2-5': { titleEn: 'State UI display',         descriptionEn: 'hpScoreUI(hp, score) returns a display string.' },

  'task-5-3-1': { titleEn: 'useEffect deps',           descriptionEn: 'effectDeps() returns [] (run once on mount).' },
  'task-5-3-2': { titleEn: 'Loop interval ms',         descriptionEn: 'loopMs(fps) returns 1000/fps.' },
  'task-5-3-3': { titleEn: 'HP auto decrease',         descriptionEn: 'tickHp(hp) returns hp - 1 (auto decrease).' },
  'task-5-3-4': { titleEn: 'Enemy spawn',              descriptionEn: 'spawnEnemy(enemies) returns new array with {hp:50} added.' },
  'task-5-3-5': { titleEn: 'Cleanup return',           descriptionEn: 'cleanup() returns "clearInterval called".' },

  'task-5-4-1': { titleEn: 'Enemies initial state',    descriptionEn: 'initEnemies() returns an empty array.' },
  'task-5-4-2': { titleEn: 'Add enemy',                descriptionEn: 'addEnemy(enemies) returns array with {hp:50} added.' },
  'task-5-4-3': { titleEn: 'Enemies render data',      descriptionEn: 'renderEnemies(enemies) returns an emoji array.' },
  'task-5-4-4': { titleEn: 'Remove enemy',             descriptionEn: 'removeFirst(enemies) removes the first enemy.' },
  'task-5-4-5': { titleEn: 'Enemy count display',      descriptionEn: 'enemyCount(enemies) returns "Enemies: " + length.' },

  'task-5-5-1': { titleEn: 'Tasks array',              descriptionEn: 'getTasks() returns ["let x=10", "console.log(1)", "x + y"].' },
  'task-5-5-2': { titleEn: 'Task state',               descriptionEn: 'getTask(tasks, idx) returns tasks[idx].' },
  'task-5-5-3': { titleEn: 'Random task',              descriptionEn: 'randomTask(tasks, seed) returns tasks[seed % length].' },
  'task-5-5-4': { titleEn: 'Input state',              descriptionEn: 'initInput() returns an empty string.' },
  'task-5-5-5': { titleEn: 'Check logic',              descriptionEn: 'checkTask(input, task, score, hp) returns score+10 if correct, hp-20 if wrong.' },

  'task-5-6-1': { titleEn: 'Correct → clear enemies',  descriptionEn: 'onCorrect(state) clears enemies and increments score.' },
  'task-5-6-2': { titleEn: 'Wrong → damage',           descriptionEn: 'onWrong(state) decreases hp by 10.' },
  'task-5-6-3': { titleEn: 'Enemy auto attack tick',   descriptionEn: 'enemyAttack(hp, enemies) subtracts enemies count * 5 from hp.' },
  'task-5-6-4': { titleEn: 'Submit function',          descriptionEn: 'submit(input, task, score) returns score+10 if correct, else score.' },
  'task-5-6-5': { titleEn: 'Auto loop state',          descriptionEn: 'autoTick(state) runs one frame: hp-1, enemy attack.' },

  'task-5-7-1': { titleEn: 'Task UI',                  descriptionEn: 'taskDisplay(task) returns "Task: " + task.' },
  'task-5-7-2': { titleEn: 'Input onChange',           descriptionEn: 'handleInput(value) returns value (controlled input).' },
  'task-5-7-3': { titleEn: 'Submit button',            descriptionEn: 'canSubmit(input) returns true if input is not empty.' },
  'task-5-7-4': { titleEn: 'Game over UI',             descriptionEn: 'isGameOver(hp) returns "Game Over" if hp <= 0, else null.' },
  'task-5-7-5': { titleEn: 'WIN + FULL UI STATE',      descriptionEn: 'uiState(hp, score) returns a complete UI state object.' },

  // ── Lesson 6: Express / Node ────────────────────────────────────
  'task-6-1-1': { titleEn: 'Import Express',           descriptionEn: 'requireExpress() returns \'const express = require("express")\' .' },
  'task-6-1-2': { titleEn: 'Create app',               descriptionEn: 'createApp() returns "const app = express()".' },
  'task-6-1-3': { titleEn: 'Set port',                 descriptionEn: 'setPort(port) returns "const PORT = " + port.' },
  'task-6-1-4': { titleEn: 'Start server',             descriptionEn: 'listenCode(port) returns a listen code string.' },
  'task-6-1-5': { titleEn: 'JSON middleware',          descriptionEn: 'middlewareCode() returns the express.json() middleware code.' },

  'task-6-2-1': { titleEn: 'GET / route',              descriptionEn: 'getRoot(path, msg) returns a GET route response.' },
  'task-6-2-2': { titleEn: 'GET /status',              descriptionEn: 'statusResponse() returns {status:"ok"}.' },
  'task-6-2-3': { titleEn: 'POST /start',              descriptionEn: 'startGame() returns {game:"started"}.' },
  'task-6-2-4': { titleEn: 'GET /score',               descriptionEn: 'scoreResponse(score) returns {score}.' },
  'task-6-2-5': { titleEn: 'POST /damage',             descriptionEn: 'damageResponse(amount) returns {hp: -amount}.' },

  'task-6-3-1': { titleEn: 'Player object',            descriptionEn: 'initPlayer() returns {hp:100, score:0}.' },
  'task-6-3-2': { titleEn: 'GET /player response',     descriptionEn: 'getPlayer(player) returns the player object.' },
  'task-6-3-3': { titleEn: 'Score update',             descriptionEn: 'addScore(player) returns player with score + 10.' },
  'task-6-3-4': { titleEn: 'Damage hp',                descriptionEn: 'hitPlayer(player) returns player with hp - 20.' },
  'task-6-3-5': { titleEn: 'Reset player',             descriptionEn: 'resetPlayer() returns {hp:100, score:0}.' },

  'task-6-4-1': { titleEn: 'Enemies array',            descriptionEn: 'initEnemies() returns an empty array.' },
  'task-6-4-2': { titleEn: 'Spawn enemy',              descriptionEn: 'spawnEnemy(enemies) returns array with {hp:50} added.' },
  'task-6-4-3': { titleEn: 'Get enemies',              descriptionEn: 'getEnemies(enemies) returns the enemies array.' },
  'task-6-4-4': { titleEn: 'Kill enemy',               descriptionEn: 'killEnemy(enemies) removes the first enemy.' },
  'task-6-4-5': { titleEn: 'Enemy count',              descriptionEn: 'enemyCount(enemies) returns {count: length}.' },

  'task-6-5-1': { titleEn: 'Task list',                descriptionEn: 'getTasks() returns a task array.' },
  'task-6-5-2': { titleEn: 'Random task',              descriptionEn: 'randomTask(tasks, seed) returns tasks[seed % length].' },
  'task-6-5-3': { titleEn: 'Check answer',             descriptionEn: 'checkAnswer(answer, tasks, player, enemies): score+10 if correct, hp-20 if wrong.' },
  'task-6-5-4': { titleEn: 'Success response',         descriptionEn: 'successRes(score) returns {result:"ok", score}.' },
  'task-6-5-5': { titleEn: 'Fail response',            descriptionEn: 'failRes(hp) returns {result:"fail", hp}.' },

  'task-6-6-1': { titleEn: 'GET player fetch',         descriptionEn: 'fetchCode(path) returns fetch GET request code.' },
  'task-6-6-2': { titleEn: 'POST answer fetch',        descriptionEn: 'postFetch(path, data) returns POST fetch options object.' },
  'task-6-6-3': { titleEn: 'GET task fetch',           descriptionEn: 'fetchTask(path) returns the fetch path.' },
  'task-6-6-4': { titleEn: 'Spawn enemy fetch',        descriptionEn: 'spawnFetch() returns POST /enemy fetch code.' },
  'task-6-6-5': { titleEn: 'Handle API response',      descriptionEn: 'handleResponse(res) returns data if status 200, else null.' },

  'task-6-7-1': { titleEn: 'Enemy auto spawn',         descriptionEn: 'spawnInterval(enemies, n) returns array with n {hp:50} enemies added.' },
  'task-6-7-2': { titleEn: 'Player auto damage',       descriptionEn: 'autoTick(player, dmg) returns player with hp - dmg.' },
  'task-6-7-3': { titleEn: 'Game over check',          descriptionEn: 'checkGameOver(player) returns {over:true} if hp<=0, else {over:false}.' },
  'task-6-7-4': { titleEn: 'Score auto tick',          descriptionEn: 'scoreTick(player, ticks) returns player with score + ticks.' },
  'task-6-7-5': { titleEn: 'FULL GAME SERVER TICK',    descriptionEn: 'serverTick(state) performs one server tick: score+1, enemy attack, spawn check.' },

  // ── Lesson 7: SQL / Database ────────────────────────────────────
  'task-7-1-1': { titleEn: 'Create players table',     descriptionEn: 'Create a players table with id, name, score columns.' },
  'task-7-1-2': { titleEn: 'Add hp column',            descriptionEn: 'Add hp INTEGER DEFAULT 100 to players table.' },
  'task-7-1-3': { titleEn: 'Add x, y columns',         descriptionEn: 'Add x, y INTEGER DEFAULT 0 columns to players table.' },
  'task-7-1-4': { titleEn: 'Add created_at',           descriptionEn: 'Add created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP to players table.' },
  'task-7-1-5': { titleEn: 'Name UNIQUE index',        descriptionEn: 'Create a unique index on players.name.' },

  'task-7-2-1': { titleEn: 'Insert player',            descriptionEn: 'Insert name=\'player1\', score=0 into players table.' },
  'task-7-2-2': { titleEn: 'Insert multiple players',  descriptionEn: 'Insert 3 players: p1(10), p2(20), p3(30) with their scores.' },
  'task-7-2-3': { titleEn: 'Insert with hp',           descriptionEn: 'Insert name=\'p4\', score=40, hp=80 player.' },
  'task-7-2-4': { titleEn: 'Insert with position',     descriptionEn: 'Insert name=\'p5\', x=10, y=20 player.' },
  'task-7-2-5': { titleEn: 'Insert all fields',        descriptionEn: 'Insert id=1, name=\'hero\', score=100, hp=100 player.' },

  'task-7-3-1': { titleEn: 'Get all players',          descriptionEn: 'Select all rows from players table.' },
  'task-7-3-2': { titleEn: 'Top 5 leaderboard',        descriptionEn: 'Get top 5 players ordered by score descending.' },
  'task-7-3-3': { titleEn: 'Filter hp < 50',           descriptionEn: 'Select players with HP less than 50.' },
  'task-7-3-4': { titleEn: 'Get by name',              descriptionEn: 'Find the player where name=\'p1\'.' },
  'task-7-3-5': { titleEn: 'Count players',            descriptionEn: 'Count total rows in players table.' },

  'task-7-4-1': { titleEn: 'Score + 10',               descriptionEn: 'Increase p1 player\'s score by 10.' },
  'task-7-4-2': { titleEn: 'hp - 20',                  descriptionEn: 'Decrease player hp by 20 (min 0).' },
  'task-7-4-3': { titleEn: 'Position update',          descriptionEn: 'Update player x, y position.' },
  'task-7-4-4': { titleEn: 'Reset all hp',             descriptionEn: 'Set all players\' hp to 100.' },
  'task-7-4-5': { titleEn: 'Low hp boost',             descriptionEn: 'Add +20 hp to players with hp less than 50.' },

  'task-7-5-1': { titleEn: 'Delete player',            descriptionEn: 'Delete a player by name.' },
  'task-7-5-2': { titleEn: 'Delete hp <= 0',           descriptionEn: 'Delete players with hp at or below 0.' },
  'task-7-5-3': { titleEn: 'Delete score < 10',        descriptionEn: 'Delete players with score less than 10.' },
  'task-7-5-4': { titleEn: 'Delete all',               descriptionEn: 'Delete all players.' },
  'task-7-5-5': { titleEn: 'Delete bottom players',    descriptionEn: 'Delete the lowest scoring players up to a limit.' },

  'task-7-6-1': { titleEn: 'GET /players',             descriptionEn: 'getAllPlayers(players) returns all players.' },
  'task-7-6-2': { titleEn: 'POST /player',             descriptionEn: 'createPlayer(players, name) adds a new player.' },
  'task-7-6-3': { titleEn: 'PUT /move',                descriptionEn: 'movePlayer(players, name, x, y) updates position and returns {ok:true}.' },
  'task-7-6-4': { titleEn: 'GET /leaderboard',         descriptionEn: 'leaderboard(players) returns top 5 players by score descending.' },
  'task-7-6-5': { titleEn: 'DELETE /player/:name',     descriptionEn: 'deletePlayer(players, name) removes player and returns {ok:true}.' },

  'task-7-7-1': { titleEn: 'POST /join',               descriptionEn: 'joinGame(players, name) adds player and returns {joined:true}.' },
  'task-7-7-2': { titleEn: 'POST /move',               descriptionEn: 'moveInGame(players, name, x, y) updates position and returns {moved:true}.' },
  'task-7-7-3': { titleEn: 'GET /state',               descriptionEn: 'getGameState(players) returns name, x, y for each player.' },
  'task-7-7-4': { titleEn: 'POST /leave',              descriptionEn: 'leaveGame(players, name) removes player and returns {left:true}.' },
  'task-7-7-5': { titleEn: 'FULL MULTIPLAYER ENGINE',  descriptionEn: 'multiGame(players, event) handles all: join/move/leave/count.' },

  // ── Lesson 8: Deployment / Git ──────────────────────────────────
  'task-8-1-1': { titleEn: 'Build command',            descriptionEn: 'buildCmd() returns the npm build command.' },
  'task-8-1-2': { titleEn: 'Static middleware',        descriptionEn: 'staticCode(folder) returns the express.static code.' },
  'task-8-1-3': { titleEn: 'index.html route',         descriptionEn: 'indexRoute(dir) returns the sendFile code.' },
  'task-8-1-4': { titleEn: 'Require path',             descriptionEn: 'requirePath() returns the path require code.' },
  'task-8-1-5': { titleEn: 'path.join',                descriptionEn: 'joinPath(parts) returns path.join(...parts) code.' },

  'task-8-2-1': { titleEn: 'Env port',                 descriptionEn: 'envPort(fallback) returns process.env.PORT || fallback.' },
  'task-8-2-2': { titleEn: 'Dotenv config',            descriptionEn: 'dotenvCode() returns the dotenv config code.' },
  'task-8-2-3': { titleEn: '.env file content',        descriptionEn: 'envFile(port) returns .env file content.' },
  'task-8-2-4': { titleEn: 'Listen with env',          descriptionEn: 'listenEnv() returns process.env.PORT listen code.' },
  'task-8-2-5': { titleEn: 'Log port',                 descriptionEn: 'logPort(port) returns "Running on " + port.' },

  'task-8-3-1': { titleEn: 'package.json start script', descriptionEn: 'startScript() returns the start script object.' },
  'task-8-3-2': { titleEn: 'git init',                 descriptionEn: 'gitInit() returns "git init".' },
  'task-8-3-3': { titleEn: 'git commit',               descriptionEn: 'gitCommit(msg) returns the git commit command.' },
  'task-8-3-4': { titleEn: 'git remote add',           descriptionEn: 'gitRemote(url) returns the git remote add command.' },
  'task-8-3-5': { titleEn: 'git push',                 descriptionEn: 'gitPush(branch) returns the git push command.' },

  'task-8-4-1': { titleEn: 'Fetch live API',           descriptionEn: 'fetchUrl(base, path) returns the full URL.' },
  'task-8-4-2': { titleEn: 'POST live fetch',          descriptionEn: 'postLive(url, data) returns POST fetch options object.' },
  'task-8-4-3': { titleEn: 'GET leaderboard',          descriptionEn: 'leaderboardFetch(path) returns fetch + json parse code.' },
  'task-8-4-4': { titleEn: 'Error handle',             descriptionEn: 'fetchWithCatch(url) returns fetch + catch code.' },
  'task-8-4-5': { titleEn: 'Async/await fetch',        descriptionEn: 'asyncFetch(url) returns async/await code.' },

  'task-8-5-1': { titleEn: 'Task fetch result',        descriptionEn: 'taskFetchResult(taskObj) returns task string.' },
  'task-8-5-2': { titleEn: 'Submit answer',            descriptionEn: 'submitAnswer(answer) returns POST body object.' },
  'task-8-5-3': { titleEn: 'Update UI from server',    descriptionEn: 'updateFromServer(playerData, state) updates hp, score state.' },
  'task-8-5-4': { titleEn: 'Sync enemies',             descriptionEn: 'syncEnemies(enemyData) converts to enemies state.' },
  'task-8-5-5': { titleEn: 'Auto refresh state',       descriptionEn: 'autoRefresh(player, interval) returns refresh config object.' },

  'task-8-6-1': { titleEn: 'Join game request',        descriptionEn: 'joinRequest(name) returns POST /join body object.' },
  'task-8-6-2': { titleEn: 'Move request',             descriptionEn: 'moveRequest(name, x, y) returns POST /move body object.' },
  'task-8-6-3': { titleEn: 'Get state',                descriptionEn: 'parseState(stateData) returns player name, x, y array.' },
  'task-8-6-4': { titleEn: 'Leave request',            descriptionEn: 'leaveRequest(name) returns POST /leave body object.' },
  'task-8-6-5': { titleEn: 'Render players',           descriptionEn: 'renderPlayers(state) returns display array.' },

  'task-8-7-1': { titleEn: 'Correct → kill enemy',     descriptionEn: 'onCorrect(state) removes enemies[0] and adds score+10.' },
  'task-8-7-2': { titleEn: 'Wrong → damage',           descriptionEn: 'onWrong(state) decreases hp by 20.' },
  'task-8-7-3': { titleEn: 'Auto game loop tick',      descriptionEn: 'autoTick(state) runs one frame: hp-1, enemies attack.' },
  'task-8-7-4': { titleEn: 'Win condition',            descriptionEn: 'checkWin(score, target) returns true if score >= target.' },
  'task-8-7-5': { titleEn: 'FULL FINAL GAME',          descriptionEn: 'finalGame(state, event) handles complete fullstack game logic.' },
}

async function main() {
  const ids = Object.keys(translations)
  console.log(`Updating ${ids.length} tasks...`)
  let ok = 0, skip = 0
  for (const id of ids) {
    const { titleEn, descriptionEn } = translations[id]
    try {
      await p.task.update({ where: { id }, data: { titleEn, descriptionEn } })
      ok++
    } catch {
      skip++
    }
  }
  console.log(`Done: ${ok} updated, ${skip} skipped (not found)`)
  await p.$disconnect()
}

main()