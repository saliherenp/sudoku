import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import DifficultySheet from '../src/components/DifficultySheet';
import { Difficulty } from '../src/engine/types';
import { useGame } from '../src/store/useGameContext';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { state, startGame } = useGame();
  const [showDifficulty, setShowDifficulty] = useState(false);
  const hasActiveGame = state.puzzle !== null && state.status === 'playing' && state.cells.some(c => !c.isGiven && c.value !== 0);

  const handleSelectDifficulty = (d: Difficulty) => {
    setShowDifficulty(false);
    startGame(d);
    router.push('/game');
  };

  const handleContinue = () => {
    router.push('/game');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <DifficultySheet
        visible={showDifficulty}
        onSelect={handleSelectDifficulty}
        onClose={() => setShowDifficulty(false)}
      />

      {/* Header with settings */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconBtn}>
          <Text style={{ fontSize: 22 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoArea}>
        <Text style={[styles.logo, { color: colors.primaryText }]}>Sudoku</Text>
        <Text style={[styles.tagline, { color: colors.secondaryText }]}>Klasik bulmaca oyunu</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={() => setShowDifficulty(true)}
          style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Yeni Oyun</Text>
        </TouchableOpacity>

        {hasActiveGame && (
          <TouchableOpacity
            onPress={handleContinue}
            style={[styles.secondaryBtn, { borderColor: colors.accent }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.accent }]}>Devam Et</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats hint */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/stats')} style={styles.statsHint}>
          <Text style={[styles.statsHintText, { color: colors.secondaryText }]}>İstatistikler →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 8 },
  iconBtn: { padding: 8 },
  logoArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 52, fontWeight: '800', letterSpacing: -2 },
  tagline: { fontSize: 15, marginTop: 4 },
  buttons: { paddingHorizontal: 32, paddingBottom: 32, gap: 14 },
  primaryBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4257CE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  secondaryBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 17, fontWeight: '600' },
  footer: { alignItems: 'center', paddingBottom: 24 },
  statsHint: { padding: 12 },
  statsHintText: { fontSize: 14 },
});
