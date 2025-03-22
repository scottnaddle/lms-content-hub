import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, KeyRound, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface LTIConfig {
  id: string;
  platform: string;
  consumer_key: string;
  shared_secret: string;
  content_id: string;
}

const LTIConfiguration: React.FC = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get('content');
  
  const [canvasConfig, setCanvasConfig] = useState<LTIConfig | null>(null);
  const [moodleConfig, setMoodleConfig] = useState<LTIConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const launchUrl = window.location.origin + '/lti/launch';
  const toolUrl = window.location.origin;
  const contentSelectionUrl = window.location.origin + '/lti/content-selection';
  
  useEffect(() => {
    const fetchLTIConfigurations = async () => {
      try {
        setLoading(true);
        let query = supabase.from('lti_configurations').select('*');
        
        if (contentId) {
          query = query.eq('content_id', contentId);
        } else if (user) {
          query = query.eq('created_by', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const canvas = data.find(config => config.platform === 'canvas') || null;
          const moodle = data.find(config => config.platform === 'moodle') || null;
          
          setCanvasConfig(canvas);
          setMoodleConfig(moodle);
        } else {
          if (contentId && user) {
            await createDefaultConfigurations();
          }
        }
      } catch (error) {
        console.error('Error fetching LTI configurations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load LTI configurations',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLTIConfigurations();
  }, [contentId, user]);
  
  const createDefaultConfigurations = async () => {
    try {
      if (!user || !contentId) return;
      
      const consumerKey = `key_${Math.random().toString(36).substring(2, 10)}`;
      const sharedSecret = `secret_${Math.random().toString(36).substring(2, 15)}`;
      
      const { data: canvasData, error: canvasError } = await supabase
        .from('lti_configurations')
        .insert({
          platform: 'canvas',
          consumer_key: consumerKey,
          shared_secret: sharedSecret,
          content_id: contentId,
          created_by: user.id
        })
        .select()
        .single();
      
      if (canvasError) throw canvasError;
      
      const { data: moodleData, error: moodleError } = await supabase
        .from('lti_configurations')
        .insert({
          platform: 'moodle',
          consumer_key: consumerKey,
          shared_secret: sharedSecret,
          content_id: contentId,
          created_by: user.id
        })
        .select()
        .single();
      
      if (moodleError) throw moodleError;
      
      setCanvasConfig(canvasData);
      setMoodleConfig(moodleData);
      
      toast({
        title: 'Success',
        description: 'LTI configurations created successfully',
      });
    } catch (error) {
      console.error('Error creating LTI configurations:', error);
      toast({
        title: 'Error',
        description: 'Failed to create LTI configurations',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    
    toast({
      title: "Copied!",
      description: `${fieldName} copied to clipboard.`,
      duration: 2000,
    });
    
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  const handleGenerateNewKeys = async () => {
    try {
      if (!user) return;
      
      const consumerKey = `key_${Math.random().toString(36).substring(2, 10)}`;
      const sharedSecret = `secret_${Math.random().toString(36).substring(2, 15)}`;
      
      if (canvasConfig) {
        const { error: canvasError } = await supabase
          .from('lti_configurations')
          .update({
            consumer_key: consumerKey,
            shared_secret: sharedSecret
          })
          .eq('id', canvasConfig.id);
        
        if (canvasError) throw canvasError;
      }
      
      if (moodleConfig) {
        const { error: moodleError } = await supabase
          .from('lti_configurations')
          .update({
            consumer_key: consumerKey,
            shared_secret: sharedSecret
          })
          .eq('id', moodleConfig.id);
        
        if (moodleError) throw moodleError;
      }
      
      const { data, error } = await supabase
        .from('lti_configurations')
        .select('*')
        .in('id', [canvasConfig?.id, moodleConfig?.id].filter(Boolean));
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const canvas = data.find(config => config.platform === 'canvas') || null;
        const moodle = data.find(config => config.platform === 'moodle') || null;
        
        setCanvasConfig(canvas);
        setMoodleConfig(moodle);
      }
      
      toast({
        title: 'Success',
        description: 'LTI keys regenerated successfully',
      });
    } catch (error) {
      console.error('Error generating new keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate new keys',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-6">Loading LTI configurations...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-in">
      <Tabs defaultValue="canvas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="canvas">Canvas LMS</TabsTrigger>
          <TabsTrigger value="moodle">Moodle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="canvas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Canvas LMS Integration</CardTitle>
              <CardDescription>
                Configure your Learning Content Hub as an external tool in Canvas LMS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="canvas-url">Launch URL</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(launchUrl, 'Launch URL')}
                  >
                    {copiedField === 'Launch URL' ? (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>
                <Input id="canvas-url" value={launchUrl} readOnly />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="canvas-key">Consumer Key</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(canvasConfig?.consumer_key || '', 'Consumer Key')}
                  >
                    {copiedField === 'Consumer Key' ? (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="canvas-key" 
                    value={canvasConfig?.consumer_key || ''} 
                    readOnly 
                    className="pl-9" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="canvas-secret">Shared Secret</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(canvasConfig?.shared_secret || '', 'Shared Secret')}
                  >
                    {copiedField === 'Shared Secret' ? (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="canvas-secret" 
                    value={canvasConfig?.shared_secret || ''} 
                    readOnly 
                    className="pl-9" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handleGenerateNewKeys}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Generate New Keys
              </Button>
              <Button className="flex items-center gap-2">
                Canvas Setup Guide
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="moodle" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Moodle Integration</CardTitle>
              <CardDescription>
                Configure your Learning Content Hub as an external tool in Moodle LMS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="moodle-url">Tool URL</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(toolUrl, 'Tool URL')}
                  >
                    {copiedField === 'Tool URL' ? (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>
                <Input id="moodle-url" value={toolUrl} readOnly />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="moodle-key">Consumer Key</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(moodleConfig?.consumer_key || '', 'Moodle Consumer Key')}
                  >
                    {copiedField === 'Moodle Consumer Key' ? (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="moodle-key" 
                    value={moodleConfig?.consumer_key || ''} 
                    readOnly 
                    className="pl-9" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="moodle-secret">Shared Secret</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(moodleConfig?.shared_secret || '', 'Moodle Shared Secret')}
                  >
                    {copiedField === 'Moodle Shared Secret' ? (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="moodle-secret" 
                    value={moodleConfig?.shared_secret || ''} 
                    readOnly 
                    className="pl-9" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handleGenerateNewKeys}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Generate New Keys
              </Button>
              <Button className="flex items-center gap-2">
                Moodle Setup Guide
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LTIConfiguration;
