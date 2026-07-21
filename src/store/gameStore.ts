import { Grid, Difficulty, Puzzle } from '../engine/types';
import { solve } from '../engine/solver';

export type CellState = {
  value: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  isGiven: boolean;
  isError: boolean;
  notes: Set<number>;
};

export type GameStatus = 'playing' | 'paused' | 'won' | 'lost';

export type GameState = {
  puzzle: Puzzle | null;
  cells: CellState[];
  selected: number | null;
  noteMode: boolean;
  errorCount: number;
  elapsedSeconds: number;
  status: GameStatus;
  history: Array<{ cells: CellState[]; selected: number | null }>;
  future: Array<{ cells: CellState[]; selected: number | null }>;
};

export function initCells(puzzle: Puzzle): CellState[] {
  return puzzle.given.map(v => ({
    value: v,
    isGiven: v !== 0,
    isError: false,
    notes: new Set(),
  }));
}

// Auto-complete the whole board from the known solution (fixes any wrong cells
// too) and mark the game won. Undoable as a single move.
export function completeBoardState(state: GameState): GameState {
  if (!state.puzzle) return state;
  const prevSnapshot = { cells: state.cells, selected: state.selected };
  const newCells = state.cells.map((c, i) =>
    c.value === state.puzzle!.solution[i] && !c.isError
      ? c
      : { ...c, value: state.puzzle!.solution[i] as CellState['value'], isError: false, notes: new Set<number>() }
  );
  return {
    ...state,
    cells: newCells,
    status: 'won',
    history: [...state.history, prevSnapshot],
    future: [],
  };
}

export function applyDigit(
  state: GameState,
  idx: number,
  digit: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
  autoNoteClean: boolean,
  mistakeLimit: boolean = true
): GameState {
  if (!state.puzzle) return state;
  const cell = state.cells[idx];
  if (cell.isGiven) return state;

  // Shallow-copy the array but keep untouched cell objects by reference so the
  // board can skip re-rendering cells that didn't change (see memoized Cell).
  // We never mutate objects in `state.cells`, so it can be pushed onto the
  // undo history directly without a deep clone.
  const prevSnapshot = { cells: state.cells, selected: state.selected };
  const newCells = state.cells.slice();

  if (digit === 0) {
    if (cell.value === 0 && cell.notes.size === 0) return state; // nothing to erase
    newCells[idx] = { ...cell, value: 0, isError: false, notes: new Set() };
  } else if (state.noteMode) {
    const notes = new Set(cell.notes);
    if (notes.has(digit)) notes.delete(digit);
    else notes.add(digit);
    newCells[idx] = { ...cell, notes, value: 0 };
  } else if (cell.isError && cell.value === digit) {
    // Re-entering the same wrong digit that's already shown clears the cell
    // and does NOT count as another error.
    newCells[idx] = { ...cell, value: 0, isError: false, notes: new Set() };
    return {
      ...state,
      cells: newCells,
      history: [...state.history, prevSnapshot],
      future: [],
    };
  } else {
    const correct = state.puzzle.solution[idx] === digit;
    let newErrors = state.errorCount;
    if (!correct) newErrors = Math.min(state.errorCount + 1, 3);

    if (autoNoteClean && correct) {
      // Clear this digit from the notes of peers that contain it (new object per
      // affected peer only, so unaffected peers keep their reference).
      const r = Math.floor(idx / 9), c = idx % 9, b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      for (let i = 0; i < 81; i++) {
        if (i === idx) continue;
        const ir = Math.floor(i / 9), ic = i % 9, ib = Math.floor(ir / 3) * 3 + Math.floor(ic / 3);
        if ((ir === r || ic === c || ib === b) && newCells[i].notes.has(digit)) {
          const notes = new Set(newCells[i].notes);
          notes.delete(digit);
          newCells[i] = { ...newCells[i], notes };
        }
      }
    }

    newCells[idx] = { ...cell, value: digit, isError: !correct, notes: new Set() };

    const status: GameStatus =
      mistakeLimit && newErrors >= 3 ? 'lost'
      : newCells.every(c => c.value !== 0 && !c.isError) ? 'won'
      : 'playing';

    return {
      ...state,
      cells: newCells,
      errorCount: newErrors,
      status,
      history: [...state.history, prevSnapshot],
      future: [],
    };
  }

  return {
    ...state,
    cells: newCells,
    history: [...state.history, prevSnapshot],
    future: [],
  };
}

export function undoState(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const prev = state.history[state.history.length - 1];
  return {
    ...state,
    cells: prev.cells,
    selected: prev.selected,
    history: state.history.slice(0, -1),
    future: [{ cells: state.cells, selected: state.selected }, ...state.future],
  };
}

export function redoState(state: GameState): GameState {
  if (state.future.length === 0) return state;
  const next = state.future[0];
  return {
    ...state,
    cells: next.cells,
    selected: next.selected,
    history: [...state.history, { cells: state.cells, selected: state.selected }],
    future: state.future.slice(1),
  };
}

export function applyHint(state: GameState, idx: number): GameState {
  if (!state.puzzle || state.cells[idx].isGiven || state.cells[idx].value !== 0) return state;
  const correct = state.puzzle.solution[idx] as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  return applyDigit({ ...state, noteMode: false }, idx, correct, true);
}
