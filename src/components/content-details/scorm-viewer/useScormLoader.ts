
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
        
        // 스토리지 URL 가져오기 - 올바른 경로 확인
        console.log('Original file path:', fileUrl);
        
        // Extract the actual file path from the full URL if it's a full URL
        let actualPath = fileUrl;
        if (fileUrl.includes('content_files/')) {
          actualPath = fileUrl.split('content_files/')[1];
        }
        
        console.log('Parsed file path for signed URL:', actualPath);
        
        // 서명된 URL 생성
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('content_files')
          .createSignedUrl(actualPath, 60); // 60초 동안 유효

        if (signedUrlError || !signedUrlData?.signedUrl) {
          console.error('Failed to get signed URL:', signedUrlError);
          throw new Error(signedUrlError?.message || 'Failed to get signed URL');
        }

        console.log('Successfully got signed URL:', signedUrlData.signedUrl);
        
        // SCORM 패키지 추출 with progress tracking
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
          setError("SCORM 패키지에서 시작 파일을 찾을 수 없습니다.");
          setStage('error');
          setIsLoading(false);
          return;
        }
        
        console.log('SCORM entry point found:', entryPoint);
        
        // 추출된 파일 및 진입점 설정
        setExtractedFiles(files);
        const entryUrl = files.get(entryPoint);
        
        if (!entryUrl) {
          setError("SCORM 시작 파일을 로드할 수 없습니다.");
          setStage('error');
          setIsLoading(false);
          return;
        }
        
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
