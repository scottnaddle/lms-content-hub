
import React, { useEffect, useRef } from 'react';
import { injectScormApi } from '@/utils/scorm';

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
  
  console.log('ScormFrame mounting with entry point:', entryPointUrl);

  useEffect(() => {
    if (!entryPointUrl) return;
    
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
        }, 300);
      } catch (error) {
        console.error('Error during iframe load handling:', error);
      }
    };
    
    const iframe = iframeRef.current;
    if (iframe) {
      // Register the load event handler
      iframe.addEventListener('load', handleIframeLoad);
      
      // Set the iframe source
      iframe.src = cacheBustedUrl;
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
      };
    }
  }, [entryPointUrl]);
  
  return (
    <iframe 
      ref={iframeRef}
      title={title}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  );
};

export default ScormFrame;
