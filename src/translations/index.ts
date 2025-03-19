
import { TranslationsCollection } from './types';
import { authTranslations } from './auth';
import { navigationTranslations } from './navigation';
import { dashboardTranslations } from './dashboard';
import { contentTranslations } from './content';
import { ltiTranslations } from './lti';
import { contentLibraryTranslations } from './content-library';
import { contentDetailsTranslations } from './content-details';
import { errorTranslations } from './errors';

// Combine all translation collections
export const translations: TranslationsCollection = {
  ...authTranslations,
  ...navigationTranslations,
  ...dashboardTranslations,
  ...contentTranslations,
  ...ltiTranslations,
  ...contentLibraryTranslations,
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
