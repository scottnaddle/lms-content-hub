
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ContentDetails } from '@/types/content';
import { getFileUrl, incrementViewCount } from '@/utils/content-utils';

export const useContentData = (id: string | undefined, t: (key: string) => string) => {
  const { toast } = useToast();
  const [content, setContent] = useState<ContentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch content details
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Increment view count
        await incrementViewCount(id);
        
        // Get content data
        const { data, error } = await supabase
          .from('contents')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Get file URLs
          const fileUrl = await getFileUrl(data.file_path);
          const thumbnailUrl = await getFileUrl(data.thumbnail_path);
          
          // Fix: Cast content_type to the correct enum type
          const contentType = data.content_type as 'video' | 'audio' | 'pdf' | 'document' | 'scorm';
          
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
  
  return {
    content,
    isLoading
  };
};
