
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

export interface ContentGridProps {
  items: ContentItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const ContentGrid: React.FC<ContentGridProps> = ({ 
  items, 
  isLoading = false,
  emptyMessage = "No content found" 
}) => {
  const navigate = useNavigate();

  const handleItemClick = (id: string, type: ContentType) => {
    navigate(`/content/${type}s/${id}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-lg p-4 animate-pulse h-64">
            <div className="h-36 bg-muted rounded-md mb-3"></div>
            <div className="h-5 bg-muted rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

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
