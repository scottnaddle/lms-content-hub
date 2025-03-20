
import React, { useEffect, useRef } from 'react';
import { injectScormApi } from '@/utils/scorm';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ScormFrameProps {
  entryPointUrl: string;
  title: string;
  extractedFiles: Map<string, string>;
}

const ScormFrame: React.FC<ScormFrameProps> = ({ 
  entryPointUrl, 
  title,
  extractedFiles 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFrameLoading, setIsFrameLoading] = React.useState(true);
  
  // SCORM API 주입 및 iframe 로드 처리
  useEffect(() => {
    if (!entryPointUrl || !iframeRef.current) return;
    
    console.log('ScormFrame: Setting iframe source to:', entryPointUrl);
    
    const iframe = iframeRef.current;
    
    const handleIframeLoad = () => {
      try {
        // iframe이 로드된 후 SCORM API 주입
        console.log('Iframe loaded, injecting SCORM API');
        injectScormApi(iframe);
        setIsFrameLoading(false);
        toast({
          title: "SCORM 콘텐츠 로드 완료",
          description: "SCORM 패키지가 성공적으로 로드되었습니다.",
        });
      } catch (err) {
        console.error('Failed to inject SCORM API:', err);
      }
    };
    
    // iframe 로드 이벤트 핸들러 설정
    iframe.addEventListener('load', handleIframeLoad);
    
    // iframe src 설정 - timeout으로 지연 처리 (더 긴 시간으로 조정)
    setTimeout(() => {
      console.log('Setting iframe source to:', entryPointUrl);
      iframe.src = entryPointUrl;
    }, 300);
    
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [entryPointUrl]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {isFrameLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-sm">
          <Skeleton className="w-full h-full absolute inset-0 -z-10" />
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            <p className="text-sm text-muted-foreground">콘텐츠 로딩 중...</p>
          </div>
        </div>
      )}
      
      <iframe 
        ref={iframeRef}
        title={title}
        className="w-full h-full bg-white"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        data-testid="scorm-iframe"
      />
    </div>
  );
};

export default ScormFrame;
