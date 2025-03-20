
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Chip } from '@/components/ui/chip';
import ContentSearch from '@/components/content-type/ContentSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TagsPage: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      
      // Get all content items with tags
      const { data, error } = await supabase
        .from('contents')
        .select('tags')
        .not('tags', 'is', null);
      
      if (error) throw error;
      
      // Extract all tags and flatten the array
      const extractedTags = data
        .flatMap(item => item.tags || [])
        .filter((tag): tag is string => tag !== null);
      
      // Remove duplicates and sort alphabetically
      const uniqueTags = [...new Set(extractedTags)].sort();
      
      setAllTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: t('error'),
        description: t('errorFetchingData'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    // Navigate to search page with the tag as a query
    navigate(`/search?tag=${encodeURIComponent(tag)}`);
  };

  // Filter tags based on search term
  const filteredTags = searchTerm 
    ? allTags.filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    : allTags;

  // Group tags by first letter for alphabetical display
  const groupedTags: Record<string, string[]> = {};
  filteredTags.forEach(tag => {
    const firstLetter = tag.charAt(0).toUpperCase();
    if (!groupedTags[firstLetter]) {
      groupedTags[firstLetter] = [];
    }
    groupedTags[firstLetter].push(tag);
  });

  // Get recent tags (last 20 unique ones)
  const recentTags = [...new Set(filteredTags)].slice(0, 20);

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold">{t('tags')}</h1>
          <ContentSearch 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            placeholder={t('searchTags')}
          />
        </div>

        <Tabs defaultValue="recent">
          <TabsList className="mb-4">
            <TabsTrigger value="recent">{t('recent')}</TabsTrigger>
            <TabsTrigger value="all">{t('allTags')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recentTags.map(tag => (
                  <Chip 
                    key={tag} 
                    variant={selectedTag === tag ? "default" : "outline"} 
                    className="cursor-pointer hover:bg-accent/80 transition-colors"
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('noTagsFound')}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : Object.keys(groupedTags).length > 0 ? (
              Object.keys(groupedTags).sort().map(letter => (
                <div key={letter} className="space-y-2">
                  <h2 className="text-lg font-semibold">{letter}</h2>
                  <div className="flex flex-wrap gap-2">
                    {groupedTags[letter].map(tag => (
                      <Chip 
                        key={tag} 
                        variant={selectedTag === tag ? "default" : "outline"} 
                        className="cursor-pointer hover:bg-accent/80 transition-colors"
                        onClick={() => handleTagSelect(tag)}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('noTagsFound')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default TagsPage;
