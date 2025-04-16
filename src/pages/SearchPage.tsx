
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import ContentSearch from '@/components/content-type/ContentSearch';
import ContentGrid from '@/components/content/ContentGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ContentDetails } from '@/types/content';
import { Chip } from '@/components/ui/chip';
import { X } from 'lucide-react';

const SearchPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialQuery = searchParams.get('q') || '';
  const initialTag = searchParams.get('tag') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [results, setResults] = useState<ContentDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update search when the query or tag changes
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';
    
    setSearchTerm(query);
    setActiveTag(tag);
    
    performSearch(query, tag);
  }, [searchParams]);
  
  const performSearch = async (query: string, tag: string) => {
    try {
      setIsLoading(true);
      
      let queryBuilder = supabase
        .from('contents')
        .select('*');
      
      // Add filter by search term if present
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }
      
      // Add filter by tag if present
      if (tag) {
        queryBuilder = queryBuilder.contains('tags', [tag]);
      }
      
      // Execute the query with ordering
      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform content_type to the correct type and ensure thumbnail_path exists
      const typedResults = data.map(item => ({
        ...item,
        content_type: item.content_type as 'video' | 'audio' | 'pdf' | 'document' | 'scorm',
        thumbnail_path: item.thumbnail_path || item.thumbnail_url
      })) as ContentDetails[];
      
      setResults(typedResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (term: string) => {
    // Update the URL params and trigger the search
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    
    setSearchParams(params);
  };
  
  const clearTag = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tag');
    setSearchParams(params);
    setActiveTag('');
  };
  
  // Debounce search input to avoid making too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold">{t('search')}</h1>
          <ContentSearch 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            placeholder={t('searchContent')}
          />
        </div>
        
        {activeTag && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('filteringByTag')}:</span>
            <Chip 
              variant="default" 
              className="flex items-center gap-1"
            >
              {activeTag}
              <X 
                className="h-3 w-3 cursor-pointer ml-1" 
                onClick={clearTag} 
              />
            </Chip>
          </div>
        )}
        
        <ContentGrid 
          items={results.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            type: item.content_type,
            thumbnail: item.thumbnailUrl || '',
            dateAdded: item.created_at,
            tags: item.tags || []
          }))}
          isLoading={isLoading} 
          emptyMessage={t('noSearchResults') || t('noContent')}
        />
      </div>
    </PageLayout>
  );
};

export default SearchPage;
