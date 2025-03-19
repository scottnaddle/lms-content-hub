
import { supabase } from '@/integrations/supabase/client';

// Format date function
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Record view function
export const recordContentView = async (userId: string | undefined, contentId: string | undefined) => {
  if (!userId || !contentId) return;
  
  try {
    const { data: viewData, error: viewCheckError } = await supabase.functions.invoke('record-content-view', {
      body: { 
        user_id: userId,
        content_id: contentId
      }
    });
    
    if (viewCheckError) {
      console.error('Error recording view:', viewCheckError);
    }
  } catch (error) {
    console.error('Error recording view:', error);
  }
};

// Increment view count
export const incrementViewCount = async (contentId: string) => {
  const { error: incrementError } = await supabase.rpc('increment_view_count', { content_id: contentId });
  
  if (incrementError) {
    console.error('Error incrementing view count:', incrementError);
  }
};

// Increment download count
export const incrementDownloadCount = async (contentId: string) => {
  const { error: downloadError } = await supabase.rpc('increment_download_count', { content_id: contentId });
  
  if (downloadError) {
    console.error('Error incrementing download count:', downloadError);
  }
};

// Get file URL from storage
export const getFileUrl = async (filePath: string | null) => {
  if (!filePath) return '';
  
  const { data } = await supabase.storage
    .from('content_files')
    .getPublicUrl(filePath);
  
  return data?.publicUrl || '';
};
