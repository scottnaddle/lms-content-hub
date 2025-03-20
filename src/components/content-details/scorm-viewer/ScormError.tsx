
import React from 'react';
import { AlertTriangle, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

interface ScormErrorProps {
  error: string;
  onDownload: () => void;
  onRetry?: () => void;
}

const ScormError: React.FC<ScormErrorProps> = ({ error, onDownload, onRetry }) => {
  const { t } = useLanguage();
  
  return (
    <Card className="w-full border-destructive/20 animate-fade-in shadow-md bg-white/50 dark:bg-black/20 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-destructive">SCORM 로딩 오류</h3>
            <p className="text-muted-foreground mt-1">콘텐츠를 로드하는 중 문제가 발생했습니다</p>
          </div>
        </div>
        
        <Alert variant="destructive" className="mb-6 border-destructive/30 bg-destructive/5">
          <AlertDescription className="text-sm">
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-wrap gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('retry')}
            </Button>
          )}
          
          <Button onClick={onDownload} variant="default" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {t('downloadPackage')}
          </Button>
          
          <Button variant="secondary" size="sm" onClick={() => window.open('https://docs.scorm.com/rte/scormplayer/', '_blank')} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            SCORM 도움말
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScormError;
