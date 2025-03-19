
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import AuthForm from '@/components/auth/AuthForm';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Redirect already logged in users
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
        <h1 className="text-2xl font-bold mb-8 text-center">{t('welcome')}</h1>
        <AuthForm />
      </div>
    </PageLayout>
  );
};

export default AuthPage;
