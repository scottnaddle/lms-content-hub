
import React, { useEffect, useRef, useState } from 'react';
import { injectScormApi } from '@/utils/scorm';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [loadError, setLoadError] = useState<string | null>(null);
  
  console.log('ScormFrame mounting with entry point:', entryPointUrl);

  useEffect(() => {
    if (!entryPointUrl) return;
    
    // Reset any previous errors
    setLoadError(null);
    
    // Add cache-busting to prevent caching issues
    const cacheBustedUrl = `${entryPointUrl}?cacheBust=${Date.now()}`;
    console.log('Setting iframe src to:', cacheBustedUrl);
    
    // Handle iframe load event for API injection
    const handleIframeLoad = () => {
      try {
        console.log('Iframe loaded, preparing to inject SCORM API');
        
        // Use a small delay to ensure the iframe content is ready
        setTimeout(() => {
          if (iframeRef.current) {
            const injectionSuccess = injectScormApi(iframeRef.current);
            console.log('SCORM API injection result:', injectionSuccess ? 'success' : 'failed');
          }
        }, 500); // Increased delay for better reliability
      } catch (error) {
        console.error('Error during iframe load handling:', error);
        setLoadError('SCORM 콘텐츠를 로드하는 중 오류가 발생했습니다.');
      }
    };
    
    // Handle iframe error events
    const handleIframeError = (event: Event) => {
      console.error('Iframe load error:', event);
      setLoadError('SCORM 콘텐츠를 로드할 수 없습니다. 파일이 손상되었거나 접근할 수 없습니다.');
    };
    
    const iframe = iframeRef.current;
    if (iframe) {
      // Register event handlers
      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);
      
      // Set the iframe source
      iframe.src = cacheBustedUrl;
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
      };
    }
  }, [entryPointUrl]);
  
  return (
    <>
      {loadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {loadError}
          </AlertDescription>
        </Alert>
      )}
      
      <iframe 
        ref={iframeRef}
        title={title}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-pointer-lock"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      />
    </>
  );
};

export default ScormFrame;
