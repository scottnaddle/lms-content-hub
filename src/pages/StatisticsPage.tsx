
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { useStatistics } from '@/components/statistics/useStatistics';
import StatisticsHeader from '@/components/statistics/StatisticsHeader';
import StatSummaryCards from '@/components/statistics/StatSummaryCards';
import StatisticsTabs from '@/components/statistics/StatisticsTabs';

const StatisticsPage: React.FC = () => {
  const { stats, viewHistory, trendData, comparisonData, isLoading } = useStatistics();
  
  return (
    <PageLayout>
      <div className="space-y-8">
        <StatisticsHeader />
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <StatSummaryCards stats={stats} isLoading={isLoading} />
            
            {/* Charts */}
            <StatisticsTabs 
              stats={stats} 
              viewHistory={viewHistory} 
              trendData={trendData}
              comparisonData={comparisonData}
            />
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default StatisticsPage;
