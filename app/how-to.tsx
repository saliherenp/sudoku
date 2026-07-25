import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';

const RULES: { title: string; body: string }[] = [
  {
    title: '🎯 Amaç',
    body: '9×9\'luk tabloyu, her satır, her sütun ve her 3×3 kutu 1–9 rakamlarını birer kez içerecek şekilde doldurmak.',
  },
  {
    title: '✏️ Rakam Girme',
    body: 'Boş bir kutuya dokun, ardından alttaki sayı tuşlarından bir rakam seç. Aynı rakama tekrar basmak (kutu kırmızıysa) rakamı siler.',
  },
  {
    title: '📝 Not Modu',
    body: '"Not" düğmesini açıp bir kutuya birden fazla küçük aday rakam yazabilirsin. Doğru rakamı yerleştirince ilgili notlar otomatik temizlenebilir (ayarlardan).',
  },
  {
    title: '❌ Hatalar',
    body: 'Yanlış rakam girersen kutu kırmızı olur ve hata sayacı artar. "Hata limiti" açıkken 3 hatada oyun biter (ayarlardan kapatılabilir).',
  },
  {
    title: '💡 İpucu & Geri Al',
    body: 'İpucu seçili boş kutuya doğru rakamı koyar. Geri Al / Yinele ile hamlelerini yönetebilirsin.',
  },
  {
    title: '✨ Muhteşem Oyun',
    body: 'Bir bulmacayı hiç hata yapmadan bitirirsen "Muhteşem Oyun" kazanırsın ve istatistiklerine eklenir.',
  },
];

export default function HowToScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primaryText }]}>Nasıl Oynanır</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {RULES.map(r => (
          <View key={r.title} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.primaryText }]}>{r.title}</Text>
            <Text style={[styles.cardBody, { color: colors.secondaryText }]}>{r.body}</Text>
          </View>
        ))}
      </ScrollView>
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
  scroll: { padding: 16, gap: 12 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardBody: { fontSize: 14, lineHeight: 21 },
});
