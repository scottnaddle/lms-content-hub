
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ContentGrid, { ContentItem } from '@/components/content/ContentGrid';
import ContentSearch from '@/components/content-type/ContentSearch';
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
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Filter content based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredContent(recentContent);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = recentContent.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerSearchTerm) ||
          (item.description && item.description.toLowerCase().includes(lowerSearchTerm)) ||
          item.tags.some((tag) => tag.toLowerCase().includes(lowerSearchTerm))
      );
      setFilteredContent(filtered);
    }
  }, [searchTerm, recentContent]);

  useEffect(() => {
    async function fetchRecentViewedContent() {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user ? 'Logged in' : 'Not logged in');
        
        if (user) {
          console.log('Fetching recently viewed content for user:', user.id);
          // Get recently viewed content for the logged-in user
          const { data, error } = await supabase
            .from('contents')
            .select(`
              id, 
              title, 
              description, 
              content_type, 
              thumbnail_path, 
              tags, 
              created_at,
              user_views!inner(viewed_at)
            `)
            .eq('user_views.user_id', user.id)
            .order('user_views.viewed_at', { ascending: false })
            .limit(20);
            
          if (error) {
            console.error('Error fetching user views:', error);
            throw error;
          }
          
          console.log('Fetched user views data:', data ? `${data.length} items` : 'No data');
          
          if (data && data.length > 0) {
            // Transform the database data to ContentItem format
            const formattedContent: ContentItem[] = data.map((item: any) => ({
              id: item.id,
              title: item.title,
              description: item.description || undefined,
              type: item.content_type as any,
              thumbnail: item.thumbnail_path || generateThumbnailUrl(item.content_type),
              dateAdded: item.user_views[0].viewed_at, // Use the view date instead of created_at
              tags: item.tags || [],
            }));
            
            setRecentContent(formattedContent);
          } else {
            console.log('No viewed content, falling back to recently added content');
            // If no viewed content, fall back to recently added content
            const { data: recentData, error: recentError } = await supabase
              .from('contents')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(20);
              
            if (recentError) {
              console.error('Error fetching recent content:', recentError);
              throw recentError;
            }
            
            console.log('Fetched recent content:', recentData ? `${recentData.length} items` : 'No data');
            
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
          console.log('No user logged in, showing recent content');
          // For anonymous users, show recent content
          const { data, error } = await supabase
            .from('contents')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
            
          if (error) {
            console.error('Error fetching recent content for anonymous user:', error);
            throw error;
          }
          
          console.log('Fetched recent content for anonymous user:', data ? `${data.length} items` : 'No data');
          
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
        <div className="space-y-4">
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
          
          <ContentSearch 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder={t('searchContent')}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ContentGrid 
            items={filteredContent.length > 0 ? filteredContent : recentContent} 
            emptyMessage={t('contentNotFound') || "No content found"}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default RecentlyViewedPage;
