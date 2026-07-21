import { createContext, useContext, useState, useEffect, ReactNode, createElement } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// expo-notifications throws at import time in Expo Go on Android (remote push was
// removed in SDK 53). Load it lazily inside try/catch so the app never crashes;
// it simply reports "unavailable" there and works in a real dev/production build.
type NotificationsModule = typeof import('expo-notifications');
let Notifications: NotificationsModule | null = null;
let notifLoadTried = false;

function getNotifications(): NotificationsModule | null {
  if (notifLoadTried) return Notifications;
  notifLoadTried = true;
  try {
    Notifications = require('expo-notifications');
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    Notifications = null;
  }
  return Notifications;
}

export function notificationsSupported(): boolean {
  return getNotifications() !== null;
}

// Turn the daily reminder on (asks permission + schedules) or off (cancels).
// Returns true if it ended up enabled.
async function applyNotifications(enabled: boolean): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false; // unavailable (e.g. Expo Go on Android)
  try {
    if (!enabled) {
      await N.cancelAllScheduledNotificationsAsync();
      return false;
    }
    const perm = await N.requestPermissionsAsync();
    if (!perm.granted) return false;
    // Android needs a channel for scheduled notifications to be shown.
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('reminders', {
        name: 'Hatırlatmalar',
        importance: N.AndroidImportance.DEFAULT,
      });
    }
    await N.cancelAllScheduledNotificationsAsync();
    await N.scheduleNotificationAsync({
      content: { title: 'Sudoku vakti! 🧩', body: 'Bugünkü bulmacanı çözmeye ne dersin?' },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
        channelId: 'reminders',
      },
    });
    return true;
  } catch {
    return false;
  }
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type Settings = {
  theme: ThemeMode;
  showErrors: boolean;          // internal — hatalı girişleri kırmızı göster (her zaman açık)
  // Geri bildirim
  soundEffects: boolean;        // Ses Efekti        (placeholder)
  vibration: boolean;           // Titreşim          (placeholder)
  notifications: boolean;       // Bildirim          (placeholder)
  // Oyun
  showTimer: boolean;           // Saat              (canlı)
  mistakeLimit: boolean;        // Hata limiti       (canlı)
  highlightRelated: boolean;    // Bölge Vurgusu     (canlı)
  highlightSameNumber: boolean; // Aynı Sayıları Vurgula (canlı)
  autoNoteClean: boolean;       // Otomatik Temizle  (canlı)
  autoComplete: boolean;        // Otomatik Tamamlama (placeholder)
  // Bilgi
  puzzleInfo: boolean;          // Bulmaca Bilgileri (placeholder)
  remainingCount: boolean;      // Kalan numara      (canlı)
};

const DEFAULT: Settings = {
  theme: 'system',
  showErrors: true,
  soundEffects: true,
  vibration: false,
  notifications: false,
  showTimer: true,
  mistakeLimit: true,
  highlightRelated: true,
  highlightSameNumber: true,
  autoNoteClean: true,
  autoComplete: false,
  puzzleInfo: false,
  remainingCount: true,
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
        try {
          const saved = { ...DEFAULT, ...JSON.parse(raw) } as Settings;
          setSettings(saved);
          // Re-arm the daily reminder if it was on last time; turn the stored
          // flag off if it can't be armed (unavailable / permission gone).
          if (saved.notifications) {
            applyNotifications(true).then(ok => {
              if (!ok) setSettings(prev => persist({ ...prev, notifications: false }));
            });
          }
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const persist = (next: Settings) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next));
    return next;
  };

  const update = (patch: Partial<Settings>) => {
    setSettings(prev => persist({ ...prev, ...patch }));
    // Notifications need permission + (re)scheduling; revert the toggle if the
    // user declines the OS permission prompt.
    if (patch.notifications !== undefined) {
      applyNotifications(patch.notifications).then(ok => {
        if (patch.notifications && !ok) {
          setSettings(prev => persist({ ...prev, notifications: false }));
          Alert.alert(
            'Bildirimler kullanılamıyor',
            notificationsSupported()
              ? 'Bildirim izni verilmedi. Cihaz ayarlarından izin verebilirsiniz.'
              : 'Bildirimler Expo Go\'da çalışmaz; bunun için bir geliştirme derlemesi (dev build) gerekir.',
          );
        }
      });
    }
  };

  return createElement(SettingsContext.Provider, { value: { settings, update, loaded } }, children);
}

export function useSettings() {
  return useContext(SettingsContext);
}
