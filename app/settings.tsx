import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { useSettings, ThemeMode } from '../src/store/useSettings';

const FEEDBACK_EMAIL = 'saliherenparca@gmail.com';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { settings, update } = useSettings();

  const howToPlay = () => router.push('/how-to');
  const about = () => router.push('/about');
  const feedback = async () => {
    const url = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Sudoku Geri Bildirim')}`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else throw new Error('no mail app');
    } catch {
      Alert.alert('Geri Bildirim', `E-posta uygulaması açılamadı. Bize şu adresten ulaşabilirsin:\n${FEEDBACK_EMAIL}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primaryText }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primaryText }]}>Ayarlar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Navigasyon */}
        <Card colors={colors}>
          <NavRow icon="📊" label="İstatistikler" onPress={() => router.push('/stats')} colors={colors} border />
          <NavRow icon="📖" label="Nasıl Oynanır" onPress={howToPlay} colors={colors} />
        </Card>

        {/* Tema + geri bildirim / bildirimler */}
        <Card colors={colors}>
          <ThemeRow
            theme={settings.theme}
            onSelect={t => update({ theme: t })}
            colors={colors}
            border
          />
          <ToggleRow icon="🔊" label="Ses Efekti" value={settings.soundEffects}
            onToggle={v => update({ soundEffects: v })} colors={colors} border />
          <ToggleRow icon="📳" label="Titreşim" value={settings.vibration}
            onToggle={v => update({ vibration: v })} colors={colors} border />
          <ToggleRow icon="🔔" label="Bildirim" value={settings.notifications}
            onToggle={v => update({ notifications: v })} colors={colors} />
        </Card>

        {/* Oyun */}
        <Card colors={colors}>
          <ToggleRow icon="🕐" label="Saat" value={settings.showTimer}
            onToggle={v => update({ showTimer: v })} colors={colors} border />
          <ToggleRow icon="⊗" label="Hata limiti" desc="3 hata yaptığınız için bu oyunu kaybettiniz"
            value={settings.mistakeLimit} onToggle={v => update({ mistakeLimit: v })} colors={colors} border />
          <ToggleRow icon="✚" label="Bölge Vurgusu" desc="Seçilen kutu için sıra, sütun veya bloğu vurgular"
            value={settings.highlightRelated} onToggle={v => update({ highlightRelated: v })} colors={colors} border />
          <ToggleRow icon="🟰" label="Aynı Sayıları Vurgula" desc="Bir kutu seçildiğinde aynı sayının yer aldığı diğer tüm kutular vurgulanır"
            value={settings.highlightSameNumber} onToggle={v => update({ highlightSameNumber: v })} colors={colors} border />
          <ToggleRow icon="🧹" label="Otomatik Temizle" desc="Sayı yerleştirildikten sonra notlar otomatik olarak kaldırılır"
            value={settings.autoNoteClean} onToggle={v => update({ autoNoteClean: v })} colors={colors} border />
          <ToggleRow icon="⚡" label="Otomatik Tamamlama" value={settings.autoComplete}
            onToggle={v => update({ autoComplete: v })} colors={colors} />
        </Card>

        {/* Bilgi / görünüm */}
        <Card colors={colors}>
          <ToggleRow icon="📈" label="Bulmaca Bilgileri" desc="Başlangıçta bulmaca tamamlama oranını göster"
            value={settings.puzzleInfo} onToggle={v => update({ puzzleInfo: v })} colors={colors} border />
          <ToggleRow icon="3️⃣" label="Kalan numara" value={settings.remainingCount}
            onToggle={v => update({ remainingCount: v })} colors={colors} />
        </Card>

        {/* Diğer */}
        <Card colors={colors}>
          <NavRow icon="💬" label="Geri Bildirim" onPress={feedback} colors={colors} border />
          <NavRow icon="ℹ️" label="Hakkında" onPress={about} colors={colors} border />
          <NavRow icon="⏻" label="Çık" onPress={() => router.replace('/')} colors={colors} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

type Colors = ReturnType<typeof useTheme>['colors'];

function Card({ colors, children }: { colors: Colors; children: React.ReactNode }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
      {children}
    </View>
  );
}

function ToggleRow({
  icon, label, desc, value, onToggle, colors, border,
}: {
  icon: string;
  label: string;
  desc?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: Colors;
  border?: boolean;
}) {
  return (
    <View style={[styles.row, border && { borderBottomWidth: 1, borderBottomColor: colors.thinLine }]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{label}</Text>
        {desc ? <Text style={[styles.rowDesc, { color: colors.secondaryText }]}>{desc}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.thinLine, true: colors.accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

const THEME_OPTIONS: { key: ThemeMode; icon: string }[] = [
  { key: 'light', icon: '☀️' },
  { key: 'dark', icon: '🌙' },
  { key: 'system', icon: '📱' },
];

function ThemeRow({
  theme, onSelect, colors, border,
}: {
  theme: ThemeMode;
  onSelect: (t: ThemeMode) => void;
  colors: Colors;
  border?: boolean;
}) {
  return (
    <View style={[styles.row, border && { borderBottomWidth: 1, borderBottomColor: colors.thinLine }]}>
      <Text style={styles.icon}>🎨</Text>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>Tema</Text>
      </View>
      <View style={styles.themeSelect}>
        {THEME_OPTIONS.map(opt => {
          const active = theme === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => onSelect(opt.key)}
              activeOpacity={0.7}
              style={[
                styles.themeOption,
                { borderColor: colors.thinLine },
                active && { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
            >
              <Text style={[styles.themeOptionIcon, active && { opacity: 1 }, !active && { opacity: 0.5 }]}>{opt.icon}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function NavRow({
  icon, label, onPress, colors, border,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  colors: Colors;
  border?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[styles.row, border && { borderBottomWidth: 1, borderBottomColor: colors.thinLine }]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{label}</Text>
      </View>
      <Text style={[styles.chevron, { color: colors.secondaryText }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 30, fontWeight: '400', lineHeight: 30 },
  title: { flex: 1, fontSize: 24, fontWeight: '700' },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 60,
  },
  icon: { fontSize: 22, width: 34 },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 17, fontWeight: '500' },
  rowDesc: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  chevron: { fontSize: 26, fontWeight: '300' },
  themeSelect: { flexDirection: 'row', gap: 8 },
  themeOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionIcon: { fontSize: 18 },
});
