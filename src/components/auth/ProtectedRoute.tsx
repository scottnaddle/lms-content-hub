
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth' 
}) => {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t('loadingText')}</h2>
          <p className="text-muted-foreground">{t('pleaseWait')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="glass-panel p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold mb-2">{t('loginRequired')}</h2>
          <p className="text-muted-foreground mb-6">{t('loginRequiredDesc')}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate(redirectTo)}>
              {t('goToLogin')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              {t('returnHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
