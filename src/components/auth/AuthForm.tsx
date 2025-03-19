
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import SocialLogin from './SocialLogin';
import { useLanguage } from '@/contexts/LanguageContext';

const AuthForm: React.FC = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const { t } = useLanguage();

  const handleRegisterSuccess = (email: string) => {
    setLoginEmail(email);
  };

  return (
    <div className="glass-panel p-6 relative">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">{t('login')}</TabsTrigger>
          <TabsTrigger value="register">{t('register')}</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                {t('socialLogin')}
              </span>
            </div>
          </div>

          <SocialLogin />
        </TabsContent>

        <TabsContent value="register">
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                {t('socialRegister')}
              </span>
            </div>
          </div>

          <SocialLogin />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForm;
