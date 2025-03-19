
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import ContentOverviewChart from './ContentOverviewChart';
import ContentTypeChart from './ContentTypeChart';
import MonthlyViewsChart from './MonthlyViewsChart';
import TrendLineChart from './TrendLineChart';
import ContentRadarChart from './ContentRadarChart';
import { ContentStats, ViewHistory, TrendData, ContentComparison } from '@/types/statistics';

interface StatisticsTabsProps {
  stats: ContentStats[];
  viewHistory: ViewHistory[];
  trendData: TrendData[];
  comparisonData: ContentComparison[];
}

const StatisticsTabs: React.FC<StatisticsTabsProps> = ({ 
  stats, 
  viewHistory,
  trendData,
  comparisonData
}) => {
  const { t } = useLanguage();
  
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
        <TabsTrigger value="content-types">{t('contentTypes')}</TabsTrigger>
        <TabsTrigger value="views">{t('viewTrends')}</TabsTrigger>
        <TabsTrigger value="trends">{t('trends')}</TabsTrigger>
        <TabsTrigger value="comparison">{t('comparison')}</TabsTrigger>
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
      
      <TabsContent value="trends" className="space-y-4">
        <TrendLineChart trendData={trendData} />
      </TabsContent>
      
      <TabsContent value="comparison" className="space-y-4">
        <ContentRadarChart comparisonData={comparisonData} />
      </TabsContent>
    </Tabs>
  );
};

export default StatisticsTabs;
