
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface DocumentViewerProps {
  fileUrl: string | undefined;
  contentType: 'pdf' | 'document';
  title: string;
  onDownload: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  fileUrl, 
  contentType, 
  title, 
  onDownload 
}) => {
  return (
    <div className="p-6 rounded-lg bg-accent">
      {fileUrl && contentType === 'pdf' ? (
        <div className="aspect-[4/3]">
          <iframe 
            src={fileUrl} 
            className="w-full h-full rounded-md"
            title={title}
          />
        </div>
      ) : (
        <div className="aspect-[4/3] rounded-lg flex flex-col items-center justify-center bg-muted">
          <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <Button onClick={onDownload}>다운로드하여 보기</Button>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
