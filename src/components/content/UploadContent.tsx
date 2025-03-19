
import React, { useState } from 'react';
import { Upload, X, FileText, Video, FileAudio, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const UploadContent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('video');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    // Auto-detect file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension) {
      if (['mp4', 'mov', 'webm', 'avi'].includes(fileExtension)) {
        setFileType('video');
      } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension)) {
        setFileType('audio');
      } else if (fileExtension === 'pdf') {
        setFileType('pdf');
      } else {
        setFileType('document');
      }
    }
    
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title) {
      toast({
        title: "입력 오류",
        description: "파일과 제목은 필수 입력사항입니다.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // 현재 로그인된 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "인증 오류",
          description: "콘텐츠를 업로드하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }
      
      // 파일 경로 생성 (사용자 ID를 포함하여 권한 관리)
      const filePath = `${user.id}/${fileType}s/${Date.now()}_${file.name}`;
      
      // Supabase Storage에 파일 업로드
      const { data: fileData, error: fileError } = await supabase.storage
        .from('content_files')
        .upload(filePath, file);
      
      if (fileError) {
        throw fileError;
      }
      
      // 파일 URL 생성
      const { data: urlData } = await supabase.storage
        .from('content_files')
        .getPublicUrl(filePath);
      
      // 콘텐츠 메타데이터를 데이터베이스에 저장
      const { data: contentData, error: contentError } = await supabase
        .from('contents')
        .insert({
          title,
          description,
          content_type: fileType,
          file_path: filePath,
          created_by: user.id,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        })
        .select('id')
        .single();
      
      if (contentError) {
        throw contentError;
      }
      
      setIsUploading(false);
      toast({
        title: "업로드 성공",
        description: "콘텐츠가 성공적으로 업로드되었습니다.",
      });
      
      // 업로드 성공 후 콘텐츠 타입에 해당하는 페이지로 이동
      navigate(`/${fileType}s`);
      
    } catch (error: any) {
      setIsUploading(false);
      console.error('Upload error:', error);
      toast({
        title: "업로드 실패",
        description: error.message || "콘텐츠 업로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const renderFileTypeIcon = () => {
    switch (fileType) {
      case 'video':
        return <Video className="h-12 w-12 text-primary/50" />;
      case 'audio':
        return <FileAudio className="h-12 w-12 text-primary/50" />;
      case 'pdf':
        return <FileText className="h-12 w-12 text-primary/50" />;
      default:
        return <FileIcon className="h-12 w-12 text-primary/50" />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-12",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            file && "border-primary/40 bg-primary/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="text-center animate-scale-in">
              {renderFileTypeIcon()}
              <p className="mt-4 font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4 mr-2" />
                파일 제거
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">파일을 끌어다 놓으세요</h3>
              <p className="text-sm text-muted-foreground mb-4">
                또는 파일 찾아보기
              </p>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                asChild
                className="relative"
              >
                <label htmlFor="file-upload">
                  <span>파일 찾기</span>
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                지원 형식: MP4, MP3, PDF, DOC, DOCX 등
              </p>
            </>
          )}
        </div>

        {file && (
          <div className="space-y-4 glass-panel p-6 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input 
                id="title" 
                placeholder="콘텐츠 제목 입력" 
                required 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea 
                id="description" 
                placeholder="콘텐츠 설명 입력" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-type">콘텐츠 유형</Label>
                <Select value={fileType} onValueChange={setFileType}>
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
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? "업로드 중..." : "콘텐츠 업로드"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default UploadContent;
