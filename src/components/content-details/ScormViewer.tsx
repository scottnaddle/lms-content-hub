import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  extractScormPackage, 
  cleanupScormResources, 
  injectScormApi 
} from '@/utils/scorm';
import { supabase } from '@/integrations/supabase/client';

interface ScormViewerProps {
  fileUrl?: string;
  title: string;
  onDownload: () => void;
}

const ScormViewer: React.FC<ScormViewerProps> = ({ 
  fileUrl, 
  title,
  onDownload
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [extractedFiles, setExtractedFiles] = useState<Map<string, string>>(new Map());
  const [entryPointUrl, setEntryPointUrl] = useState<string | null>(null);
  const { t } = useLanguage();
  
  // SCORM 패키지 추출 및 로드
  useEffect(() => {
    let isMounted = true;
    
    const loadScormPackage = async () => {
      if (!fileUrl) {
        setError("SCORM 파일을 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // 스토리지 URL로부터 서명된 URL 생성
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('content_files')
          .createSignedUrl(fileUrl, 60); // 60초 동안 유효

        if (signedUrlError || !signedUrlData?.signedUrl) {
          throw new Error(signedUrlError?.message || 'Failed to get signed URL');
        }

        console.log('Using signed URL for SCORM package:', signedUrlData.signedUrl);
        
        // SCORM 패키지 추출
        const { entryPoint, extractedFiles: files, error: extractError } = await extractScormPackage(signedUrlData.signedUrl);
        
        if (!isMounted) return;
        
        if (extractError) {
          console.error('SCORM extraction error:', extractError);
          setError(extractError);
          setIsLoading(false);
          return;
        }
        
        if (!entryPoint) {
          setError("SCORM 패키지에서 시작 파일을 찾을 수 없습니다.");
          setIsLoading(false);
          return;
        }
        
        console.log('SCORM entry point found:', entryPoint);
        
        // 추출된 파일 및 진입점 설정
        setExtractedFiles(files);
        const entryUrl = files.get(entryPoint);
        
        if (!entryUrl) {
          setError("SCORM 시작 파일을 로드할 수 없습니다.");
          setIsLoading(false);
          return;
        }
        
        setEntryPointUrl(entryUrl);
      } catch (err: any) {
        if (isMounted) {
          console.error("SCORM 로드 오류:", err);
          setError(`SCORM 패키지를 로드하는 데 실패했습니다: ${err.message || "알 수 없는 오류"}`);
          setIsLoading(false);
        }
      }
    };
    
    loadScormPackage();
    
    return () => {
      isMounted = false;
      if (extractedFiles.size > 0) {
        cleanupScormResources(extractedFiles);
      }
    };
  }, [fileUrl]);
  
  // SCORM API 주입 및 iframe 로드 처리
  useEffect(() => {
    if (!entryPointUrl || !iframeRef.current) return;
    
    const iframe = iframeRef.current;
    
    const handleIframeLoad = () => {
      try {
        // iframe이 로드된 후 SCORM API 주입
        console.log('Iframe loaded, injecting SCORM API');
        injectScormApi(iframe);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to inject SCORM API:', err);
        setError('SCORM API 주입에 실패했습니다');
        setIsLoading(false);
      }
    };
    
    // iframe 로드 이벤트 핸들러 설정
    iframe.addEventListener('load', handleIframeLoad);
    
    // iframe src 설정
    console.log('Setting iframe source to:', entryPointUrl);
    iframe.src = entryPointUrl;
    
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [entryPointUrl]);
  
  // 리소스 정리
  useEffect(() => {
    return () => {
      console.log('Cleaning up SCORM resources');
      cleanupScormResources(extractedFiles);
    };
  }, [extractedFiles]);
  
  return (
    <div className="w-full flex flex-col space-y-4">
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3">SCORM 콘텐츠를 로드 중입니다...</p>
        </div>
      )}
      
      {error && (
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
      )}
      
      <div 
        className={`w-full h-[70vh] border rounded-lg ${(isLoading || error) ? 'hidden' : 'block'}`}
        data-testid="scorm-container"
      >
        <iframe 
          ref={iframeRef}
          title={title}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
};

export default ScormViewer;
