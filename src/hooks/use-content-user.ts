
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { recordContentView } from '@/utils/content-utils';

export const useContentUser = (contentId: string | undefined) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id || null;
      setCurrentUser(userId);
      
      // If user is logged in and content_id is available, record this view
      if (data.user && contentId) {
        await recordContentView(data.user.id, contentId);
      }
    };
    
    getCurrentUser();
  }, [contentId]);
  
  return { currentUser };
};
