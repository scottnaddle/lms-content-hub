
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit, 
  Trash2,
  FileText,
  Calendar,
  Tag
} from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContentDetails {
  id: string;
  title: string;
  description: string | null;
  content_type: 'video' | 'audio' | 'pdf' | 'document';
  file_path: string | null;
  thumbnail_path: string | null;
  created_at: string;
  created_by: string | null;
  tags: string[] | null;
  view_count: number | null;
  download_count: number | null;
  fileUrl?: string;
  thumbnailUrl?: string;
}

const ContentDetailsPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [content, setContent] = useState<ContentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // 현재 사용자 가져오기
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user?.id || null);
      
      // If user is logged in and content_id is available, record this view
      if (data.user && id) {
        try {
          // Call the RPC function with the correct parameter structure
          const { error: viewCheckError } = await supabase
            .rpc('record_content_view', { 
              p_user_id: data.user.id,
              p_content_id: id
            });
          
          if (viewCheckError) {
            console.error('Error recording view:', viewCheckError);
          }
        } catch (error) {
          console.error('Error recording view:', error);
        }
      }
    };
    
    getCurrentUser();
  }, [id]);
  
  // 콘텐츠 상세 정보 가져오기
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fix: Cast id to UUID type to match the parameter type
        const { error: incrementError } = await supabase.rpc('increment_view_count', { content_id: id });
        
        if (incrementError) {
          console.error('Error incrementing view count:', incrementError);
        }
        
        // 콘텐츠 데이터 가져오기
        const { data, error } = await supabase
          .from('contents')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // 파일 URL 가져오기
          let fileUrl = '';
          let thumbnailUrl = '';
          
          if (data.file_path) {
            const { data: fileData } = await supabase.storage
              .from('content_files')
              .getPublicUrl(data.file_path);
            fileUrl = fileData?.publicUrl || '';
          }
          
          if (data.thumbnail_path) {
            const { data: thumbnailData } = await supabase.storage
              .from('content_files')
              .getPublicUrl(data.thumbnail_path);
            thumbnailUrl = thumbnailData?.publicUrl || '';
          }
          
          // Fix: Cast content_type to the correct enum type
          const contentType = data.content_type as 'video' | 'audio' | 'pdf' | 'document';
          
          setContent({
            ...data,
            content_type: contentType,
            fileUrl,
            thumbnailUrl
          });
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast({
          title: t('notFound'),
          description: t('contentNotFoundDesc'),
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [id, toast, t]);
  
  const handleDownload = async () => {
    if (!content || !content.fileUrl) return;
    
    try {
      // Fix: Use the RPC method with correct parameter structure
      const { error: downloadError } = await supabase.rpc('increment_download_count', { content_id: content.id });
      
      if (downloadError) {
        console.error('Error incrementing download count:', downloadError);
      }
      
      // 파일 다운로드
      window.open(content.fileUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };
  
  const handleDelete = async () => {
    if (!content || !currentUser) return;
    
    try {
      setIsDeleting(true);
      
      // 스토리지에서 파일 삭제
      if (content.file_path) {
        await supabase.storage
          .from('content_files')
          .remove([content.file_path]);
      }
      
      // 썸네일 삭제
      if (content.thumbnail_path) {
        await supabase.storage
          .from('content_files')
          .remove([content.thumbnail_path]);
      }
      
      // 데이터베이스에서 콘텐츠 삭제
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', content.id);
      
      if (error) throw error;
      
      toast({
        title: "삭제 완료",
        description: "콘텐츠가 성공적으로 삭제되었습니다.",
      });
      
      // 콘텐츠 유형 페이지로 이동
      navigate(`/${content.content_type}s`);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "삭제 실패",
        description: "콘텐츠를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  if (!content) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">콘텐츠를 찾을 수 없음</h2>
          <p className="text-muted-foreground mb-6">요청하신 콘텐츠가 존재하지 않거나 삭제되었습니다.</p>
          <Button onClick={() => navigate(-1)}>뒤로 가기</Button>
        </div>
      </PageLayout>
    );
  }
  
  const formattedDate = new Date(content.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const isOwner = currentUser === content.created_by;
  
  return (
    <PageLayout>
      <div className="space-y-8 animate-in">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Chip className="bg-primary/10 text-primary border-none capitalize">
            {content.content_type}
          </Chip>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-semibold tracking-tight">{content.title}</h1>
            <p className="text-muted-foreground">{content.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {content.tags?.map((tag) => (
              <Chip key={tag} variant="outline" className="bg-accent/50">
                {tag}
              </Chip>
            ))}
          </div>
          
          <div className="flex justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{content.content_type.toUpperCase()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>조회수: {content.view_count}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" />
                <span>공유</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                <span>다운로드 ({content.download_count})</span>
              </Button>
              {isOwner && (
                <>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="glass-panel p-6">
            {content.content_type === 'video' && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                {content.fileUrl ? (
                  <video 
                    src={content.fileUrl} 
                    controls 
                    className="w-full h-full object-contain"
                    poster={content.thumbnailUrl || undefined}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/80">
                    <p className="text-white/70">비디오를 불러올 수 없습니다</p>
                  </div>
                )}
              </div>
            )}
            
            {content.content_type === 'audio' && (
              <div className="p-8 rounded-lg bg-accent flex items-center justify-center">
                {content.fileUrl ? (
                  <div className="w-full">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary text-5xl">♪</span>
                    </div>
                    <p className="text-lg font-medium text-center mb-4">{content.title}</p>
                    <audio controls className="w-full">
                      <source src={content.fileUrl} />
                      브라우저가 오디오 재생을 지원하지 않습니다.
                    </audio>
                  </div>
                ) : (
                  <p className="text-muted-foreground">오디오를 불러올 수 없습니다</p>
                )}
              </div>
            )}
            
            {(content.content_type === 'pdf' || content.content_type === 'document') && (
              <div className="p-6 rounded-lg bg-accent">
                {content.fileUrl && content.content_type === 'pdf' ? (
                  <div className="aspect-[4/3]">
                    <iframe 
                      src={content.fileUrl} 
                      className="w-full h-full rounded-md"
                      title={content.title}
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-lg flex flex-col items-center justify-center bg-muted">
                    <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
                    <Button onClick={handleDownload}>다운로드하여 보기</Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium mb-4">LTI 통합</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                이 콘텐츠는 LTI 통합을 통해 Canvas LMS 및 Moodle에 포함할 수 있습니다.
              </p>
              <Button onClick={() => navigate('/lti-configuration')}>
                LTI 구성
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContentDetailsPage;
