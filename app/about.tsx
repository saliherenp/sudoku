import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useTheme } from '../src/theme';

export default function AboutScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primaryText }]}>Hakkında</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.logo}>🧩</Text>
        <Text style={[styles.appName, { color: colors.primaryText }]}>Sudoku</Text>
        <Text style={[styles.tagline, { color: colors.secondaryText }]}>Klasik bulmaca oyunu</Text>
        <Text style={[styles.version, { color: colors.secondaryText }]}>Sürüm {version}</Text>

        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardText, { color: colors.secondaryText }]}>
            4 zorluk seviyesi, not modu, ipucu, istatistikler ve bulmaca paylaşımı ile
            klasik Sudoku deneyimi.
          </Text>
        </View>

        <Text style={[styles.footer, { color: colors.secondaryText }]}>
          Salih Eren Parça tarafından geliştirildi.
        </Text>
      </View>
    </SafeAreaView>
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
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 32, paddingTop: 40 },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 30, fontWeight: '800' },
  tagline: { fontSize: 15, marginTop: 4 },
  version: { fontSize: 13, marginTop: 12 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginTop: 28 },
  cardText: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  footer: { fontSize: 13, marginTop: 'auto', marginBottom: 24 },
});
