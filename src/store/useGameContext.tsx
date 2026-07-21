import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, CellState, initCells, applyDigit, undoState, redoState, applyHint, completeBoardState } from './gameStore';
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
  | { type: 'AUTO_COMPLETE' }
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
  completeBoard: () => void;
  tick: () => void;
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

function reducer(state: GameState, action: Action & { autoNoteClean?: boolean; mistakeLimit?: boolean }): GameState {
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
      return applyDigit(state, state.selected, action.digit, action.autoNoteClean ?? false, action.mistakeLimit ?? true);
    case 'AUTO_COMPLETE':
      if (state.status !== 'playing') return state;
      return completeBoardState(state);
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

  // Auto-save active game state. Debounced so rapid taps (and the 1s timer tick)
  // don't each trigger a full serialize + disk write on the interaction path.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loadedRef.current) return;
    if (state.status === 'won' || state.status === 'lost') {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      AsyncStorage.removeItem(SAVE_KEY);
      return;
    }
    if (!state.puzzle || state.status !== 'playing') return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(SAVE_KEY, serializeState(state));
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  // The 1s timer is driven by the game screen while it is focused (see game.tsx),
  // so elapsed time does NOT keep advancing on the home screen / other screens.

  // Stable callback identities so memoized children (e.g. board cells) aren't
  // forced to re-render just because the provider re-rendered.
  const startGame = useCallback((difficulty: Difficulty) => {
    const puzzle = generatePuzzle(difficulty);
    AsyncStorage.removeItem(SAVE_KEY);
    dispatch({ type: 'START_GAME', puzzle });
  }, []);

  const startSharedGame = useCallback((puzzle: Puzzle) => {
    AsyncStorage.removeItem(SAVE_KEY);
    dispatch({ type: 'START_GAME', puzzle });
  }, []);

  const autoNoteClean = settings.autoNoteClean;
  // Read the latest settings inside the stable inputDigit callback via a ref,
  // so the callback identity never changes (keeps memoized children cheap).
  const settingsRef = useRef({ autoNoteClean, mistakeLimit: settings.mistakeLimit });
  settingsRef.current = { autoNoteClean, mistakeLimit: settings.mistakeLimit };

  const selectCell = useCallback((idx: number | null) => dispatch({ type: 'SELECT_CELL', idx }), []);
  const inputDigit = useCallback(
    (digit: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) =>
      dispatch({
        type: 'INPUT_DIGIT',
        digit,
        autoNoteClean: settingsRef.current.autoNoteClean,
        mistakeLimit: settingsRef.current.mistakeLimit,
      } as Action & { autoNoteClean: boolean; mistakeLimit: boolean }),
    [],
  );
  const toggleNoteMode = useCallback(() => dispatch({ type: 'TOGGLE_NOTE_MODE' }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const hint = useCallback(() => dispatch({ type: 'HINT' }), []);
  const completeBoard = useCallback(() => dispatch({ type: 'AUTO_COMPLETE' }), []);
  const tick = useCallback(() => dispatch({ type: 'TICK' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);

  const value: ContextType = useMemo(() => ({
    state,
    autoNoteClean,
    startGame,
    startSharedGame,
    selectCell,
    inputDigit,
    toggleNoteMode,
    undo,
    redo,
    hint,
    completeBoard,
    tick,
    pause,
    resume,
  }), [state, autoNoteClean, startGame, startSharedGame, selectCell, inputDigit, toggleNoteMode, undo, redo, hint, completeBoard, tick, pause, resume]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
