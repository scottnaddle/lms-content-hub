
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

// Content library translations type
export interface ContentLibraryTranslations {
  [key: string]: {
    allContent: string;
    videos: string;
    audio: string;
    documents: string;
    pdfs: string;
    search: string;
    searchContent: string;
    filterBy: string;
    sortBy: string;
    newest: string;
    oldest: string;
    mostViewed: string;
    mostDownloaded: string;
    noContent: string;
    noContentDescription: string;
    uploadSomething: string;
    browseAll: string;
    recentlyViewed: string;
    recentlyViewedDescription: string;
    notFoundInCategory: string;
    tags: string;
    searchTags: string;
    allTags: string;
    recent: string;
    noTagsFound: string;
    filteringByTag: string;
    noSearchResults?: string;
  };
}
