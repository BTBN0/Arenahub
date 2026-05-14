/**
 * Seed: HTML – GAME WORLD FOUNDATION (Course 1)
 * Run: npx tsx prisma/seed-html-course.ts
 *
 * Creates/upserts Course 1 with 7 lessons × 5 tasks.
 * Each task has: description, starterCode, testCases (HtmlRule[]).
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Starter code templates ─────────────────────────────────────────
const BASE_HTML = `<!DOCTYPE html>
<html>
  <head>
    <title></title>
  </head>
  <body>

  </body>
</html>`

const BASE_WITH_H1 = `<!DOCTYPE html>
<html>
  <head>
    <title>Game World</title>
  </head>
  <body>
    <h1></h1>
  </body>
</html>`

const BASE_FULL = `<!DOCTYPE html>
<html>
  <head>
    <title>Game World</title>
  </head>
  <body>
    <h1>GAME WORLD</h1>
    <p></p>
  </body>
</html>`

const BASE_IMG = `<!DOCTYPE html>
<html>
  <head><title>Game World</title></head>
  <body>
    <img src="" alt="">
  </body>
</html>`

const BASE_DIV = `<!DOCTYPE html>
<html>
  <head><title>Game World</title></head>
  <body>
    <div>
      <p>Welcome <span></span></p>
    </div>
  </body>
</html>`

const BASE_BTN = `<!DOCTYPE html>
<html>
  <head><title>Game World</title></head>
  <body>
    <div>
      <input type="text">
      <button></button>
    </div>
  </body>
</html>`

const BASE_GAME_UI = `<!DOCTYPE html>
<html>
  <head><title>Game World</title></head>
  <body>
    <div id="game">
      <div id="hp">HP: 100</div>
      <div id="score">Score: 0</div>
    </div>
  </body>
</html>`

const BASE_LINKS = `<!DOCTYPE html>
<html>
  <head><title>Game World</title></head>
  <body>
    <nav>
      <a href="home.html">Home</a>
    </nav>
  </body>
</html>`

const BASE_FORM = `<!DOCTYPE html>
<html>
  <head><title>Game World</title></head>
  <body>
    <form>
      <label for="playerName">Player Name:</label>
      <input type="text" name="playerName" id="playerName">
      <button type="submit">START GAME</button>
    </form>
  </body>
</html>`

// ── Lesson data ────────────────────────────────────────────────────
const LESSONS = [
  // ── LESSON 1 ──────────────────────────────────────────────────
  {
    title: 'Basic HTML Structure',
    content: 'HTML документийн үндсэн бүтцийг сур.',
    xpReward: 50,
    orderIndex: 0,
    tasks: [
      {
        title: 'HTML Skeleton Creation',
        description: `HTML баримтын үндсэн бүтцийг үүсгэ.

Дараах tag-уудыг бүгдийг нэм:
• <!DOCTYPE html>
• <html>
• <head>
• <body>

Зөвлөгөө: DOCTYPE нь HTML5 баримт гэдгийг browser-д мэдэгддэг.`,
        starterCode: `<!DOCTYPE html>`,
        testCases: [
          { type: 'hasDoctype', hint: '<!DOCTYPE html> байх ёстой' },
          { type: 'hasTag', tag: 'html', hint: '<html> tag нэмнэ үү' },
          { type: 'hasTag', tag: 'head', hint: '<head> tag нэмнэ үү' },
          { type: 'hasTag', tag: 'body', hint: '<body> tag нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Head Section Setup',
        description: `<head> tag доторх контентыг тохируул.

Дараахыг нэм:
• <title> tag
• title-ийн текст нь "Game World" байх ёстой

Зөвлөгөө: <title> нь browser tab дээр харагдах нэрийг тодорхойлно.`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasTag', tag: 'title', hint: '<title> tag нэмнэ үү' },
          { type: 'tagText', tag: 'title', text: 'Game World', hint: 'title текстийг "Game World" болго' },
        ],
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Page Heading',
        description: `<body> доторх гарчиг нэм.

Дараахыг нэм:
• <h1> tag
• h1 текст нь "GAME WORLD" байх ёстой

Зөвлөгөө: <h1> нь хамгийн том гарчгийн tag. Нэг хуудсанд ганц л <h1> байна.`,
        starterCode: BASE_WITH_H1,
        testCases: [
          { type: 'hasTag', tag: 'h1', hint: '<h1> tag нэмнэ үү' },
          { type: 'tagText', tag: 'h1', text: 'GAME WORLD', hint: 'h1 текстийг "GAME WORLD" болго' },
        ],
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Paragraph Content',
        description: `Тайлбар текст нэм.

Дараахыг нэм:
• <p> tag
• "welcome" гэсэн үг агуулсан текст

Жишээ: "Welcome to Game World!"

Зөвлөгөө: <p> нь paragraph буюу догол мөрийн tag.`,
        starterCode: BASE_WITH_H1,
        testCases: [
          { type: 'hasTag', tag: 'p', hint: '<p> tag нэмнэ үү' },
          { type: 'tagContains', tag: 'p', text: 'welcome', hint: '<p> дотор "welcome" гэсэн үг байх ёстой' },
        ],
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Validate Full Structure',
        description: `Бүх элементийг нэгтгэж дуусгаарай.

Бүтэн HTML файл дараахыг агуулах ёстой:
• <!DOCTYPE html>
• <html>, <head>, <body>
• <title>Game World</title>
• <h1>GAME WORLD</h1>
• <p> агуулсан welcome текст

Энэ нь миний анхны HTML хуудас!`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasDoctype', hint: '<!DOCTYPE html> байх ёстой' },
          { type: 'hasTag', tag: 'html', hint: '<html> tag байх ёстой' },
          { type: 'hasTag', tag: 'head', hint: '<head> tag байх ёстой' },
          { type: 'hasTag', tag: 'body', hint: '<body> tag байх ёстой' },
          { type: 'tagText', tag: 'title', text: 'Game World', hint: '<title>Game World</title> байх ёстой' },
          { type: 'hasTag', tag: 'h1', hint: '<h1> tag байх ёстой' },
          { type: 'tagContains', tag: 'p', text: 'welcome', hint: '<p> дотор welcome текст байх ёстой' },
        ],
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 2 ──────────────────────────────────────────────────
  {
    title: 'Images + Elements',
    content: 'Зураг болон inline элементүүдийг HTML-д ашиглах.',
    xpReward: 50,
    orderIndex: 1,
    tasks: [
      {
        title: 'Add Image',
        description: `Хуудсандаа зураг нэм.

Дараахыг нэм:
• <img> tag
• src attribute (зургийн хаяг)

Жишээ: <img src="hero.png">

Зөвлөгөө: <img> нь self-closing tag — closing tag шаардлагагүй.`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasTag', tag: 'img', hint: '<img> tag нэмнэ үү' },
          { type: 'hasAttr', tag: 'img', attr: 'src', hint: 'img-д src attribute нэм' },
        ],
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Add Alt Text',
        description: `Зурагт тайлбар текст нэм.

Дараахыг нэм:
• alt attribute
• Зургийг тодорхойлох текст

Жишээ: <img src="hero.png" alt="Game hero character">

Зөвлөгөө: alt текст нь accessibility-д зайлшгүй чухал!`,
        starterCode: BASE_IMG,
        testCases: [
          { type: 'hasTag', tag: 'img', hint: '<img> tag байх ёстой' },
          { type: 'hasAttr', tag: 'img', attr: 'src', hint: 'img-д src attribute байх ёстой' },
          { type: 'hasAttr', tag: 'img', attr: 'alt', hint: 'img-д alt attribute нэм' },
        ],
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Create Container',
        description: `Элементүүдийг бүлэглэх container үүсгэ.

Дараахыг нэм:
• <div> tag
• Div доторх контент

Жишээ: <div><p>Контент</p></div>

Зөвлөгөө: <div> нь хамгийн түгээмэл container элемент.`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasTag', tag: 'div', hint: '<div> tag нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Inline Text',
        description: `Мөрийн дотор inline элемент ашигла.

Дараахыг нэм:
• <p> tag
• <p> доторх <span> tag

Жишээ: <p>Player: <span>Hero</span></p>

Зөвлөгөө: <span> нь inline элемент — шинэ мөр үүсгэхгүй.`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasTag', tag: 'p', hint: '<p> tag нэмнэ үү' },
          { type: 'hasTag', tag: 'span', hint: '<span> tag нэмнэ үү' },
          { type: 'hasChild', parent: 'p', child: 'span', hint: '<p> доторх <span> байх ёстой' },
        ],
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Layout Combine',
        description: `Зураг болон текстийг нэг контейнерт нэгтгэ.

Дараахыг нэм:
• <div> container
• Div доторх <img>
• Div доторх <p> текст

Тэд хамт нэг <div> дотор байх ёстой.`,
        starterCode: BASE_DIV,
        testCases: [
          { type: 'hasTag', tag: 'div', hint: '<div> container нэмнэ үү' },
          { type: 'hasTag', tag: 'img', hint: '<img> tag нэмнэ үү' },
          { type: 'hasChild', parent: 'div', child: 'img', hint: 'div доторх img байх ёстой' },
          { type: 'hasChild', parent: 'div', child: 'p', hint: 'div доторх p байх ёстой' },
        ],
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 3 ──────────────────────────────────────────────────
  {
    title: 'Button + Input',
    content: 'Товч болон input элементүүдийг HTML-д хэрэглэ.',
    xpReward: 50,
    orderIndex: 2,
    tasks: [
      {
        title: 'Create Button',
        description: `Хуудсандаа товч нэм.

Дараахыг нэм:
• <button> tag
• Товчны текст

Жишээ: <button>Click me</button>

Зөвлөгөө: button-г дарахад JavaScript ажиллуулж болно.`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasTag', tag: 'button', hint: '<button> tag нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Create Input',
        description: `Текст оруулах input нэм.

Дараахыг нэм:
• <input> tag
• type="text"

Жишээ: <input type="text">

Зөвлөгөө: input нь self-closing tag — хэрэглэгчийн мэдээлэл авна.`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasInput', inputType: 'text', hint: 'type="text" input нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Combine Input + Button',
        description: `Input болон button-г нэгтгэ.

Дараахыг нэм:
• <input type="text">
• <button> tag
• Хоёулаа нэг <div> доторх байх ёстой

Энэ нь жижиг form UI үүсгэнэ.`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasInput', inputType: 'text', hint: '<input type="text"> нэмнэ үү' },
          { type: 'hasTag', tag: 'button', hint: '<button> tag нэмнэ үү' },
          { type: 'hasChild', parent: 'div', child: 'button', hint: 'button нь div доторх байх ёстой' },
        ],
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Button Text',
        description: `Товчны текстийг тохируул.

Дараахыг хийгээрэй:
• button tag
• button-ийн текст нь "START GAME" байх ёстой

Гарчгийн үсгийг яг таг нийцүүлнэ үү!`,
        starterCode: BASE_BTN,
        testCases: [
          { type: 'hasTag', tag: 'button', hint: '<button> tag байх ёстой' },
          { type: 'tagText', tag: 'button', text: 'START GAME', hint: 'button текстийг "START GAME" болго' },
        ],
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Simulate Interaction',
        description: `Click event-т бэлэн бүтэц үүсгэ.

Дараахыг нэм:
• <div> container
• Доторх <input type="text">
• Доторх <button>START GAME</button>

Энэ бүтэц нь дараа JavaScript event handler-т бэлэн байна.`,
        starterCode: BASE_BTN,
        testCases: [
          { type: 'hasTag', tag: 'div', hint: '<div> container нэмнэ үү' },
          { type: 'hasInput', inputType: 'text', hint: '<input type="text"> нэмнэ үү' },
          { type: 'tagText', tag: 'button', text: 'START GAME', hint: 'button текст "START GAME" байх ёстой' },
          { type: 'hasChild', parent: 'div', child: 'input', hint: 'input нь div доторх байх ёстой' },
          { type: 'hasChild', parent: 'div', child: 'button', hint: 'button нь div доторх байх ёстой' },
        ],
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 4 ──────────────────────────────────────────────────
  {
    title: 'Game UI Structure',
    content: 'Тоглоомын UI-ийн HTML бүтцийг үүсгэ.',
    xpReward: 50,
    orderIndex: 3,
    tasks: [
      {
        title: 'Game Container',
        description: `Тоглоомын үндсэн container үүсгэ.

Дараахыг нэм:
• <div> tag
• id="game" attribute

Жишээ: <div id="game"></div>

Зөвлөгөө: id нь JavaScript-ийн getElementById()-аар хандах боломж олгоно.`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasId', id: 'game', hint: 'id="game" olan div нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'HP Bar',
        description: `HP (Health Points) тоолуур нэм.

Дараахыг нэм:
• <div id="game"> container
• Дотор нь <div id="hp">

Жишээ:
<div id="game">
  <div id="hp">HP: 100</div>
</div>`,
        starterCode: BASE_GAME_UI,
        testCases: [
          { type: 'hasId', id: 'game', hint: 'id="game" div байх ёстой' },
          { type: 'hasId', id: 'hp', hint: 'id="hp" div нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Score System',
        description: `Оноо тоолуур нэм.

Дараахыг нэм:
• <div id="score"> inside #game

Жишээ:
<div id="game">
  <div id="hp">HP: 100</div>
  <div id="score">Score: 0</div>
</div>`,
        starterCode: BASE_GAME_UI,
        testCases: [
          { type: 'hasId', id: 'game', hint: 'id="game" div байх ёстой' },
          { type: 'hasId', id: 'score', hint: 'id="score" div нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'UI Top Bar',
        description: `HP болон Score-г нэгтгэж дэлгэцийн дээр харуул.

Дараахыг нэмнэ:
• id="game" container
• Дотор нь id="hp"
• Дотор нь id="score"
• style="display:flex" нэм

Жишээ:
<div id="game" style="display:flex">
  <div id="hp">HP: 100</div>
  <div id="score">Score: 0</div>
</div>`,
        starterCode: BASE_GAME_UI,
        testCases: [
          { type: 'hasId', id: 'game', hint: 'id="game" div байх ёстой' },
          { type: 'hasId', id: 'hp', hint: 'id="hp" div байх ёстой' },
          { type: 'hasId', id: 'score', hint: 'id="score" div байх ёстой' },
          { type: 'hasAttr', tag: 'div', attr: 'style', hint: 'div-д style attribute нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Center Layout',
        description: `Game container-ийг дэлгэцийн голд байрлуул.

Дараахыг нэм:
• id="game" div-д style="display:flex"
• justify-content:center нэм
• HP + Score хамт байна

Бүтэн style: style="display:flex; justify-content:center"`,
        starterCode: BASE_GAME_UI,
        testCases: [
          { type: 'hasId', id: 'game', hint: 'id="game" div байх ёстой' },
          { type: 'hasId', id: 'hp', hint: 'id="hp" байх ёстой' },
          { type: 'hasId', id: 'score', hint: 'id="score" байх ёстой' },
        ],
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 5 ──────────────────────────────────────────────────
  {
    title: 'Links + Navigation',
    content: 'Холбоос болон навигацийн системийг HTML-д хийж сур.',
    xpReward: 50,
    orderIndex: 4,
    tasks: [
      {
        title: 'Create Link',
        description: `Анхны холбоосоо үүсгэ.

Дараахыг нэм:
• <a> tag
• href attribute

Жишээ: <a href="home.html">Home</a>

Зөвлөгөө: href нь hyperlink reference — очих хаягаа зааж өгнө.`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasTag', tag: 'a', hint: '<a> tag нэмнэ үү' },
          { type: 'hasAttr', tag: 'a', attr: 'href', hint: 'a-д href attribute нэм' },
        ],
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Home Navigation',
        description: `Нүүр хуудас руу холбоос нэм.

Дараахыг нэм:
• <a href="home.html"> tag
• Холбоосын текст

href утга нь яг "home.html" байх ёстой.`,
        starterCode: BASE_LINKS,
        testCases: [
          { type: 'hasAttrValue', tag: 'a', attr: 'href', value: 'home.html', hint: 'href="home.html" link нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Game Navigation',
        description: `Тоглоомын хуудас руу холбоос нэм.

Одоо байгаа home.html холбоосоос гадна:
• game.html рүү холбоос нэм

Хоёр өөр <a> tag байх ёстой.`,
        starterCode: BASE_LINKS,
        testCases: [
          { type: 'hasTag', tag: 'a', hint: 'хоёр <a> tag нэмнэ үү' },
          { type: 'hasAttrValue', tag: 'a', attr: 'href', value: 'home.html', hint: 'href="home.html" link байх ёстой' },
        ],
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Menu System',
        description: `Олон холбоос агуулсан nav menu үүсгэ.

Дараахыг нэм:
• <nav> tag
• Nav доторх <a> холбоосууд (дор хаяж 2)

Жишээ:
<nav>
  <a href="home.html">Home</a>
  <a href="game.html">Game</a>
</nav>`,
        starterCode: BASE_LINKS,
        testCases: [
          { type: 'hasTag', tag: 'nav', hint: '<nav> tag нэмнэ үү' },
          { type: 'hasChild', parent: 'nav', child: 'a', hint: 'nav доторх <a> байх ёстой' },
        ],
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Active State',
        description: `Одоогийн хуудсыг тэмдэглэ.

Дараахыг нэм:
• Нэг <a> tag-д class="active" нэм

Жишээ: <a href="home.html" class="active">Home</a>

Зөвлөгөө: CSS-ийн .active класс идэвхтэй хуудсыг ялгаж харуулна.`,
        starterCode: BASE_LINKS,
        testCases: [
          { type: 'hasClass', cls: 'active', hint: 'class="active" olan element нэмнэ үү' },
          { type: 'hasTag', tag: 'nav', hint: '<nav> tag нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 6 ──────────────────────────────────────────────────
  {
    title: 'Forms – Player Name',
    content: 'HTML form болон input элементүүдийг ашиглаж хэрэглэгчийн мэдээлэл авах.',
    xpReward: 50,
    orderIndex: 5,
    tasks: [
      {
        title: 'Create Form',
        description: `Анхны form үүсгэ.

Дараахыг нэм:
• <form> tag

Жишээ:
<form>
  <!-- input-ууд энд орно -->
</form>

Зөвлөгөө: <form> нь хэрэглэгчийн мэдээлэл цуглуулах эх бүтэц.`,
        starterCode: BASE_HTML,
        testCases: [
          { type: 'hasTag', tag: 'form', hint: '<form> tag нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Player Input',
        description: `Тоглогчийн нэрний input нэм.

Дараахыг нэм:
• <input> tag
• name="playerName" attribute

Жишээ: <input type="text" name="playerName">

name attribute нь серверт мэдээлэл явуулахад ашиглагдана.`,
        starterCode: BASE_FORM,
        testCases: [
          { type: 'hasTag', tag: 'form', hint: '<form> tag байх ёстой' },
          { type: 'hasAttrValue', tag: 'input', attr: 'name', value: 'playerName', hint: 'name="playerName" olan input нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Submit Button',
        description: `Form-г илгээх товч нэм.

Дараахыг нэм:
• <button type="submit"> эсвэл <input type="submit">

Жишээ: <button type="submit">START GAME</button>

Submit button-г дарахад form-ийн мэдээлэл серверт явна.`,
        starterCode: BASE_FORM,
        testCases: [
          { type: 'hasTag', tag: 'form', hint: '<form> tag байх ёстой' },
          { type: 'hasInput', inputType: 'submit', hint: 'type="submit" input эсвэл button нэмнэ үү' },
        ],
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Label System',
        description: `Input-д label нэм.

Дараахыг нэм:
• <label> tag
• for attribute (input-ийн id-тай нийцэх)

Жишээ:
<label for="playerName">Player Name:</label>
<input id="playerName" name="playerName" type="text">`,
        starterCode: BASE_FORM,
        testCases: [
          { type: 'hasTag', tag: 'label', hint: '<label> tag нэмнэ үү' },
          { type: 'hasAttr', tag: 'label', attr: 'for', hint: 'label-д for attribute нэм' },
        ],
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Form Structure Validation',
        description: `Бүрэн form бүтцийг шалгаарай.

Дараах бүгд байх ёстой:
• <form> tag
• <label for="playerName">
• <input name="playerName" type="text">
• <button type="submit"> эсвэл submit input

Энэ бол player нэрийг авах бүрэн form!`,
        starterCode: BASE_FORM,
        testCases: [
          { type: 'hasTag', tag: 'form', hint: '<form> tag байх ёстой' },
          { type: 'hasTag', tag: 'label', hint: '<label> tag байх ёстой' },
          { type: 'hasAttrValue', tag: 'input', attr: 'name', value: 'playerName', hint: 'name="playerName" olan input байх ёстой' },
          { type: 'hasInput', inputType: 'submit', hint: 'type="submit" input байх ёстой' },
        ],
        xpReward: 10, orderIndex: 4,
      },
    ],
  },

  // ── LESSON 7 ──────────────────────────────────────────────────
  {
    title: 'Full Game Page',
    content: 'Өмнөх бүх хичээлийг нэгтгэж бүрэн тоглоомын хуудас үүсгэ.',
    xpReward: 100,
    orderIndex: 6,
    tasks: [
      {
        title: 'Full HTML Structure',
        description: `Бүрэн HTML бүтцийг үүсгэ.

Дараах бүгд байх ёстой:
• <!DOCTYPE html>
• <html>, <head>, <body>
• <title>Game World</title>
• <h1> гарчиг
• <p> тайлбар

Энэ бол тоглоомын ерөнхий layout.`,
        starterCode: BASE_FULL,
        testCases: [
          { type: 'hasDoctype', hint: '<!DOCTYPE html> байх ёстой' },
          { type: 'hasTag', tag: 'html', hint: '<html> tag байх ёстой' },
          { type: 'hasTag', tag: 'head', hint: '<head> tag байх ёстой' },
          { type: 'hasTag', tag: 'body', hint: '<body> tag байх ёстой' },
          { type: 'hasTag', tag: 'title', hint: '<title> tag байх ёстой' },
          { type: 'hasTag', tag: 'h1', hint: '<h1> гарчиг байх ёстой' },
        ],
        xpReward: 10, orderIndex: 0,
      },
      {
        title: 'Game UI Elements',
        description: `Game UI элементүүдийг нэм.

Дараахыг нэм:
• id="game" container
• Дотор нь id="hp" — HP тоолуур
• Дотор нь id="score" — Оноо

Жишээ:
<div id="game">
  <div id="hp">HP: 100</div>
  <div id="score">Score: 0</div>
</div>`,
        starterCode: BASE_GAME_UI,
        testCases: [
          { type: 'hasId', id: 'game', hint: 'id="game" div байх ёстой' },
          { type: 'hasId', id: 'hp', hint: 'id="hp" div байх ёстой' },
          { type: 'hasId', id: 'score', hint: 'id="score" div байх ёстой' },
        ],
        xpReward: 10, orderIndex: 1,
      },
      {
        title: 'Layout System',
        description: `Game layout-г тохируул.

Дараахыг хийгээрэй:
• #game div-д flex layout нэм: style="display:flex"
• HP болон Score хажуулж байрла

Жишээ:
<div id="game" style="display:flex; gap:20px">`,
        starterCode: BASE_GAME_UI,
        testCases: [
          { type: 'hasId', id: 'game', hint: 'id="game" div байх ёстой' },
          { type: 'hasAttr', tag: 'div', attr: 'style', hint: 'div-д style attribute нэм' },
          { type: 'hasId', id: 'hp', hint: 'id="hp" байх ёстой' },
          { type: 'hasId', id: 'score', hint: 'id="score" байх ёстой' },
        ],
        xpReward: 10, orderIndex: 2,
      },
      {
        title: 'Navigation + UI',
        description: `Navigation menu болон game UI-г нэгтгэ.

Дараахыг нэм:
• <nav> navigation menu
• <a> холбоосууд
• id="game" game container

Хуудас нь nav дээр, game UI дор байрлана.`,
        starterCode: BASE_GAME_UI,
        testCases: [
          { type: 'hasTag', tag: 'nav', hint: '<nav> tag нэмнэ үү' },
          { type: 'hasChild', parent: 'nav', child: 'a', hint: 'nav доторх <a> link байх ёстой' },
          { type: 'hasId', id: 'game', hint: 'id="game" div байх ёстой' },
        ],
        xpReward: 10, orderIndex: 3,
      },
      {
        title: 'Final Validation',
        description: `Бүрэн тоглоомын хуудсыг дуусга!

Дараах бүгд байх ёстой:
• <!DOCTYPE html>, html, head, body
• title + h1
• nav + холбоосууд
• id="game" + id="hp" + id="score"
• form + input + button

Энэ бол чиний анхны бүрэн HTML тоглоомын хуудас!`,
        starterCode: `<!DOCTYPE html>
<html>
  <head>
    <title>Game World</title>
  </head>
  <body>
    <nav>
      <a href="home.html">Home</a>
      <a href="game.html">Game</a>
    </nav>
    <h1>GAME WORLD</h1>
    <div id="game" style="display:flex; gap:16px">
      <div id="hp">HP: 100</div>
      <div id="score">Score: 0</div>
    </div>
    <form>
      <label for="playerName">Player Name:</label>
      <input type="text" name="playerName" id="playerName">
      <button type="submit">START GAME</button>
    </form>
  </body>
</html>`,
        testCases: [
          { type: 'hasDoctype', hint: '<!DOCTYPE html> байх ёстой' },
          { type: 'hasTag', tag: 'nav', hint: '<nav> navigation байх ёстой' },
          { type: 'hasId', id: 'game', hint: 'id="game" байх ёстой' },
          { type: 'hasId', id: 'hp', hint: 'id="hp" байх ёстой' },
          { type: 'hasId', id: 'score', hint: 'id="score" байх ёстой' },
          { type: 'hasTag', tag: 'form', hint: '<form> байх ёстой' },
          { type: 'hasAttrValue', tag: 'input', attr: 'name', value: 'playerName', hint: 'name="playerName" input байх ёстой' },
        ],
        xpReward: 10, orderIndex: 4,
      },
    ],
  },
]

// ── Seed function ──────────────────────────────────────────────────
async function main() {
  console.log('⚡ HTML Course seed эхэлж байна...')

  // Find or create Course 1 (HTML)
  let course = await prisma.course.findFirst({
    where: { category: 'HTML' },
  })

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'HTML – GAME WORLD FOUNDATION',
        description: 'HTML-ийн үндэс: тоглоомын дэлхий байгуул. Элемент, бүтэц, form, navigation зэргийг зааж өгнө.',
        category: 'HTML',
        difficulty: 'BEGINNER',
        xpReward: 450,
        orderIndex: 0,
        isActive: true,
      },
    })
    console.log(`✓ Course үүсгэлээ: ${course.title}`)
  } else {
    console.log(`✓ Course олдлоо: ${course.title}`)
  }

  // Create lessons and tasks
  for (const lessonData of LESSONS) {
    const { tasks: taskList, ...lessonFields } = lessonData

    // Upsert lesson by title + courseId
    let lesson = await prisma.lesson.findFirst({
      where: { courseId: course.id, title: lessonFields.title },
    })

    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: { ...lessonFields, courseId: course.id },
      })
      console.log(`  ✓ Lesson үүсгэлээ: ${lesson.title}`)
    } else {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: lessonFields,
      })
      console.log(`  ↺ Lesson шинэчлэлээ: ${lesson.title}`)
    }

    // Create/update tasks
    for (const taskData of taskList) {
      let task = await prisma.task.findFirst({
        where: { lessonId: lesson.id, title: taskData.title },
      })

      const taskPayload = {
        title:       taskData.title,
        description: taskData.description,
        taskType:    'code',
        starterCode: taskData.starterCode,
        testCases:   taskData.testCases as object,
        xpReward:    taskData.xpReward,
        orderIndex:  taskData.orderIndex,
      }

      if (!task) {
        await prisma.task.create({
          data: { ...taskPayload, lessonId: lesson.id },
        })
        console.log(`    ✓ Task: ${taskData.title}`)
      } else {
        await prisma.task.update({
          where: { id: task.id },
          data: taskPayload,
        })
        console.log(`    ↺ Task updated: ${taskData.title}`)
      }
    }
  }

  console.log('\n✅ HTML Course seed амжилттай дууслаа!')
  console.log(`   ${LESSONS.length} lessons, ${LESSONS.reduce((s, l) => s + l.tasks.length, 0)} tasks`)
}

main()
  .catch(e => { console.error('❌ Seed алдаа:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())