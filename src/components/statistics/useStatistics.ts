
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ContentStats, ViewHistory, TrendData, ContentComparison } from '@/types/statistics';
import { StatisticsService } from '@/services/StatisticsService';

export const useStatistics = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<ContentStats[]>([]);
  const [viewHistory, setViewHistory] = useState<ViewHistory[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [comparisonData, setComparisonData] = useState<ContentComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch content type statistics using the service
        const contentTypeStats = await StatisticsService.fetchContentTypeStats();
        setStats(contentTypeStats);
        
        // Generate view history data using the service
        const historyData = StatisticsService.generateViewHistoryData();
        setViewHistory(historyData);
        
        // Generate trend data
        const trends = StatisticsService.generateTrendData();
        setTrendData(trends);
        
        // Generate comparison data for radar chart
        const contentTypes = contentTypeStats.map(stat => stat.type);
        const comparison = StatisticsService.generateContentComparisonData(contentTypes);
        setComparisonData(comparison);
        
      } catch (error: any) {
        console.error('Error fetching statistics:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load statistics',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatistics();
  }, [toast]);

  return {
    stats,
    viewHistory,
    trendData,
    comparisonData,
    isLoading
  };
};
