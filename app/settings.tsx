import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { useSettings, ThemeMode } from '../src/store/useSettings';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { settings, update } = useSettings();

  const themeModes: { key: ThemeMode; label: string }[] = [
    { key: 'light', label: 'Açık' },
    { key: 'dark', label: 'Koyu' },
    { key: 'system', label: 'Sistem' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primaryText }]}>Ayarlar</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>TEMA</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          {themeModes.map(({ key, label }, i) => (
            <TouchableOpacity
              key={key}
              onPress={() => update({ theme: key })}
              style={[
                styles.themeRow,
                i < themeModes.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.thinLine },
              ]}
            >
              <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{label}</Text>
              {settings.theme === key && (
                <Text style={{ color: colors.accent, fontSize: 18 }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>OYUN</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <ToggleRow
            label="Hata Vurgusu"
            desc="Yanlış girişleri renkle göster"
            value={settings.showErrors}
            onToggle={v => update({ showErrors: v })}
            colors={colors}
            accent={colors.accent}
            border={colors.thinLine}
          />
          <ToggleRow
            label="Vurgulama"
            desc="Aynı satır / sütun / 3×3 kutuyu vurgula"
            value={settings.highlightRelated}
            onToggle={v => update({ highlightRelated: v })}
            colors={colors}
            accent={colors.accent}
            border={colors.thinLine}
          />
          <ToggleRow
            label="Otomatik Not Temizleme"
            desc="Rakam girilince ilgili notları sil"
            value={settings.autoNoteClean}
            onToggle={v => update({ autoNoteClean: v })}
            colors={colors}
            accent={colors.accent}
            border={undefined}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ToggleRow({
  label, desc, value, onToggle, colors, accent, border,
}: {
  label: string;
  desc: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: any;
  accent: string;
  border: string | undefined;
}) {
  return (
    <View style={[styles.toggleRow, border && { borderBottomWidth: 1, borderBottomColor: border }]}>
      <View style={styles.toggleText}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.secondaryText }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.thinLine, true: accent }}
        thumbColor="#fff"
      />
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
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowDesc: { fontSize: 13, marginTop: 2 },
});
