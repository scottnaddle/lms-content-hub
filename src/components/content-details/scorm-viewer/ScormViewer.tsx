
import React, { useState } from 'react';
import ScormFrame from './ScormFrame';
import ScormProgress from './ScormProgress';
import ScormError from './ScormError';
import { useScormLoader } from './useScormLoader';

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
    extractedFiles
  } = useScormLoader(fileUrl);
  
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
        />
      )}
      
      <div 
        className={`w-full h-[70vh] border rounded-lg ${(isLoading || error) ? 'hidden' : 'block'}`}
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
