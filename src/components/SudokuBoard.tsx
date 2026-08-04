import React, { useMemo, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';
import { useTheme } from '../theme';
import { CellState } from '../store/gameStore';

type Props = {
  cells: CellState[];
  selected: number | null;
  onSelect: (idx: number) => void;
  showErrors: boolean;
  highlightRelated: boolean;
  highlightSameNumber: boolean;
};

function row(i: number) { return Math.floor(i / 9); }
function col(i: number) { return i % 9; }
function box(i: number) { return Math.floor(row(i) / 3) * 3 + Math.floor(col(i) / 3); }

const THIN = 1;
const THICK = 2.5;
const OUTER = 2.5;

type ThemeColors = ReturnType<typeof useTheme>['colors'];

type CellProps = {
  cell: CellState;
  idx: number;
  cellSize: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNum: boolean;
  // The digit among this cell's notes that matches the selected value (0 = none).
  // Passed per cell rather than board-wide so selecting a digit only re-renders
  // the cells that actually note it.
  noteHighlight: number;
  showErrors: boolean;
  colors: ThemeColors;
  onSelect: (idx: number) => void;
};

type CellHandle = { pulse: () => void };

// Memoized so a selection/input only re-renders the handful of cells whose
// visual state actually changed, instead of all 81 every time. Exposes an
// imperative `pulse()` so the board can replay the animation on any press
// (including re-taps) without changing props / re-rendering.
const Cell = React.memo(forwardRef<CellHandle, CellProps>(function Cell({
  cell, idx, cellSize, isSelected, isHighlighted, isSameNum, noteHighlight, showErrors, colors, onSelect,
}, ref) {
  const r = row(idx), c = col(idx);
  const isErr = showErrors && cell.isError;

  let bg = colors.boardBackground;
  if (isSelected) bg = colors.selectedCell;
  else if (isErr) bg = colors.errorCell;
  else if (isSameNum) bg = colors.sameNumberCell;
  else if (isHighlighted) bg = colors.highlightCell;

  // Thick lines only on internal 3x3 box boundaries; outer border draws edges.
  const isBoxRight = c !== 8 && (c + 1) % 3 === 0;
  const borderRightW = c === 8 ? 0 : isBoxRight ? THICK : THIN;
  const borderRightC = isBoxRight ? colors.thickLine : colors.thinLine;

  const isBoxBottom = r !== 8 && (r + 1) % 3 === 0;
  const borderBottomW = r === 8 ? 0 : isBoxBottom ? THICK : THIN;
  const borderBottomC = isBoxBottom ? colors.thickLine : colors.thinLine;

  let textColor = cell.isGiven ? colors.givenNumber : colors.playerNumber;
  if (isErr) textColor = colors.errorText;

  // Pronounced pulse (thick border in the 3x3-divider colour that fades out); a
  // digit inside the cell grows then shrinks back in sync. Runs on the NATIVE
  // thread so the selection re-render can't drop its first frames — this keeps
  // the very first tap exactly as bold as later taps. Idle value 1 = invisible.
  const anim = useRef(new Animated.Value(1)).current;
  useImperativeHandle(ref, () => ({
    pulse: () => {
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    },
  }), []);
  // Build the interpolation nodes ONCE. Recreating them on a re-render (which
  // happens on the first tap, when selection changes) would detach the running
  // native animation from its node and make it jump — the "drop" on the 1st tap.
  const pulseOpacity = useMemo(() => anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.95, 0.95, 0] }), [anim]);
  const digitScale = useMemo(() => anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.28, 1] }), [anim]);

  return (
    <TouchableOpacity
      onPress={() => onSelect(idx)}
      activeOpacity={0.75}
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: bg,
          borderRightWidth: borderRightW,
          borderRightColor: borderRightC,
          borderBottomWidth: borderBottomW,
          borderBottomColor: borderBottomC,
        },
      ]}
    >
      {cell.value !== 0 ? (
        <Animated.Text style={[
          styles.digit,
          {
            color: textColor,
            fontSize: cellSize * 0.50,
            fontWeight: cell.isGiven ? '700' : '500',
            transform: [{ scale: digitScale }],
          },
        ]}>
          {cell.value}
        </Animated.Text>
      ) : cell.notes.size > 0 ? (
        <PencilMarks
          notes={cell.notes}
          cellSize={cellSize}
          color={colors.pencilMark}
          highlight={noteHighlight}
          highlightColor={colors.pencilMarkHighlight}
        />
      ) : null}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.cellPulse, { borderColor: colors.thickLine, opacity: pulseOpacity }]}
      />
    </TouchableOpacity>
  );
}));

function SudokuBoard({ cells, selected, onSelect, showErrors, highlightRelated, highlightSameNumber }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // Integer cell size so 1px grid lines never land on fractional pixels.
  const cellSize = Math.floor(Math.min(width - 32, 360) / 9);
  const inner = cellSize * 9;

  // Imperative pulse handles for each cell, plus stable per-index ref setters
  // (so attaching them doesn't churn on every render).
  const cellRefs = useRef<(CellHandle | null)[]>([]);
  const setters = useMemo(
    () => Array.from({ length: 81 }, (_, i) => (el: CellHandle | null) => { cellRefs.current[i] = el; }),
    [],
  );

  // Latest values read inside the stable press handler via refs, so the handler
  // identity never changes (keeps the memoized cells from re-rendering).
  const cellsRef = useRef(cells); cellsRef.current = cells;
  const sameHLRef = useRef(highlightSameNumber); sameHLRef.current = highlightSameNumber;
  const onSelectRef = useRef(onSelect); onSelectRef.current = onSelect;

  const handleSelect = useCallback((idx: number) => {
    // Apply the selection/highlight FIRST, then play the pulse on the next frame —
    // once the background highlight has committed. Otherwise the first tap shows a
    // two-step "pulse-then-highlight" (a visible drop); running it after the commit
    // makes every tap (first included) look identical to a re-tap of a lit cell.
    onSelectRef.current(idx);
    requestAnimationFrame(() => {
      cellRefs.current[idx]?.pulse();
      if (sameHLRef.current) {
        const cs = cellsRef.current;
        const v = cs[idx]?.value;
        if (v) {
          for (let i = 0; i < 81; i++) {
            if (i !== idx && cs[i]?.value === v) cellRefs.current[i]?.pulse();
          }
        }
      }
    });
  }, []);

  const highlights = useMemo(() => {
    if (selected === null || !highlightRelated) return new Set<number>();
    const sr = row(selected), sc = col(selected), sb = box(selected);
    const s = new Set<number>();
    for (let i = 0; i < 81; i++) {
      if (i !== selected && (row(i) === sr || col(i) === sc || box(i) === sb)) s.add(i);
    }
    return s;
  }, [selected, highlightRelated]);

  const selectedValue = selected !== null ? cells[selected]?.value : 0;

  const sameNumber = useMemo(() => {
    if (!selectedValue || !highlightSameNumber) return new Set<number>();
    const s = new Set<number>();
    for (let i = 0; i < 81; i++) {
      if (i !== selected && cells[i]?.value === selectedValue) s.add(i);
    }
    return s;
  }, [selectedValue, selected, cells, highlightSameNumber]);

  // Same setting as the same-number cell highlight: selecting a filled cell also
  // makes that digit stand out wherever it only exists as a pencil mark.
  const noteDigit = highlightSameNumber ? selectedValue : 0;

  if (cells.length === 0) return null;

  return (
    <View style={[styles.board, { borderColor: colors.boardBorder, borderWidth: OUTER }]}>
      {/* Fixed-size grid; explicit rows avoid flex-wrap sub-pixel breakage */}
      <View style={{ width: inner, height: inner }}>
        {Array.from({ length: 9 }, (_, r) => (
          <View key={r} style={{ flexDirection: 'row', height: cellSize }}>
            {Array.from({ length: 9 }, (_, c) => {
              const idx = r * 9 + c;
              const cell = cells[idx];
              return (
                <Cell
                  key={c}
                  ref={setters[idx]}
                  cell={cell}
                  idx={idx}
                  cellSize={cellSize}
                  isSelected={selected === idx}
                  isHighlighted={highlights.has(idx)}
                  isSameNum={sameNumber.has(idx)}
                  noteHighlight={noteDigit && cell.notes.has(noteDigit) ? noteDigit : 0}
                  showErrors={showErrors}
                  colors={colors}
                  onSelect={handleSelect}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

export default React.memo(SudokuBoard);

// Fixed 3x3 layout: each digit always sits in the same slot (1 top-left …
// 9 bottom-right), like a phone keypad. Flex rows fill the exact cell content
// box, so no digit ever wraps to the wrong slot.
function PencilMarks({ notes, cellSize, color, highlight, highlightColor }: {
  notes: Set<number>;
  cellSize: number;
  color: string;
  highlight: number;
  highlightColor: string;
}) {
  return (
    <View style={styles.notesGrid}>
      {[0, 1, 2].map(r => (
        <View key={r} style={styles.notesRow}>
          {[1, 2, 3].map(c => {
            const n = r * 3 + c;
            // The note matching the selected digit is drawn bigger, bolder and
            // in the highlight colour so it stands out among its neighbours.
            const isHL = n === highlight;
            return (
              <View key={n} style={styles.noteSlot}>
                {notes.has(n) && (
                  <Text style={{
                    fontSize: cellSize * (isHL ? 0.26 : 0.20),
                    color: isHL ? highlightColor : color,
                    fontWeight: isHL ? '800' : '600',
                  }}>
                    {n}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellPulse: {
    borderWidth: 5,
  },
  digit: {
    textAlign: 'center',
  },
  notesGrid: {
    width: '100%',
    height: '100%',
  },
  notesRow: {
    flexDirection: 'row',
    flex: 1,
  },
  noteSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
