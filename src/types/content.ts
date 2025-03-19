
export interface ContentDetails {
  id: string;
  title: string;
  description: string | null;
  content_type: 'video' | 'audio' | 'pdf' | 'document';
  file_path: string | null;
  thumbnail_path: string | null;
  created_at: string;
  created_by: string | null;
  tags: string[] | null;
  view_count: number | null;
  download_count: number | null;
  fileUrl?: string;
  thumbnailUrl?: string;
  duration?: number | null;
  page_count?: number | null;
  metadata?: Record<string, any> | null;
  // Creator information from view
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface ContentMetadata {
  // Educational metadata
  subject?: string;
  grade_level?: string;
  language?: string;
  educational_standard?: string;
  license_type?: string;
  accessibility_features?: string[];
  learning_objectives?: string[];
  // Additional technical metadata
  file_size?: number;
  file_format?: string;
  encoding?: string;
  resolution?: string; // For videos
  bitrate?: number; // For audio/video
}
