
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define type for content statistics data
export type ContentStats = {
  type: string;
  count: number;
  viewCount: number;
  downloadCount: number;
};

// Define type for view history data (monthly)
export type ViewHistory = {
  month: string;
  count: number;
};

export const useStatistics = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<ContentStats[]>([]);
  const [viewHistory, setViewHistory] = useState<ViewHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch content type statistics
        const { data: contentTypeData, error: contentTypeError } = await supabase
          .from('contents')
          .select('content_type, view_count, download_count');
          
        if (contentTypeError) {
          throw contentTypeError;
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
        
        setStats(Object.values(contentTypeStats));
        
        // Generate mock view history data (last 6 months)
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
        
        setViewHistory(historyData);
        
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
    isLoading
  };
};
