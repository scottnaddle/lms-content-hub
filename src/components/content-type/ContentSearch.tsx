
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ContentSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder: string;
}

const ContentSearch: React.FC<ContentSearchProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  placeholder 
}) => {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default ContentSearch;
