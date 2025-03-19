
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChartContainer,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendData } from '@/types/statistics';

interface TrendLineChartProps {
  trendData: TrendData[];
}

const TrendLineChart: React.FC<TrendLineChartProps> = ({ trendData }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('contentTrends')}</CardTitle>
        <CardDescription>{t('viewsAndDownloadsOverTime')}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            'views': { color: '#0088FE' },
            'downloads': { color: '#00C49F' }
          }}
        >
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="views" 
              name={t('views')} 
              stroke="#0088FE" 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="downloads" 
              name={t('downloads')} 
              stroke="#00C49F" 
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TrendLineChart;
