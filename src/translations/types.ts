
// Define available languages
export type Language = 'en' | 'ru' | 'uz' | 'ko';

// Translation dictionary types
export interface TranslationEntry {
  en: string;
  ru: string;
  uz: string;
  ko: string;
}

export interface TranslationsCollection {
  [key: string]: TranslationEntry;
}
