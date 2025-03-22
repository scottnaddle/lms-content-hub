
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface LTIIntegrationProps {
  contentId: string;
}

const LTIIntegration: React.FC<LTIIntegrationProps> = ({ contentId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [hasLtiConfig, setHasLtiConfig] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const checkLtiConfiguration = async () => {
      try {
        if (!contentId) return;
        
        const { data, error } = await supabase
          .from('lti_configurations')
          .select('id')
          .eq('content_id', contentId)
          .limit(1);
        
        if (error) throw error;
        
        setHasLtiConfig(data && data.length > 0);
      } catch (error) {
        console.error('Error checking LTI configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLtiConfiguration();
  }, [contentId]);
  
  const handleConfigureLTI = () => {
    navigate(`/lti-configuration?content=${contentId}`);
  };

  const handleCreateLtiConfig = async () => {
    try {
      if (!user || !contentId) return;
      
      // Generate random keys for LTI integration
      const consumerKey = `key_${Math.random().toString(36).substring(2, 10)}`;
      const sharedSecret = `secret_${Math.random().toString(36).substring(2, 15)}`;
      
      // Create configurations for both Canvas and Moodle
      const { error: canvasError } = await supabase
        .from('lti_configurations')
        .insert({
          platform: 'canvas',
          consumer_key: consumerKey,
          shared_secret: sharedSecret,
          content_id: contentId,
          created_by: user.id
        });
      
      if (canvasError) throw canvasError;
      
      const { error: moodleError } = await supabase
        .from('lti_configurations')
        .insert({
          platform: 'moodle',
          consumer_key: consumerKey,
          shared_secret: sharedSecret,
          content_id: contentId,
          created_by: user.id
        });
      
      if (moodleError) throw moodleError;
      
      toast({
        title: t('success'),
        description: t('ltiConfigCreated'),
      });
      
      setHasLtiConfig(true);
    } catch (error) {
      console.error('Error creating LTI configuration:', error);
      toast({
        title: t('error'),
        description: t('ltiConfigError'),
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-medium mb-4">{t('ltiIntegration')}</h3>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('ltiDescription')}
        </p>
        
        {isLoading ? (
          <p className="text-sm">Loading...</p>
        ) : hasLtiConfig ? (
          <Button onClick={handleConfigureLTI}>
            {t('ltiConfigure')}
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">
              {t('ltiNoConfig')}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleCreateLtiConfig}>
                {t('ltiCreateConfig')}
              </Button>
              <Button variant="outline" onClick={handleConfigureLTI}>
                {t('ltiAdvancedConfig')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LTIIntegration;
