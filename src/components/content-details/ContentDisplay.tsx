
import React from 'react';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import DocumentViewer from './DocumentViewer';
import ScormViewer from './scorm-viewer';

interface ContentDisplayProps {
  contentType: 'video' | 'audio' | 'pdf' | 'document' | 'scorm';
  fileUrl?: string;
  thumbnailUrl?: string;
  title: string;
  onDownload: () => void;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({
  contentType,
  fileUrl,
  thumbnailUrl,
  title,
  onDownload
}) => {
  console.log('ContentDisplay: Content type and file URL', { contentType, fileUrl });
  
  return (
    <div className="glass-panel p-6 overflow-hidden">
      {contentType === 'video' && (
        <VideoPlayer fileUrl={fileUrl} thumbnailUrl={thumbnailUrl} title={title} />
      )}
      
      {contentType === 'audio' && (
        <AudioPlayer fileUrl={fileUrl} title={title} />
      )}
      
      {(contentType === 'pdf' || contentType === 'document') && (
        <DocumentViewer 
          fileUrl={fileUrl} 
          contentType={contentType} 
          title={title} 
          onDownload={onDownload} 
        />
      )}

      {contentType === 'scorm' && (
        <ScormViewer
          fileUrl={fileUrl}
          title={title}
          onDownload={onDownload}
        />
      )}
    </div>
  );
};

export default ContentDisplay;
