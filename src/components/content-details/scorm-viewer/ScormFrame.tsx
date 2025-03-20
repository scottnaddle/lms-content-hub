
import React, { useEffect, useRef, useState } from 'react';
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
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [injectionAttempts, setInjectionAttempts] = useState(0);
  
  // SCORM API 주입 및 iframe 로드 처리
  useEffect(() => {
    if (!entryPointUrl || !iframeRef.current) return;
    
    console.log('ScormFrame: Setting iframe source to:', entryPointUrl);
    
    const iframe = iframeRef.current;
    let apiInjected = false;
    
    // iframe이 로드될 때 SCORM API 주입
    const handleIframeLoad = () => {
      try {
        // iframe이 로드된 후 SCORM API 주입
        console.log('Iframe loaded, injecting SCORM API');
        apiInjected = injectScormApi(iframe);
        setIsFrameLoading(false);
        
        // SCORM API가 제대로 주입되었는지 확인
        setTimeout(() => {
          if (apiInjected) {
            console.log('SCORM API validation successful');
            toast({
              title: "SCORM 콘텐츠 로드 완료",
              description: "SCORM 패키지가 성공적으로 로드되었습니다.",
            });
          } else {
            console.warn('SCORM API not found after injection');
            if (injectionAttempts < 3) {
              console.log(`Retrying API injection (attempt ${injectionAttempts + 1})`);
              setInjectionAttempts(prev => prev + 1);
            }
          }
        }, 500);

        // Force reload if iframe appears empty after loading
        setTimeout(() => {
          const iframeDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
          if (iframeDoc && (!iframeDoc.body || !iframeDoc.body.innerHTML.trim())) {
            console.warn('Iframe appears to be empty, forcing reload');
            if (injectionAttempts < 3) {
              iframe.src = entryPointUrl + (entryPointUrl.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
              setInjectionAttempts(prev => prev + 1);
            }
          }
        }, 1000);
      } catch (err) {
        console.error('Failed to inject SCORM API:', err);
      }
    };
    
    // iframe 로드 이벤트 핸들러 설정
    iframe.addEventListener('load', handleIframeLoad);
    
    // iframe src 설정 - timeout으로 지연 처리 (DOM이 먼저 준비되도록)
    setTimeout(() => {
      console.log('Setting iframe source to:', entryPointUrl);
      iframe.src = entryPointUrl;
      
      // 5초 후에도 로딩이 완료되지 않으면 로딩 상태 해제 (UI 차단 방지)
      const timeoutId = setTimeout(() => {
        if (isFrameLoading && !apiInjected) {
          console.log('Loading timeout reached, forcing UI to show iframe');
          setIsFrameLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }, 300);
    
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [entryPointUrl, injectionAttempts]);

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
