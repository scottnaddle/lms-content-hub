
import React from 'react';
import ContentCard, { ContentType } from './ContentCard';
import { useNavigate } from 'react-router-dom';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  thumbnail?: string;
  dateAdded: string;
  tags?: string[];
}

interface ContentGridProps {
  items: ContentItem[];
  emptyMessage?: string;
}

const ContentGrid: React.FC<ContentGridProps> = ({ 
  items, 
  emptyMessage = "No content found" 
}) => {
  const navigate = useNavigate();

  const handleItemClick = (id: string, type: ContentType) => {
    navigate(`/content/${type}s/${id}`);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 staggered-animate-in">
      {items.map((item) => (
        <ContentCard
          key={item.id}
          {...item}
          onClick={() => handleItemClick(item.id, item.type)}
        />
      ))}
    </div>
  );
};

export default ContentGrid;
