
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import ContentOverviewChart from './ContentOverviewChart';
import ContentTypeChart from './ContentTypeChart';
import MonthlyViewsChart from './MonthlyViewsChart';
import { ContentStats, ViewHistory } from '@/types/statistics';

interface StatisticsTabsProps {
  stats: ContentStats[];
  viewHistory: ViewHistory[];
}

const StatisticsTabs: React.FC<StatisticsTabsProps> = ({ stats, viewHistory }) => {
  const { t } = useLanguage();
  
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
        <TabsTrigger value="content-types">{t('contentTypes')}</TabsTrigger>
        <TabsTrigger value="views">{t('viewTrends')}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <ContentOverviewChart stats={stats} />
      </TabsContent>
      
      <TabsContent value="content-types" className="space-y-4">
        <ContentTypeChart stats={stats} />
      </TabsContent>
      
      <TabsContent value="views" className="space-y-4">
        <MonthlyViewsChart viewHistory={viewHistory} />
      </TabsContent>
    </Tabs>
  );
};

export default StatisticsTabs;
