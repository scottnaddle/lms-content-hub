
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import UploadContent from '@/components/content/UploadContent';
import { Chip } from '@/components/ui/chip';
import { useLanguage } from '@/contexts/LanguageContext';

const UploadPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Chip className="bg-primary/10 text-primary border-none">{t('upload')}</Chip>
          </div>
          <h1 className="font-semibold tracking-tight">{t('uploadContentTitle')}</h1>
          <p className="text-muted-foreground max-w-2xl">
            {t('uploadDescription')}
          </p>
        </div>
        
        <UploadContent />
      </div>
    </PageLayout>
  );
};

export default UploadPage;
