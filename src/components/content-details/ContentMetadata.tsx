
import React from 'react';
import { Calendar, FileText } from 'lucide-react';

interface ContentMetadataProps {
  formattedDate: string;
  contentType: string;
  viewCount: number | null;
}

const ContentMetadata: React.FC<ContentMetadataProps> = ({ 
  formattedDate, 
  contentType, 
  viewCount 
}) => {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{formattedDate}</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>{contentType.toUpperCase()}</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>조회수: {viewCount}</span>
      </div>
    </div>
  );
};

export default ContentMetadata;
