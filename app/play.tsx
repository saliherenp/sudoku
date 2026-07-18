import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGame } from '../src/store/useGameContext';
import { useTheme } from '../src/theme';
import { solve, isValid } from '../src/engine/solver';
import { CellValue, Difficulty, Grid, Puzzle } from '../src/engine/types';

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

function parsePuzzle(p: string, d: string): Puzzle | null {
  if (typeof p !== 'string' || p.length !== 81) return null;
  const digits = p.split('').map(Number);
  if (digits.some(n => isNaN(n) || n < 0 || n > 9)) return null;

  const given = digits as Grid;
  if (!isValid(given)) return null;

  const solution = solve(given);
  if (!solution) return null;

  const difficulty = VALID_DIFFICULTIES.includes(d as Difficulty)
    ? (d as Difficulty)
    : 'medium';

  return { given, solution, difficulty };
}

export default function PlayScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ p?: string; d?: string }>();
  const { startSharedGame } = useGame();

  useEffect(() => {
    const puzzle = parsePuzzle(params.p ?? '', params.d ?? '');
    if (puzzle) {
      startSharedGame(puzzle);
      router.replace('/game');
    } else {
      router.replace('/');
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={[styles.text, { color: colors.secondaryText }]}>Bulmaca yükleniyor…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  text: { fontSize: 15 },
});
