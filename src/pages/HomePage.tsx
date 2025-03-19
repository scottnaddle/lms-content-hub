import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { ContentItem } from '@/components/content/ContentGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { generateThumbnailUrl } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';
import DashboardHeader from '@/components/home/DashboardHeader';
import WelcomePanel from '@/components/home/WelcomePanel';
import RecentContent from '@/components/home/RecentContent';

const HomePage: React.FC = () => {
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
          .limit(8);

        if (error) {
          throw error;
        }

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
        console.error('Error fetching content:', error);
        toast({
          title: t('notFound'),
          description: error.message || t('contentNotFoundDesc'),
          variant: 'destructive',
        });
        setRecentContent([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentContent();
  }, [toast, t]);
  
  return (
    <PageLayout>
      <div className="space-y-12">
        <DashboardHeader />
        <WelcomePanel />
        <RecentContent recentContent={recentContent} isLoading={isLoading} />
      </div>
    </PageLayout>
  );
};

export default HomePage;
