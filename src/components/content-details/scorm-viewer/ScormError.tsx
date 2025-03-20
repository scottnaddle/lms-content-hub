
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ScormErrorProps {
  error: string;
  onDownload: () => void;
}

const ScormError: React.FC<ScormErrorProps> = ({ error, onDownload }) => {
  const { t } = useLanguage();
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="ml-2">SCORM 로딩 오류</AlertTitle>
      <AlertDescription className="mt-2">
        {error}
        <div className="mt-4">
          <Button onClick={onDownload} variant="outline" size="sm">
            {t('downloadPackage')}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ScormError;
