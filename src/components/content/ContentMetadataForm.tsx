
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
  return (
    <div className="space-y-4 glass-panel p-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input 
          id="title" 
          placeholder="콘텐츠 제목 입력" 
          required 
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea 
          id="description" 
          placeholder="콘텐츠 설명 입력" 
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="content-type">콘텐츠 유형</Label>
          <Select value={fileType} onValueChange={onFileTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="콘텐츠 유형 선택" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="video">비디오</SelectItem>
              <SelectItem value="audio">오디오</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="document">문서</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
          <Input 
            id="tags" 
            placeholder="예: 강의, 수학, 초급" 
            value={tags}
            onChange={(e) => onTagsChange(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading ? "업로드 중..." : "콘텐츠 업로드"}
        </Button>
      </div>
    </div>
  );
};

export default ContentMetadataForm;
