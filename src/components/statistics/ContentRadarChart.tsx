
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChartContainer,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts';
import { ContentComparison } from '@/types/statistics';

interface ContentRadarChartProps {
  comparisonData: ContentComparison[];
}

const ContentRadarChart: React.FC<ContentRadarChartProps> = ({ comparisonData }) => {
  const { t } = useLanguage();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9467BD'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('contentComparison')}</CardTitle>
        <CardDescription>{t('contentTypeMetricsComparison')}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            'engagement': { color: '#0088FE' },
            'popularity': { color: '#00C49F' },
            'growth': { color: '#FFBB28' },
            'retention': { color: '#FF8042' }
          }}
        >
          <RadarChart outerRadius={90} data={comparisonData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="type" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            {['engagement', 'popularity', 'growth', 'retention'].map((key, index) => (
              <Radar 
                key={key}
                name={t(key)} 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                fill={COLORS[index % COLORS.length]} 
                fillOpacity={0.6} 
              />
            ))}
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ContentRadarChart;
