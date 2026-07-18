import { createContext, useContext, useState, useEffect, ReactNode, createElement } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export type Settings = {
  theme: ThemeMode;
  showErrors: boolean;
  highlightRelated: boolean;
  autoNoteClean: boolean;
};

const DEFAULT: Settings = {
  theme: 'system',
  showErrors: true,
  highlightRelated: true,
  autoNoteClean: true,
};

const KEY = 'sudoku_settings';

type SettingsContextType = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  loaded: boolean;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT,
  update: () => {},
  loaded: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try { setSettings({ ...DEFAULT, ...JSON.parse(raw) }); } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const update = (patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  return createElement(SettingsContext.Provider, { value: { settings, update, loaded } }, children);
}

export function useSettings() {
  return useContext(SettingsContext);
}
