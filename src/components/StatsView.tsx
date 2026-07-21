import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { useStats } from '../store/useStats';
import { Difficulty } from '../engine/types';

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

export default function StatsView({ title }: { title?: string }) {
  const { colors } = useTheme();
  const { stats } = useStats();

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {title ? <Text style={[styles.title, { color: colors.primaryText }]}>{title}</Text> : null}
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
            <View style={[styles.perfectRow, { borderTopColor: colors.thinLine }]}>
              <Text style={styles.perfectIcon}>✨</Text>
              <Text style={[styles.perfectLabel, { color: colors.secondaryText }]}>Muhteşem Oyun</Text>
              <Text style={[styles.perfectValue, { color: DIFF_COLORS[key] }]}>{d.perfect}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
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
  scroll: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4, marginLeft: 4 },
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
  perfectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  perfectIcon: { fontSize: 16, marginRight: 8 },
  perfectLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  perfectValue: { fontSize: 20, fontWeight: '800' },
});
