import { generatePuzzle } from '../generator';
import { countSolutions, isValid, solve } from '../solver';
import { Difficulty, Grid } from '../types';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
const SAMPLES_PER_DIFFICULTY = 5;

describe('Sudoku Engine', () => {
  describe('solver', () => {
    it('solves a known puzzle', () => {
      // A valid puzzle with unique solution
      const puzzle: Grid = [
        5,3,0, 0,7,0, 0,0,0,
        6,0,0, 1,9,5, 0,0,0,
        0,9,8, 0,0,0, 0,6,0,
        8,0,0, 0,6,0, 0,0,3,
        4,0,0, 8,0,3, 0,0,1,
        7,0,0, 0,2,0, 0,0,6,
        0,6,0, 0,0,0, 2,8,0,
        0,0,0, 4,1,9, 0,0,5,
        0,0,0, 0,8,0, 0,7,9,
      ];
      const result = solve(puzzle);
      expect(result).not.toBeNull();
      expect(result!.every(v => v !== 0)).toBe(true);
      expect(isValid(result!)).toBe(true);
    });

    it('returns null for unsolvable puzzle', () => {
      const bad: Grid = new Array(81).fill(0) as Grid;
      bad[0] = 1; bad[1] = 1; // two 1s in same row
      expect(solve(bad)).toBeNull();
    });
  });

  describe('generator', () => {
    DIFFICULTIES.forEach(diff => {
      it(`generates ${SAMPLES_PER_DIFFICULTY} valid unique-solution puzzles for ${diff}`, () => {
        for (let i = 0; i < SAMPLES_PER_DIFFICULTY; i++) {
          const puzzle = generatePuzzle(diff);

          // Solution must be valid
          expect(isValid(puzzle.solution)).toBe(true);
          expect(puzzle.solution.every(v => v !== 0)).toBe(true);

          // Given cells must match solution
          for (let j = 0; j < 81; j++) {
            if (puzzle.given[j] !== 0) {
              expect(puzzle.given[j]).toBe(puzzle.solution[j]);
            }
          }

          // Must have exactly 1 solution
          expect(countSolutions(puzzle.given, 2)).toBe(1);
        }
      }, 30000);
    });
  });
});
