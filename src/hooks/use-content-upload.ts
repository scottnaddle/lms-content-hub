
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useContentUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('video');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFile = (selectedFile: File) => {
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

  const handleRemoveFile = () => {
    setFile(null);
  };

  // 특수문자와 비 영숫자 문자를 제거하고 안전한 파일 이름 생성
  const getSafeFileName = (originalName: string): string => {
    // 파일 확장자 추출
    const parts = originalName.split('.');
    const extension = parts.pop() || '';
    
    // 파일 이름에서 확장자를 제외한 부분
    const nameWithoutExtension = parts.join('.');
    
    // 파일 이름을 영숫자, 하이픈, 언더스코어로 제한
    const safeNameWithoutExtension = nameWithoutExtension
      .replace(/[^\w\s-]/g, '') // 영숫자, 공백, 하이픈만 허용
      .replace(/\s+/g, '_'); // 공백을 언더스코어로 변환
    
    // 만약 안전한 이름이 비어있다면 타임스탬프 사용
    const finalName = safeNameWithoutExtension || `file_${Date.now()}`;
    
    // 안전한 이름과 원래 확장자 결합
    return `${finalName}.${extension}`;
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
      
      if (!user) {
        toast({
          title: "인증 오류",
          description: "콘텐츠를 업로드하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }
      
      // 안전한 파일 이름 생성
      const safeFileName = getSafeFileName(file.name);
      const filePath = `${user.id}/${fileType}s/${Date.now()}_${safeFileName}`;
      
      const { data: fileData, error: fileError } = await supabase.storage
        .from('content_files')
        .upload(filePath, file);
      
      if (fileError) {
        console.error('Upload error:', fileError);
        throw fileError;
      }
      
      const { data: urlData } = await supabase.storage
        .from('content_files')
        .getPublicUrl(filePath);
      
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

  return {
    file,
    fileType,
    isUploading,
    title,
    description,
    tags,
    setTitle,
    setDescription,
    setFileType,
    setTags,
    handleFile,
    handleRemoveFile,
    handleSubmit
  };
};

