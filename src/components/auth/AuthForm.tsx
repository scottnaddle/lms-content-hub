
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import SocialLogin from './SocialLogin';

const AuthForm: React.FC = () => {
  const [loginEmail, setLoginEmail] = useState('');

  const handleRegisterSuccess = (email: string) => {
    setLoginEmail(email);
  };

  return (
    <div className="glass-panel p-6">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">로그인</TabsTrigger>
          <TabsTrigger value="register">회원가입</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                소셜 계정으로 로그인
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
                소셜 계정으로 회원가입
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
