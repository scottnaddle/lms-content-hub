
import { useState, useEffect, useCallback } from 'react';
import { extractScormPackage } from '@/utils/scorm';
import { supabase } from '@/integrations/supabase/client';

export const useScormLoader = (fileUrl?: string) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [extractedFiles, setExtractedFiles] = useState<Map<string, string>>(new Map());
  const [entryPointUrl, setEntryPointUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [stage, setStage] = useState<'downloading' | 'extracting' | 'loading' | 'complete' | 'error'>('downloading');

  const loadScormPackage = useCallback(async () => {
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
      
      // Extract the actual file path from the full URL if it's a full URL
      let actualPath = fileUrl;
      if (fileUrl.includes('content_files/')) {
        actualPath = fileUrl.split('content_files/')[1];
      }
      
      console.log('Parsed file path for signed URL:', actualPath);
      
      // 서명된 URL 생성 (10분 동안 유효)
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('content_files')
        .createSignedUrl(actualPath, 600); 

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('Failed to get signed URL:', signedUrlError);
        throw new Error(signedUrlError?.message || 'Failed to get signed URL');
      }

      console.log('Successfully got signed URL');
      
      // SCORM 패키지 추출 with progress tracking
      const { entryPoint, extractedFiles: files, error: extractError } = await extractScormPackage(
        signedUrlData.signedUrl,
        (progress) => {
          setDownloadProgress(progress);
          if (progress === 100) {
            setStage('extracting');
          }
        },
        (progress) => {
          setExtractionProgress(progress);
          if (progress === 100) {
            setStage('loading');
          }
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
      console.error("SCORM 로드 오류:", err);
      setError(`SCORM 패키지를 로드하는 데 실패했습니다: ${err.message || "알 수 없는 오류"}`);
      setStage('error');
      setIsLoading(false);
    }
  }, [fileUrl]);
  
  // 초기 로드 및 fileUrl 변경 시 로드
  useEffect(() => {
    loadScormPackage();
  }, [loadScormPackage]);
  
  // 재시도 함수
  const retryLoading = () => {
    loadScormPackage();
  };

  return {
    error,
    isLoading,
    entryPointUrl,
    downloadProgress,
    extractionProgress,
    stage,
    extractedFiles,
    retryLoading
  };
};
