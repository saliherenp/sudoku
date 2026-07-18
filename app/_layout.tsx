import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SettingsProvider } from '../src/store/useSettings';
import { GameProvider } from '../src/store/useGameContext';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 12 }}>
            Runtime Error
          </Text>
          <ScrollView>
            <Text style={{ fontFamily: 'monospace', fontSize: 13, color: '#333' }}>
              {String(this.state.error)}
              {'\n\n'}
              {(this.state.error as any)?.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <GameProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="game" />
            <Stack.Screen name="stats" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="play" />
          </Stack>
        </GameProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
