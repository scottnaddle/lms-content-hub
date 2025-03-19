
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ContentMetadataFormProps {
  title: string;
  description: string;
  fileType: string;
  tags: string;
  duration?: number | null;
  pageCount?: number | null;
  subject?: string;
  gradeLevel?: string;
  language?: string;
  learningObjectives?: string;
  isUploading: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileTypeChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onDurationChange?: (value: number | null) => void;
  onPageCountChange?: (value: number | null) => void;
  onSubjectChange?: (value: string) => void;
  onGradeLevelChange?: (value: string) => void;
  onLanguageChange?: (value: string) => void;
  onLearningObjectivesChange?: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ContentMetadataForm: React.FC<ContentMetadataFormProps> = ({
  title,
  description,
  fileType,
  tags,
  duration,
  pageCount,
  subject,
  gradeLevel,
  language,
  learningObjectives,
  isUploading,
  onTitleChange,
  onDescriptionChange,
  onFileTypeChange,
  onTagsChange,
  onDurationChange,
  onPageCountChange,
  onSubjectChange,
  onGradeLevelChange,
  onLanguageChange,
  onLearningObjectivesChange,
  onSubmit
}) => {
  const { t } = useLanguage();

  // Helper function to format duration
  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to parse duration input
  const parseDurationInput = (input: string): number | null => {
    if (!input) return null;
    
    // Handle MM:SS format
    if (input.includes(':')) {
      const [minutes, seconds] = input.split(':').map(part => parseInt(part.trim(), 10));
      if (!isNaN(minutes) && !isNaN(seconds)) {
        return (minutes * 60) + seconds;
      }
    }
    
    // Handle seconds-only format
    const secondsOnly = parseInt(input.trim(), 10);
    return !isNaN(secondsOnly) ? secondsOnly : null;
  };

  return (
    <div className="space-y-4 glass-panel p-6 animate-fade-in">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">{t('basicInfo')}</TabsTrigger>
          <TabsTrigger value="technical">{t('technicalInfo')}</TabsTrigger>
          <TabsTrigger value="educational">{t('educationalInfo')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
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
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-4">
          {(fileType === 'video' || fileType === 'audio') && (
            <div className="space-y-2">
              <Label htmlFor="duration">{t('duration')} (MM:SS)</Label>
              <Input
                id="duration"
                placeholder="3:45"
                value={duration ? formatDuration(duration) : ''}
                onChange={(e) => onDurationChange && onDurationChange(parseDurationInput(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">{t('durationHint')}</p>
            </div>
          )}
          
          {(fileType === 'pdf' || fileType === 'document') && (
            <div className="space-y-2">
              <Label htmlFor="pageCount">{t('pageCount')}</Label>
              <Input
                id="pageCount"
                type="number"
                min="1"
                placeholder="10"
                value={pageCount || ''}
                onChange={(e) => onPageCountChange && onPageCountChange(parseInt(e.target.value) || null)}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="educational" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">{t('subject')}</Label>
              <Input
                id="subject"
                placeholder={t('subjectPlaceholder')}
                value={subject || ''}
                onChange={(e) => onSubjectChange && onSubjectChange(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">{t('gradeLevel')}</Label>
              <Input
                id="gradeLevel"
                placeholder={t('gradeLevelPlaceholder')}
                value={gradeLevel || ''}
                onChange={(e) => onGradeLevelChange && onGradeLevelChange(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">{t('language')}</Label>
            <Select 
              value={language || 'ko'} 
              onValueChange={(value) => onLanguageChange && onLanguageChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="learningObjectives">{t('learningObjectives')}</Label>
            <Textarea
              id="learningObjectives"
              placeholder={t('learningObjectivesPlaceholder')}
              value={learningObjectives || ''}
              onChange={(e) => onLearningObjectivesChange && onLearningObjectivesChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t('separateByCommas')}</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading ? t('uploading') : t('uploadContent')}
        </Button>
      </div>
    </div>
  );
};

export default ContentMetadataForm;
