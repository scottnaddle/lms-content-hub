
import React from 'react';
import { FileText, Video, Headphones } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ContentStats } from '@/types/statistics';

interface StatSummaryCardsProps {
  stats: ContentStats[];
  isLoading: boolean;
}

const StatSummaryCards: React.FC<StatSummaryCardsProps> = ({ stats, isLoading }) => {
  const { t } = useLanguage();
  
  // Get total counts
  const totalContent = stats.reduce((sum, item) => sum + item.count, 0);
  const totalViews = stats.reduce((sum, item) => sum + item.viewCount, 0);
  const totalDownloads = stats.reduce((sum, item) => sum + item.downloadCount, 0);
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-12 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalContent')}</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalContent}</div>
          <p className="text-xs text-muted-foreground">
            {t('itemsInLibrary')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalViews')}</CardTitle>
          <Video className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalViews}</div>
          <p className="text-xs text-muted-foreground">
            {t('contentViews')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalDownloads')}</CardTitle>
          <Headphones className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDownloads}</div>
          <p className="text-xs text-muted-foreground">
            {t('contentDownloads')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatSummaryCards;
