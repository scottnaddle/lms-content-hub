
/**
 * 추출된 SCORM 패키지의 리소스를 정리하는 함수
 */
export const cleanupScormResources = (extractedFiles: Map<string, string>) => {
  // 모든 Blob URL 해제
  extractedFiles.forEach(url => {
    URL.revokeObjectURL(url);
  });
  
  extractedFiles.clear();
};
