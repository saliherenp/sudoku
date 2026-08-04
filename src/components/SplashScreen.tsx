import { useEffect } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const DURATION = 1800;

// Must match `imageWidth` of the expo-splash-screen plugin in app.json, so the
// mark doesn't resize when the native splash hands off to this one.
const LOGO_SIZE = 220;

// Branded splash shown over the app while it settles. Colours are fixed rather
// than themed: it hands off from the native splash screen, which is dark in
// both light and dark mode. The gradient is the app icon's own (#2C3459 →
// #14172A, leaning the same way), so splash and icon read as one thing.
export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFinish, DURATION);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <LinearGradient
      colors={['#2C3459', '#14172A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={styles.container}
    >
      {/* Dead centre and deliberately NOT animated: the native splash already
          drew this exact mark at this exact size and place, so fading it in
          would flash. Only the caption below it animates. */}
      <Image
        source={require('../../assets/splash-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* Absolutely positioned so adding the caption can't push the mark off
          the centre the native splash left it on. */}
      <View style={styles.caption} pointerEvents="none">
        <Animated.Text entering={FadeInDown.delay(400).duration(600)} style={styles.title}>
          Sudoku
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(650).duration(600)} style={styles.subtitle}>
          Zihnini çalıştır
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
  caption: {
    position: 'absolute',
    top: '50%',
    // Half the logo box plus a gap — the drawn mark stops short of the box edge.
    marginTop: LOGO_SIZE / 2 + 20,
    alignItems: 'center',
  },
  title: { color: '#eef1f8', fontSize: 40, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: '#8fa4ea', fontSize: 18, fontWeight: '600', marginTop: 6 },
});
