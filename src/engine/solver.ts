import { Grid, Digit } from './types';

// Pre-compute peer sets for each cell (row + col + box peers, excluding self)
const PEERS: ReadonlyArray<readonly number[]> = (() => {
  const result: number[][] = [];
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9), c = i % 9;
    const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    const s = new Set<number>();
    for (let j = 0; j < 81; j++) {
      const jr = Math.floor(j / 9), jc = j % 9;
      const jb = Math.floor(jr / 3) * 3 + Math.floor(jc / 3);
      if (j !== i && (jr === r || jc === c || jb === b)) s.add(j);
    }
    result.push(Array.from(s));
  }
  return result;
})();

export function peers(idx: number): readonly number[] {
  return PEERS[idx];
}

export function candidates(grid: Grid, idx: number): Digit[] {
  let used = 0;
  for (const p of PEERS[idx]) {
    used |= (1 << grid[p]);
  }
  const result: Digit[] = [];
  for (let d = 1; d <= 9; d++) {
    if (!(used & (1 << d))) result.push(d as Digit);
  }
  return result;
}

export function isValid(grid: Grid): boolean {
  for (let i = 0; i < 81; i++) {
    const v = grid[i];
    if (v === 0) continue;
    for (const p of PEERS[i]) {
      if (p > i && grid[p] === v) return false;
    }
  }
  return true;
}

/**
 * Fast bitmask-based solver. Counts solutions up to `limit` (stops early).
 */
export function countSolutions(grid: Grid, limit = 2): number {
  // Build candidate bitmasks (bits 1–9)
  const cands = new Int32Array(81);
  for (let i = 0; i < 81; i++) {
    if (grid[i] === 0) {
      let used = 0;
      for (const p of PEERS[i]) used |= (1 << grid[p]);
      cands[i] = 0b1111111110 & ~used; // bits 1-9
    }
  }

  const g = new Int32Array(grid);
  let count = 0;

  function solve(): boolean {
    // MRV: find unfilled cell with fewest candidates
    let minBits = 1023, minIdx = -1;
    for (let i = 0; i < 81; i++) {
      if (g[i] !== 0) continue;
      const bits = cands[i];
      if (bits === 0) return false;
      const popcount = countBits(bits);
      if (popcount < minBits) { minBits = popcount; minIdx = i; }
      if (minBits === 1) break;
    }
    if (minIdx === -1) { count++; return count >= limit; }

    const bits = cands[minIdx];
    // Save/restore candidate masks for peers
    const saved: Array<{ idx: number; bits: number }> = [];

    for (let d = 1; d <= 9; d++) {
      if (!(bits & (1 << d))) continue;
      g[minIdx] = d;

      // Propagate: remove d from peers' candidates
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

      // Restore
      for (const s of saved) cands[s.idx] = s.bits;
      g[minIdx] = 0;
    }

    cands[minIdx] = bits;
    return false;
  }

  solve();
  return count;
}

function countBits(n: number): number {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}

/**
 * Solves the puzzle and returns the completed grid, or null if unsolvable.
 */
export function solve(grid: Grid): Grid | null {
  const g = new Int32Array(grid);
  const cands = new Int32Array(81);

  for (let i = 0; i < 81; i++) {
    if (g[i] === 0) {
      let used = 0;
      for (const p of PEERS[i]) used |= (1 << g[p]);
      cands[i] = 0b1111111110 & ~used;
    }
  }

  function inner(): boolean {
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
    const saved: Array<{ idx: number; bits: number }> = [];

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

  if (!inner()) return null;
  return Array.from(g) as Grid;
}
