
import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContentDetails } from '@/hooks/use-content-details';

// Import component parts
import ContentHeader from '@/components/content-details/ContentHeader';
import ContentTitle from '@/components/content-details/ContentTitle';
import ContentTags from '@/components/content-details/ContentTags';
import ContentMetadata from '@/components/content-details/ContentMetadata';
import ContentActions from '@/components/content-details/ContentActions';
import ContentDisplay from '@/components/content-details/ContentDisplay';
import LTIIntegration from '@/components/content-details/LTIIntegration';

const ContentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  
  const {
    content,
    isLoading,
    isDeleting,
    currentUser,
    handleDownload,
    handleDelete,
    formatDate
  } = useContentDetails(id, t);
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  if (!content) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">콘텐츠를 찾을 수 없음</h2>
          <p className="text-muted-foreground mb-6">요청하신 콘텐츠가 존재하지 않거나 삭제되었습니다.</p>
          <Button onClick={() => window.history.back()}>뒤로 가기</Button>
        </div>
      </PageLayout>
    );
  }
  
  const formattedDate = formatDate(content.created_at);
  const isOwner = currentUser === content.created_by;
  
  return (
    <PageLayout>
      <div className="space-y-8 animate-in">
        <ContentHeader contentType={content.content_type} />
        
        <div className="space-y-6">
          <ContentTitle title={content.title} description={content.description} />
          
          <ContentTags tags={content.tags} />
          
          <div className="flex justify-between flex-wrap gap-4">
            <div className="flex-grow">
              <ContentMetadata 
                content={content}
                formattedDate={formattedDate}
              />
            </div>
            
            <div className="flex-shrink-0">
              <ContentActions 
                isOwner={isOwner} 
                downloadCount={content.download_count} 
                onDownload={handleDownload} 
                onDelete={handleDelete} 
                isDeleting={isDeleting} 
              />
            </div>
          </div>
          
          <Separator />
          
          <ContentDisplay 
            contentType={content.content_type} 
            fileUrl={content.fileUrl} 
            thumbnailUrl={content.thumbnailUrl}
            title={content.title}
            onDownload={handleDownload}
          />

          <LTIIntegration />
        </div>
      </div>
    </PageLayout>
  );
};

export default ContentDetailsPage;
