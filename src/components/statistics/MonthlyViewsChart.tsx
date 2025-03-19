
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
import { ViewHistory } from '@/types/statistics';

interface MonthlyViewsChartProps {
  viewHistory: ViewHistory[];
}

const MonthlyViewsChart: React.FC<MonthlyViewsChartProps> = ({ viewHistory }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('monthlyViewTrends')}</CardTitle>
        <CardDescription>{t('contentViewsOverTime')}</CardDescription>
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
            <Bar dataKey="count" name={t('views')} fill="#0088FE" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyViewsChart;
