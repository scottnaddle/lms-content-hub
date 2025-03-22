
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import LTIConfiguration from '@/components/lti/LTIConfiguration';
import { Chip } from '@/components/ui/chip';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const LTIConfigPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get('content');
  
  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          {contentId && (
            <div className="mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="flex items-center gap-1"
              >
                <Link to={`/content/scorm/${contentId}`}>
                  <ArrowLeft className="h-4 w-4" />
                  {t('backToContent')}
                </Link>
              </Button>
            </div>
          )}
          
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
