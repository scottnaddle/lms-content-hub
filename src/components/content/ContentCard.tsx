
import React from 'react';
import { File, Video, FileAudio, FileText, MoreVertical, ExternalLink, Download } from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ContentType = 'video' | 'audio' | 'pdf' | 'document';

interface ContentCardProps {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  thumbnail?: string;
  dateAdded: string;
  tags?: string[];
  onClick?: () => void;
}

const contentTypeIcons = {
  video: Video,
  audio: FileAudio,
  pdf: FileText,
  document: File,
};

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  description,
  type,
  thumbnail,
  dateAdded,
  tags = [],
  onClick,
}) => {
  const Icon = contentTypeIcons[type];
  const formattedDate = new Date(dateAdded).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="content-card relative group cursor-pointer h-full"
      onClick={onClick}
    >
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Open</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              <span>Download</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col h-full">
        <div className={cn(
          "relative mb-4 aspect-video rounded-md overflow-hidden bg-muted",
          type === 'audio' && "aspect-[3/1]"
        )}>
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent">
              <Icon className="h-12 w-12 text-accent-foreground/40" />
            </div>
          )}
          <div className="absolute bottom-2 right-2">
            <Chip variant="default" className="text-[10px] bg-background/90 backdrop-blur-sm text-foreground border">
              {type.toUpperCase()}
            </Chip>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="space-y-1 mb-2">
            <h3 className="font-medium leading-tight text-base">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mt-auto">
            {tags.slice(0, 3).map((tag) => (
              <Chip 
                key={tag} 
                variant="ghost" 
                className="text-[10px] bg-accent/50"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </Chip>
            ))}
            {tags.length > 3 && <Chip variant="ghost" className="text-[10px]">+{tags.length - 3}</Chip>}
          </div>

          <div className="text-xs text-muted-foreground mt-3">{formattedDate}</div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
