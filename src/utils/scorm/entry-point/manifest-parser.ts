
/**
 * SCORM 매니페스트 파일 파싱을 위한 유틸리티
 */
import JSZip from 'jszip';

/**
 * 매니페스트 파일에서 진입점 추출
 */
export const extractEntryFromManifest = async (
  manifestFile: JSZip.JSZipObject, 
  manifestPath: string, 
  extractedFiles: Map<string, string>
): Promise<string | null> => {
  try {
    console.log('Parsing manifest file to find entry point:', manifestPath);
    const manifestContent = await manifestFile.async('text');
    
    // 첫 번째 방법: resource 태그에서 href 속성 찾기
    const resourceMatch = manifestContent.match(/href=['"]([^'"]+\.html)['"]/) || 
                          manifestContent.match(/identifier=['"]resource['"][^>]*href=['"]([^'"]+\.html)['"]/);
    
    if (resourceMatch && resourceMatch[1]) {
      let manifestEntryPoint = resourceMatch[1];
      
      // 상대 경로 처리
      if (manifestPath.includes('/')) {
        const manifestDir = manifestPath.substring(0, manifestPath.lastIndexOf('/') + 1);
        manifestEntryPoint = manifestDir + manifestEntryPoint;
      }
      
      // 경로 정규화 (슬래시 중복 제거 등)
      manifestEntryPoint = manifestEntryPoint.replace(/\/\//g, '/');
      
      // 매니페스트에서 찾은 진입점이 실제로 존재하는지 확인
      if (extractedFiles.has(manifestEntryPoint)) {
        console.log('Entry point found in manifest:', manifestEntryPoint);
        return manifestEntryPoint;
      } else {
        console.log('Entry point in manifest not found in extracted files:', manifestEntryPoint);
      }
    }
  } catch (err) {
    console.error('Failed to extract entrypoint from manifest:', err);
  }
  
  return null;
};
