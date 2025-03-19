
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ContentGrid, { ContentItem } from '@/components/content/ContentGrid';
import { Button } from '@/components/ui/button';
import { Plus, Clock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@/components/ui/chip';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock data for demonstration
const recentContent: ContentItem[] = [
  {
    id: '1',
    title: 'Introduction to React Hooks',
    description: 'Learn the basics of React Hooks and how to use them in your applications.',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    dateAdded: '2023-10-15',
    tags: ['React', 'JavaScript', 'Web Development'],
  },
  {
    id: '2',
    title: 'CSS Grid Layout Complete Guide',
    description: 'A comprehensive guide to CSS Grid Layout with practical examples.',
    type: 'pdf',
    thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    dateAdded: '2023-10-10',
    tags: ['CSS', 'Web Design', 'Frontend'],
  },
  {
    id: '3',
    title: 'Podcast: Future of Machine Learning',
    description: 'An insightful discussion about the future of machine learning and AI.',
    type: 'audio',
    dateAdded: '2023-10-05',
    tags: ['Machine Learning', 'AI', 'Technology'],
  },
  {
    id: '4',
    title: 'Database Design Fundamentals',
    description: 'Learn the fundamentals of database design and implementation.',
    type: 'document',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    dateAdded: '2023-10-01',
    tags: ['Database', 'SQL', 'Backend'],
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <PageLayout>
      <div className="space-y-12">
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
          
          <div className="glass-panel p-6 pb-10 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-semibold mb-2">{t('manageContent')}</h2>
              <p className="text-muted-foreground max-w-2xl mb-4">
                {t('contentDescription')}
              </p>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => navigate('/upload')} className="gap-2">
                  {t('getStarted')}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/lti-configuration')}>
                  {t('ltiConfiguration')}
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-medium">{t('recentlyAdded')}</h2>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/recently-viewed')} 
              className="text-sm"
            >
              {t('viewAll')}
            </Button>
          </div>
          
          <ContentGrid items={recentContent} />
        </section>
      </div>
    </PageLayout>
  );
};

export default HomePage;
