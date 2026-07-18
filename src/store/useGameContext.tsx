import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, CellState, initCells, applyDigit, undoState, redoState, applyHint } from './gameStore';
import { Puzzle, Difficulty } from '../engine/types';
import { generatePuzzle } from '../engine/generator';
import { useSettings } from './useSettings';

const SAVE_KEY = 'sudoku_active_game';

function serializeState(s: GameState): string {
  const plain = {
    ...s,
    cells: s.cells.map(c => ({ ...c, notes: Array.from(c.notes) })),
    history: s.history.map(h => ({ ...h, cells: h.cells.map(c => ({ ...c, notes: Array.from(c.notes) })) })),
    future: s.future.map(f => ({ ...f, cells: f.cells.map(c => ({ ...c, notes: Array.from(c.notes) })) })),
  };
  return JSON.stringify(plain);
}

function deserializeState(raw: string): GameState {
  const p = JSON.parse(raw);
  const fixCell = (c: CellState & { notes: number[] }) => ({ ...c, notes: new Set(c.notes) });
  return {
    ...p,
    cells: p.cells.map(fixCell),
    history: p.history.map((h: { cells: (CellState & { notes: number[] })[]; selected: number | null }) => ({ ...h, cells: h.cells.map(fixCell) })),
    future: p.future.map((f: { cells: (CellState & { notes: number[] })[]; selected: number | null }) => ({ ...f, cells: f.cells.map(fixCell) })),
  };
}

type Action =
  | { type: 'START_GAME'; puzzle: Puzzle }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'SELECT_CELL'; idx: number | null }
  | { type: 'INPUT_DIGIT'; digit: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  | { type: 'TOGGLE_NOTE_MODE' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'HINT' }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SET_AUTO_NOTE_CLEAN'; value: boolean };

type ContextType = {
  state: GameState;
  autoNoteClean: boolean;
  startGame: (difficulty: Difficulty) => void;
  startSharedGame: (puzzle: Puzzle) => void;
  selectCell: (idx: number | null) => void;
  inputDigit: (digit: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) => void;
  toggleNoteMode: () => void;
  undo: () => void;
  redo: () => void;
  hint: () => void;
  pause: () => void;
  resume: () => void;
};

const INITIAL: GameState = {
  puzzle: null,
  cells: [],
  selected: null,
  noteMode: false,
  errorCount: 0,
  elapsedSeconds: 0,
  status: 'playing',
  history: [],
  future: [],
};

const GameContext = createContext<ContextType | null>(null);

function reducer(state: GameState, action: Action & { autoNoteClean?: boolean }): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...INITIAL,
        puzzle: action.puzzle,
        cells: initCells(action.puzzle),
        status: 'playing',
      };
    case 'LOAD_GAME':
      return action.state;
    case 'SELECT_CELL':
      return { ...state, selected: action.idx };
    case 'INPUT_DIGIT':
      if (state.selected === null || state.status !== 'playing') return state;
      return applyDigit(state, state.selected, action.digit, action.autoNoteClean ?? false);
    case 'TOGGLE_NOTE_MODE':
      return { ...state, noteMode: !state.noteMode };
    case 'UNDO':
      return undoState(state);
    case 'REDO':
      return redoState(state);
    case 'HINT':
      if (state.selected === null || state.status !== 'playing') return state;
      return applyHint(state, state.selected);
    case 'TICK':
      if (state.status !== 'playing') return state;
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
    case 'PAUSE':
      return { ...state, status: 'paused' };
    case 'RESUME':
      return { ...state, status: 'playing' };
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const loadedRef = useRef(false);

  // Load saved game on mount
  useEffect(() => {
    AsyncStorage.getItem(SAVE_KEY).then(raw => {
      if (raw) {
        try {
          const saved = deserializeState(raw);
          if (saved.puzzle && saved.status === 'playing') {
            dispatch({ type: 'LOAD_GAME', state: saved });
          }
        } catch {}
      }
      loadedRef.current = true;
    });
  }, []);

  // Auto-save active game state
  useEffect(() => {
    if (!loadedRef.current) return;
    if (state.puzzle && state.status === 'playing') {
      AsyncStorage.setItem(SAVE_KEY, serializeState(state));
    } else if (state.status === 'won' || state.status === 'lost') {
      AsyncStorage.removeItem(SAVE_KEY);
    }
  }, [state]);

  useEffect(() => {
    if (state.status !== 'playing') return;
    const timer = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(timer);
  }, [state.status]);

  const startGame = (difficulty: Difficulty) => {
    const puzzle = generatePuzzle(difficulty);
    AsyncStorage.removeItem(SAVE_KEY);
    dispatch({ type: 'START_GAME', puzzle });
  };

  const startSharedGame = (puzzle: Puzzle) => {
    AsyncStorage.removeItem(SAVE_KEY);
    dispatch({ type: 'START_GAME', puzzle });
  };

  const value: ContextType = {
    state,
    autoNoteClean: settings.autoNoteClean,
    startGame,
    startSharedGame,
    selectCell: (idx) => dispatch({ type: 'SELECT_CELL', idx }),
    inputDigit: (digit) => dispatch({ type: 'INPUT_DIGIT', digit, autoNoteClean: settings.autoNoteClean } as Action & { autoNoteClean: boolean }),
    toggleNoteMode: () => dispatch({ type: 'TOGGLE_NOTE_MODE' }),
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    hint: () => dispatch({ type: 'HINT' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    resume: () => dispatch({ type: 'RESUME' }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
