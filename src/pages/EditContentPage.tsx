
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ContentDetails } from '@/types/content';
import TagInput from '@/components/content/TagInput';

const EditContentPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [content, setContent] = useState<ContentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  
  // Fetch content details
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('contents')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setContent(data);
          setTitle(data.title);
          setDescription(data.description || '');
          setTags(data.tags ? data.tags.join(', ') : '');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast({
          title: t('contentNotFound'),
          description: t('contentNotFoundDesc'),
          variant: "destructive"
        });
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [id, toast, navigate, t]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content) return;
    
    try {
      setIsSaving(true);
      
      // Process tags from comma-separated string to array
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      // Update content metadata
      const { error } = await supabase
        .from('contents')
        .update({
          title,
          description,
          tags: tagsArray.length > 0 ? tagsArray : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', content.id);
      
      if (error) throw error;
      
      toast({
        title: t('contentUpdated'),
        description: t('contentUpdatedDesc'),
      });
      
      // Navigate back to content details page
      navigate(`/content/${type}/${id}`);
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: t('updateError'),
        description: t('updateErrorDesc'),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4"
            aria-label={t('goBack')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">{t('editContent')}</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('contentTitle')}</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder={t('enterContentTitle')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('enterContentDescription')}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">{t('tagsWithSeparator')}</Label>
              <TagInput 
                value={tags}
                onChange={setTags}
                placeholder={t('tagsExample')}
              />
            </div>
          </div>
          
          <div className="flex gap-4 justify-end pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSaving}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default EditContentPage;
