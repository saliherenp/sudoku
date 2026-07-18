import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { useStats } from '../src/store/useStats';
import { Difficulty } from '../src/engine/types';

const DIFFS: { key: Difficulty; label: string }[] = [
  { key: 'easy',   label: 'Kolay'  },
  { key: 'medium', label: 'Orta'   },
  { key: 'hard',   label: 'Zor'    },
  { key: 'expert', label: 'Uzman'  },
];

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: '#3BAE7C', medium: '#4257CE', hard: '#E3973A', expert: '#D2566B',
};

function formatTime(s: number | null) {
  if (s === null) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function StatsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { stats } = useStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primaryText }]}>İstatistikler</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {DIFFS.map(({ key, label }) => {
          const d = stats[key];
          const winRate = d.played > 0 ? Math.round((d.won / d.played) * 100) : 0;
          const avg = d.won > 0 ? Math.round(d.totalTime / d.won) : null;

          return (
            <View key={key} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.dot, { backgroundColor: DIFF_COLORS[key] }]} />
                <Text style={[styles.cardTitle, { color: colors.primaryText }]}>{label}</Text>
                <Text style={[styles.winRate, { color: DIFF_COLORS[key] }]}>{winRate}%</Text>
              </View>
              <View style={styles.cardGrid}>
                <StatItem label="Oynanan" value={String(d.played)} colors={colors} />
                <StatItem label="Kazanılan" value={String(d.won)} colors={colors} />
                <StatItem label="En İyi" value={formatTime(d.bestTime)} colors={colors} />
                <StatItem label="Ort. Süre" value={formatTime(avg)} colors={colors} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.primaryText }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 60, padding: 4 },
  backText: { fontSize: 14, fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, gap: 12 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
  winRate: { fontSize: 15, fontWeight: '700' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
});
