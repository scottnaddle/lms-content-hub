
import { TranslationsCollection } from './types';
import { authTranslations } from './auth';
import { navigationTranslations } from './navigation';
import { dashboardTranslations } from './dashboard';
import { contentTranslations } from './content';
import { ltiTranslations } from './lti';
import { errorTranslations } from './errors';
import { contentDetailsTranslations } from './content-details';

// Import but don't merge ContentLibraryTranslations type which is different from TranslationsCollection
import { contentLibraryTranslations } from './content-library';

// Combine all translation collections
export const translations: TranslationsCollection = {
  ...authTranslations,
  ...navigationTranslations,
  ...dashboardTranslations,
  ...contentTranslations,
  ...ltiTranslations,
  ...contentDetailsTranslations,
  ...errorTranslations,
};

// Utility function to translate text
export function translate<K extends keyof typeof translations>(
  key: K,
  lang: 'en' | 'ru' | 'uz' | 'ko'
): string {
  if (translations[key]) {
    return translations[key][lang];
  }
  console.warn(`Translation missing for key: ${key}, language: ${lang}`);
  return `${key}`;
}

// Export contentLibraryTranslations separately since it has a different structure
export { contentLibraryTranslations };
