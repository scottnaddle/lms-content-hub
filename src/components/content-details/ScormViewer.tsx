
import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
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
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [stage, setStage] = useState<'downloading' | 'extracting' | 'loading' | 'complete' | 'error'>('downloading');
  const { t } = useLanguage();
  
  // SCORM 패키지 추출 및 로드
  useEffect(() => {
    let isMounted = true;
    
    const loadScormPackage = async () => {
      if (!fileUrl) {
        setError("SCORM 파일을 찾을 수 없습니다.");
        setStage('error');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setStage('downloading');
        setDownloadProgress(0);
        setExtractionProgress(0);
        
        // 스토리지 URL로부터 서명된 URL 생성
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('content_files')
          .createSignedUrl(fileUrl, 60); // 60초 동안 유효

        if (signedUrlError || !signedUrlData?.signedUrl) {
          throw new Error(signedUrlError?.message || 'Failed to get signed URL');
        }

        console.log('Using signed URL for SCORM package:', signedUrlData.signedUrl);
        
        // SCORM 패키지 추출 with progress tracking
        const { entryPoint, extractedFiles: files, error: extractError } = await extractScormPackage(
          signedUrlData.signedUrl,
          (progress) => {
            if (isMounted) {
              setDownloadProgress(progress);
              if (progress === 100) {
                setStage('extracting');
              }
            }
          },
          (progress) => {
            if (isMounted) {
              setExtractionProgress(progress);
              if (progress === 100) {
                setStage('loading');
              }
            }
          }
        );
        
        if (!isMounted) return;
        
        if (extractError) {
          console.error('SCORM extraction error:', extractError);
          setError(extractError);
          setStage('error');
          setIsLoading(false);
          return;
        }
        
        if (!entryPoint) {
          setError("SCORM 패키지에서 시작 파일을 찾을 수 없습니다.");
          setStage('error');
          setIsLoading(false);
          return;
        }
        
        console.log('SCORM entry point found:', entryPoint);
        
        // 추출된 파일 및 진입점 설정
        setExtractedFiles(files);
        const entryUrl = files.get(entryPoint);
        
        if (!entryUrl) {
          setError("SCORM 시작 파일을 로드할 수 없습니다.");
          setStage('error');
          setIsLoading(false);
          return;
        }
        
        setEntryPointUrl(entryUrl);
      } catch (err: any) {
        if (isMounted) {
          console.error("SCORM 로드 오류:", err);
          setError(`SCORM 패키지를 로드하는 데 실패했습니다: ${err.message || "알 수 없는 오류"}`);
          setStage('error');
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
        setStage('complete');
        setIsLoading(false);
        toast({
          title: "SCORM 콘텐츠 로드 완료",
          description: "SCORM 패키지가 성공적으로 로드되었습니다.",
        });
      } catch (err) {
        console.error('Failed to inject SCORM API:', err);
        setError('SCORM API 주입에 실패했습니다');
        setStage('error');
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

  // Progress status text
  const getStageText = () => {
    switch (stage) {
      case 'downloading':
        return `SCORM 콘텐츠 다운로드 중... (${downloadProgress}%)`;
      case 'extracting':
        return `SCORM 패키지 압축 해제 중... (${extractionProgress}%)`;
      case 'loading':
        return 'SCORM 콘텐츠 초기화 중...';
      case 'complete':
        return 'SCORM 콘텐츠가 로드되었습니다.';
      case 'error':
        return '오류가 발생했습니다.';
      default:
        return 'SCORM 콘텐츠를 로드 중입니다...';
    }
  };
  
  // Current progress value based on stage
  const getCurrentProgress = () => {
    switch (stage) {
      case 'downloading':
        return downloadProgress;
      case 'extracting':
        return extractionProgress;
      case 'loading':
        return 100;
      case 'complete':
        return 100;
      case 'error':
        return 100;
      default:
        return 0;
    }
  };
  
  return (
    <div className="w-full flex flex-col space-y-4">
      {isLoading && (
        <div className="flex flex-col space-y-4 py-8">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></div>
            <p>{getStageText()}</p>
          </div>
          
          <Progress value={getCurrentProgress()} className="w-full h-2" />
          
          <p className="text-xs text-muted-foreground">
            {stage === 'downloading' && '콘텐츠를 다운로드하는 동안 잠시 기다려 주세요.'}
            {stage === 'extracting' && '압축 해제에는 시간이 걸릴 수 있습니다. 패키지 크기에 따라 다릅니다.'}
            {stage === 'loading' && 'SCORM 콘텐츠를 초기화하는 중입니다.'}
          </p>
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
