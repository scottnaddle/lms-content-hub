
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { useNavigate } from 'react-router-dom';

interface ContentHeaderProps {
  contentType: string;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ contentType }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="mr-2"
        aria-label="뒤로 가기"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <Chip className="bg-primary/10 text-primary border-none capitalize">
        {contentType}
      </Chip>
    </div>
  );
};

export default ContentHeader;
