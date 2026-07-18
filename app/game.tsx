import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../src/theme';
import { useGame } from '../src/store/useGameContext';
import { useStats } from '../src/store/useStats';
import { useSettings } from '../src/store/useSettings';
import SudokuBoard from '../src/components/SudokuBoard';
import NumberPad from '../src/components/NumberPad';
import ControlBar from '../src/components/ControlBar';

const DIFF_LABELS: Record<string, string> = {
  easy: 'Kolay', medium: 'Orta', hard: 'Zor', expert: 'Uzman',
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function GameScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { state, selectCell, inputDigit, toggleNoteMode, undo, redo, hint, pause, resume, startGame, startSharedGame } = useGame();
  const { recordGame } = useStats();
  const { settings } = useSettings();
  const recordedRef = useRef(false);

  const { puzzle, cells, selected, noteMode, errorCount, elapsedSeconds, status, history, future } = state;

  // Record game result once per game; reset when a fresh game starts playing.
  useEffect(() => {
    if (status === 'playing') {
      recordedRef.current = false;
    } else if ((status === 'won' || status === 'lost') && puzzle && !recordedRef.current) {
      recordedRef.current = true;
      recordGame(puzzle.difficulty, status === 'won', elapsedSeconds);
    }
  }, [status]);

  if (!puzzle) {
    router.replace('/');
    return null;
  }

  const isPaused = status === 'paused';
  const isOver = status === 'won' || status === 'lost';

  const handleShare = async () => {
    const encoded = puzzle.given.join('');
    const link = `sudoku://play?p=${encoded}&d=${puzzle.difficulty}`;
    await Clipboard.setStringAsync(link);
    try {
      await Share.share({ message: `Bu Sudoku bulmacasını çözebilir misin?\n${link}` });
    } catch {
      // Share sheet unavailable (e.g. web) — clipboard copy is the fallback.
      Alert.alert('Bağlantı Kopyalandı', 'Bulmaca bağlantısı panoya kopyalandı.');
    }
  };

  const handleRetry = () => {
    recordedRef.current = false;
    startSharedGame(puzzle); // same puzzle, progress reset
  };

  const handleNewGame = () => {
    recordedRef.current = false;
    startGame(puzzle.difficulty); // fresh puzzle, same difficulty
  };

  const handleErase = () => {
    if (selected !== null) inputDigit(0);
  };

  const handlePauseResume = () => {
    if (isPaused) resume();
    else pause();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.pageBackground }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.accent }]}>← Ana Ekran</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={[styles.diffLabel, { color: colors.secondaryText }]}>
            {DIFF_LABELS[puzzle.difficulty]}
          </Text>
          <TouchableOpacity onPress={handlePauseResume}>
            <Text style={[styles.timer, { color: colors.primaryText }]}>
              {isPaused ? '⏸ Duraklatıldı' : `⏱ ${formatTime(elapsedSeconds)}`}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorBadge}>
          <Text style={[styles.errorText, { color: errorCount > 0 ? colors.errorText : colors.secondaryText }]}>
            Hata: {errorCount}/3
          </Text>
        </View>
      </View>

      {/* Board */}
      <View style={[styles.boardArea, isPaused && styles.blurred]}>
        {isPaused ? (
          <View style={styles.pauseOverlay}>
            <Text style={[styles.pauseText, { color: colors.primaryText }]}>⏸ Oyun Duraklatıldı</Text>
            <TouchableOpacity onPress={resume} style={[styles.resumeBtn, { backgroundColor: colors.accent }]}>
              <Text style={styles.resumeBtnText}>Devam Et</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <SudokuBoard
            cells={cells}
            selected={selected}
            onSelect={selectCell}
            showErrors={settings.showErrors}
            highlightRelated={settings.highlightRelated}
            solution={puzzle.solution}
          />
        )}
      </View>

      {/* Controls */}
      {!isPaused && !isOver && (
        <View style={styles.controls}>
          <NumberPad
            onPress={inputDigit}
            cells={cells}
          />
          <View style={{ height: 16 }} />
          <ControlBar
            noteMode={noteMode}
            onToggleNote={toggleNoteMode}
            onErase={handleErase}
            onUndo={undo}
            onRedo={redo}
            onHint={hint}
            onShare={handleShare}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
          />
        </View>
      )}

      {/* Win/Loss overlay */}
      {isOver && (
        <View style={[styles.resultOverlay, { backgroundColor: colors.pageBackground }]}>
          <Text style={styles.resultEmoji}>{status === 'won' ? '🎉' : '😞'}</Text>
          <Text style={[styles.resultTitle, { color: colors.primaryText }]}>
            {status === 'won' ? 'Tebrikler!' : 'Oyun Bitti'}
          </Text>
          <Text style={[styles.resultSub, { color: colors.secondaryText }]}>
            {status === 'won'
              ? `${DIFF_LABELS[puzzle.difficulty]} · ${formatTime(elapsedSeconds)}`
              : '3 hata yaptınız.'}
          </Text>
          {status === 'won' ? (
            <TouchableOpacity
              onPress={handleNewGame}
              style={[styles.resultBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.resultBtnText}>Yeni Oyun</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleRetry}
              style={[styles.resultBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.resultBtnText}>Tekrar Dene</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={styles.resultSecondaryBtn}
          >
            <Text style={[styles.resultSecondaryText, { color: colors.secondaryText }]}>Ana Ekrana Dön</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 14, fontWeight: '600' },
  topCenter: { flex: 1, alignItems: 'center' },
  diffLabel: { fontSize: 12, fontWeight: '500' },
  timer: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  errorBadge: {},
  errorText: { fontSize: 13, fontWeight: '600' },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  blurred: { opacity: 0.05 },
  pauseOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: { fontSize: 20, fontWeight: '700' },
  resumeBtn: { marginTop: 20, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  resumeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  controls: { paddingHorizontal: 16, paddingBottom: 24 },
  resultOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: { fontSize: 28, fontWeight: '800' },
  resultSub: { fontSize: 16, marginTop: 8, marginBottom: 32 },
  resultBtn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16 },
  resultBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resultSecondaryBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12 },
  resultSecondaryText: { fontSize: 15, fontWeight: '600' },
});
