
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContentMetadataFormProps {
  title: string;
  description: string;
  fileType: string;
  tags: string;
  duration: number | null;
  pageCount: number | null;
  isUploading: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileTypeChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onDurationChange: (value: number | null) => void;
  onPageCountChange: (value: number | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ContentMetadataForm: React.FC<ContentMetadataFormProps> = ({
  title,
  description,
  fileType,
  tags,
  duration,
  pageCount,
  isUploading,
  onTitleChange,
  onDescriptionChange,
  onFileTypeChange,
  onTagsChange,
  onDurationChange,
  onPageCountChange,
  onSubmit
}) => {
  const { t } = useLanguage();

  // 초를 분:초 형식으로 변환
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 분:초 문자열을 초로 변환
  const parseDuration = (timeString: string) => {
    if (!timeString) return null;
    const parts = timeString.split(':');
    if (parts.length !== 2) return null;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (isNaN(minutes) || isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const durationInSeconds = parseDuration(e.target.value);
    onDurationChange(durationInSeconds);
  };

  return (
    <div className="space-y-4 glass-panel p-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="title">{t('contentTitle')}</Label>
        <Input 
          id="title" 
          placeholder={t('enterContentTitle')} 
          required 
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea 
          id="description" 
          placeholder={t('enterContentDescription')} 
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="content-type">{t('contentType')}</Label>
          <Select value={fileType} onValueChange={onFileTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectContentType')} />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="video">{t('video')}</SelectItem>
              <SelectItem value="audio">{t('audio')}</SelectItem>
              <SelectItem value="pdf">{t('pdf')}</SelectItem>
              <SelectItem value="document">{t('document')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">{t('tagsWithSeparator')}</Label>
          <Input 
            id="tags" 
            placeholder={t('tagsExample')} 
            value={tags}
            onChange={(e) => onTagsChange(e.target.value)}
          />
        </div>
      </div>

      {/* 파일 유형에 따른 추가 메타데이터 필드 */}
      {(fileType === 'video' || fileType === 'audio') && (
        <div className="space-y-2">
          <Label htmlFor="duration">{t('duration')} (MM:SS)</Label>
          <Input 
            id="duration" 
            placeholder="0:00" 
            value={formatDuration(duration)}
            onChange={handleDurationChange}
          />
        </div>
      )}

      {(fileType === 'pdf' || fileType === 'document') && (
        <div className="space-y-2">
          <Label htmlFor="pageCount">{t('pageCount')}</Label>
          <Input 
            id="pageCount" 
            type="number" 
            placeholder="0" 
            value={pageCount || ''}
            onChange={(e) => onPageCountChange(parseInt(e.target.value) || null)}
          />
        </div>
      )}

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading ? t('uploading') : t('uploadContent')}
        </Button>
      </div>
    </div>
  );
};

export default ContentMetadataForm;
