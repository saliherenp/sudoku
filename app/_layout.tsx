import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NativeSplash from 'expo-splash-screen';
import { SettingsProvider } from '../src/store/useSettings';
import { GameProvider } from '../src/store/useGameContext';
import { useTheme } from '../src/theme';
import SplashScreen from '../src/components/SplashScreen';

// Hold the native splash until our own one is mounted, so the handoff has no
// white flash in between.
NativeSplash.preventAutoHideAsync().catch(() => {});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    const error: Error | null = this.state.error;
    if (!error) return this.props.children;

    // A stack trace helps while developing but means nothing to a player, so
    // released builds get a plain apology on the splash background instead.
    if (!__DEV__) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.emoji}>😕</Text>
          <Text style={errorStyles.title}>Bir şeyler ters gitti</Text>
          <Text style={errorStyles.body}>
            Beklenmedik bir hata oluştu. Uygulamayı kapatıp yeniden açtığında
            kaldığın yerden devam edebilirsin.
          </Text>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 12 }}>
          Runtime Error
        </Text>
        <ScrollView>
          <Text style={{ fontFamily: 'monospace', fontSize: 13, color: '#333' }}>
            {String(error)}
            {'\n\n'}
            {(error as any)?.stack}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#1c2139',
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#eef1f8', textAlign: 'center' },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#8fa4ea',
    textAlign: 'center',
    marginTop: 12,
  },
});

// Inside the providers so it can follow the app's chosen theme (light/dark/system)
// rather than only the device color scheme.
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  useEffect(() => {
    NativeSplash.hideAsync().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <GameProvider>
          {/* The splash is dark regardless of theme, so match the bar to it. */}
          {showSplash ? <StatusBar style="light" /> : <ThemedStatusBar />}
          {/* The navigator stays mounted underneath the splash so deep links
              resolve while it is still on screen. */}
          <View style={styles.root}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="game" />
              <Stack.Screen name="stats" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="how-to" />
              <Stack.Screen name="about" />
              <Stack.Screen name="play" />
            </Stack>
            {showSplash && (
              <View style={StyleSheet.absoluteFill}>
                <SplashScreen onFinish={handleSplashFinish} />
              </View>
            )}
          </View>
        </GameProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
