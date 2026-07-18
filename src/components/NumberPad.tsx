import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { CellState } from '../store/gameStore';

type Props = {
  onPress: (digit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) => void;
  cells: CellState[];
};

export default function NumberPad({ onPress, cells }: Props) {
  const { colors } = useTheme();

  const usedCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (let d = 1; d <= 9; d++) {
      counts[d] = cells.filter(c => c.value === d).length;
    }
    return counts;
  }, [cells]);

  return (
    <View style={styles.row}>
      {([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(d => {
        const done = usedCounts[d] >= 9;
        return (
          <TouchableOpacity
            key={d}
            onPress={() => !done && onPress(d)}
            activeOpacity={done ? 1 : 0.6}
            style={[
              styles.button,
              { borderColor: colors.thinLine, opacity: done ? 0.3 : 1 },
            ]}
          >
            <Text style={[styles.digit, { color: colors.accent }]}>{d}</Text>
            {!done && (
              <View style={[styles.badge, { backgroundColor: colors.highlightCell }]}>
                <Text style={[styles.badgeText, { color: colors.secondaryText }]}>
                  {9 - usedCounts[d]}
                </Text>
              </View>
            )}
            {done && (
              <Text style={[styles.badgeText, { color: colors.hintColor, position: 'absolute', bottom: 4 }]}>✓</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  button: {
    width: 36,
    height: 56,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 22,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
});
