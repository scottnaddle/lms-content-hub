
import React from 'react';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContentTypeHeaderProps {
  typeLabel: string;
}

const ContentTypeHeader: React.FC<ContentTypeHeaderProps> = ({ typeLabel }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Get the appropriate button text based on content type
  const getUploadButtonText = () => {
    if (typeLabel.toLowerCase() === 'videos') return t('uploadVideo');
    if (typeLabel.toLowerCase() === 'audio') return t('uploadAudio');
    return t('uploadDocument');
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Chip className="bg-primary/10 text-primary border-none">{t('contentLibraryLabel')}</Chip>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="font-semibold tracking-tight">{typeLabel}</h1>
        <Button onClick={() => navigate('/upload')} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>{getUploadButtonText()}</span>
        </Button>
      </div>
    </div>
  );
};

export default ContentTypeHeader;
