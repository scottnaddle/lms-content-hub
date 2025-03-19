
import { TranslationsCollection } from './types';
import { navigationGeneralTranslations } from './navigation-general';
import { statisticsTranslations } from './statistics-translations';

// Combine all navigation-related translations
export const navigationTranslations: TranslationsCollection = {
  ...navigationGeneralTranslations,
  ...statisticsTranslations,
};
