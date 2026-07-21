import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Difficulty } from '../engine/types';

type Props = {
  visible: boolean;
  onSelect: (d: Difficulty) => void;
  onClose: () => void;
};

const LEVELS: { key: Difficulty; label: string }[] = [
  { key: 'easy',   label: 'Kolay'  },
  { key: 'medium', label: 'Orta'   },
  { key: 'hard',   label: 'Zor'    },
  { key: 'expert', label: 'Uzman'  },
];

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: '#3BAE7C',
  medium: '#4257CE',
  hard: '#E3973A',
  expert: '#D2566B',
};

const HIDDEN = 500;

export default function DifficultySheet({ visible, onSelect, onClose }: Props) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(HIDDEN)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: HIDDEN, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.cardBackground, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.thinLine }]} />
          <Text style={[styles.title, { color: colors.primaryText }]}>Zorluk Seç</Text>
          {LEVELS.map((level, i) => (
            <TouchableOpacity
              key={level.key}
              onPress={() => onSelect(level.key)}
              activeOpacity={0.7}
              style={[
                styles.levelRow,
                i < LEVELS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.thinLine },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: DIFF_COLORS[level.key] }]} />
              <Text style={[styles.levelLabel, { color: colors.primaryText }]}>{level.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,30,42,0.42)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 16 },
  levelLabel: { fontSize: 17, fontWeight: '600' },
});
