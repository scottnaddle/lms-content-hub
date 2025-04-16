
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { incrementDownloadCount } from '@/utils/content-utils';
import { ContentDetails } from '@/types/content';

export const useContentActions = (content: ContentDetails | null) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Handle download
  const handleDownload = async () => {
    if (!content || !content.fileUrl) return;
    
    try {
      // Increment download count
      await incrementDownloadCount(content.id);
      
      // Download file
      window.open(content.fileUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!content) return;
    
    try {
      setIsDeleting(true);
      
      // Delete file from storage
      if (content.file_path) {
        await supabase.storage
          .from('content_files')
          .remove([content.file_path]);
      }
      
      // Delete thumbnail
      if (content.thumbnail_url) {
        await supabase.storage
          .from('content_files')
          .remove([content.thumbnail_url]);
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
  
  return {
    isDeleting,
    handleDownload,
    handleDelete
  };
};

