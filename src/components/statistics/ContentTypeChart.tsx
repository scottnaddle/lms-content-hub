
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChartContainer,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ContentStats } from '@/types/statistics';

interface ContentTypeChartProps {
  stats: ContentStats[];
}

const ContentTypeChart: React.FC<ContentTypeChartProps> = ({ stats }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('contentTypeStats')}</CardTitle>
        <CardDescription>{t('viewsAndDownloads')}</CardDescription>
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
            <Bar dataKey="viewCount" name={t('views')} fill="#0088FE" />
            <Bar dataKey="downloadCount" name={t('downloads')} fill="#00C49F" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ContentTypeChart;
