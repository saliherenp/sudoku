import React, { useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { useTheme } from '../theme';
import { CellState } from '../store/gameStore';

// A number button that plays a subtle "border thickens then fades" pulse on tap.
function PadButton({
  disabled, onPress, width, height, accent, borderColor, opacity, children,
}: {
  disabled: boolean;
  onPress: () => void;
  width: number;
  height: number;
  accent: string;
  borderColor: string;
  opacity: number;
  children: React.ReactNode;
}) {
  // Idle value 1 = fully faded out; pulse resets to 0 then animates back to 1.
  const anim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    // Place the digit first so it isn't delayed by the animation, and run the
    // pulse on the native (UI) thread so it never competes with the re-render.
    onPress();
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  };

  const pulseOpacity = useMemo(() => anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.9, 0.9, 0] }), [anim]);
  const pulseScale = useMemo(() => anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }), [anim]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.6}
      style={[styles.button, { width, height, borderColor, opacity }]}
    >
      {children}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.pulse, { borderColor: accent, opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]}
      />
    </TouchableOpacity>
  );
}

type Props = {
  onPress: (digit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) => void;
  cells: CellState[];
  noteMode: boolean;
  showRemaining: boolean;
};

// Tiny outer margin from the screen edges and tiny gap between buttons, so the
// 9 buttons fill almost the entire screen width.
const SIDE = 5;
const GAP = 5;

function NumberPad({ onPress, cells, noteMode, showRemaining }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  // Fit exactly 9 buttons across the width: 8 gaps + 2 side margins.
  const buttonW = Math.floor((width - SIDE * 2 - GAP * 8) / 9);
  const buttonH = Math.round(buttonW * 1.5);

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
        // In note mode a fully-placed digit can still be toggled as a note.
        const disabled = done && !noteMode;
        return (
          <PadButton
            key={d}
            disabled={disabled}
            onPress={() => onPress(d)}
            width={buttonW}
            height={buttonH}
            accent={colors.accent}
            borderColor={colors.thinLine}
            opacity={disabled ? 0.3 : 1}
          >
            <Text style={[styles.digit, { color: colors.accent, fontSize: Math.round(buttonW * 0.52) }]}>{d}</Text>
            {!done && showRemaining && (
              <Text style={[styles.badgeText, styles.count, { color: colors.secondaryText }]}>
                {9 - usedCounts[d]}
              </Text>
            )}
            {done && (
              <Text style={[styles.badgeText, { color: colors.hintColor, position: 'absolute', bottom: 4 }]}>✓</Text>
            )}
          </PadButton>
        );
      })}
    </View>
  );
}

export default React.memo(NumberPad);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE,
  },
  button: {
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    borderRadius: 12,
    borderWidth: 2.5,
  },
  digit: {
    fontWeight: '700',
  },
  count: {
    position: 'absolute',
    bottom: 3,
    right: 5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
});
