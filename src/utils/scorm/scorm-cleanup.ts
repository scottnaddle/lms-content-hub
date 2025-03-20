
/**
 * 추출된 SCORM 패키지의 리소스를 정리하는 함수
 */
export const cleanupScormResources = (extractedFiles: Map<string, string>) => {
  try {
    // 모든 Blob URL 해제
    let count = 0;
    extractedFiles.forEach(url => {
      try {
        URL.revokeObjectURL(url);
        count++;
      } catch (err) {
        console.error('Error revoking object URL:', err);
      }
    });
    
    console.log(`Cleaned up ${count} SCORM resource URLs`);
    
    // Clear the map
    extractedFiles.clear();
  } catch (err) {
    console.error('Error cleaning up SCORM resources:', err);
  }
};
