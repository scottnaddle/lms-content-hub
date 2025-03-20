
import React from 'react';
import { Calendar, FileText, Clock, Hash } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContentMetadataProps {
  formattedDate: string;
  contentType: string;
  viewCount: number | null;
  duration?: number | null;
  pageCount?: number | null;
}

const ContentMetadata: React.FC<ContentMetadataProps> = ({ 
  formattedDate, 
  contentType, 
  viewCount,
  duration,
  pageCount
}) => {
  const { t } = useLanguage();
  
  // 재생 시간을 분:초 형식으로 변환
  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{formattedDate}</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>{t(contentType.toLowerCase() as any)}</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Hash className="h-4 w-4" />
        <span>{t('views')}: {viewCount || 0}</span>
      </div>

      {(contentType === 'video' || contentType === 'audio') && duration && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{t('duration')}: {formatDuration(duration)}</span>
        </div>
      )}

      {(contentType === 'pdf' || contentType === 'document') && pageCount && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="h-4 w-4" />
          <span>{t('pageCount')}: {pageCount}</span>
        </div>
      )}
    </div>
  );
};

export default ContentMetadata;
