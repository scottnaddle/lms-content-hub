
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'en' | 'ru' | 'uz' | 'ko';

// Create the translations dictionary
export const translations = {
  // Auth related translations
  login: {
    en: 'Login',
    ru: 'Войти',
    uz: 'Kirish',
    ko: '로그인',
  },
  register: {
    en: 'Register',
    ru: 'Регистрация',
    uz: 'Ro\'yxatdan o\'tish',
    ko: '회원가입',
  },
  email: {
    en: 'Email',
    ru: 'Электронная почта',
    uz: 'Elektron pochta',
    ko: '이메일',
  },
  password: {
    en: 'Password',
    ru: 'Пароль',
    uz: 'Parol',
    ko: '비밀번호',
  },
  username: {
    en: 'Username',
    ru: 'Имя пользователя',
    uz: 'Foydalanuvchi nomi',
    ko: '사용자 이름',
  },
  socialLogin: {
    en: 'Login with social account',
    ru: 'Войти через соцсеть',
    uz: 'Ijtimoiy tarmoq orqali kirish',
    ko: '소셜 계정으로 로그인',
  },
  socialRegister: {
    en: 'Register with social account',
    ru: 'Зарегистрироваться через соцсеть',
    uz: 'Ijtimoiy tarmoq orqali ro\'yxatdan o\'tish',
    ko: '소셜 계정으로 회원가입',
  },
  loading: {
    en: 'Loading...',
    ru: 'Загрузка...',
    uz: 'Yuklanmoqda...',
    ko: '로딩 중...',
  },
  loggingIn: {
    en: 'Logging in...',
    ru: 'Вход в систему...',
    uz: 'Tizimga kirilmoqda...',
    ko: '로그인 중...',
  },
  registering: {
    en: 'Registering...',
    ru: 'Регистрация...',
    uz: 'Ro\'yxatdan o\'tilmoqda...',
    ko: '회원가입 중...',
  },
  welcome: {
    en: 'Welcome to Learning Content Hub',
    ru: 'Добро пожаловать в Learning Content Hub',
    uz: 'Learning Content Hub ga xush kelibsiz',
    ko: '학습 콘텐츠 허브에 오신 것을 환영합니다',
  },
  invalidEmail: {
    en: 'Please enter a valid email address',
    ru: 'Пожалуйста, введите действительный адрес электронной почты',
    uz: 'Iltimos, to\'g\'ri elektron pochta manzilini kiriting',
    ko: '올바른 이메일 주소를 입력해주세요',
  },
  passwordLength: {
    en: 'Password must be at least 6 characters',
    ru: 'Пароль должен содержать не менее 6 символов',
    uz: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
    ko: '비밀번호는 최소 6자 이상이어야 합니다',
  },
  usernameLength: {
    en: 'Username must be at least 3 characters',
    ru: 'Имя пользователя должно содержать не менее 3 символов',
    uz: 'Foydalanuvchi nomi kamida 3 ta belgidan iborat bo\'lishi kerak',
    ko: '사용자 이름은 최소 3자 이상이어야 합니다',
  },
  selectLanguage: {
    en: 'Language',
    ru: 'Язык',
    uz: 'Til',
    ko: '언어',
  },
  // Header related translations
  myAccount: {
    en: 'My Account',
    ru: 'Мой аккаунт',
    uz: 'Mening hisobim',
    ko: '내 계정',
  },
  profile: {
    en: 'Profile',
    ru: 'Профиль',
    uz: 'Profil',
    ko: '프로필',
  },
  logout: {
    en: 'Logout',
    ru: 'Выйти',
    uz: 'Chiqish',
    ko: '로그아웃',
  },
  searchContent: {
    en: 'Search content...',
    ru: 'Поиск контента...',
    uz: 'Kontent qidirish...',
    ko: '콘텐츠 검색...',
  },
};

// Function to translate text
export function translate(key: keyof typeof translations, lang: Language): string {
  if (translations[key]) {
    return translations[key][lang];
  }
  console.warn(`Translation missing for key: ${key}, language: ${lang}`);
  return `${key}`;
}

// Context type
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check localStorage for saved language or default to English
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function using the current language
  const t = (key: keyof typeof translations): string => {
    return translate(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
