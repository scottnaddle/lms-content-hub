
import React from 'react';
import { Chip } from '@/components/ui/chip';

interface ContentTagsProps {
  tags: string[] | null;
}

const ContentTags: React.FC<ContentTagsProps> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Chip key={tag} variant="outline" className="bg-accent/50">
          {tag}
        </Chip>
      ))}
    </div>
  );
};

export default ContentTags;
