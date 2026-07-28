/**
 * Sudoku ikon seti üreteci — "B" (koyu tema) tasarımı.
 * SVG üretir; rsvg-convert ile PNG'ye çevrilir.
 */
const fs = require('fs');
const S = 1024;
const FONT = 'Avenir Next';

// X deseni: 5 rakam. 60px'te bile okunur, 3x3 ızgara kimliğini korur.
const CELLS = [
  [0, 0, '6', 'given'],
  [0, 2, '1', 'accent'],
  [1, 1, '5', 'given'],
  [2, 0, '7', 'accent'],
  [2, 2, '3', 'given'],
];

function content({ box, lineColor, lineWidth, lineOpacity, given, accent, withDigits = true }) {
  const margin = (S - box) / 2;
  const cell = box / 3;
  const fs_ = cell * 0.72;
  const a = margin;
  const b = margin + box;
  const out = [];

  for (let i = 1; i <= 2; i++) {
    const p = margin + cell * i;
    out.push(`<line x1="${p.toFixed(1)}" y1="${a.toFixed(1)}" x2="${p.toFixed(1)}" y2="${b.toFixed(1)}" stroke="${lineColor}" stroke-width="${lineWidth}" stroke-linecap="round" opacity="${lineOpacity}"/>`);
    out.push(`<line x1="${a.toFixed(1)}" y1="${p.toFixed(1)}" x2="${b.toFixed(1)}" y2="${p.toFixed(1)}" stroke="${lineColor}" stroke-width="${lineWidth}" stroke-linecap="round" opacity="${lineOpacity}"/>`);
  }

  if (withDigits) {
    for (const [r, c, d, kind] of CELLS) {
      const cx = margin + cell * c + cell / 2;
      const cy = margin + cell * r + cell / 2;
      // Avenir Next rakam yüksekliği ~0.71em → taban çizgisini elle hizala
      const y = cy + fs_ * 0.355;
      out.push(`<text x="${cx.toFixed(1)}" y="${y.toFixed(1)}" font-family="${FONT}" font-weight="800" font-size="${fs_.toFixed(1)}" fill="${kind === 'accent' ? accent : given}" text-anchor="middle">${d}</text>`);
    }
  }
  return out.join('\n  ');
}

function svg({ background, ...rest }) {
  const defs = background && background.gradient
    ? `<linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${background.gradient[0]}"/><stop offset="1" stop-color="${background.gradient[1]}"/></linearGradient>`
    : '';
  const bgRect = background
    ? `<rect width="${S}" height="${S}" fill="${background.gradient ? 'url(#bg)' : background.flat}"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>${defs}</defs>
  ${bgRect}
  ${content(rest)}
</svg>`;
}

const BRAND = {
  bg: ['#2C3459', '#14172A'],
  line: '#8090D8',
  lineOpacity: 0.55,
  given: '#F2F4FF',
  accent: '#8BA8FF',
};

// Android adaptive icon: içerik merkezdeki %66'lık güvenli alanda kalmalı (620/1024 = %60.5)
const SAFE_BOX = 620;
const FULL_BOX = 688;

const targets = {
  // iOS light + Android legacy + web favicon: opak, tam kanvas
  'icon': svg({
    background: { gradient: BRAND.bg },
    box: FULL_BOX, lineColor: BRAND.line, lineWidth: 15, lineOpacity: BRAND.lineOpacity,
    given: BRAND.given, accent: BRAND.accent,
  }),

  // iOS dark: şeffaf zemin — sistem kendi koyu arka planını uygular
  'icon-ios-dark': svg({
    background: null,
    box: FULL_BOX, lineColor: BRAND.line, lineWidth: 15, lineOpacity: 0.7,
    given: '#FFFFFF', accent: '#A8BEFF',
  }),

  // iOS tinted: gri tonlama, opak (Expo bu varyantta şeffaflığı beyaza düzleştirir)
  'icon-ios-tinted': svg({
    background: { flat: '#1B1E2B' },
    box: FULL_BOX, lineColor: '#9BA0B5', lineWidth: 15, lineOpacity: 0.7,
    given: '#FFFFFF', accent: '#C8CCDA',
  }),

  // Android adaptive foreground: şeffaf, güvenli alan
  'adaptive-icon': svg({
    background: null,
    box: SAFE_BOX, lineColor: BRAND.line, lineWidth: 14, lineOpacity: 0.6,
    given: BRAND.given, accent: BRAND.accent,
  }),

  // Android adaptive background: tam kanvas gradyan (görünür alan merkezdeki %66)
  'adaptive-icon-bg': svg({
    background: { gradient: ['#343D68', '#101323'] },
    box: 0, lineColor: 'none', lineWidth: 0, lineOpacity: 0, given: 'none', accent: 'none',
    withDigits: false,
  }),

  // Android 13+ tema ikonu: yalnızca alfa kanalı kullanılır
  'adaptive-icon-mono': svg({
    background: null,
    box: SAFE_BOX, lineColor: '#FFFFFF', lineWidth: 16, lineOpacity: 0.75,
    given: '#FFFFFF', accent: '#FFFFFF',
  }),

  // Bildirim ikonu: Android silüeti alfadan üretir → rakamsız, kalın ızgara
  'notification-icon': svg({
    background: null,
    box: 660, lineColor: '#FFFFFF', lineWidth: 46, lineOpacity: 1,
    given: '#FFFFFF', accent: '#FFFFFF', withDigits: false,
  }),

  // Splash: #1c2139 üzerine 220px genişlikte, şeffaf zemin
  'splash-icon': svg({
    background: null,
    box: 840, lineColor: BRAND.line, lineWidth: 16, lineOpacity: 0.55,
    given: BRAND.given, accent: BRAND.accent,
  }),
};

const dir = process.argv[2];
for (const [name, src] of Object.entries(targets)) {
  fs.writeFileSync(`${dir}/${name}.svg`, src);
}
console.log(Object.keys(targets).join(' '));
