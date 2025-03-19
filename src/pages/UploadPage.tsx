
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import UploadContent from '@/components/content/UploadContent';
import { Chip } from '@/components/ui/chip';

const UploadPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Chip className="bg-primary/10 text-primary border-none">Upload</Chip>
          </div>
          <h1 className="font-semibold tracking-tight">Upload Content</h1>
          <p className="text-muted-foreground max-w-2xl">
            Upload videos, audio files, PDFs, and other documents to your content library.
          </p>
        </div>
        
        <UploadContent />
      </div>
    </PageLayout>
  );
};

export default UploadPage;
