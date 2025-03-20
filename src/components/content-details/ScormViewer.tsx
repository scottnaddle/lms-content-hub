
import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { extractScormPackage, cleanupScormResources, injectScormApi } from '@/utils/scorm-utils';

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
        
        // SCORM 패키지 추출
        const { entryPoint, extractedFiles: files, error: extractError } = await extractScormPackage(fileUrl);
        
        if (!isMounted) return;
        
        if (extractError) {
          setError(extractError);
          setIsLoading(false);
          return;
        }
        
        if (!entryPoint) {
          setError("SCORM 패키지에서 시작 파일을 찾을 수 없습니다.");
          setIsLoading(false);
          return;
        }
        
        // 추출된 파일 및 진입점 설정
        setExtractedFiles(files);
        const entryUrl = files.get(entryPoint);
        setEntryPointUrl(entryUrl || null);
        
        if (!entryUrl) {
          setError("SCORM 시작 파일을 로드할 수 없습니다.");
          setIsLoading(false);
        }
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
      // 리소스 정리
      cleanupScormResources(extractedFiles);
    };
  }, [fileUrl]);
  
  // SCORM API 주입 및 iframe 로드 처리
  useEffect(() => {
    if (!entryPointUrl || !iframeRef.current) return;
    
    const iframe = iframeRef.current;
    
    const handleIframeLoad = () => {
      // iframe이 로드된 후 SCORM API 주입
      injectScormApi(iframe);
      setIsLoading(false);
    };
    
    // iframe 로드 이벤트 핸들러 설정
    iframe.addEventListener('load', handleIframeLoad);
    
    // iframe src 설정
    iframe.src = entryPointUrl;
    
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [entryPointUrl]);
  
  // 리소스 정리
  useEffect(() => {
    return () => {
      cleanupScormResources(extractedFiles);
    };
  }, []);
  
  return (
    <div className="w-full flex flex-col space-y-4">
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="mb-3 text-yellow-700 dark:text-yellow-400">{error}</p>
          <Button onClick={onDownload} variant="outline">
            {t('downloadPackage')}
          </Button>
        </div>
      )}
      
      <div className={`w-full h-[70vh] border rounded-lg overflow-hidden ${(isLoading || error) ? 'hidden' : ''}`}>
        <iframe 
          ref={iframeRef}
          title={title}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
};

export default ScormViewer;
