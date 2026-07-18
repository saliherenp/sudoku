export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellValue = Digit | 0;
export type Grid = CellValue[];  // 81 elements, row-major

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Puzzle {
  given: Grid;       // initial board (0 = empty)
  solution: Grid;    // full solution
  difficulty: Difficulty;
}

// Min given-clue counts per difficulty (determines how many cells to keep)
export const DIFFICULTY_CLUES: Record<Difficulty, { min: number; max: number }> = {
  easy:   { min: 36, max: 46 },
  medium: { min: 28, max: 35 },
  hard:   { min: 23, max: 27 },
  expert: { min: 17, max: 22 },
};
