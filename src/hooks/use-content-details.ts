
import { formatDate } from '@/utils/content-utils';
import { useContentData } from './use-content-data';
import { useContentUser } from './use-content-user';
import { useContentActions } from './use-content-actions';

export const useContentDetails = (id: string | undefined, t: (key: string) => string) => {
  // Get content data
  const { content, isLoading } = useContentData(id, t);
  
  // Get current user
  const { currentUser } = useContentUser(id);
  
  // Get content actions
  const { isDeleting, handleDownload, handleDelete } = useContentActions(content);
  
  return {
    content,
    isLoading,
    isDeleting,
    currentUser,
    handleDownload,
    handleDelete,
    formatDate
  };
};
