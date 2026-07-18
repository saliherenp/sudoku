import { Grid, CellValue, Digit, Difficulty, Puzzle, DIFFICULTY_CLUES } from './types';
import { solve, countSolutions, candidates } from './solver';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateFullGrid(): Grid {
  const grid = new Array(81).fill(0) as Grid;

  function fill(idx: number): boolean {
    if (idx === 81) return true;
    if (grid[idx] !== 0) return fill(idx + 1);

    const cands = candidates(grid, idx);
    for (const d of shuffle(cands)) {
      grid[idx] = d;
      if (fill(idx + 1)) return true;
      grid[idx] = 0;
    }
    return false;
  }

  fill(0);
  return grid;
}

export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const solution = generateFullGrid();
  const given = [...solution] as Grid;

  const { min, max } = DIFFICULTY_CLUES[difficulty];
  const targetClues = min + Math.floor(Math.random() * (max - min + 1));

  const indices = shuffle(Array.from({ length: 81 }, (_, i) => i));

  for (const idx of indices) {
    const currentClues = given.filter(v => v !== 0).length;
    if (currentClues <= targetClues) break;

    const backup = given[idx];
    given[idx] = 0;

    // If removing this cell breaks uniqueness, put it back
    if (countSolutions(given, 2) !== 1) {
      given[idx] = backup;
    }
  }

  return { given, solution, difficulty };
}
