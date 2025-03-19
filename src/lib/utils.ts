
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function generateThumbnailUrl(fileType: string): string {
  const defaultThumbnails = {
    video: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2',
    audio: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    pdf: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2',
    document: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
  };
  
  return defaultThumbnails[fileType as keyof typeof defaultThumbnails] || '';
}
