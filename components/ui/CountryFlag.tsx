'use client'
import React from 'react'

// viewBox 0 0 30 18  (5:3 standard flag ratio, 30×18 pixel grid)
const FLAGS: Record<string, React.ReactNode> = {

  /* ── МОНГОЛ ──────────────────────────────────────────────────────── */
  'Монгол': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      {/* Left red band */}
      <rect x="0"  y="0" width="10" height="18" fill="#C4272F"/>
      {/* Blue center band */}
      <rect x="10" y="0" width="10" height="18" fill="#015197"/>
      {/* Right red band */}
      <rect x="20" y="0" width="10" height="18" fill="#C4272F"/>

      {/* ══ СОЁМБО (yellow, in left red band, center x=5) ══ */}

      {/* Гал — 3 хэлтэй дөл */}
      <rect x="4"  y="0" width="2" height="1" fill="#F9CF02"/>
      <rect x="2"  y="0" width="1" height="2" fill="#F9CF02"/>
      <rect x="7"  y="0" width="1" height="2" fill="#F9CF02"/>
      <rect x="3"  y="1" width="4" height="1" fill="#F9CF02"/>
      <rect x="2"  y="2" width="6" height="1" fill="#F9CF02"/>

      {/* Нар — дугуй */}
      <rect x="3"  y="3" width="4" height="1" fill="#F9CF02"/>
      <rect x="2"  y="4" width="6" height="1" fill="#F9CF02"/>
      <rect x="3"  y="5" width="4" height="1" fill="#F9CF02"/>

      {/* Сар — хэлийн хагас нуман */}
      <rect x="3"  y="6" width="4" height="1" fill="#F9CF02"/>
      <rect x="2"  y="6" width="2" height="1" fill="#F9CF02"/>

      {/* Дээд 2 зураас + гадагш харсан гурвалжин */}
      <rect x="1"  y="7" width="8" height="1" fill="#F9CF02"/>
      <rect x="0"  y="8" width="1" height="1" fill="#F9CF02"/>
      <rect x="9"  y="8" width="1" height="1" fill="#F9CF02"/>
      <rect x="1"  y="9" width="8" height="1" fill="#F9CF02"/>

      {/* Инь-ян тойрог */}
      <rect x="3"  y="10" width="4" height="1" fill="#F9CF02"/>
      <rect x="2"  y="11" width="6" height="1" fill="#F9CF02"/>
      <rect x="2"  y="12" width="3" height="1" fill="#F9CF02"/>
      <rect x="5"  y="12" width="3" height="1" fill="#C4272F"/>
      <rect x="2"  y="13" width="3" height="1" fill="#C4272F"/>
      <rect x="5"  y="13" width="3" height="1" fill="#F9CF02"/>
      <rect x="2"  y="14" width="6" height="1" fill="#F9CF02"/>
      <rect x="3"  y="15" width="4" height="1" fill="#F9CF02"/>
      {/* Инь-ян цэгүүд */}
      <rect x="3"  y="12" width="1" height="1" fill="#C4272F"/>
      <rect x="6"  y="13" width="1" height="1" fill="#F9CF02"/>

      {/* Доод 2 зураас */}
      <rect x="1"  y="16" width="8" height="1" fill="#F9CF02"/>

      {/* Суурь */}
      <rect x="1"  y="17" width="8" height="1" fill="#F9CF02"/>
    </svg>
  ),

  /* ── СОЛОНГОС ────────────────────────────────────────────────────── */
  'Солонгос': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0" width="30" height="18" fill="#ffffff"/>
      {/* Taeguk red arc (top-left half of circle) */}
      <rect x="10" y="5"  width="10" height="2" fill="#CD2E3A"/>
      <rect x="9"  y="6"  width="6"  height="2" fill="#CD2E3A"/>
      <rect x="9"  y="7"  width="12" height="1" fill="#CD2E3A"/>
      <rect x="10" y="8"  width="10" height="1" fill="#CD2E3A"/>
      {/* Taeguk blue arc (bottom-right half) */}
      <rect x="10" y="9"  width="10" height="1" fill="#003478"/>
      <rect x="11" y="10" width="9"  height="1" fill="#003478"/>
      <rect x="11" y="11" width="9"  height="2" fill="#003478"/>
      <rect x="10" y="13" width="10" height="2" fill="#003478"/>
      {/* Small circles in taeguk */}
      <rect x="12" y="7"  width="2" height="2" fill="#003478"/>
      <rect x="16" y="11" width="2" height="2" fill="#CD2E3A"/>
      {/* Trigrams top-left (three dashes) */}
      <rect x="3" y="3"  width="4" height="1" fill="#000"/>
      <rect x="3" y="5"  width="1" height="1" fill="#000"/>
      <rect x="5" y="5"  width="2" height="1" fill="#000"/>
      <rect x="3" y="7"  width="4" height="1" fill="#000"/>
      {/* Trigrams bottom-right */}
      <rect x="23" y="10" width="4" height="1" fill="#000"/>
      <rect x="23" y="12" width="4" height="1" fill="#000"/>
      <rect x="23" y="14" width="4" height="1" fill="#000"/>
      {/* Trigrams top-right */}
      <rect x="23" y="3"  width="4" height="1" fill="#000"/>
      <rect x="23" y="5"  width="1" height="1" fill="#000"/>
      <rect x="25" y="5"  width="2" height="1" fill="#000"/>
      <rect x="23" y="7"  width="4" height="1" fill="#000"/>
      {/* Trigrams bottom-left */}
      <rect x="3" y="10" width="4" height="1" fill="#000"/>
      <rect x="3" y="12" width="1" height="1" fill="#000"/>
      <rect x="5" y="12" width="2" height="1" fill="#000"/>
      <rect x="3" y="14" width="4" height="1" fill="#000"/>
    </svg>
  ),

  /* ── ЯПОН ─────────────────────────────────────────────────────────── */
  'Япон': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0" width="30" height="18" fill="#ffffff"/>
      {/* Red sun disc */}
      <rect x="11" y="3"  width="8"  height="1" fill="#BC002D"/>
      <rect x="9"  y="4"  width="12" height="1" fill="#BC002D"/>
      <rect x="8"  y="5"  width="14" height="8" fill="#BC002D"/>
      <rect x="9"  y="13" width="12" height="1" fill="#BC002D"/>
      <rect x="11" y="14" width="8"  height="1" fill="#BC002D"/>
    </svg>
  ),

  /* ── ХЯТАД ────────────────────────────────────────────────────────── */
  'Хятад': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0" width="30" height="18" fill="#DE2910"/>
      {/* Big 5-point star */}
      <rect x="3"  y="1" width="5" height="1" fill="#FFDE00"/>
      <rect x="2"  y="2" width="7" height="1" fill="#FFDE00"/>
      <rect x="2"  y="3" width="7" height="2" fill="#FFDE00"/>
      <rect x="3"  y="5" width="5" height="1" fill="#FFDE00"/>
      <rect x="4"  y="0" width="3" height="7" fill="#FFDE00"/>
      <rect x="2"  y="3" width="7" height="1" fill="#DE2910"/>
      {/* 4 small stars */}
      <rect x="11" y="1" width="2" height="2" fill="#FFDE00"/>
      <rect x="13" y="4" width="2" height="2" fill="#FFDE00"/>
      <rect x="13" y="8" width="2" height="2" fill="#FFDE00"/>
      <rect x="11" y="11" width="2" height="2" fill="#FFDE00"/>
    </svg>
  ),

  /* ── ОРОС ─────────────────────────────────────────────────────────── */
  'Орос': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0"  width="30" height="6"  fill="#ffffff"/>
      <rect x="0" y="6"  width="30" height="6"  fill="#003DA5"/>
      <rect x="0" y="12" width="30" height="6"  fill="#CC0000"/>
    </svg>
  ),

  /* ── АНУ ──────────────────────────────────────────────────────────── */
  'АНУ': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0"  width="30" height="18" fill="#B22234"/>
      <rect x="0" y="2"  width="30" height="2"  fill="#ffffff"/>
      <rect x="0" y="6"  width="30" height="2"  fill="#ffffff"/>
      <rect x="0" y="10" width="30" height="2"  fill="#ffffff"/>
      <rect x="0" y="14" width="30" height="2"  fill="#ffffff"/>
      {/* Blue canton */}
      <rect x="0" y="0" width="12" height="10" fill="#3C3B6E"/>
      {/* Stars 3×3 grid simplified */}
      <rect x="1"  y="1" width="2" height="1" fill="#fff"/>
      <rect x="5"  y="1" width="2" height="1" fill="#fff"/>
      <rect x="9"  y="1" width="2" height="1" fill="#fff"/>
      <rect x="3"  y="3" width="2" height="1" fill="#fff"/>
      <rect x="7"  y="3" width="2" height="1" fill="#fff"/>
      <rect x="1"  y="5" width="2" height="1" fill="#fff"/>
      <rect x="5"  y="5" width="2" height="1" fill="#fff"/>
      <rect x="9"  y="5" width="2" height="1" fill="#fff"/>
      <rect x="3"  y="7" width="2" height="1" fill="#fff"/>
      <rect x="7"  y="7" width="2" height="1" fill="#fff"/>
    </svg>
  ),

  /* ── ИХ БРИТАНИ ─────────────────────────────────────────────────── */
  'Их Британи': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0" width="30" height="18" fill="#012169"/>
      {/* White diagonal X */}
      <rect x="0"  y="0" width="5"  height="3"  fill="#ffffff"/>
      <rect x="5"  y="3" width="4"  height="3"  fill="#ffffff"/>
      <rect x="9"  y="6" width="4"  height="2"  fill="#ffffff"/>
      <rect x="13" y="8" width="4"  height="2"  fill="#ffffff"/>
      <rect x="17" y="10" width="4" height="3"  fill="#ffffff"/>
      <rect x="21" y="13" width="4" height="2"  fill="#ffffff"/>
      <rect x="25" y="15" width="5" height="3"  fill="#ffffff"/>
      <rect x="25" y="0" width="5"  height="3"  fill="#ffffff"/>
      <rect x="21" y="3" width="4"  height="3"  fill="#ffffff"/>
      <rect x="17" y="6" width="4"  height="2"  fill="#ffffff"/>
      <rect x="9"  y="10" width="4" height="3"  fill="#ffffff"/>
      <rect x="5"  y="13" width="4" height="2"  fill="#ffffff"/>
      <rect x="0"  y="15" width="5" height="3"  fill="#ffffff"/>
      {/* White cross */}
      <rect x="0"  y="7" width="30" height="4"  fill="#ffffff"/>
      <rect x="12" y="0" width="6"  height="18" fill="#ffffff"/>
      {/* Red cross */}
      <rect x="0"  y="8" width="30" height="2"  fill="#C8102E"/>
      <rect x="13" y="0" width="4"  height="18" fill="#C8102E"/>
      {/* Red diagonals (St Patrick) */}
      <rect x="0"  y="0" width="3"  height="2"  fill="#C8102E"/>
      <rect x="3"  y="2" width="3"  height="2"  fill="#C8102E"/>
      <rect x="6"  y="4" width="3"  height="2"  fill="#C8102E"/>
      <rect x="21" y="12" width="3" height="2"  fill="#C8102E"/>
      <rect x="24" y="14" width="3" height="2"  fill="#C8102E"/>
      <rect x="27" y="16" width="3" height="2"  fill="#C8102E"/>
      <rect x="27" y="0" width="3"  height="2"  fill="#C8102E"/>
      <rect x="24" y="2" width="3"  height="2"  fill="#C8102E"/>
      <rect x="21" y="4" width="3"  height="2"  fill="#C8102E"/>
      <rect x="6"  y="12" width="3" height="2"  fill="#C8102E"/>
      <rect x="3"  y="14" width="3" height="2"  fill="#C8102E"/>
      <rect x="0"  y="16" width="3" height="2"  fill="#C8102E"/>
    </svg>
  ),

  /* ── ГЕРМАН ───────────────────────────────────────────────────────── */
  'Герман': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0"  width="30" height="6"  fill="#000000"/>
      <rect x="0" y="6"  width="30" height="6"  fill="#DD0000"/>
      <rect x="0" y="12" width="30" height="6"  fill="#FFCE00"/>
    </svg>
  ),

  /* ── ФРАНЦ ────────────────────────────────────────────────────────── */
  'Франц': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0"  y="0" width="10" height="18" fill="#002395"/>
      <rect x="10" y="0" width="10" height="18" fill="#ffffff"/>
      <rect x="20" y="0" width="10" height="18" fill="#ED2939"/>
    </svg>
  ),

  /* ── АВСТРАЛИ ─────────────────────────────────────────────────────── */
  'Австрали': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0" width="30" height="18" fill="#00008B"/>
      {/* Union Jack top-left (simplified) */}
      <rect x="0" y="4"  width="15" height="3" fill="#fff"/>
      <rect x="0" y="5"  width="15" height="1" fill="#C8102E"/>
      <rect x="6" y="0"  width="3"  height="9" fill="#fff"/>
      <rect x="7" y="0"  width="1"  height="9" fill="#C8102E"/>
      {/* Diagonal hints */}
      <rect x="0" y="0" width="4"  height="2" fill="#fff"/>
      <rect x="11" y="7" width="4" height="2" fill="#fff"/>
      <rect x="11" y="0" width="4" height="2" fill="#fff"/>
      <rect x="0"  y="7" width="4" height="2" fill="#fff"/>
      {/* Southern Cross stars */}
      <rect x="20" y="2"  width="2" height="2" fill="#fff"/>
      <rect x="25" y="6"  width="2" height="2" fill="#fff"/>
      <rect x="19" y="10" width="2" height="2" fill="#fff"/>
      <rect x="24" y="13" width="2" height="2" fill="#fff"/>
      <rect x="17" y="5"  width="1" height="1" fill="#fff"/>
      {/* Commonwealth star */}
      <rect x="6"  y="12" width="3" height="3" fill="#fff"/>
    </svg>
  ),

  /* ── КАНАД ────────────────────────────────────────────────────────── */
  'Канад': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0"  y="0" width="7"  height="18" fill="#FF0000"/>
      <rect x="7"  y="0" width="16" height="18" fill="#ffffff"/>
      <rect x="23" y="0" width="7"  height="18" fill="#FF0000"/>
      {/* Maple leaf (centered at x=15, y=9) */}
      <rect x="14" y="2"  width="2" height="2" fill="#FF0000"/>
      <rect x="12" y="4"  width="6" height="1" fill="#FF0000"/>
      <rect x="11" y="5"  width="8" height="1" fill="#FF0000"/>
      <rect x="10" y="6"  width="10" height="2" fill="#FF0000"/>
      <rect x="12" y="8"  width="6" height="1" fill="#FF0000"/>
      <rect x="13" y="9"  width="4" height="1" fill="#FF0000"/>
      {/* leaf notches */}
      <rect x="10" y="6" width="2" height="1" fill="#fff"/>
      <rect x="18" y="6" width="2" height="1" fill="#fff"/>
      <rect x="11" y="7" width="1" height="1" fill="#fff"/>
      <rect x="18" y="7" width="1" height="1" fill="#fff"/>
      {/* Stem */}
      <rect x="14" y="10" width="2" height="5" fill="#FF0000"/>
    </svg>
  ),

  /* ── ЭНЭТХЭГ ─────────────────────────────────────────────────────── */
  'Энэтхэг': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0"  width="30" height="6"  fill="#FF9933"/>
      <rect x="0" y="6"  width="30" height="6"  fill="#ffffff"/>
      <rect x="0" y="12" width="30" height="6"  fill="#138808"/>
      {/* Ashoka Chakra (blue wheel) */}
      <rect x="13" y="7"  width="4" height="1" fill="#000080"/>
      <rect x="13" y="10" width="4" height="1" fill="#000080"/>
      <rect x="12" y="8"  width="1" height="2" fill="#000080"/>
      <rect x="17" y="8"  width="1" height="2" fill="#000080"/>
      <rect x="13" y="8"  width="4" height="2" fill="#000080" opacity="0.2"/>
      <rect x="14" y="8"  width="2" height="2" fill="#ffffff"/>
      {/* Spokes */}
      <rect x="14" y="7"  width="1" height="1" fill="#000080"/>
      <rect x="15" y="7"  width="1" height="1" fill="#000080"/>
      <rect x="14" y="10" width="1" height="1" fill="#000080"/>
      <rect x="15" y="10" width="1" height="1" fill="#000080"/>
      <rect x="12" y="8"  width="1" height="1" fill="#000080"/>
      <rect x="12" y="9"  width="1" height="1" fill="#000080"/>
      <rect x="17" y="8"  width="1" height="1" fill="#000080"/>
      <rect x="17" y="9"  width="1" height="1" fill="#000080"/>
    </svg>
  ),

  /* ── ИНДОНЕЗ ─────────────────────────────────────────────────────── */
  'Индонез': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0" width="30" height="9"  fill="#CE1126"/>
      <rect x="0" y="9" width="30" height="9"  fill="#ffffff"/>
    </svg>
  ),

  /* ── ТАЙЛАНД ─────────────────────────────────────────────────────── */
  'Тайланд': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0"  width="30" height="3"  fill="#A51931"/>
      <rect x="0" y="3"  width="30" height="3"  fill="#F4F5F8"/>
      <rect x="0" y="6"  width="30" height="6"  fill="#2D2A4A"/>
      <rect x="0" y="12" width="30" height="3"  fill="#F4F5F8"/>
      <rect x="0" y="15" width="30" height="3"  fill="#A51931"/>
    </svg>
  ),

  /* ── ВЬЕТНАМ ─────────────────────────────────────────────────────── */
  'Вьетнам': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0" width="30" height="18" fill="#DA251D"/>
      {/* 5-point yellow star */}
      <rect x="13" y="2"  width="4" height="2" fill="#FFFF00"/>
      <rect x="11" y="4"  width="8" height="2" fill="#FFFF00"/>
      <rect x="10" y="6"  width="10" height="3" fill="#FFFF00"/>
      <rect x="11" y="9"  width="3" height="3" fill="#FFFF00"/>
      <rect x="16" y="9"  width="3" height="3" fill="#FFFF00"/>
      <rect x="12" y="12" width="2" height="2" fill="#FFFF00"/>
      <rect x="16" y="12" width="2" height="2" fill="#FFFF00"/>
      {/* Center cutout */}
      <rect x="13" y="7"  width="4" height="1" fill="#DA251D"/>
      <rect x="13" y="4"  width="4" height="1" fill="#DA251D"/>
    </svg>
  ),

  /* ── СИНГАПУР ────────────────────────────────────────────────────── */
  'Сингапур': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0"  width="30" height="9"  fill="#EF3340"/>
      <rect x="0" y="9"  width="30" height="9"  fill="#ffffff"/>
      {/* Crescent moon */}
      <rect x="2"  y="1" width="6" height="7" fill="#ffffff"/>
      <rect x="4"  y="1" width="5" height="7" fill="#EF3340"/>
      {/* 5 stars */}
      <rect x="9"  y="1" width="2" height="2" fill="#ffffff"/>
      <rect x="12" y="2" width="2" height="2" fill="#ffffff"/>
      <rect x="11" y="5" width="2" height="2" fill="#ffffff"/>
      <rect x="8"  y="5" width="2" height="2" fill="#ffffff"/>
      <rect x="7"  y="3" width="2" height="2" fill="#ffffff"/>
    </svg>
  ),

  /* ── МАЛАЙЗ ──────────────────────────────────────────────────────── */
  'Малайз': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      {/* 14 alternating stripes (simplified 7 pairs) */}
      <rect x="0" y="0"  width="30" height="18" fill="#CC0001"/>
      <rect x="0" y="2"  width="30" height="2"  fill="#ffffff"/>
      <rect x="0" y="6"  width="30" height="2"  fill="#ffffff"/>
      <rect x="0" y="10" width="30" height="2"  fill="#ffffff"/>
      <rect x="0" y="14" width="30" height="2"  fill="#ffffff"/>
      {/* Blue canton */}
      <rect x="0" y="0" width="14" height="10" fill="#010066"/>
      {/* Yellow crescent */}
      <rect x="2"  y="2" width="6" height="6" fill="#FFCC00"/>
      <rect x="3"  y="2" width="5" height="6" fill="#010066"/>
      {/* Yellow star */}
      <rect x="8"  y="4" width="3" height="1" fill="#FFCC00"/>
      <rect x="9"  y="3" width="1" height="3" fill="#FFCC00"/>
    </svg>
  ),

  /* ── ФИЛИППИН ────────────────────────────────────────────────────── */
  'Филиппин': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0"  width="30" height="9"  fill="#0038A8"/>
      <rect x="0" y="9"  width="30" height="9"  fill="#CE1126"/>
      {/* White triangle */}
      <polygon points="0,0 0,18 12,9" fill="#ffffff"/>
      {/* Sun */}
      <rect x="4"  y="7" width="4" height="4" fill="#FCD116"/>
      <rect x="3"  y="8" width="6" height="2" fill="#FCD116"/>
      {/* Rays */}
      <rect x="5"  y="5" width="2" height="2" fill="#FCD116"/>
      <rect x="5"  y="11" width="2" height="2" fill="#FCD116"/>
      <rect x="2"  y="8" width="2" height="2" fill="#FCD116"/>
    </svg>
  ),

  /* ── БРАЗИЛ ──────────────────────────────────────────────────────── */
  'Бразил': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0" width="30" height="18" fill="#009C3B"/>
      {/* Yellow diamond */}
      <polygon points="15,1 29,9 15,17 1,9" fill="#FFDF00"/>
      {/* Blue circle */}
      <rect x="10" y="6"  width="10" height="6" fill="#002776"/>
      <rect x="11" y="5"  width="8"  height="8" fill="#002776"/>
      <rect x="12" y="4"  width="6"  height="10" fill="#002776"/>
      {/* White band across circle */}
      <rect x="10" y="8"  width="10" height="2" fill="#ffffff"/>
      {/* Text hint (stars simplified) */}
      <rect x="12" y="6"  width="1" height="1" fill="#ffffff"/>
      <rect x="15" y="7"  width="1" height="1" fill="#ffffff"/>
      <rect x="18" y="6"  width="1" height="1" fill="#ffffff"/>
      <rect x="13" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="17" y="10" width="1" height="1" fill="#ffffff"/>
    </svg>
  ),

  /* ── АРГЕНТИН ────────────────────────────────────────────────────── */
  'Аргентин': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0"  width="30" height="6"  fill="#74ACDF"/>
      <rect x="0" y="6"  width="30" height="6"  fill="#ffffff"/>
      <rect x="0" y="12" width="30" height="6"  fill="#74ACDF"/>
      {/* Sol de Mayo (sun) — yellow circle with rays */}
      <rect x="13" y="7"  width="4" height="4" fill="#F6B40E"/>
      <rect x="12" y="8"  width="6" height="2" fill="#F6B40E"/>
      <rect x="14" y="6"  width="2" height="6" fill="#F6B40E"/>
      {/* Sun face */}
      <rect x="13" y="8"  width="1" height="1" fill="#843511"/>
      <rect x="16" y="8"  width="1" height="1" fill="#843511"/>
      <rect x="14" y="10" width="2" height="1" fill="#843511"/>
      {/* Rays */}
      <rect x="12" y="7"  width="1" height="1" fill="#F6B40E"/>
      <rect x="17" y="7"  width="1" height="1" fill="#F6B40E"/>
      <rect x="12" y="10" width="1" height="1" fill="#F6B40E"/>
      <rect x="17" y="10" width="1" height="1" fill="#F6B40E"/>
    </svg>
  ),

  /* ── БУСАД ───────────────────────────────────────────────────────── */
  'Бусад': (
    <svg viewBox="0 0 30 18" width="100%" height="100%" style={{ imageRendering:'pixelated', display:'block' }}>
      <rect x="0" y="0" width="30" height="18" fill="#1a2535"/>
      {/* Globe grid lines */}
      <rect x="0"  y="5"  width="30" height="1" fill="#2a4060"/>
      <rect x="0"  y="11" width="30" height="1" fill="#2a4060"/>
      <rect x="5"  y="0"  width="1"  height="18" fill="#2a4060"/>
      <rect x="14" y="0"  width="1"  height="18" fill="#3a5a80"/>
      <rect x="24" y="0"  width="1"  height="18" fill="#2a4060"/>
      {/* Continents hint */}
      <rect x="6"  y="2"  width="6" height="4" fill="#2a5030"/>
      <rect x="15" y="2"  width="4" height="3" fill="#2a5030"/>
      <rect x="7"  y="8"  width="5" height="5" fill="#2a5030"/>
      <rect x="16" y="7"  width="7" height="6" fill="#2a5030"/>
    </svg>
  ),
}

interface Props {
  country?: string | null
  size?: number
  style?: React.CSSProperties
}

export default function CountryFlag({ country, size = 28, style }: Props) {
  if (!country) return null
  const flag = FLAGS[country] ?? FLAGS['Бусад']
  const h = Math.round(size * 18 / 30)
  return (
    <span
      title={country}
      style={{
        display: 'inline-flex',
        width: size,
        height: h,
        flexShrink: 0,
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
        ...style,
      }}
    >
      <span style={{ display:'block', width:'100%', height:'100%', lineHeight:0 }}>
        {flag}
      </span>
    </span>
  )
}