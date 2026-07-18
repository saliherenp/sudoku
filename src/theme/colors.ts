export const LightColors = {
  // Backgrounds
  pageBackground: '#FBFBF9',
  boardBackground: '#FFFFFF',
  cardBackground: '#FFFFFF',
  cardBorder: '#DEDFDA',
  sceneBg: '#E6E6E2',

  // Board
  thinLine: '#E9E9E4',
  thickLine: '#C5C6C2',
  boardBorder: '#DEDFDA',

  // Text
  givenNumber: '#262B36',
  playerNumber: '#3F57C9',
  primaryText: '#23262F',
  secondaryText: '#9296A0',

  // Accent
  accent: '#4257CE',

  // Cell states
  selectedCell: '#BFCDF6',
  highlightCell: '#EFF1FB',
  sameNumberCell: '#D9E1F9',
  errorCell: '#FBE7E8',
  errorText: '#D8434A',
  hintColor: '#3BAE7C',

  // Difficulty colors
  easy: '#3BAE7C',
  medium: '#4257CE',
  hard: '#E3973A',
  expert: '#D2566B',

  // Pencil marks
  pencilMark: '#A6A9B4',
} as const;

export const DarkColors = {
  // Backgrounds
  pageBackground: '#12141A',
  boardBackground: '#1A1D26',
  cardBackground: '#1E2130',
  cardBorder: '#2C3040',
  sceneBg: '#12141A',

  // Board — light enough to show on ALL dark cell backgrounds
  thinLine: '#3A4055',
  thickLine: '#6872A0',
  boardBorder: '#5A6282',

  // Text
  givenNumber: '#E8EAF4',
  playerNumber: '#8BA8FF',
  primaryText: '#F0F2FC',
  secondaryText: '#7A809A',

  // Accent
  accent: '#4F66E8',

  // Cell states — clearly distinct from each other
  selectedCell: '#3A5099',     // bright blue: clearly selected
  highlightCell: '#222840',    // subtle hint, but clearly different from background
  sameNumberCell: '#2B3C74',   // mid blue: related to selected but softer
  errorCell: '#4A1F28',
  errorText: '#FF7070',
  hintColor: '#3BAE7C',

  // Difficulty colors
  easy: '#3BAE7C',
  medium: '#4F66E8',
  hard: '#E3973A',
  expert: '#D2566B',

  // Pencil marks
  pencilMark: '#6870A0',
} as const;

export type ThemeColors = Record<keyof typeof LightColors, string>;
