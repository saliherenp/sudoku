import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Difficulty } from '../engine/types';

type Props = {
  visible: boolean;
  onSelect: (d: Difficulty) => void;
  onClose: () => void;
};

const LEVELS: { key: Difficulty; label: string; desc: string }[] = [
  { key: 'easy',   label: 'Kolay',  desc: '36–46 ipucu' },
  { key: 'medium', label: 'Orta',   desc: '28–35 ipucu' },
  { key: 'hard',   label: 'Zor',    desc: '23–27 ipucu' },
  { key: 'expert', label: 'Uzman',  desc: '17–22 ipucu' },
];

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: '#3BAE7C',
  medium: '#4257CE',
  hard: '#E3973A',
  expert: '#D2566B',
};

export default function DifficultySheet({ visible, onSelect, onClose }: Props) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -300, duration: 200, useNativeDriver: true }),
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
          <Text style={[styles.title, { color: colors.primaryText }]}>Zorluk Seç</Text>
          {LEVELS.map(level => (
            <TouchableOpacity
              key={level.key}
              onPress={() => onSelect(level.key)}
              activeOpacity={0.7}
              style={[styles.levelRow, { borderBottomColor: colors.thinLine }]}
            >
              <View style={[styles.dot, { backgroundColor: DIFF_COLORS[level.key] }]} />
              <View style={styles.levelText}>
                <Text style={[styles.levelLabel, { color: colors.primaryText }]}>{level.label}</Text>
                <Text style={[styles.levelDesc, { color: colors.secondaryText }]}>{level.desc}</Text>
              </View>
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
    justifyContent: 'flex-start',
  },
  sheet: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 16 },
  levelText: { flex: 1 },
  levelLabel: { fontSize: 17, fontWeight: '600' },
  levelDesc: { fontSize: 13, marginTop: 2 },
});
