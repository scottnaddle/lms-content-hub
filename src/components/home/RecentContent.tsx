
import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ContentGrid, { ContentItem } from '@/components/content/ContentGrid';
import { useLanguage } from '@/contexts/LanguageContext';

interface RecentContentProps {
  recentContent: ContentItem[];
  isLoading: boolean;
}

const RecentContent: React.FC<RecentContentProps> = ({ recentContent, isLoading }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
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
  );
};

export default RecentContent;
