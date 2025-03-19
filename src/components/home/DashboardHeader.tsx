
import React from 'react';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Chip className="bg-primary/10 text-primary border-none">{t('dashboard')}</Chip>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-semibold tracking-tight">{t('welcomeToDashboard')}</h1>
        <Button onClick={() => navigate('/upload')} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>{t('uploadContent')}</span>
        </Button>
      </div>
    </section>
  );
};

export default DashboardHeader;
