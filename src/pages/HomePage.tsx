
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ContentGrid, { ContentItem } from '@/components/content/ContentGrid';
import { Button } from '@/components/ui/button';
import { Plus, Clock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@/components/ui/chip';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { generateThumbnailUrl } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
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

        // Transform the database data to ContentItem format
        const formattedContent: ContentItem[] = data.map((item: Tables['contents']['Row']) => ({
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
          title: "Error",
          description: error.message || "Unable to fetch content",
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
      <div className="space-y-12">
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Chip className="bg-primary/10 text-primary border-none">{t('dashboard')}</Chip>
          </div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-semibold tracking-tight">{t('welcomeToDashboard')}</h1>
            <Button onClick={() => navigate('/upload')} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>{t('uploadContent')}</span>
            </Button>
          </div>
          
          <div className="glass-panel p-6 pb-10 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-semibold mb-2">{t('manageContent')}</h2>
              <p className="text-muted-foreground max-w-2xl mb-4">
                {t('contentDescription')}
              </p>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => navigate('/upload')} className="gap-2">
                  {t('getStarted')}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/lti-configuration')}>
                  {t('ltiConfiguration')}
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-medium">{t('recentlyAdded')}</h2>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/recently-viewed')} 
              className="text-sm"
            >
              {t('viewAll')}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ContentGrid 
              items={recentContent} 
              emptyMessage="No content found"
            />
          )}
        </section>
      </div>
    </PageLayout>
  );
};

export default HomePage;
