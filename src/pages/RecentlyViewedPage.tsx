
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
    async function fetchRecentContent() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('contents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          throw error;
        }

        // Transform the database data to ContentItem format
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
      } catch (error: any) {
        console.error('Error fetching recent content:', error);
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

    fetchRecentContent();
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
            {'Browse your recently uploaded content.'}
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
