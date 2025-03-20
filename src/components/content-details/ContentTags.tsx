
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@/components/ui/chip';

interface ContentTagsProps {
  tags: string[] | null;
}

const ContentTags: React.FC<ContentTagsProps> = ({ tags }) => {
  const navigate = useNavigate();
  
  if (!tags || tags.length === 0) return null;
  
  const handleTagClick = (tag: string) => {
    navigate(`/search?tag=${encodeURIComponent(tag)}`);
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Chip 
          key={tag} 
          variant="outline" 
          className="bg-accent/50 cursor-pointer hover:bg-accent/80 transition-colors"
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </Chip>
      ))}
    </div>
  );
};

export default ContentTags;
