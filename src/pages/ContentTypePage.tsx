
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import ContentGrid, { ContentItem } from '@/components/content/ContentGrid';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { capitalizeFirstLetter } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const ContentTypePage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<ContentItem[]>([]);
  
  const contentType = type?.toLowerCase() || '';
  const typeLabel = capitalizeFirstLetter(contentType);
  
  // Supabase에서 콘텐츠 로드
  useEffect(() => {
    const loadContents = async () => {
      try {
        setIsLoading(true);
        
        // contentType에서 's'를 제거하여 단수형으로 변환 (videos -> video)
        const singularType = contentType.endsWith('s') 
          ? contentType.slice(0, -1) 
          : contentType;
        
        const { data, error } = await supabase
          .from('contents')
          .select('*')
          .eq('content_type', singularType)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          // Supabase 데이터를 ContentItem 형식으로 변환
          const contentItems: ContentItem[] = await Promise.all(data.map(async (item) => {
            // 파일 URL 가져오기
            let thumbnail = '';
            if (item.thumbnail_path) {
              const { data: urlData } = await supabase.storage
                .from('content_files')
                .getPublicUrl(item.thumbnail_path);
              thumbnail = urlData?.publicUrl || '';
            }
            
            return {
              id: item.id,
              title: item.title,
              description: item.description || '',
              type: item.content_type as 'video' | 'audio' | 'pdf' | 'document',
              thumbnail: thumbnail,
              dateAdded: item.created_at,
              tags: item.tags || [],
            };
          }));
          
          setContents(contentItems);
        }
      } catch (error) {
        console.error('Error loading contents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (contentType) {
      loadContents();
    }
  }, [contentType]);
  
  // 검색어로 콘텐츠 필터링
  const filteredContent = contents.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Chip className="bg-primary/10 text-primary border-none">콘텐츠 라이브러리</Chip>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-semibold tracking-tight">{typeLabel}</h1>
            <Button onClick={() => navigate('/upload')} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>
                {contentType === 'videos' ? '비디오' : 
                 contentType === 'audio' ? '오디오' : '문서'} 업로드
              </span>
            </Button>
          </div>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`${typeLabel} 검색...`}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ContentGrid 
            items={filteredContent} 
            emptyMessage={searchTerm ? `"${searchTerm}"와(과) 일치하는 ${typeLabel}을(를) 찾을 수 없습니다` : `${typeLabel}이(가) 없습니다`} 
          />
        )}
      </div>
    </PageLayout>
  );
};

export default ContentTypePage;
