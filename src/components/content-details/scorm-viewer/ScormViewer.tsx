
import React, { useEffect } from 'react';
import ScormFrame from './ScormFrame';
import ScormProgress from './ScormProgress';
import ScormError from './ScormError';
import { useScormLoader } from './useScormLoader';
import { cleanupScormResources } from '@/utils/scorm/scorm-cleanup';
import { injectScormApi } from '@/utils/scorm';

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
  const {
    error,
    isLoading,
    entryPointUrl,
    downloadProgress,
    extractionProgress,
    stage,
    extractedFiles,
    retryLoading,
    retryCount
  } = useScormLoader(fileUrl);
  
  // Debug logging
  console.log('ScormViewer state:', { 
    error, 
    isLoading, 
    entryPointUrl: entryPointUrl ? '[URL exists]' : 'null',
    stage,
    downloadProgress,
    extractionProgress,
    filesCount: extractedFiles.size,
    retryCount
  });
  
  // Initialize SCORM API handlers once when component mounts
  useEffect(() => {
    // Early initialize SCORM API handlers in parent window
    injectScormApi(null);
    
    return () => {
      // Cleanup when component unmounts
      if (extractedFiles.size > 0) {
        console.log('Cleaning up SCORM resources');
        cleanupScormResources(extractedFiles);
      }
    };
  }, []);
  
  // Cleanup resources on unmount or when files change
  useEffect(() => {
    return () => {
      if (extractedFiles.size > 0) {
        console.log('Cleaning up SCORM resources on files change');
        cleanupScormResources(extractedFiles);
      }
    };
  }, [extractedFiles]);
  
  return (
    <div className="w-full flex flex-col space-y-4">
      {isLoading && (
        <ScormProgress 
          stage={stage}
          downloadProgress={downloadProgress}
          extractionProgress={extractionProgress}
        />
      )}
      
      {error && (
        <ScormError 
          error={error} 
          onDownload={onDownload}
          onRetry={retryLoading}
          retryCount={retryCount}
        />
      )}
      
      <div 
        className={`w-full h-[70vh] bg-gray-50 border rounded-lg overflow-hidden transition-opacity duration-300 ${(isLoading || error) ? 'hidden' : 'block animate-fade-in'}`}
        data-testid="scorm-container"
      >
        {entryPointUrl && !isLoading && !error && (
          <ScormFrame 
            entryPointUrl={entryPointUrl} 
            title={title} 
            extractedFiles={extractedFiles} 
          />
        )}
      </div>
    </div>
  );
};

export default ScormViewer;
