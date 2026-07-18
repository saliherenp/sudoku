import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import { CellState } from '../store/gameStore';

type Props = {
  cells: CellState[];
  selected: number | null;
  onSelect: (idx: number) => void;
  showErrors: boolean;
  highlightRelated: boolean;
  solution: number[];
};

function row(i: number) { return Math.floor(i / 9); }
function col(i: number) { return i % 9; }
function box(i: number) { return Math.floor(row(i) / 3) * 3 + Math.floor(col(i) / 3); }

const THIN = 1;
const THICK = 2.5;
const OUTER = 2.5;

export default function SudokuBoard({ cells, selected, onSelect, showErrors, highlightRelated, solution }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // Integer cell size so 1px grid lines never land on fractional pixels.
  const cellSize = Math.floor(Math.min(width - 32, 360) / 9);
  const inner = cellSize * 9;

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
    if (!selectedValue) return new Set<number>();
    const s = new Set<number>();
    for (let i = 0; i < 81; i++) {
      if (i !== selected && cells[i]?.value === selectedValue) s.add(i);
    }
    return s;
  }, [selectedValue, selected, cells]);

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
              const isSelected = selected === idx;
              const isHighlighted = highlights.has(idx);
              const isSameNum = sameNumber.has(idx);
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

              return (
                <TouchableOpacity
                  key={c}
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
                    <Text style={[
                      styles.digit,
                      {
                        color: textColor,
                        fontSize: cellSize * 0.50,
                        fontWeight: cell.isGiven ? '700' : '500',
                      },
                    ]}>
                      {cell.value}
                    </Text>
                  ) : cell.notes.size > 0 ? (
                    <PencilMarks notes={cell.notes} cellSize={cellSize} color={colors.pencilMark} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function PencilMarks({ notes, cellSize, color }: { notes: Set<number>; cellSize: number; color: string }) {
  const markSize = cellSize / 3;
  return (
    <View style={styles.notesGrid}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <View key={n} style={{ width: markSize, height: markSize, alignItems: 'center', justifyContent: 'center' }}>
          {notes.has(n) && (
            <Text style={{ fontSize: cellSize * 0.21, color, fontWeight: '600' }}>{n}</Text>
          )}
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
  digit: {
    textAlign: 'center',
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
});
