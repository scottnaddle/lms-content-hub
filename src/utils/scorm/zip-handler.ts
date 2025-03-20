
/**
 * SCORM 패키지의 ZIP 파일 처리를 위한 유틸리티
 */
import JSZip from 'jszip';
import { getContentType } from './mime-types';

/**
 * ZIP 파일 다운로드 및 로드
 */
export const downloadAndLoadZip = async (fileUrl: string): Promise<{ 
  zip: JSZip; 
  zipData: ArrayBuffer;
}> => {
  // SCORM 패키지 다운로드 시도
  const response = await fetch(fileUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download SCORM package: ${response.statusText} (${response.status})`);
  }
  
  const zipData = await response.arrayBuffer();
  console.log('SCORM package downloaded, size:', zipData.byteLength);
  
  // JSZip을 사용하여 ZIP 파일 추출
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipData);
  
  return { zip: loadedZip, zipData };
};

/**
 * ZIP 파일에서 모든 파일 추출 및 Blob URL 생성
 */
export const extractAllFiles = async (loadedZip: JSZip): Promise<Map<string, string>> => {
  const extractedFiles = new Map<string, string>();
  
  const extractPromises = Object.keys(loadedZip.files).map(async (filename) => {
    const file = loadedZip.files[filename];
    
    // 디렉토리는 건너뛰기
    if (file.dir) return;
    
    try {
      // 파일 내용을 Blob으로 추출
      const content = await file.async('blob');
      const contentType = getContentType(filename);
      const blob = new Blob([content], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      
      // 파일 경로와 Blob URL을 맵에 저장
      extractedFiles.set(filename, blobUrl);
      
      // 디버깅을 위해 첫 10개 파일 경로 출력
      if (extractedFiles.size <= 10) {
        console.log(`Extracted file ${extractedFiles.size}: ${filename} -> ${blobUrl}`);
      }
    } catch (err) {
      console.error(`Failed to extract file: ${filename}`, err);
    }
  });
  
  // 모든 파일 추출이 완료될 때까지 대기
  await Promise.all(extractPromises);
  
  console.log('Extraction complete, files:', extractedFiles.size);
  return extractedFiles;
};
