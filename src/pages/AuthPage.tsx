
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import AuthForm from '@/components/auth/AuthForm';
import { supabase } from '@/integrations/supabase/client';

const AuthPage = () => {
  const navigate = useNavigate();

  // 이미 로그인한 사용자 리디렉션
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <PageLayout>
      <div className="max-w-md mx-auto py-8 animate-in">
        <h1 className="text-2xl font-bold mb-8 text-center">학습 콘텐츠 허브에 오신 것을 환영합니다</h1>
        <AuthForm />
      </div>
    </PageLayout>
  );
};

export default AuthPage;
