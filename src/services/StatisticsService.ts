
import { supabase } from '@/integrations/supabase/client';
import { ContentStats, ViewHistory, TrendData, ContentComparison } from '@/types/statistics';

export const StatisticsService = {
  /**
   * Fetch content type statistics data from Supabase
   */
  async fetchContentTypeStats(): Promise<ContentStats[]> {
    const { data: contentTypeData, error } = await supabase
      .from('contents')
      .select('content_type, view_count, download_count');
      
    if (error) {
      throw error;
    }
    
    // Calculate content type statistics
    const contentTypeStats: { [key: string]: ContentStats } = {};
    
    contentTypeData.forEach((item) => {
      const type = item.content_type;
      if (!contentTypeStats[type]) {
        contentTypeStats[type] = {
          type,
          count: 0,
          viewCount: 0,
          downloadCount: 0
        };
      }
      
      contentTypeStats[type].count += 1;
      contentTypeStats[type].viewCount += item.view_count || 0;
      contentTypeStats[type].downloadCount += item.download_count || 0;
    });
    
    return Object.values(contentTypeStats);
  },
  
  /**
   * Generate mock view history data (last 6 months)
   * TODO: Replace with actual data when available
   */
  generateViewHistoryData(): ViewHistory[] {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    const historyData: ViewHistory[] = [];
    
    // Generate data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping around to previous year
      historyData.push({
        month: months[monthIndex],
        count: Math.floor(Math.random() * 50) + 10 // Generate random view count data for now
      });
    }
    
    return historyData;
  },
  
  /**
   * Generate mock trend data for the last 12 days
   * TODO: Replace with actual data when available
   */
  generateTrendData(): TrendData[] {
    const trendData: TrendData[] = [];
    const currentDate = new Date();
    
    // Generate data for the last 12 days
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
      
      trendData.push({
        date: formattedDate,
        views: Math.floor(Math.random() * 30) + 5,
        downloads: Math.floor(Math.random() * 15) + 2
      });
    }
    
    return trendData;
  },
  
  /**
   * Generate mock content comparison data for radar chart
   * TODO: Replace with actual data when available
   */
  generateContentComparisonData(contentTypes: string[]): ContentComparison[] {
    return contentTypes.map(type => ({
      type,
      engagement: Math.floor(Math.random() * 80) + 20,
      popularity: Math.floor(Math.random() * 80) + 20,
      growth: Math.floor(Math.random() * 80) + 20,
      retention: Math.floor(Math.random() * 80) + 20
    }));
  }
};
