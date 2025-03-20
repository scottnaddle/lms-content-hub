
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
import TagInput from './TagInput';

interface ContentMetadataFormProps {
  title: string;
  description: string;
  fileType: string;
  tags: string;
  isUploading: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileTypeChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ContentMetadataForm: React.FC<ContentMetadataFormProps> = ({
  title,
  description,
  fileType,
  tags,
  isUploading,
  onTitleChange,
  onDescriptionChange,
  onFileTypeChange,
  onTagsChange,
  onSubmit
}) => {
  const { t } = useLanguage();

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
          <TagInput 
            value={tags}
            onChange={onTagsChange}
            placeholder={t('tagsExample')}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading ? t('uploading') : t('uploadContent')}
        </Button>
      </div>
    </div>
  );
};

export default ContentMetadataForm;
