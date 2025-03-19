
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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

export const useContentDetails = (id: string | undefined, t: (key: string) => string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user?.id || null);
      
      // If user is logged in and content_id is available, record this view
      if (data.user && id) {
        try {
          // Fix: Using the rpc function via fetch to bypass TypeScript error
          // This is a workaround for the TypeScript type issue
          const { data: viewData, error: viewCheckError } = await supabase.functions.invoke('record-content-view', {
            body: { 
              user_id: data.user.id,
              content_id: id
            }
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
  
  // Fetch content details
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
        
        // Get content data
        const { data, error } = await supabase
          .from('contents')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Get file URLs
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
  
  // Handle download
  const handleDownload = async () => {
    if (!content || !content.fileUrl) return;
    
    try {
      // Fix: Use the RPC method with correct parameter structure
      const { error: downloadError } = await supabase.rpc('increment_download_count', { content_id: content.id });
      
      if (downloadError) {
        console.error('Error incrementing download count:', downloadError);
      }
      
      // Download file
      window.open(content.fileUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!content || !currentUser) return;
    
    try {
      setIsDeleting(true);
      
      // Delete file from storage
      if (content.file_path) {
        await supabase.storage
          .from('content_files')
          .remove([content.file_path]);
      }
      
      // Delete thumbnail
      if (content.thumbnail_path) {
        await supabase.storage
          .from('content_files')
          .remove([content.thumbnail_path]);
      }
      
      // Delete content from database
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', content.id);
      
      if (error) throw error;
      
      toast({
        title: "삭제 완료",
        description: "콘텐츠가 성공적으로 삭제되었습니다.",
      });
      
      // Navigate to content type page
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
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return {
    content,
    isLoading,
    isDeleting,
    currentUser,
    handleDownload,
    handleDelete,
    formatDate
  };
};
