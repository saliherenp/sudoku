import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const DURATION = 1800;

// Branded splash shown over the app while it settles. Colours are fixed rather
// than themed: it hands off from the native splash screen, which is dark in
// both light and dark mode.
export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFinish, DURATION);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <LinearGradient
      colors={['#292f51', '#1c2139', '#161a2d']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <Animated.Image
        entering={FadeIn.duration(700)}
        source={require('../../assets/splash-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Animated.Text entering={FadeInDown.delay(400).duration(600)} style={styles.title}>
        Sudoku
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(650).duration(600)} style={styles.subtitle}>
        Zihnini çalıştır
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 180, height: 180, marginBottom: 40 },
  title: { color: '#eef1f8', fontSize: 40, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: '#8fa4ea', fontSize: 18, fontWeight: '600', marginTop: 6 },
});
