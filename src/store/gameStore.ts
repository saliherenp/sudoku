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

export function applyDigit(
  state: GameState,
  idx: number,
  digit: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
  autoNoteClean: boolean
): GameState {
  if (!state.puzzle) return state;
  const cell = state.cells[idx];
  if (cell.isGiven) return state;

  const newCells = state.cells.map(c => ({ ...c, notes: new Set(c.notes) }));

  if (digit === 0) {
    newCells[idx] = { ...newCells[idx], value: 0, isError: false, notes: new Set() };
  } else if (state.noteMode) {
    const notes = new Set(newCells[idx].notes);
    if (notes.has(digit)) notes.delete(digit);
    else notes.add(digit);
    newCells[idx] = { ...newCells[idx], notes, value: 0 };
  } else {
    const correct = state.puzzle.solution[idx] === digit;
    let newErrors = state.errorCount;
    if (!correct) newErrors = Math.min(state.errorCount + 1, 3);

    if (autoNoteClean && correct) {
      // Clear notes from peers that contain this digit
      const r = Math.floor(idx / 9), c = idx % 9, b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      for (let i = 0; i < 81; i++) {
        const ir = Math.floor(i / 9), ic = i % 9, ib = Math.floor(ir / 3) * 3 + Math.floor(ic / 3);
        if (i !== idx && (ir === r || ic === c || ib === b)) {
          newCells[i].notes.delete(digit);
        }
      }
    }

    newCells[idx] = { ...newCells[idx], value: digit, isError: !correct, notes: new Set() };

    const status: GameStatus =
      newErrors >= 3 ? 'lost'
      : newCells.every(c => c.value !== 0 && !c.isError) ? 'won'
      : 'playing';

    return {
      ...state,
      cells: newCells,
      errorCount: newErrors,
      status,
      history: [...state.history, { cells: state.cells.map(c => ({ ...c, notes: new Set(c.notes) })), selected: state.selected }],
      future: [],
    };
  }

  return {
    ...state,
    cells: newCells,
    history: [...state.history, { cells: state.cells.map(c => ({ ...c, notes: new Set(c.notes) })), selected: state.selected }],
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
