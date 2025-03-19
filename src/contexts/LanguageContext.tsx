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
  // Dashboard related translations
  dashboard: {
    en: 'Dashboard',
    ru: 'Панель управления',
    uz: 'Boshqaruv paneli',
    ko: '대시보드',
  },
  welcomeToDashboard: {
    en: 'Welcome to Learning Content Hub',
    ru: 'Добро пожаловать в Learning Content Hub',
    uz: 'Learning Content Hub ga xush kelibsiz',
    ko: '학습 콘텐츠 허브에 오신 것을 환영합니다',
  },
  uploadContent: {
    en: 'Upload Content',
    ru: 'Загрузить контент',
    uz: 'Kontentni yuklash',
    ko: '콘텐츠 업로드',
  },
  manageContent: {
    en: 'Manage Your Learning Content',
    ru: 'Управляйте своим учебным контентом',
    uz: 'O\'quv kontentingizni boshqaring',
    ko: '학습 콘텐츠 관리',
  },
  contentDescription: {
    en: 'Upload, organize, and share your educational content seamlessly with Canvas LMS, Moodle, and other learning platforms through LTI integration.',
    ru: 'Загружайте, организуйте и делитесь своим образовательным контентом с Canvas LMS, Moodle и другими учебными платформами через интеграцию LTI.',
    uz: 'O\'quv kontentingizni LTI integratsiyasi orqali Canvas LMS, Moodle va boshqa o\'quv platformalari bilan uzluksiz yuklang, tartibga soling va baham ko\'ring.',
    ko: 'LTI 통합을 통해 Canvas LMS, Moodle 및 기타 학습 플랫폼과 교육 콘텐츠를 원활하게 업로드, 구성 및 공유하세요.',
  },
  getStarted: {
    en: 'Get Started',
    ru: 'Начать',
    uz: 'Boshlash',
    ko: '시작하기',
  },
  ltiConfiguration: {
    en: 'LTI Configuration',
    ru: 'Настройка LTI',
    uz: 'LTI konfiguratsiyasi',
    ko: 'LTI 구성',
  },
  recentlyAdded: {
    en: 'Recently Added Content',
    ru: 'Недавно добавленный контент',
    uz: 'Yaqinda qo\'shilgan kontent',
    ko: '최근 추가된 콘텐츠',
  },
  viewAll: {
    en: 'View All',
    ru: 'Посмотреть все',
    uz: 'Barchasini ko\'rish',
    ko: '모두 보기',
  },
  // Sidebar related translations
  home: {
    en: 'Home',
    ru: 'Главная',
    uz: 'Asosiy',
    ko: '홈',
  },
  recentlyViewed: {
    en: 'Recently Viewed',
    ru: 'Недавно просмотренные',
    uz: 'Yaqinda ko\'rilgan',
    ko: '최근 본 콘텐츠',
  },
  contentLibrary: {
    en: 'Content Library',
    ru: 'Библиотека контента',
    uz: 'Kontent kutubxonasi',
    ko: '콘텐츠 라이브러리',
  },
  videos: {
    en: 'Videos',
    ru: 'Видео',
    uz: 'Videolar',
    ko: '비디오',
  },
  audio: {
    en: 'Audio',
    ru: 'Аудио',
    uz: 'Audio',
    ko: '오디오',
  },
  documents: {
    en: 'Documents',
    ru: 'Документы',
    uz: 'Hujjatlar',
    ko: '문서',
  },
  collections: {
    en: 'Collections',
    ru: 'Коллекции',
    uz: 'To\'plamlar',
    ko: '컬렉션',
  },
  tags: {
    en: 'Tags',
    ru: 'Теги',
    uz: 'Teglar',
    ko: '태그',
  },
  integration: {
    en: 'Integration',
    ru: 'Интеграция',
    uz: 'Integratsiya',
    ko: '통합',
  },
  system: {
    en: 'System',
    ru: 'Система',
    uz: 'Tizim',
    ko: '시스템',
  },
  settings: {
    en: 'Settings',
    ru: 'Настройки',
    uz: 'Sozlamalar',
    ko: '설정',
  },
  helpSupport: {
    en: 'Help & Support',
    ru: 'Помощь и поддержка',
    uz: 'Yordam va qo\'llab-quvvatlash',
    ko: '도움말 및 지원',
  },
  // Upload page translations
  upload: {
    en: 'Upload',
    ru: 'Загрузка',
    uz: 'Yuklash',
    ko: '업로드',
  },
  uploadContentTitle: {
    en: 'Upload Content',
    ru: 'Загрузить контент',
    uz: 'Kontentni yuklash',
    ko: '콘텐츠 업로드',
  },
  uploadDescription: {
    en: 'Upload videos, audio files, PDFs, and other documents to your content library.',
    ru: 'Загрузите видео, аудиофайлы, PDF-файлы и другие документы в вашу библиотеку контента.',
    uz: 'Video, audio fayllar, PDF va boshqa hujjatlarni kontent kutubxonangizga yuklang.',
    ko: '비디오, 오디오 파일, PDF 및 기타 문서를 콘텐츠 라이브러리에 업��드하세요.',
  },
  // File upload related translations
  removeFile: {
    en: 'Remove file',
    ru: 'Удалить фа��л',
    uz: 'Faylni olib tashlash',
    ko: '파일 제거',
  },
  dropFilesHere: {
    en: 'Drop files here',
    ru: 'Перетащите файлы сюда',
    uz: 'Fayllarni shu yerga tashlang',
    ko: '파일을 끌어다 놓으세요',
  },
  orBrowseFiles: {
    en: 'Or browse files',
    ru: 'Или просмотрите файлы',
    uz: 'Yoki fayllarni ko\'rib chiqing',
    ko: '또는 파일 찾아보기',
  },
  browseFiles: {
    en: 'Browse files',
    ru: 'Просмотр файлов',
    uz: 'Fayllarni ko\'rish',
    ko: '파일 찾기',
  },
  supportedFormats: {
    en: 'Supported formats: MP4, MP3, PDF, DOC, DOCX, etc.',
    ru: 'Поддерживаемые форматы: MP4, MP3, PDF, DOC, DOCX и др.',
    uz: 'Qo\'llab-quvvatlanadigan formatlar: MP4, MP3, PDF, DOC, DOCX va boshqalar.',
    ko: '지원 형식: MP4, MP3, PDF, DOC, DOCX 등',
  },
  // Content metadata form translations
  contentTitle: {
    en: 'Title',
    ru: 'Заголовок',
    uz: 'Sarlavha',
    ko: '제목',
  },
  enterContentTitle: {
    en: 'Enter content title',
    ru: 'Введите заголовок контента',
    uz: 'Kontent sarlavhasini kiriting',
    ko: '콘텐츠 제목 입력',
  },
  description: {
    en: 'Description',
    ru: 'Описание',
    uz: 'Tavsif',
    ko: '설명',
  },
  enterContentDescription: {
    en: 'Enter content description',
    ru: 'Введите описание контента',
    uz: 'Kontent tavsifini kiriting',
    ko: '콘텐츠 설명 입력',
  },
  contentType: {
    en: 'Content Type',
    ru: 'Тип контента',
    uz: 'Kontent turi',
    ko: '콘텐츠 유형',
  },
  selectContentType: {
    en: 'Select content type',
    ru: 'Выберите тип контента',
    uz: 'Kontent turini tanlang',
    ko: '콘텐츠 유형 선택',
  },
  video: {
    en: 'Video',
    ru: 'Видео',
    uz: 'Video',
    ko: '비디오',
  },
  pdf: {
    en: 'PDF',
    ru: 'PDF',
    uz: 'PDF',
    ko: 'PDF',
  },
  document: {
    en: 'Document',
    ru: 'Документ',
    uz: 'Hujjat',
    ko: '문서',
  },
  tagsWithSeparator: {
    en: 'Tags (comma separated)',
    ru: 'Теги (разделены запятыми)',
    uz: 'Teglar (vergul bilan ajratilgan)',
    ko: '태그 (쉼표로 구분)',
  },
  tagsExample: {
    en: 'Example: lecture, math, beginner',
    ru: 'Например: лекция, математика, начальный',
    uz: 'Misol: ma\'ruza, matematika, boshlang\'ich',
    ko: '예: 강의, 수학, 초급',
  },
  uploading: {
    en: 'Uploading...',
    ru: 'Загрузка...',
    uz: 'Yuklanmoqda...',
    ko: '업로드 중...',
  },
  // LTI configuration page translations
  ltiConfigPageTitle: {
    en: 'LTI Configuration',
    ru: 'Настройка LTI',
    uz: 'LTI konfiguratsiyasi',
    ko: 'LTI 구성',
  },
  ltiConfigDescription: {
    en: 'Configure Learning Tools Interoperability (LTI) to integrate with Canvas LMS, Moodle, and other learning platforms.',
    ru: 'Настройте совместимость учебных инструментов (LTI) для интеграции с Canvas LMS, Moodle и другими учебными платформами.',
    uz: 'Canvas LMS, Moodle va boshqa o\'qitish platformalari bilan integratsiya qilish uchun Learning Tools Interoperability (LTI) ni sozlang.',
    ko: 'Canvas LMS, Moodle 및 기타 학습 플랫폼과 통합하기 위한 학습 도구 상호 운용성(LTI)을 구성합니다.',
  },
  // Content type page translations
  contentLibraryLabel: {
    en: 'Content Library',
    ru: 'Библиотека контента',
    uz: 'Kontent kutubxonasi',
    ko: '콘텐츠 라이브러리',
  },
  uploadVideo: {
    en: 'Upload Video',
    ru: 'Загрузить видео',
    uz: 'Video yuklash',
    ko: '비디오 업로드',
  },
  uploadAudio: {
    en: 'Upload Audio',
    ru: 'Загрузить аудио',
    uz: 'Audio yuklash',
    ko: '오디오 업로드',
  },
  uploadDocument: {
    en: 'Upload Document',
    ru: 'Загрузить документ',
    uz: 'Hujjat yuklash',
    ko: '문서 업로드',
  },
  searchVideos: {
    en: 'Search videos...',
    ru: 'Поиск видео...',
    uz: 'Videolarni qidirish...',
    ko: '비디오 검색...',
  },
  searchAudio: {
    en: 'Search audio...',
    ru: 'Поиск аудио...',
    uz: 'Audiolarni qidirish...',
    ko: '오디오 검색...',
  },
  searchDocuments: {
    en: 'Search documents...',
    ru: 'Поиск документов...',
    uz: 'Hujjatlarni qidirish...',
    ko: '문서 검색...',
  },
  noMatchingItems: {
    en: 'No matching items found',
    ru: 'Не найдено совпадающих элементов',
    uz: 'Mos keluvchi elementlar topilmadi',
    ko: '일치하는 항목을 찾을 수 없습니다',
  },
  noItems: {
    en: 'No items available',
    ru: 'Нет доступных элементов',
    uz: 'Elementlar mavjud emas',
    ko: '사용 가능한 항목이 없습니다',
  },
  // Content details page translations
  share: {
    en: 'Share',
    ru: 'Поделиться',
    uz: 'Ulashish',
    ko: '공유',
  },
  download: {
    en: 'Download',
    ru: 'Скачать',
    uz: 'Yuklab olish',
    ko: '다운로드',
  },
  edit: {
    en: 'Edit',
    ru: 'Редактировать',
    uz: 'Tahrirlash',
    ko: '편집',
  },
  delete: {
    en: 'Delete',
    ru: 'Удалить',
    uz: 'O\'chirish',
    ko: '삭제',
  },
  views: {
    en: 'Views',
    ru: 'Просмотры',
    uz: 'Ko\'rishlar',
    ko: '조회수',
  },
  ltiIntegration: {
    en: 'LTI Integration',
    ru: 'Интеграция LTI',
    uz: 'LTI integratsiyasi',
    ko: 'LTI 통합',
  },
  ltiDescription: {
    en: 'This content can be included in Canvas LMS and Moodle through LTI integration.',
    ru: 'Этот контент может быть включен в Canvas LMS и Moodle через интеграцию LTI.',
    uz: 'Bu kontent LTI integratsiyasi orqali Canvas LMS va Moodle\'ga kiritilishi mumkin.',
    ko: '이 콘텐츠는 LTI 통합을 통해 Canvas LMS 및 Moodle에 포함할 수 있습니다.',
  },
  downloadToView: {
    en: 'Download to view',
    ru: 'Скачать для просмотра',
    uz: 'Ko\'rish uchun yuklab oling',
    ko: '다운로드하여 보기',
  },
  // Error messages
  notFound: {
    en: 'Not Found',
    ru: 'Не найдено',
    uz: 'Topilmadi',
    ko: '찾을 수 없음',
  },
  pageNotFound: {
    en: 'Oops! Page not found',
    ru: 'Упс! Страница не найдена',
    uz: 'Voy! Sahifa topilmadi',
    ko: '이런! 페이지를 찾을 수 없습니다',
  },
  returnHome: {
    en: 'Return to Home',
    ru: 'Вернуться на главную',
    uz: 'Bosh sahifaga qaytish',
    ko: '홈으로 돌아가기',
  },
  deletionSuccess: {
    en: 'Content deleted successfully',
    ru: 'Контент успешно удален',
    uz: 'Kontent muvaffaqiyatli o\'chirildi',
    ko: '콘텐츠가 성공적으로 삭제되었습니다',
  },
  deletionFailed: {
    en: 'Failed to delete content',
    ru: 'Не удалось удалить контент',
    uz: 'Kontentni o\'chirib bo\'lmadi',
    ko: '콘텐츠를 삭제하는 데 실패했습니다',
  },
  contentNotFound: {
    en: 'Content not found',
    ru: 'Контент не найден',
    uz: 'Kontent topilmadi',
    ko: '콘텐츠를 찾을 수 없습니다',
  },
  contentNotFoundDesc: {
    en: 'The requested content does not exist or has been deleted',
    ru: 'Запрашиваемый контент не существует или был удален',
    uz: 'So\'ralgan kontent mavjud emas yoki o\'chirilgan',
    ko: '요청하신 콘텐츠가 존재하지 않거나 삭제되었습니다',
  },
  backButton: {
    en: 'Go Back',
    ru: 'Назад',
    uz: 'Orqaga',
    ko: '뒤로 가기',
  },
  loadingText: {
    en: 'Loading...',
    ru: 'Загрузка...',
    uz: 'Yuklanmoqda...',
    ko: '로딩 중...',
  },
  pleaseWait: {
    en: 'Please wait',
    ru: 'Пожалуйста, подождите',
    uz: 'Iltimos, kuting',
    ko: '잠시만 기다려주세요',
  },
};

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

// Function to translate text
export function translate(key: keyof typeof translations, lang: Language): string {
  if (translations[key]) {
    return translations[key][lang];
  }
  console.warn(`Translation missing for key: ${key}, language: ${lang}`);
  return `${key}`;
};

// Hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
