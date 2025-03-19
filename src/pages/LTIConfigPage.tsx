
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import LTIConfiguration from '@/components/lti/LTIConfiguration';
import { Chip } from '@/components/ui/chip';

const LTIConfigPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Chip className="bg-primary/10 text-primary border-none">Integration</Chip>
          </div>
          <h1 className="font-semibold tracking-tight">LTI Configuration</h1>
          <p className="text-muted-foreground max-w-2xl">
            Configure Learning Tools Interoperability (LTI) to integrate with Canvas LMS, Moodle, and other learning platforms.
          </p>
        </div>
        
        <LTIConfiguration />
      </div>
    </PageLayout>
  );
};

export default LTIConfigPage;
