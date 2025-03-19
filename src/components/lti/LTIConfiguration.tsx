
import React, { useState } from 'react';
import { Copy, ExternalLink, KeyRound, Check } from 'lucide-react';
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

const LTIConfiguration: React.FC = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

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

  // These would normally come from your backend config
  const configData = {
    launchUrl: 'https://learning-hub.example.com/lti/launch',
    consumerKey: 'lti_consumer_key_123',
    sharedSecret: 'shared_secret_456',
    contentSelectionUrl: 'https://learning-hub.example.com/lti/content-selection',
    toolUrl: 'https://learning-hub.example.com',
  };

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
                    onClick={() => handleCopy(configData.launchUrl, 'Launch URL')}
                  >
                    {copiedField === 'Launch URL' ? (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>
                <Input id="canvas-url" value={configData.launchUrl} readOnly />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="canvas-key">Consumer Key</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(configData.consumerKey, 'Consumer Key')}
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
                  <Input id="canvas-key" value={configData.consumerKey} readOnly className="pl-9" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="canvas-secret">Shared Secret</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(configData.sharedSecret, 'Shared Secret')}
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
                  <Input id="canvas-secret" value={configData.sharedSecret} readOnly className="pl-9" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Generate New Keys</Button>
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
                    onClick={() => handleCopy(configData.toolUrl, 'Tool URL')}
                  >
                    {copiedField === 'Tool URL' ? (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>
                <Input id="moodle-url" value={configData.toolUrl} readOnly />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="moodle-key">Consumer Key</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(configData.consumerKey, 'Moodle Consumer Key')}
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
                  <Input id="moodle-key" value={configData.consumerKey} readOnly className="pl-9" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="moodle-secret">Shared Secret</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => handleCopy(configData.sharedSecret, 'Moodle Shared Secret')}
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
                  <Input id="moodle-secret" value={configData.sharedSecret} readOnly className="pl-9" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Generate New Keys</Button>
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
