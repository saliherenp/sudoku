import { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import DifficultySheet from '../src/components/DifficultySheet';
import StatsView from '../src/components/StatsView';
import { Difficulty } from '../src/engine/types';
import { useGame } from '../src/store/useGameContext';

const DIFF_LABELS: Record<Difficulty, string> = {
  easy: 'Kolay', medium: 'Orta', hard: 'Zor', expert: 'Uzman',
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { state, startGame } = useGame();

  const [showDifficulty, setShowDifficulty] = useState(false);
  const [page, setPage] = useState(0);
  const [pagerH, setPagerH] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const hasActiveGame =
    state.puzzle !== null &&
    state.status === 'playing' &&
    state.cells.some(c => !c.isGiven && c.value !== 0);

  const goToPage = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== page) setPage(i);
  };

  const handleSelectDifficulty = (d: Difficulty) => {
    setShowDifficulty(false);
    startGame(d);
    router.push('/game');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.pageBackground }]} edges={['top', 'bottom']}>
      <DifficultySheet
        visible={showDifficulty}
        onSelect={handleSelectDifficulty}
        onClose={() => setShowDifficulty(false)}
      />

      <View style={styles.pager} onLayout={e => setPagerH(e.nativeEvent.layout.height)}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
        >
          {/* Page 1 — Home */}
          <View style={{ width, height: pagerH }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconBtn}>
                <Text style={{ fontSize: 22 }}>⚙️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.logoArea}>
              <Text style={[styles.logo, { color: colors.primaryText }]}>Sudoku</Text>
              <Text style={[styles.tagline, { color: colors.secondaryText }]}>Klasik bulmaca oyunu</Text>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                onPress={() => setShowDifficulty(true)}
                style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Yeni</Text>
              </TouchableOpacity>

              {hasActiveGame && (
                <TouchableOpacity
                  onPress={() => router.push('/game')}
                  style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Devam Et</Text>
                  <Text style={styles.continueSub}>
                    {DIFF_LABELS[state.puzzle!.difficulty]} · {formatTime(state.elapsedSeconds)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Page 2 — Stats */}
          <View style={{ width, height: pagerH }}>
            <StatsView title="İstatistikler" />
          </View>
        </ScrollView>
      </View>

      {/* Bottom tab bar */}
      <View style={[styles.tabBar, { borderTopColor: colors.thinLine }]}>
        {[{ i: 0, icon: '⌂' }, { i: 1, icon: '👤' }].map(({ i, icon }) => {
          const active = page === i;
          return (
            <TouchableOpacity key={i} style={styles.tab} onPress={() => goToPage(i)} activeOpacity={0.7}>
              <View
                style={[
                  styles.tabPill,
                  active && { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder, borderWidth: 1 },
                ]}
              >
                <Text style={[styles.tabIcon, { color: active ? colors.accent : colors.secondaryText }]}>{icon}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pager: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 8 },
  iconBtn: { padding: 8 },
  logoArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 52, fontWeight: '800', letterSpacing: -2 },
  tagline: { fontSize: 15, marginTop: 4 },
  buttons: { paddingHorizontal: 32, paddingBottom: 32, gap: 14 },
  primaryBtn: {
    height: 60,
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
  continueSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500', marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  tabPill: {
    minWidth: 72,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tabIcon: { fontSize: 26 },
});
