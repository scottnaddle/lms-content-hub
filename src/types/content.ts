
export interface ContentDetails {
  id: string;
  title: string;
  description: string | null;
  content_type: 'video' | 'audio' | 'pdf' | 'document' | 'scorm';
  file_path: string | null;
  thumbnail_path?: string | null;  // Make this optional with ?
  thumbnail_url?: string | null;   // Add this as some functions might be using this property
  created_at: string;
  created_by: string | null;
  tags: string[] | null;
  view_count: number | null;
  download_count: number | null;
  fileUrl?: string;
  thumbnailUrl?: string;
}
