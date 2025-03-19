
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChartContainer,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

// Define type for content statistics data
type ContentStats = {
  type: string;
  count: number;
  viewCount: number;
  downloadCount: number;
};

interface ContentOverviewChartProps {
  stats: ContentStats[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ContentOverviewChart: React.FC<ContentOverviewChartProps> = ({ stats }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('contentOverview')}</CardTitle>
        <CardDescription>{t('contentDistribution')}</CardDescription>
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
  );
};

export default ContentOverviewChart;
