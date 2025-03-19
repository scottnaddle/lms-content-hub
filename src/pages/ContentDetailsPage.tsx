
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit, 
  Trash2,
  FileText,
  Calendar,
  Tag
} from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Separator } from '@/components/ui/separator';
import { ContentItem } from '@/components/content/ContentGrid';

// Mock content items for demonstration
const mockContentItems: Record<string, ContentItem> = {
  '1': {
    id: '1',
    title: 'Introduction to React Hooks',
    description: 'Learn the basics of React Hooks and how to use them in your applications. This comprehensive video covers useState, useEffect, useContext, useReducer, and custom hooks with practical examples.',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    dateAdded: '2023-10-15',
    tags: ['React', 'JavaScript', 'Web Development', 'Hooks', 'Frontend'],
  },
  '2': {
    id: '2',
    title: 'CSS Grid Layout Complete Guide',
    description: 'A comprehensive guide to CSS Grid Layout with practical examples. This PDF document covers all aspects of CSS Grid, from basic concepts to advanced techniques for creating complex layouts.',
    type: 'pdf',
    thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    dateAdded: '2023-10-10',
    tags: ['CSS', 'Web Design', 'Frontend', 'Layout', 'Responsive Design'],
  },
  '3': {
    id: '3',
    title: 'Podcast: Future of Machine Learning',
    description: 'An insightful discussion about the future of machine learning and AI. This podcast features experts in the field discussing emerging trends, challenges, and opportunities in machine learning and artificial intelligence.',
    type: 'audio',
    dateAdded: '2023-10-05',
    tags: ['Machine Learning', 'AI', 'Technology', 'Future Tech', 'Data Science'],
  },
  '4': {
    id: '4',
    title: 'Database Design Fundamentals',
    description: 'Learn the fundamentals of database design and implementation. This document covers relational database concepts, normalization, SQL basics, and best practices for designing efficient database schemas.',
    type: 'document',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    dateAdded: '2023-10-01',
    tags: ['Database', 'SQL', 'Backend', 'Data Modeling', 'System Design'],
  },
};

const ContentDetailsPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  
  // In a real application, you would fetch this from your API/database
  const content = id ? mockContentItems[id] : null;
  
  if (!content) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">Content Not Found</h2>
          <p className="text-muted-foreground mb-6">The content you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </PageLayout>
    );
  }
  
  const formattedDate = new Date(content.dateAdded).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <PageLayout>
      <div className="space-y-8 animate-in">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
            aria-label="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Chip className="bg-primary/10 text-primary border-none capitalize">
            {content.type}
          </Chip>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-semibold tracking-tight">{content.title}</h1>
            <p className="text-muted-foreground">{content.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {content.tags?.map((tag) => (
              <Chip key={tag} variant="outline" className="bg-accent/50">
                {tag}
              </Chip>
            ))}
          </div>
          
          <div className="flex justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{content.type.toUpperCase()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="glass-panel p-6">
            {content.type === 'video' && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                {content.thumbnail ? (
                  <img 
                    src={content.thumbnail} 
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/80">
                    <p className="text-white/70">Video Preview</p>
                  </div>
                )}
              </div>
            )}
            
            {content.type === 'audio' && (
              <div className="p-8 rounded-lg bg-accent flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary text-5xl">♪</span>
                  </div>
                  <p className="text-lg font-medium">{content.title}</p>
                  <p className="text-muted-foreground">Audio Player</p>
                </div>
              </div>
            )}
            
            {(content.type === 'pdf' || content.type === 'document') && (
              <div className="p-6 rounded-lg bg-accent">
                {content.thumbnail ? (
                  <img 
                    src={content.thumbnail} 
                    alt={content.title}
                    className="w-full h-auto object-cover rounded-md"
                  />
                ) : (
                  <div className="aspect-[4/3] rounded-lg flex items-center justify-center bg-muted">
                    <FileText className="h-16 w-16 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-lg font-medium mb-4">LTI Integration</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This content is available for embedding in Canvas LMS and Moodle through LTI integration.
              </p>
              <Button onClick={() => navigate('/lti-configuration')}>
                Configure LTI
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContentDetailsPage;
