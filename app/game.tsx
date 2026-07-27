import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share, useWindowDimensions, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useAudioPlayer } from 'expo-audio';
import { useTheme } from '../src/theme';
import { useGame } from '../src/store/useGameContext';
import { useStats } from '../src/store/useStats';
import { useSettings } from '../src/store/useSettings';
import SudokuBoard from '../src/components/SudokuBoard';
import NumberPad from '../src/components/NumberPad';
import ControlBar from '../src/components/ControlBar';
import { SHARE_BASE_URL } from '../src/config';

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
  const { width } = useWindowDimensions();
  // Match SudokuBoard's own sizing so the info row lines up with the grid edges.
  const boardWidth = Math.floor(Math.min(width - 32, 360) / 9) * 9 + 5;
  const { state, selectCell, inputDigit, toggleNoteMode, undo, redo, hint, completeBoard, tick, pause, resume, startGame, startSharedGame } = useGame();
  const { recordGame } = useStats();
  const { settings } = useSettings();
  const recordedRef = useRef(false);

  // Measure the board area and the board to pull the controls up by half of the
  // whitespace that sits between the board's bottom edge and the controls.
  const [boardAreaH, setBoardAreaH] = useState(0);
  const [boardH, setBoardH] = useState(0);
  const controlsLift = Math.max(0, (boardAreaH - boardH) / 4);

  // Auto-complete prompt: shown once when few cells remain (until dismissed).
  const [autoCompleteDismissed, setAutoCompleteDismissed] = useState(false);

  const { puzzle, cells, selected, noteMode, errorCount, elapsedSeconds, status, history, future } = state;

  // Record game result once per game; reset when a fresh game starts playing.
  useEffect(() => {
    if (status === 'playing') {
      recordedRef.current = false;
    } else if ((status === 'won' || status === 'lost') && puzzle && !recordedRef.current) {
      recordedRef.current = true;
      recordGame(puzzle.difficulty, status === 'won', elapsedSeconds, status === 'won' && errorCount === 0);
    }
  }, [status]);

  // Haptic feedback: buzz when a new mistake is made (if vibration is enabled).
  const prevErrorRef = useRef(errorCount);
  useEffect(() => {
    if (errorCount > prevErrorRef.current && settings.vibration) {
      Vibration.vibrate(200);
    }
    prevErrorRef.current = errorCount;
  }, [errorCount, settings.vibration]);

  // Sound effect: play a short pop on each move (a new history entry) if enabled.
  // Throttled so very fast input doesn't thrash the audio engine (which would
  // otherwise fight the JS thread and make rapid entry feel like it lags).
  const player = useAudioPlayer(require('../assets/sounds/tap.wav'));
  const prevMovesRef = useRef(history.length);
  const lastSoundRef = useRef(0);
  useEffect(() => {
    if (history.length > prevMovesRef.current && settings.soundEffects) {
      const now = Date.now();
      if (now - lastSoundRef.current > 70) {
        lastSoundRef.current = now;
        player.seekTo(0);
        player.play();
      }
    }
    prevMovesRef.current = history.length;
  }, [history.length, settings.soundEffects]);

  // Reset the auto-complete prompt when a fresh puzzle starts.
  useEffect(() => { setAutoCompleteDismissed(false); }, [puzzle]);

  // Advance the timer only while THIS screen is focused. The reducer ignores
  // TICK unless status is 'playing', so paused/finished games don't advance,
  // and time stops the moment we leave for the home screen.
  useFocusEffect(
    useCallback(() => {
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }, [tick])
  );

  if (!puzzle) {
    router.replace('/');
    return null;
  }

  const isPaused = status === 'paused';
  const isOver = status === 'won' || status === 'lost';
  const filledCount = cells.filter(c => c.value !== 0).length;
  const completion = Math.round((filledCount / 81) * 100);
  const emptyCount = 81 - filledCount;
  const showAutoCompletePrompt =
    settings.autoComplete && status === 'playing' && emptyCount > 0 && emptyCount <= 5 && !autoCompleteDismissed;

  const handleShare = async () => {
    const encoded = puzzle.given.join('');
    // With a hosting URL set, share a clickable https link (WhatsApp linkifies it);
    // the page then opens the app via the sudoku:// deep link. Without it, fall back
    // to the raw deep link (works when pasted, just not auto-clickable).
    const base = SHARE_BASE_URL.replace(/\/$/, '');
    const link = base
      ? `${base}/?p=${encoded}&d=${puzzle.difficulty}`
      : `sudoku://play?p=${encoded}&d=${puzzle.difficulty}`;
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
      {/* Top bar: home (left), share + pause + settings (right) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={styles.iconBtn}
          accessibilityLabel="Ana ekran"
        >
          <Text style={[styles.topIcon, { color: colors.primaryText }]}>⌂</Text>
        </TouchableOpacity>
        <View style={styles.topRight}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.iconBtn}
            accessibilityLabel="Paylaş"
          >
            <Text style={[styles.topIcon, { color: colors.primaryText }]}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePauseResume}
            style={styles.iconBtn}
            accessibilityLabel={isPaused ? 'Devam et' : 'Duraklat'}
          >
            {isPaused ? (
              <Text style={[styles.topIcon, { color: colors.primaryText }]}>▶</Text>
            ) : (
              <View style={styles.pauseIcon}>
                <View style={[styles.pauseBar, { backgroundColor: colors.primaryText }]} />
                <View style={[styles.pauseBar, { backgroundColor: colors.primaryText }]} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.iconBtn}
            accessibilityLabel="Ayarlar"
          >
            <Text style={[styles.topIcon, { color: colors.primaryText }]}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Board */}
      <View
        style={styles.boardArea}
        onLayout={e => setBoardAreaH(e.nativeEvent.layout.height)}
      >
        <View
          style={{ width: boardWidth }}
          onLayout={e => setBoardH(e.nativeEvent.layout.height)}
        >
          {/* Info row sits directly above the grid, aligned to its edges */}
          <View style={styles.infoRow}>
            <Text style={[styles.errorText, { color: errorCount > 0 ? colors.errorText : colors.secondaryText }]}>
              Hata: {errorCount}{settings.mistakeLimit ? '/3' : ''}
            </Text>
            <Text style={[styles.diffLabel, { color: colors.secondaryText }]}>
              {DIFF_LABELS[puzzle.difficulty]}{settings.puzzleInfo ? ` · %${completion}` : ''}
            </Text>
            {settings.showTimer ? (
              <TouchableOpacity onPress={handlePauseResume}>
                <Text style={[styles.timer, { color: colors.primaryText }]}>
                  ⏱ {formatTime(elapsedSeconds)}
                </Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
          </View>
          <SudokuBoard
            cells={cells}
            selected={selected}
            onSelect={selectCell}
            showErrors={settings.showErrors}
            highlightRelated={settings.highlightRelated}
            highlightSameNumber={settings.highlightSameNumber}
          />
        </View>
      </View>

      {/* Controls */}
      {!isPaused && !isOver && (
        <View style={[styles.controls, { transform: [{ translateY: -controlsLift }] }]}>
          <View style={styles.controlBarWrap}>
            <ControlBar
              noteMode={noteMode}
              onToggleNote={toggleNoteMode}
              onErase={handleErase}
              onUndo={undo}
              onRedo={redo}
              onHint={hint}
              canUndo={history.length > 0}
              canRedo={future.length > 0}
            />
          </View>
          <View style={{ height: 16 }} />
          <NumberPad
            onPress={inputDigit}
            cells={cells}
            noteMode={noteMode}
            showRemaining={settings.remainingCount}
          />
        </View>
      )}

      {/* Auto-complete prompt (bottom-right) */}
      {showAutoCompletePrompt && (
        <View style={[styles.autoComplete, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
          <Text style={[styles.autoCompleteText, { color: colors.primaryText }]}>
            Son {emptyCount} kutu kaldı. Otomatik tamamlansın mı?
          </Text>
          <View style={styles.autoCompleteBtns}>
            <TouchableOpacity onPress={() => setAutoCompleteDismissed(true)} style={styles.autoCompleteNo}>
              <Text style={[styles.autoCompleteNoText, { color: colors.secondaryText }]}>Hayır</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={completeBoard} style={[styles.autoCompleteYes, { backgroundColor: colors.accent }]}>
              <Text style={styles.autoCompleteYesText}>Evet</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pause overlay */}
      {isPaused && (
        <View style={[styles.resultOverlay, { backgroundColor: colors.pageBackground }]}>
          <Text style={styles.resultEmoji}>⏸️</Text>
          <Text style={[styles.resultTitle, { color: colors.primaryText }]}>Oyun Duraklatıldı</Text>
          <Text style={[styles.resultSub, { color: colors.secondaryText }]}>
            {DIFF_LABELS[puzzle.difficulty]} · {formatTime(elapsedSeconds)}
          </Text>
          <TouchableOpacity
            onPress={resume}
            style={[styles.resultBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.resultBtnText}>Devam Et</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Win/Loss overlay */}
      {isOver && (
        <View style={[styles.resultOverlay, { backgroundColor: colors.pageBackground }]}>
          <Text style={styles.resultEmoji}>{status === 'won' ? (errorCount === 0 ? '✨' : '🎉') : '😞'}</Text>
          <Text style={[styles.resultTitle, { color: colors.primaryText }]}>
            {status === 'won' ? (errorCount === 0 ? 'Muhteşem Oyun!' : 'Tebrikler!') : 'Oyun Bitti'}
          </Text>
          {status === 'won' && errorCount === 0 && (
            <Text style={[styles.perfectBadge, { color: colors.accent }]}>Hatasız çözdün 🏆</Text>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topIcon: { fontSize: 21, fontWeight: '600' },
  pauseIcon: { flexDirection: 'row', gap: 3 },
  pauseBar: { width: 3.5, height: 16, borderRadius: 1.5 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  diffLabel: { fontSize: 14, fontWeight: '600' },
  timer: { fontSize: 15, fontWeight: '700' },
  errorText: { fontSize: 14, fontWeight: '600' },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  controls: { paddingBottom: 24 },
  controlBarWrap: { paddingHorizontal: 16 },
  resultOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: { fontSize: 28, fontWeight: '800' },
  autoComplete: {
    position: 'absolute',
    right: 16,
    bottom: 28,
    maxWidth: 260,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  autoCompleteText: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  autoCompleteBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  autoCompleteNo: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  autoCompleteNoText: { fontSize: 14, fontWeight: '600' },
  autoCompleteYes: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  autoCompleteYesText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  perfectBadge: { fontSize: 15, fontWeight: '700', marginTop: 8 },
  resultSub: { fontSize: 16, marginTop: 8, marginBottom: 32 },
  resultBtn: { paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16 },
  resultBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resultSecondaryBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12 },
  resultSecondaryText: { fontSize: 15, fontWeight: '600' },
});
