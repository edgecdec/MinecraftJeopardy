export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  success: string;
  error: string;
}

export interface ThemeAssets {
  bgImage: string; // URL or Gradient
  headerTexture?: string;
  fontFamily: string;
  soundPack: string; // 'minecraft' | 'stardew' | 'default'
}

export interface GameTheme {
  id: string;
  name: string; // Display Name (e.g. "Minecraft Jeopardy")
  colors: ThemeColors;
  assets: ThemeAssets;
}

export interface Question {
  difficulty: number;
  clue: string;
  answer: string;
}

export interface Category {
  name: string;
  description?: string;
  pool: Question[];
}

export interface GameData {
  id: string; // 'minecraft' | 'stardew'
  categoryCount?: number; // Default to 6 if omitted
  categories: Category[];
  finalJeopardy: { category: string; clue: string; answer: string }[];
}
