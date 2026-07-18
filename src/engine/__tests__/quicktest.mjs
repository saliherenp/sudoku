// Quick engine test without Jest framework
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// We'll use ts-node/esm or compile manually. Let's use a simpler approach:
// Inline the logic here to avoid transpilation issues.

// ---- Inline solver ----
const PEERS = (() => {
  const result = [];
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9), c = i % 9;
    const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    const s = new Set();
    for (let j = 0; j < 81; j++) {
      const jr = Math.floor(j / 9), jc = j % 9;
      const jb = Math.floor(jr / 3) * 3 + Math.floor(jc / 3);
      if (j !== i && (jr === r || jc === c || jb === b)) s.add(j);
    }
    result.push(Array.from(s));
  }
  return result;
})();

function countBits(n) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}

function buildCands(grid) {
  const cands = new Int32Array(81);
  for (let i = 0; i < 81; i++) {
    if (grid[i] === 0) {
      let used = 0;
      for (const p of PEERS[i]) used |= (1 << grid[p]);
      cands[i] = 0b1111111110 & ~used;
    }
  }
  return cands;
}

function countSolutions(grid, limit = 2) {
  const g = new Int32Array(grid);
  const cands = buildCands(g);
  let count = 0;
  function solve() {
    let minBits = 1023, minIdx = -1;
    for (let i = 0; i < 81; i++) {
      if (g[i] !== 0) continue;
      const bits = cands[i];
      if (bits === 0) return false;
      const pc = countBits(bits);
      if (pc < minBits) { minBits = pc; minIdx = i; }
      if (minBits === 1) break;
    }
    if (minIdx === -1) { count++; return count >= limit; }
    const bits = cands[minIdx];
    const saved = [];
    for (let d = 1; d <= 9; d++) {
      if (!(bits & (1 << d))) continue;
      g[minIdx] = d;
      saved.length = 0;
      let ok = true;
      for (const p of PEERS[minIdx]) {
        if (g[p] === 0 && (cands[p] & (1 << d))) {
          saved.push({ idx: p, bits: cands[p] });
          cands[p] &= ~(1 << d);
          if (cands[p] === 0) { ok = false; break; }
        }
      }
      if (ok && solve()) return true;
      for (const s of saved) cands[s.idx] = s.bits;
      g[minIdx] = 0;
    }
    cands[minIdx] = bits;
    return false;
  }
  solve();
  return count;
}

function solveGrid(grid) {
  const g = new Int32Array(grid);
  const cands = buildCands(g);
  function inner() {
    let minBits = 1023, minIdx = -1;
    for (let i = 0; i < 81; i++) {
      if (g[i] !== 0) continue;
      const bits = cands[i];
      if (bits === 0) return false;
      const pc = countBits(bits);
      if (pc < minBits) { minBits = pc; minIdx = i; }
      if (minBits === 1) break;
    }
    if (minIdx === -1) return true;
    const bits = cands[minIdx];
    const saved = [];
    for (let d = 1; d <= 9; d++) {
      if (!(bits & (1 << d))) continue;
      g[minIdx] = d;
      saved.length = 0;
      let ok = true;
      for (const p of PEERS[minIdx]) {
        if (g[p] === 0 && (cands[p] & (1 << d))) {
          saved.push({ idx: p, bits: cands[p] });
          cands[p] &= ~(1 << d);
          if (cands[p] === 0) { ok = false; break; }
        }
      }
      if (ok && inner()) return true;
      for (const s of saved) cands[s.idx] = s.bits;
      g[minIdx] = 0;
    }
    cands[minIdx] = bits;
    return false;
  }
  return inner() ? Array.from(g) : null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function candidates(grid, idx) {
  let used = 0;
  for (const p of PEERS[idx]) used |= (1 << grid[p]);
  const result = [];
  for (let d = 1; d <= 9; d++) {
    if (!(used & (1 << d))) result.push(d);
  }
  return result;
}

function generateFullGrid() {
  const grid = new Array(81).fill(0);
  function fill(idx) {
    if (idx === 81) return true;
    if (grid[idx] !== 0) return fill(idx + 1);
    const cands = shuffle(candidates(grid, idx));
    for (const d of cands) {
      grid[idx] = d;
      if (fill(idx + 1)) return true;
      grid[idx] = 0;
    }
    return false;
  }
  fill(0);
  return grid;
}

const DIFFICULTY_CLUES = {
  easy:   { min: 36, max: 46 },
  medium: { min: 28, max: 35 },
  hard:   { min: 23, max: 27 },
  expert: { min: 17, max: 22 },
};

function generatePuzzle(difficulty) {
  const solution = generateFullGrid();
  const given = [...solution];
  const { min, max } = DIFFICULTY_CLUES[difficulty];
  const targetClues = min + Math.floor(Math.random() * (max - min + 1));
  const indices = shuffle(Array.from({ length: 81 }, (_, i) => i));
  for (const idx of indices) {
    const currentClues = given.filter(v => v !== 0).length;
    if (currentClues <= targetClues) break;
    const backup = given[idx];
    given[idx] = 0;
    if (countSolutions(given, 2) !== 1) given[idx] = backup;
  }
  return { given, solution, difficulty };
}

function isValid(grid) {
  for (let i = 0; i < 81; i++) {
    const v = grid[i];
    if (v === 0) continue;
    for (const p of PEERS[i]) {
      if (p > i && grid[p] === v) return false;
    }
  }
  return true;
}

// ---- Tests ----
const DIFFS = ['easy', 'medium', 'hard', 'expert'];
const SAMPLES = 3;
let passed = 0, failed = 0;

console.log('=== Sudoku Engine Tests ===\n');

// Test 1: known puzzle
{
  const puzzle = [
    5,3,0,0,7,0,0,0,0,
    6,0,0,1,9,5,0,0,0,
    0,9,8,0,0,0,0,6,0,
    8,0,0,0,6,0,0,0,3,
    4,0,0,8,0,3,0,0,1,
    7,0,0,0,2,0,0,0,6,
    0,6,0,0,0,0,2,8,0,
    0,0,0,4,1,9,0,0,5,
    0,0,0,0,8,0,0,7,9,
  ];
  const result = solveGrid(puzzle);
  if (result && result.every(v => v !== 0) && isValid(result)) {
    console.log('✅ solver: solves known puzzle');
    passed++;
  } else {
    console.log('❌ solver: failed on known puzzle');
    failed++;
  }
}

// Test 2: uniqueness on known puzzle
{
  const puzzle = [
    5,3,0,0,7,0,0,0,0,
    6,0,0,1,9,5,0,0,0,
    0,9,8,0,0,0,0,6,0,
    8,0,0,0,6,0,0,0,3,
    4,0,0,8,0,3,0,0,1,
    7,0,0,0,2,0,0,0,6,
    0,6,0,0,0,0,2,8,0,
    0,0,0,4,1,9,0,0,5,
    0,0,0,0,8,0,0,7,9,
  ];
  const c = countSolutions(puzzle, 2);
  if (c === 1) {
    console.log('✅ solver: known puzzle has exactly 1 solution');
    passed++;
  } else {
    console.log(`❌ solver: expected 1 solution, got ${c}`);
    failed++;
  }
}

// Test 3–6: generator per difficulty
for (const diff of DIFFS) {
  const t0 = Date.now();
  let ok = true;
  for (let i = 0; i < SAMPLES; i++) {
    const { given, solution } = generatePuzzle(diff);
    if (!isValid(solution)) { ok = false; break; }
    if (!solution.every(v => v !== 0)) { ok = false; break; }
    for (let j = 0; j < 81; j++) {
      if (given[j] !== 0 && given[j] !== solution[j]) { ok = false; break; }
    }
    if (countSolutions(given, 2) !== 1) { ok = false; break; }
  }
  const ms = Date.now() - t0;
  const label = `generator: ${SAMPLES}x ${diff} (${ms}ms)`;
  if (ok) { console.log(`✅ ${label}`); passed++; }
  else    { console.log(`❌ ${label}`); failed++; }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
