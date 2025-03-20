
import React, { useEffect, useRef, useState } from 'react';
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
  const [apiInjected, setApiInjected] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Add a cache-busting parameter to prevent caching issues
  const cacheBustedUrl = entryPointUrl.includes('?') 
    ? `${entryPointUrl}&cacheBust=${Date.now()}` 
    : `${entryPointUrl}?cacheBust=${Date.now()}`;
  
  // First, set up iframe when component mounts
  useEffect(() => {
    console.log('ScormFrame mounting with entry point:', entryPointUrl);
    return () => {
      console.log('ScormFrame unmounting, cleaning up...');
    };
  }, [entryPointUrl]);

  // Handle iframe loading and API injection with proper timing
  useEffect(() => {
    if (!iframeRef.current || !entryPointUrl) return;
    
    const iframe = iframeRef.current;
    
    // Function to inject API with retries
    const injectAPI = () => {
      console.log('Attempting to inject SCORM API...');
      
      // Delay API injection slightly to ensure iframe is ready
      setTimeout(() => {
        const success = injectScormApi(iframe);
        console.log('API injection result:', success ? 'SUCCESS' : 'FAILED');
        
        if (success) {
          setApiInjected(true);
        } else if (loadAttempts < 3) {
          console.log(`API injection failed, retrying (attempt ${loadAttempts + 1}/3)...`);
          setLoadAttempts(prev => prev + 1);
        } else {
          console.error('Failed to inject SCORM API after multiple attempts');
        }
      }, 100); // Short delay to let iframe content initialize
    };

    // Handle iframe load event
    const handleIframeLoad = () => {
      console.log('Iframe loaded, preparing to inject SCORM API');
      
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        // Log what's in the iframe
        if (iframeDoc) {
          console.log('Iframe document readyState:', iframeDoc.readyState);
          console.log('Iframe body content:', 
            iframeDoc.body ? 
              (iframeDoc.body.innerHTML.length > 100 ? 
                iframeDoc.body.innerHTML.substring(0, 100) + '...' : 
                iframeDoc.body.innerHTML) : 
              'No body element');
        } else {
          console.warn('Cannot access iframe document content (possible cross-origin restriction)');
        }
        
        // Inject the API
        injectAPI();
        
      } catch (err) {
        console.error('Error during iframe load handling:', err);
      }
    };
    
    // Add load event listener
    iframe.addEventListener('load', handleIframeLoad);
    
    // Set the source to trigger loading
    console.log('Setting iframe src to:', cacheBustedUrl);
    iframe.src = cacheBustedUrl;
    
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [entryPointUrl, cacheBustedUrl, loadAttempts]);
  
  // Add a final effect for retry logic
  useEffect(() => {
    if (loadAttempts > 0 && !apiInjected && iframeRef.current) {
      console.log(`Retry attempt ${loadAttempts}: Reloading iframe...`);
      
      // Force reload the iframe with a new cache busting parameter
      const iframe = iframeRef.current;
      const newCacheBustedUrl = `${entryPointUrl}?cacheBust=${Date.now()}-retry${loadAttempts}`;
      iframe.src = newCacheBustedUrl;
    }
  }, [loadAttempts, apiInjected, entryPointUrl]);

  return (
    <iframe 
      ref={iframeRef}
      title={title}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      onError={(e) => console.error('Iframe error:', e)}
    />
  );
};

export default ScormFrame;
