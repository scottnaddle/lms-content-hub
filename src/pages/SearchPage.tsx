
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { generateThumbnailUrl } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import ContentGrid, { ContentItem } from '@/components/content/ContentGrid';
import { Skeleton } from '@/components/ui/skeleton';
import ContentSearch from '@/components/content-type/ContentSearch';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const updateSearchQuery = (term: string) => {
    setSearchTerm(term);
    setSearchParams({ q: term });
  };

  useEffect(() => {
    async function searchContent() {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('contents')
          .select('*')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const formattedContent: ContentItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || undefined,
          type: item.content_type as any,
          thumbnail: item.thumbnail_path || generateThumbnailUrl(item.content_type),
          dateAdded: item.created_at,
          tags: item.tags || [],
        }));

        setSearchResults(formattedContent);
      } catch (error: any) {
        console.error('Error searching content:', error);
        toast({
          title: t('searchError'),
          description: error.message || t('errorOccurred'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    searchContent();
  }, [query, toast, t]);

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">{t('searchResults')}</h1>
          <p className="text-muted-foreground">
            {query ? t('resultsFor').replace('{query}', query) : t('enterSearchTerm')}
          </p>
          
          <div className="w-full max-w-2xl">
            <ContentSearch 
              searchTerm={searchTerm} 
              setSearchTerm={updateSearchQuery} 
              placeholder={t('searchContent')}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <ContentGrid 
            items={searchResults} 
            emptyMessage={query ? t('noResultsFound').replace('{query}', query) : t('enterSearchTerm')}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default SearchPage;
