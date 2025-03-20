
import { useState, useEffect } from 'react';
import { extractScormPackage } from '@/utils/scorm';
import { supabase } from '@/integrations/supabase/client';

export type ScormStage = 'downloading' | 'extracting' | 'loading' | 'complete' | 'error';

export const useScormLoader = (fileUrl?: string) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [extractedFiles, setExtractedFiles] = useState<Map<string, string>>(new Map());
  const [entryPointUrl, setEntryPointUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [stage, setStage] = useState<ScormStage>('downloading');
  
  // SCORM 패키지 추출 및 로드
  useEffect(() => {
    let isMounted = true;
    
    const loadScormPackage = async () => {
      if (!fileUrl) {
        console.error('No file URL provided for SCORM package');
        setError("SCORM 파일을 찾을 수 없습니다.");
        setStage('error');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setStage('downloading');
        setDownloadProgress(0);
        setExtractionProgress(0);
        
        // Parse file path from URL
        console.log('Original SCORM file URL:', fileUrl);
        
        // Extract the actual file path from the full URL
        let actualPath = fileUrl;
        // Handle both 'content_files/' and 'storage/v1/object/public/content_files/' formats
        if (fileUrl.includes('content_files/')) {
          const pathParts = fileUrl.split('content_files/');
          actualPath = pathParts[pathParts.length - 1];
        }
        
        console.log('Parsed file path for signed URL:', actualPath);
        
        // Generate signed URL with extended validity (10 minutes)
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('content_files')
          .createSignedUrl(actualPath, 600); // 10분 동안 유효

        if (signedUrlError || !signedUrlData?.signedUrl) {
          console.error('Failed to get signed URL:', signedUrlError);
          throw new Error(signedUrlError?.message || 'Signed URL generation failed');
        }

        console.log('Successfully got signed URL:', signedUrlData.signedUrl);
        
        // Extract SCORM package with progress tracking
        const { entryPoint, extractedFiles: files, error: extractError } = await extractScormPackage(
          signedUrlData.signedUrl,
          (progress) => {
            if (isMounted) {
              setDownloadProgress(progress);
              if (progress === 100) {
                setStage('extracting');
              }
            }
          },
          (progress) => {
            if (isMounted) {
              setExtractionProgress(progress);
              if (progress === 100) {
                setStage('loading');
              }
            }
          }
        );
        
        if (!isMounted) return;
        
        if (extractError) {
          console.error('SCORM extraction error:', extractError);
          setError(extractError);
          setStage('error');
          setIsLoading(false);
          return;
        }
        
        if (!entryPoint) {
          console.error('No entry point found in SCORM package');
          setError("SCORM 패키지에서 시작 파일을 찾을 수 없습니다.");
          setStage('error');
          setIsLoading(false);
          return;
        }
        
        console.log('SCORM entry point found:', entryPoint);
        
        // Set extracted files and entry point
        setExtractedFiles(files);
        const entryUrl = files.get(entryPoint);
        
        if (!entryUrl) {
          console.error('Entry point URL not found in extracted files');
          setError("SCORM 시작 파일을 로드할 수 없습니다.");
          setStage('error');
          setIsLoading(false);
          return;
        }
        
        console.log('Setting entry point URL:', entryUrl);
        setEntryPointUrl(entryUrl);
        setStage('complete');
        setIsLoading(false);
      } catch (err: any) {
        if (isMounted) {
          console.error("SCORM 로드 오류:", err);
          setError(`SCORM 패키지를 로드하는 데 실패했습니다: ${err.message || "알 수 없는 오류"}`);
          setStage('error');
          setIsLoading(false);
        }
      }
    };
    
    loadScormPackage();
    
    return () => {
      isMounted = false;
    };
  }, [fileUrl]);

  return {
    error,
    isLoading,
    extractedFiles,
    entryPointUrl,
    downloadProgress,
    extractionProgress,
    stage
  };
};
