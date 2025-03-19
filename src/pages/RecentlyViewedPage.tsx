
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ContentGrid, { ContentItem } from '@/components/content/ContentGrid';
import { Chip } from '@/components/ui/chip';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateThumbnailUrl } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';

const RecentlyViewedPage: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentViewedContent() {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get recently viewed content for the logged-in user
          const { data, error } = await supabase
            .from('user_views')
            .select('content_id, viewed_at, contents(*)')
            .eq('user_id', user.id)
            .order('viewed_at', { ascending: false })
            .limit(20);
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Transform the database data to ContentItem format
            const formattedContent: ContentItem[] = data.map((item) => ({
              id: item.contents.id,
              title: item.contents.title,
              description: item.contents.description || undefined,
              type: item.contents.content_type as any,
              thumbnail: item.contents.thumbnail_path || generateThumbnailUrl(item.contents.content_type),
              dateAdded: item.viewed_at, // Use the view date instead of created_at
              tags: item.contents.tags || [],
            }));
            
            setRecentContent(formattedContent);
          } else {
            // If no viewed content, fall back to recently added content
            const { data: recentData, error: recentError } = await supabase
              .from('contents')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(20);
              
            if (recentError) throw recentError;
            
            const formattedContent: ContentItem[] = recentData.map((item: Tables<'contents'>) => ({
              id: item.id,
              title: item.title,
              description: item.description || undefined,
              type: item.content_type as any,
              thumbnail: item.thumbnail_path || generateThumbnailUrl(item.content_type),
              dateAdded: item.created_at,
              tags: item.tags || [],
            }));
            
            setRecentContent(formattedContent);
          }
        } else {
          // For anonymous users, show recent content
          const { data, error } = await supabase
            .from('contents')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
            
          if (error) throw error;
          
          const formattedContent: ContentItem[] = data.map((item: Tables<'contents'>) => ({
            id: item.id,
            title: item.title,
            description: item.description || undefined,
            type: item.content_type as any,
            thumbnail: item.thumbnail_path || generateThumbnailUrl(item.content_type),
            dateAdded: item.created_at,
            tags: item.tags || [],
          }));
          
          setRecentContent(formattedContent);
        }
      } catch (error: any) {
        console.error('Error fetching recent viewed content:', error);
        toast({
          title: t('notFound'),
          description: error.message || t('contentNotFoundDesc'),
          variant: 'destructive',
        });
        // Set empty array to prevent the UI from waiting indefinitely
        setRecentContent([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentViewedContent();
  }, [toast, t]);

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Chip className="bg-primary/10 text-primary border-none">{t('contentLibraryLabel')}</Chip>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h1 className="font-semibold tracking-tight">{t('recentlyViewed')}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {t('recentlyViewedDescription')}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ContentGrid 
            items={recentContent} 
            emptyMessage={t('contentNotFound') || "No content found"}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default RecentlyViewedPage;
