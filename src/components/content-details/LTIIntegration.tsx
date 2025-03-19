
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LTIIntegration: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-medium mb-4">LTI 통합</h3>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          이 콘텐츠는 LTI 통합을 통해 Canvas LMS 및 Moodle에 포함할 수 있습니다.
        </p>
        <Button onClick={() => navigate('/lti-configuration')}>
          LTI 구성
        </Button>
      </div>
    </div>
  );
};

export default LTIIntegration;
