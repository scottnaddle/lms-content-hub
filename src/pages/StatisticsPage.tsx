
import React, { useState, useEffect } from 'react';
import { BarChart as BarChartIcon, FileText, Video, Headphones } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Chip } from '@/components/ui/chip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Define type for content statistics data
type ContentStats = {
  type: string;
  count: number;
  viewCount: number;
  downloadCount: number;
};

// Define type for view history data (monthly)
type ViewHistory = {
  month: string;
  count: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatisticsPage: React.FC = () => {
  const { t } = useLanguage();
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
  
  // Get total counts
  const totalContent = stats.reduce((sum, item) => sum + item.count, 0);
  const totalViews = stats.reduce((sum, item) => sum + item.viewCount, 0);
  const totalDownloads = stats.reduce((sum, item) => sum + item.downloadCount, 0);
  
  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Chip className="bg-primary/10 text-primary border-none">Dashboard</Chip>
          </div>
          <div className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5 text-muted-foreground" />
            <h1 className="font-semibold tracking-tight">Content Statistics</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            View comprehensive statistics about content usage and popularity across the platform.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalContent}</div>
                  <p className="text-xs text-muted-foreground">
                    Items in content library
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalViews}</div>
                  <p className="text-xs text-muted-foreground">
                    Content views
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                  <Headphones className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDownloads}</div>
                  <p className="text-xs text-muted-foreground">
                    Content downloads
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content-types">Content Types</TabsTrigger>
                <TabsTrigger value="views">View Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Overview</CardTitle>
                    <CardDescription>Distribution of content by type</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ChartContainer 
                      config={{
                        'video': { color: '#0088FE' },
                        'audio': { color: '#00C49F' },
                        'document': { color: '#FFBB28' },
                        'other': { color: '#FF8042' }
                      }}
                    >
                      <PieChart>
                        <Pie
                          data={stats}
                          dataKey="count"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.type}: ${entry.count}`}
                        >
                          {stats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="content-types" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Type Statistics</CardTitle>
                    <CardDescription>Views and downloads by content type</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ChartContainer
                      config={{
                        'views': { color: '#0088FE' },
                        'downloads': { color: '#00C49F' }
                      }}
                    >
                      <BarChart data={stats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="viewCount" name="Views" fill="#0088FE" />
                        <Bar dataKey="downloadCount" name="Downloads" fill="#00C49F" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="views" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly View Trends</CardTitle>
                    <CardDescription>Content views over the past 6 months</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ChartContainer
                      config={{
                        'count': { color: '#0088FE' }
                      }}
                    >
                      <BarChart data={viewHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="count" name="Views" fill="#0088FE" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default StatisticsPage;
