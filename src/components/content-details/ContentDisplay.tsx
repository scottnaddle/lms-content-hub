
import React from 'react';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import DocumentViewer from './DocumentViewer';

interface ContentDisplayProps {
  contentType: 'video' | 'audio' | 'pdf' | 'document';
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
  return (
    <div className="glass-panel p-6">
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
    </div>
  );
};

export default ContentDisplay;
