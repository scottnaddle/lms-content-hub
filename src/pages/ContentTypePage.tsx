import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import ContentGrid, { ContentItem } from '@/components/content/ContentGrid';
import { capitalizeFirstLetter, generateThumbnailUrl } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import ContentTypeHeader from '@/components/content-type/ContentTypeHeader';
import ContentSearch from '@/components/content-type/ContentSearch';
import { getFileUrl } from '@/utils/content-utils';

const ContentTypePage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const { t } = useLanguage();
  
  const contentType = type?.toLowerCase() || '';
  const typeLabel = capitalizeFirstLetter(contentType);
  
  useEffect(() => {
    const loadContents = async () => {
      try {
        setIsLoading(true);
        
        const singularType = contentType.endsWith('s') 
          ? contentType.slice(0, -1) 
          : contentType;
        
        let query = supabase
          .from('contents')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (singularType === 'document') {
          query = query.or('content_type.eq.document,content_type.eq.pdf');
        } else {
          query = query.eq('content_type', singularType);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching contents:', error);
          throw error;
        }
        
        if (data) {
          const contentItems: ContentItem[] = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            type: item.content_type as 'video' | 'audio' | 'pdf' | 'document' | 'scorm',
            thumbnail: item.thumbnail_url || generateThumbnailUrl(item.content_type),
            dateAdded: item.created_at,
            tags: item.tags || [],
          }));
          
          setContents(contentItems);
        }
      } catch (error) {
        console.error('Error loading contents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (contentType) {
      loadContents();
    }
  }, [contentType]);
  
  // 검색어로 콘텐츠 필터링
  const filteredContent = contents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = searchTerm ? 
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) : 
      true;
    
    return matchesSearch || matchesTag;
  });
  
  // Get the appropriate search placeholder text based on content type
  const getSearchPlaceholder = () => {
    if (contentType === 'videos') return t('searchVideos');
    if (contentType === 'audio') return t('searchAudio');
    return t('searchDocuments');
  };
  
  // Get the appropriate empty message
  const getEmptyMessage = () => {
    if (searchTerm) {
      return `${searchTerm} - ${t('noMatchingItems')}`;
    }
    return `${t('noItems')}`;
  };
  
  return (
    <PageLayout>
      <div className="space-y-8">
        <ContentTypeHeader typeLabel={typeLabel} />
        
        <ContentSearch 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          placeholder={getSearchPlaceholder()} 
        />
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ContentGrid 
            items={filteredContent} 
            emptyMessage={getEmptyMessage()}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default ContentTypePage;
