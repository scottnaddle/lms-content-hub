
import React from 'react';

interface ContentTitleProps {
  title: string;
  description: string | null;
}

const ContentTitle: React.FC<ContentTitleProps> = ({ title, description }) => {
  return (
    <div className="space-y-2">
      <h1 className="font-semibold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};

export default ContentTitle;
