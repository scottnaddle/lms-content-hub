
import { useState, useEffect, useCallback } from 'react';
import { extractScormPackage } from '@/utils/scorm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type ScormStage = 'downloading' | 'extracting' | 'loading' | 'complete' | 'error';

export const useScormLoader = (fileUrl?: string) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [extractedFiles, setExtractedFiles] = useState<Map<string, string>>(new Map());
  const [entryPointUrl, setEntryPointUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [stage, setStage] = useState<ScormStage>('downloading');
  const [retryCount, setRetryCount] = useState(0);

  const parseFilePath = useCallback((url: string) => {
    // Extract path from full Supabase URL if needed
    if (url.includes('content_files/')) {
      return url.split('content_files/')[1];
    }
    return url;
  }, []);

  const getSignedUrl = useCallback(async (path: string) => {
    console.log('Getting signed URL for:', path);
    
    try {
      // 더 긴 유효 시간 (30분)으로 서명된 URL 요청
      const { data, error } = await supabase
        .storage
        .from('content_files')
        .createSignedUrl(path, 1800);
      
      if (error) throw error;
      if (!data?.signedUrl) throw new Error('Failed to get signed URL');
      
      console.log('Obtained signed URL with 30 min expiration');
      return data.signedUrl;
    } catch (err: any) {
      console.error('Signed URL error:', err);
      throw new Error(`Failed to get access to SCORM file: ${err.message}`);
    }
  }, []);

  const loadScormPackage = useCallback(async () => {
    if (!fileUrl) {
      setError("SCORM 파일을 찾을 수 없습니다.");
      setStage('error');
      setIsLoading(false);
      return;
    }

    try {
      // Reset states
      setIsLoading(true);
      setError(null);
      setStage('downloading');
      setDownloadProgress(0);
      setExtractionProgress(0);
      
      // Parse file path and get signed URL
      const actualPath = parseFilePath(fileUrl);
      console.log('Parsed file path:', actualPath);
      
      const signedUrl = await getSignedUrl(actualPath);
      console.log('Successfully got signed URL with longer expiration');
      
      // Extract SCORM package with progress tracking
      const { entryPoint, extractedFiles: files, error: extractError } = await extractScormPackage(
        signedUrl,
        (progress) => {
          setDownloadProgress(progress);
          if (progress === 100) setStage('extracting');
        },
        (progress) => {
          setExtractionProgress(progress);
          if (progress === 100) setStage('loading');
        }
      );
      
      if (extractError) {
        console.error('SCORM extraction error:', extractError);
        setError(extractError);
        setStage('error');
        setIsLoading(false);
        return;
      }
      
      if (!entryPoint) {
        setError("SCORM 패키지에서 시작 파일을 찾을 수 없습니다.");
        setStage('error');
        setIsLoading(false);
        return;
      }
      
      // Set extracted files
      setExtractedFiles(files);
      
      // Get entry URL and validate
      const entryUrl = files.get(entryPoint);
      
      if (!entryUrl) {
        setError("SCORM 시작 파일을 로드할 수 없습니다.");
        setStage('error');
        setIsLoading(false);
        return;
      }
      
      console.log('SCORM entry point found:', entryPoint);
      console.log('Entry URL:', entryUrl);
      
      setEntryPointUrl(entryUrl);
      setStage('loading');
      
      // Longer delay before marking as complete to allow the iframe to initialize
      setTimeout(() => {
        setStage('complete');
        setIsLoading(false);
      }, 1000); // Increased from 500ms to 1000ms
      
    } catch (err: any) {
      console.error("SCORM 로드 오류:", err);
      setError(`SCORM 패키지를 로드하는 데 실패했습니다: ${err.message || "알 수 없는 오류"}`);
      setStage('error');
      setIsLoading(false);
    }
  }, [fileUrl, parseFilePath, getSignedUrl]);
  
  // Initial load and when fileUrl changes or retry is triggered
  useEffect(() => {
    loadScormPackage();
    
    // Cleanup function
    return () => {
      // Reset states when component unmounts or fileUrl changes
      setEntryPointUrl(null);
      setError(null);
      setDownloadProgress(0);
      setExtractionProgress(0);
    };
  }, [loadScormPackage, retryCount]);
  
  // Retry function
  const retryLoading = useCallback(() => {
    setRetryCount(prev => prev + 1);
    toast({
      title: "SCORM 콘텐츠 재시도",
      description: "SCORM 패키지를 다시 로드합니다...",
    });
  }, []);

  return {
    error,
    isLoading,
    entryPointUrl,
    downloadProgress,
    extractionProgress,
    stage,
    extractedFiles,
    retryLoading,
    retryCount
  };
};
