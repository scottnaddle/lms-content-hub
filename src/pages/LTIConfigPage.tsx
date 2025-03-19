
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import LTIConfiguration from '@/components/lti/LTIConfiguration';
import { Chip } from '@/components/ui/chip';
import { useLanguage } from '@/contexts/LanguageContext';

const LTIConfigPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Chip className="bg-primary/10 text-primary border-none">{t('integration')}</Chip>
          </div>
          <h1 className="font-semibold tracking-tight">{t('ltiConfigPageTitle')}</h1>
          <p className="text-muted-foreground max-w-2xl">
            {t('ltiConfigDescription')}
          </p>
        </div>
        
        <LTIConfiguration />
      </div>
    </PageLayout>
  );
};

export default LTIConfigPage;
