
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Edit, Trash2 } from 'lucide-react';

interface ContentActionsProps {
  isOwner: boolean;
  downloadCount: number | null;
  onDownload: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const ContentActions: React.FC<ContentActionsProps> = ({ 
  isOwner, 
  downloadCount, 
  onDownload, 
  onDelete, 
  isDeleting 
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="gap-1">
        <Share2 className="h-4 w-4" />
        <span>공유</span>
      </Button>
      <Button variant="outline" size="sm" className="gap-1" onClick={onDownload}>
        <Download className="h-4 w-4" />
        <span>다운로드 ({downloadCount})</span>
      </Button>
      {isOwner && (
        <>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default ContentActions;
