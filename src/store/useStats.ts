import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Difficulty } from '../engine/types';

export type DiffStats = {
  played: number;
  won: number;
  perfect: number;          // "Muhteşem Oyun" — hatasız kazanılan oyunlar
  bestTime: number | null;  // seconds
  totalTime: number;        // total seconds of won games
};

export type StatsData = Record<Difficulty, DiffStats>;

const EMPTY_DIFF: DiffStats = { played: 0, won: 0, perfect: 0, bestTime: null, totalTime: 0 };

const DEFAULT: StatsData = {
  easy: { ...EMPTY_DIFF },
  medium: { ...EMPTY_DIFF },
  hard: { ...EMPTY_DIFF },
  expert: { ...EMPTY_DIFF },
};

const KEY = 'sudoku_stats';

export function useStats() {
  const [stats, setStats] = useState<StatsData>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<StatsData>;
          // Merge each difficulty over EMPTY_DIFF so older saves without the
          // new `perfect` field don't come back as undefined.
          const merged = { ...DEFAULT };
          (Object.keys(DEFAULT) as Difficulty[]).forEach(k => {
            merged[k] = { ...EMPTY_DIFF, ...(saved[k] ?? {}) };
          });
          setStats(merged);
        } catch {}
      }
    });
  }, []);

  const recordGame = async (difficulty: Difficulty, won: boolean, seconds: number, flawless = false) => {
    setStats(prev => {
      const d = prev[difficulty];
      const next: DiffStats = {
        played: d.played + 1,
        won: d.won + (won ? 1 : 0),
        perfect: d.perfect + (won && flawless ? 1 : 0),
        totalTime: d.totalTime + (won ? seconds : 0),
        bestTime: won
          ? (d.bestTime === null ? seconds : Math.min(d.bestTime, seconds))
          : d.bestTime,
      };
      const updated = { ...prev, [difficulty]: next };
      AsyncStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { stats, recordGame };
}
