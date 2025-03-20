
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { Tag, X } from 'lucide-react';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, placeholder }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse tags from value prop (comma-separated string)
  useEffect(() => {
    if (value) {
      const tagArray = value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      setTags(tagArray);
    } else {
      setTags([]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Check if a comma was typed
    if (newValue.endsWith(',')) {
      // Get the tag (everything before the comma)
      const newTag = newValue.slice(0, -1).trim();
      
      if (newTag && !tags.includes(newTag)) {
        // Add the new tag
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        
        // Convert tags array back to comma-separated string for the parent component
        onChange(updatedTags.join(', '));
        
        // Clear the input
        setInputValue('');
      } else {
        // Just remove the comma
        setInputValue(newTag);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      const newTag = inputValue.trim();
      
      if (!tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        onChange(updatedTags.join(', '));
      }
      
      setInputValue('');
    }
    
    // Remove last tag on Backspace if input is empty
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      const updatedTags = tags.slice(0, -1);
      setTags(updatedTags);
      onChange(updatedTags.join(', '));
    }
  };

  const removeTag = (indexToRemove: number) => {
    const updatedTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(updatedTags);
    onChange(updatedTags.join(', '));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-10 mb-1">
        {tags.map((tag, index) => (
          <Chip 
            key={index} 
            variant="secondary" 
            className="flex items-center gap-1 animate-in fade-in"
          >
            <Tag className="h-3 w-3" />
            {tag}
            <X 
              className="h-3 w-3 cursor-pointer ml-1" 
              onClick={() => removeTag(index)} 
            />
          </Chip>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[120px] h-7 p-0 text-sm"
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  );
};

export default TagInput;
