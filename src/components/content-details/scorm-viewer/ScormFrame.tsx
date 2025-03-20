
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

  // Inject the communication script into the iframe
  const injectCommunicationScript = (iframe: HTMLIFrameElement) => {
    try {
      const script = `
        // SCORM API Bridge for Cross-Domain Communication
        (function() {
          // Generate a unique ID for this session
          const sessionId = new Date().getTime() + '-' + Math.random().toString(36).substring(2, 9);
          console.log('SCORM API Bridge initialized with session ID:', sessionId);
          
          // Create call counter for matching responses
          let callCounter = 0;
          
          // Create a promise-based tracking system for API calls
          const pendingCalls = {};
          
          // Function to create proxy API methods
          function createAPIProxy(version) {
            return new Proxy({}, {
              get: function(target, method) {
                if (typeof method !== 'string') return undefined;
                
                return function() {
                  const callId = sessionId + '-' + (callCounter++);
                  const params = Array.from(arguments);
                  
                  // Create a promise that will be resolved when we get a response
                  const promise = new Promise((resolve) => {
                    pendingCalls[callId] = resolve;
                  });
                  
                  // Send the API call to the parent
                  window.parent.postMessage({
                    scormAPICall: true,
                    scormVersion: version,
                    method: method,
                    params: params,
                    callId: callId
                  }, '*');
                  
                  // We need to handle both sync and async patterns that SCORM content might use
                  const result = undefined; // Default return for async
                  
                  // Set a timeout to clean up the pending call if it doesn't get a response
                  setTimeout(() => {
                    if (pendingCalls[callId]) {
                      console.warn('SCORM API call timeout:', method);
                      delete pendingCalls[callId];
                    }
                  }, 5000);
                  
                  // Return the result for sync calls
                  return result;
                };
              }
            });
          }
          
          // Install message listener for responses
          window.addEventListener('message', function(event) {
            const data = event.data;
            
            // Process only SCORM API responses
            if (!data || !data.scormAPIResponse) return;
            
            const { callId, result } = data;
            
            // Resolve the pending promise
            if (pendingCalls[callId]) {
              pendingCalls[callId](result);
              delete pendingCalls[callId];
            }
          });
          
          // Create the SCORM API objects
          window.API = createAPIProxy('1.2');
          window.API_1484_11 = createAPIProxy('2004');
          
          console.log('SCORM API Bridge ready:', { 
            API: !!window.API, 
            API_1484_11: !!window.API_1484_11 
          });
        })();
      `;
      
      setTimeout(() => {
        if (iframe.contentWindow) {
          try {
            // Try to inject directly if same origin - use document.write instead of eval
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(`<script>${script}</script>`);
            iframe.contentWindow.document.close();
            console.log('Successfully injected SCORM API Bridge directly');
          } catch (e) {
            console.log('Direct injection failed (expected for cross-origin), using postMessage');
            // Fallback for cross-origin: use postMessage to send the script
            iframe.contentWindow.postMessage({
              scormBridgeScript: script
            }, '*');
          }
        }
      }, 500);
    } catch (error) {
      console.error('Error injecting communication script:', error);
    }
  };

  useEffect(() => {
    if (!entryPointUrl) return;
    
    // Reset any previous errors
    setLoadError(null);
    
    // Add cache-busting to prevent caching issues
    const cacheBustedUrl = `${entryPointUrl}?cacheBust=${Date.now()}`;
    console.log('Setting iframe src to:', cacheBustedUrl);
    
    // Inject SCORM API to parent window BEFORE loading the iframe
    try {
      console.log('Creating SCORM API handlers in parent window');
      injectScormApi(null); // Create API handlers in parent window
    } catch (error) {
      console.error('Error creating SCORM API handlers:', error);
    }
    
    // Handle iframe load event
    const handleIframeLoad = () => {
      try {
        console.log('Iframe loaded successfully');
        
        // Inject the communication script into the iframe after it loads
        if (iframeRef.current) {
          injectCommunicationScript(iframeRef.current);
        }
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
        // 최대한 많은 권한을 부여
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-pointer-lock allow-top-navigation allow-modals"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </>
  );
};

export default ScormFrame;
