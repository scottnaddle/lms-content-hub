
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
}
