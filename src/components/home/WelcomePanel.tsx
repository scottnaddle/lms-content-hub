
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const WelcomePanel: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className="glass-panel p-6 pb-10 relative overflow-hidden">
      <div className="absolute -right-10 -bottom-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="relative">
        <h2 className="text-2xl font-semibold mb-2">{t('manageContent')}</h2>
        <p className="text-muted-foreground max-w-2xl mb-4">
          {t('contentDescription')}
        </p>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => navigate('/upload')} className="gap-2">
            {t('getStarted')}
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/lti-configuration')}>
            {t('ltiConfiguration')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePanel;
