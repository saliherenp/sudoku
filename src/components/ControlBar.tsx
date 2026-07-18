import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

type Props = {
  noteMode: boolean;
  onToggleNote: () => void;
  onErase: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onShare: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

type ControlItem = {
  label: string;
  icon: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
};

export default function ControlBar({ noteMode, onToggleNote, onErase, onUndo, onRedo, onHint, onShare, canUndo, canRedo }: Props) {
  const { colors } = useTheme();

  const items: ControlItem[] = [
    { label: 'Not', icon: '✏️', onPress: onToggleNote, active: noteMode },
    { label: 'Sil', icon: '⌫', onPress: onErase },
    { label: 'Geri Al', icon: '↩', onPress: onUndo, disabled: !canUndo },
    { label: 'Yinele', icon: '↪', onPress: onRedo, disabled: !canRedo },
    { label: 'İpucu', icon: '💡', onPress: onHint },
    { label: 'Paylaş', icon: '🔗', onPress: onShare },
  ];

  return (
    <View style={styles.row}>
      {items.map(item => (
        <TouchableOpacity
          key={item.label}
          onPress={item.onPress}
          disabled={item.disabled}
          activeOpacity={0.6}
          style={[
            styles.button,
            item.active && { backgroundColor: colors.accent },
            item.disabled && { opacity: 0.35 },
          ]}
        >
          {item.active && item.label === 'Not' && (
            <View style={[styles.activeBadge, { backgroundColor: colors.hintColor }]}>
              <Text style={styles.activeBadgeText}>AÇIK</Text>
            </View>
          )}
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={[
            styles.label,
            { color: item.active ? '#fff' : colors.secondaryText },
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    minHeight: 50,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
    position: 'relative',
  },
  icon: { fontSize: 22 },
  label: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  activeBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  activeBadgeText: { fontSize: 8, color: '#fff', fontWeight: '700' },
});
