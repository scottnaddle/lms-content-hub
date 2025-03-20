
import React, { useEffect, useRef } from 'react';
import { injectScormApi, cleanupScormResources } from '@/utils/scorm';
import { toast } from '@/components/ui/use-toast';

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
  
  // SCORM API 주입 및 iframe 로드 처리
  useEffect(() => {
    if (!entryPointUrl || !iframeRef.current) return;
    
    console.log('ScormFrame: 진입점 URL을 iframe에 설정합니다.', entryPointUrl);
    
    const iframe = iframeRef.current;
    
    const handleIframeLoad = () => {
      try {
        // iframe이 로드된 후 SCORM API 주입
        console.log('Iframe loaded, injecting SCORM API');
        injectScormApi(iframe);
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
    
    // iframe src 설정 - timeout으로 지연 처리
    setTimeout(() => {
      console.log('Setting iframe source to:', entryPointUrl);
      iframe.src = entryPointUrl;
    }, 100);
    
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
    <iframe 
      ref={iframeRef}
      title={title}
      className="w-full h-full"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      data-testid="scorm-iframe"
    />
  );
};

export default ScormFrame;
