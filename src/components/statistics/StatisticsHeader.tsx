
import React from 'react';
import { BarChart as BarChartIcon } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { useLanguage } from '@/contexts/LanguageContext';

const StatisticsHeader: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Chip className="bg-primary/10 text-primary border-none">Dashboard</Chip>
      </div>
      <div className="flex items-center gap-2">
        <BarChartIcon className="h-5 w-5 text-muted-foreground" />
        <h1 className="font-semibold tracking-tight">{t('contentStatistics')}</h1>
      </div>
      <p className="text-muted-foreground max-w-2xl">
        {t('statisticsDescription')}
      </p>
    </div>
  );
};

export default StatisticsHeader;
