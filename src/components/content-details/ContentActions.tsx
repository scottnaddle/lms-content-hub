
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Edit, Trash2, Check, Copy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface ContentActionsProps {
  isOwner: boolean;
  contentId: string;
  contentType: string;
  downloadCount: number | null;
  onDownload: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const ContentActions: React.FC<ContentActionsProps> = ({ 
  isOwner, 
  contentId,
  contentType,
  downloadCount, 
  onDownload, 
  onDelete, 
  isDeleting 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate share URL for the content
  const shareUrl = window.location.origin + `/content/${contentType}/${contentId}`;
  
  const handleCopyClick = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    toast({
      title: t('urlCopied'),
      description: t('urlCopiedDesc'),
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleEditClick = () => {
    navigate(`/edit/${contentType}/${contentId}`);
  };
  
  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => setShareDialogOpen(true)}
        >
          <Share2 className="h-4 w-4" />
          <span>{t('share')}</span>
        </Button>
        
        <Button variant="outline" size="sm" className="gap-1" onClick={onDownload}>
          <Download className="h-4 w-4" />
          <span>{t('download')} ({downloadCount})</span>
        </Button>
        
        {isOwner && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4" />
              <span>{t('edit')}</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">{t('delete')}</span>
            </Button>
          </>
        )}
      </div>
      
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('shareContent')}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">{t('shareUrlDesc')}</p>
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleCopyClick}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentActions;
