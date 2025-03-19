
import React from 'react';
import { Calendar, FileText, Clock, Layers, User, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ContentDetails } from '@/types/content';

interface ContentMetadataProps {
  content: ContentDetails;
  formattedDate: string;
}

const ContentMetadata: React.FC<ContentMetadataProps> = ({ 
  content, 
  formattedDate 
}) => {
  // Helper function to format duration
  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get file size in human-readable format
  const getFileSize = (): string => {
    const fileSizeBytes = content.metadata?.file_size;
    if (!fileSizeBytes) return 'N/A';
    
    if (fileSizeBytes < 1024) return `${fileSizeBytes} bytes`;
    if (fileSizeBytes < 1024 * 1024) return `${(fileSizeBytes / 1024).toFixed(1)} KB`;
    return `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{content.content_type.toUpperCase()}</span>
        </div>
        
        {content.duration && (content.content_type === 'video' || content.content_type === 'audio') && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(content.duration)}</span>
          </div>
        )}
        
        {content.page_count && (content.content_type === 'pdf' || content.content_type === 'document') && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>{content.page_count} 페이지</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="h-4 w-4" />
          <span>조회수: {content.view_count}</span>
        </div>
      </div>
      
      {/* Creator information */}
      {content.full_name && (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={content.avatar_url || ''} alt={content.full_name} />
            <AvatarFallback>{content.full_name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{content.full_name}</p>
            {content.username && <p className="text-xs text-muted-foreground">@{content.username}</p>}
          </div>
        </div>
      )}
      
      {/* Educational metadata card */}
      {content.metadata && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">교육 콘텐츠 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {content.metadata.subject && (
                <div>
                  <p className="text-muted-foreground">과목</p>
                  <p>{content.metadata.subject}</p>
                </div>
              )}
              
              {content.metadata.grade_level && (
                <div>
                  <p className="text-muted-foreground">학년/수준</p>
                  <p>{content.metadata.grade_level}</p>
                </div>
              )}
              
              {content.metadata.language && (
                <div>
                  <p className="text-muted-foreground">언어</p>
                  <p>{content.metadata.language === 'ko' ? '한국어' : 
                      content.metadata.language === 'en' ? 'English' : 
                      content.metadata.language === 'ja' ? '日本語' : 
                      content.metadata.language === 'zh' ? '中文' : 
                      content.metadata.language === 'es' ? 'Español' : 
                      content.metadata.language}</p>
                </div>
              )}
              
              {content.metadata.file_size && (
                <div>
                  <p className="text-muted-foreground">파일 크기</p>
                  <p>{getFileSize()}</p>
                </div>
              )}
            </div>
            
            {content.metadata.learning_objectives && content.metadata.learning_objectives.length > 0 && (
              <>
                <Separator className="my-3" />
                <div>
                  <p className="text-muted-foreground mb-2">학습 목표</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {content.metadata.learning_objectives.map((objective: string, index: number) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentMetadata;
