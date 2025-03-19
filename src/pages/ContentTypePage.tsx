
import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import ContentGrid, { ContentItem } from '@/components/content/ContentGrid';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { capitalizeFirstLetter } from '@/lib/utils';

// Mock data for demonstration
const mockContent: Record<string, ContentItem[]> = {
  videos: [
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
      id: '5',
      title: 'Advanced CSS Animations',
      description: 'Master advanced CSS animations and transitions for modern web interfaces.',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1550063873-ab792950096b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      dateAdded: '2023-09-20',
      tags: ['CSS', 'Animation', 'Web Design'],
    },
  ],
  audio: [
    {
      id: '3',
      title: 'Podcast: Future of Machine Learning',
      description: 'An insightful discussion about the future of machine learning and AI.',
      type: 'audio',
      dateAdded: '2023-10-05',
      tags: ['Machine Learning', 'AI', 'Technology'],
    },
    {
      id: '6',
      title: 'Interview with Tech Leaders',
      description: 'Exclusive interviews with technology leaders about the future of the industry.',
      type: 'audio',
      dateAdded: '2023-09-15',
      tags: ['Technology', 'Leadership', 'Interview'],
    },
  ],
  documents: [
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
      id: '4',
      title: 'Database Design Fundamentals',
      description: 'Learn the fundamentals of database design and implementation.',
      type: 'document',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      dateAdded: '2023-10-01',
      tags: ['Database', 'SQL', 'Backend'],
    },
  ],
};

const ContentTypePage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const contentType = type?.toLowerCase() || '';
  const typeLabel = capitalizeFirstLetter(contentType);
  
  // Filter content based on search term
  const filteredContent = mockContent[contentType]?.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];
  
  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Chip className="bg-primary/10 text-primary border-none">Content Library</Chip>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-semibold tracking-tight">{typeLabel}</h1>
            <Button onClick={() => navigate('/upload')} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Upload {contentType === 'videos' ? 'Video' : contentType === 'audio' ? 'Audio' : 'Document'}</span>
            </Button>
          </div>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${contentType}...`}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <ContentGrid 
          items={filteredContent} 
          emptyMessage={searchTerm ? `No ${contentType} found matching "${searchTerm}"` : `No ${contentType} found`} 
        />
      </div>
    </PageLayout>
  );
};

export default ContentTypePage;
