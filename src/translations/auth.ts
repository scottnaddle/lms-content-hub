
import { TranslationsCollection } from './types';

export const authTranslations: TranslationsCollection = {
  // Auth Form
  login: { en: 'Login', ko: '로그인', ru: 'Войти', uz: 'Kirish' },
  register: { en: 'Register', ko: '회원가입', ru: 'Регистрация', uz: "Ro'yxatdan o'tish" },
  email: { en: 'Email', ko: '이메일', ru: 'Эл. почта', uz: 'Elektron pochta' },
  password: { en: 'Password', ko: '비밀번호', ru: 'Пароль', uz: 'Parol' },
  username: { en: 'Username', ko: '사용자 이름', ru: 'Имя пользователя', uz: 'Foydalanuvchi nomi' },
  loggingIn: { en: 'Logging in...', ko: '로그인 중...', ru: 'Выполняется вход...', uz: 'Kirilmoqda...' },
  registering: { en: 'Registering...', ko: '가입 중...', ru: 'Регистрация...', uz: "Ro'yxatdan o'tilmoqda..." },
  socialLogin: { en: 'Or continue with', ko: '또는 다음으로 계속', ru: 'Или продолжить с', uz: 'Yoki davom eting' },
  socialRegister: { en: 'Or sign up with', ko: '또는 다음으로 가입', ru: 'Или зарегистрироваться с', uz: "Yoki ro'yxatdan o'ting" },

  // Validation Messages
  invalidEmail: { en: 'Please enter a valid email', ko: '유효한 이메일을 입력하세요', ru: 'Пожалуйста, введите корректный адрес эл. почты', uz: "Iltimos, to'g'ri elektron pochta manzilini kiriting" },
  passwordLength: { en: 'Password must be at least 6 characters', ko: '비밀번호는 최소 6자 이상이어야 합니다', ru: 'Пароль должен содержать не менее 6 символов', uz: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' },
  usernameLength: { en: 'Username must be at least 3 characters', ko: '사용자 이름은 최소 3자 이상이어야 합니다', ru: 'Имя пользователя должно содержать не менее 3 символов', uz: 'Foydalanuvchi nomi kamida 3 ta belgidan iborat bo\'lishi kerak' },
  
  // Auth Page
  welcome: { en: 'Welcome!', ko: '환영합니다!', ru: 'Добро пожаловать!', uz: 'Xush kelibsiz!' },
  
  // Protected Route
  loginRequired: { en: 'Login Required', ko: '로그인이 필요합니다', ru: 'Требуется вход', uz: 'Kirish talab qilinadi' },
  loginRequiredDesc: { en: 'You need to be logged in to access this page', ko: '이 페이지에 접근하려면 로그인이 필요합니다', ru: 'Вам необходимо войти в систему для доступа к этой странице', uz: 'Bu sahifaga kirish uchun tizimga kirishingiz kerak' },
  goToLogin: { en: 'Go to Login', ko: '로그인으로 이동', ru: 'Перейти к входу', uz: 'Kirishga o\'tish' },
  returnHome: { en: 'Return Home', ko: '홈으로 돌아가기', ru: 'Вернуться на главную', uz: 'Bosh sahifaga qaytish' },
  loadingText: { en: 'Loading...', ko: '로딩 중...', ru: 'Загрузка...', uz: 'Yuklanmoqda...' },
  pleaseWait: { en: 'Please wait...', ko: '잠시만 기다려주세요...', ru: 'Пожалуйста, подождите...', uz: 'Iltimos, kuting...' },

  // User Profile
  account: { en: 'Account', ko: '계정', ru: 'Аккаунт', uz: 'Hisob' },
  userProfileTitle: { en: 'User Profile', ko: '사용자 프로필', ru: 'Профиль пользователя', uz: 'Foydalanuvchi profili' },
  userProfileDescription: { en: 'Manage your account settings and set profile preferences', ko: '계정 설정 및 프로필 환경설정을 관리하세요', ru: 'Управляйте настройками учетной записи и установите параметры профиля', uz: 'Hisob sozlamalarini boshqarish va profil parametrlarini o\'rnatish' },
  profile: { en: 'Profile', ko: '프로필', ru: 'Профиль', uz: 'Profil' },
  editProfile: { en: 'Edit Profile', ko: '프로필 편집', ru: 'Редактировать профиль', uz: 'Profilni tahrirlash' },
  updateProfileInfo: { en: 'Update your profile information', ko: '프로필 정보를 업데이트하세요', ru: 'Обновите информацию своего профиля', uz: 'Profil ma\'lumotlarini yangilang' },
  fullName: { en: 'Full Name', ko: '전체 이름', ru: 'Полное имя', uz: 'To\'liq ism' },
  website: { en: 'Website', ko: '웹사이트', ru: 'Веб-сайт', uz: 'Veb-sayt' },
  saveChanges: { en: 'Save Changes', ko: '변경사항 저장', ru: 'Сохранить изменения', uz: "O'zgarishlarni saqlash" },
  saving: { en: 'Saving...', ko: '저장 중...', ru: 'Сохранение...', uz: 'Saqlanmoqda...' },
  profileUpdated: { en: 'Profile Updated', ko: '프로필 업데이트 완료', ru: 'Профиль обновлен', uz: 'Profil yangilandi' },
  profileUpdatedSuccess: { en: 'Your profile has been updated successfully', ko: '프로필이 성공적으로 업데이트되었습니다', ru: 'Ваш профиль был успешно обновлен', uz: 'Profilingiz muvaffaqiyatli yangilandi' },
  
  // Password Management
  changePassword: { en: 'Change Password', ko: '비밀번호 변경', ru: 'Изменить пароль', uz: 'Parolni o\'zgartirish' },
  updatePasswordDescription: { en: 'Update your password to keep your account secure', ko: '계정 보안을 위해 비밀번호를 업데이트하세요', ru: 'Обновите пароль, чтобы обеспечить безопасность вашей учетной записи', uz: 'Hisobingiz xavfsizligini ta\'minlash uchun parolni yangilang' },
  currentPassword: { en: 'Current Password', ko: '현재 비밀번호', ru: 'Текущий пароль', uz: 'Joriy parol' },
  newPassword: { en: 'New Password', ko: '새 비밀번호', ru: 'Новый пароль', uz: 'Yangi parol' },
  confirmPassword: { en: 'Confirm Password', ko: '비밀번호 확인', ru: 'Подтвердите пароль', uz: 'Parolni tasdiqlang' },
  passwordsDoNotMatch: { en: 'Passwords do not match', ko: '비밀번호가 일치하지 않습니다', ru: 'Пароли не совпадают', uz: 'Parollar mos kelmaydi' },
  updatePassword: { en: 'Update Password', ko: '비밀번호 업데이트', ru: 'Обновить пароль', uz: 'Parolni yangilash' },
  updating: { en: 'Updating...', ko: '업데이트 중...', ru: 'Обновление...', uz: 'Yangilanmoqda...' },
  passwordUpdated: { en: 'Password Updated', ko: '비밀번호 업데이트 완료', ru: 'Пароль обновлен', uz: 'Parol yangilandi' },
  passwordUpdatedSuccess: { en: 'Your password has been updated successfully', ko: '비밀번호가 성공적으로 업데이트되었습니다', ru: 'Ваш пароль был успешно обновлен', uz: 'Parolingiz muvaffaqiyatli yangilandi' },
  
  // Error Messages
  errorOccurred: { en: 'An error occurred', ko: '오류가 발생했습니다', ru: 'Произошла ошибка', uz: 'Xatolik yuz berdi' },
  invalidUrl: { en: 'Please enter a valid URL', ko: '유효한 URL을 입력하세요', ru: 'Пожалуйста, введите корректный URL', uz: "Iltimos, to'g'ri URL manzilini kiriting" },
};
