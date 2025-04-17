import { TranslationsCollection } from './types';
import { navigationGeneralTranslations } from './navigation-general';
import { statisticsTranslations } from './statistics-translations';

// Combine all navigation-related translations
export const navigationTranslations: TranslationsCollection = {
  ...navigationGeneralTranslations,
  ...statisticsTranslations,
  en: {
    videos: 'Videos',
    audio: 'Audio',
    documents: 'Documents',
    tags: 'Tags',
  },
  ko: {
    videos: '비디오',
    audio: '오디오',
    documents: '문서',
    tags: '태그',
  }
};
