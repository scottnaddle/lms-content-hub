
/**
 * SCORM 패키지 추출 핵심 기능
 */
import { 
  commonEntryPaths, 
  extractEntryFromManifest, 
  findEntryInDirectory, 
  detectScormPackageType, 
  selectBestHtmlFile 
} from '../entry-point';
import { downloadAndLoadZip, extractAllFiles } from '../zip-handler';
import { findScormEntryPoint } from './entry-point-finder';

/**
 * SCORM 패키지(ZIP)를 다운로드하고 추출하는 함수
 * @param fileUrl SCORM 패키지 URL
 * @param onDownloadProgress 다운로드 진행 상태 콜백
 * @param onExtractionProgress 압축 해제 진행 상태 콜백
 * @returns 추출된 콘텐츠의 HTML 엔트리 포인트와 추출된 파일들의 URL 맵
 */
export const extractScormPackage = async (
  fileUrl: string,
  onDownloadProgress?: (progress: number) => void,
  onExtractionProgress?: (progress: number) => void
): Promise<{
  entryPoint: string | null;
  extractedFiles: Map<string, string>;
  error?: string;
}> => {
  try {
    // 파일 URL이 없는 경우
    if (!fileUrl) {
      return { entryPoint: null, extractedFiles: new Map(), error: 'SCORM 파일 URL이 제공되지 않았습니다.' };
    }

    console.log('Extracting SCORM package from URL:', fileUrl);
    
    // ZIP 파일 다운로드 및 로드 (with progress tracking)
    const { zip: loadedZip } = await downloadAndLoadZip(fileUrl, onDownloadProgress);
    
    // SCORM 콘텐츠의 모든 파일을 추출 (with progress tracking)
    const extractedFiles = await extractAllFiles(loadedZip, onExtractionProgress);
    
    // 진입점 파일 찾기
    const entryPoint = await findScormEntryPoint(loadedZip, extractedFiles);
    
    // 디버그: 선택된 진입점의 URL 확인
    if (entryPoint) {
      const entryUrl = extractedFiles.get(entryPoint);
      console.log('Entry point URL:', entryUrl);
    }
    
    console.log('SCORM entry point determined:', entryPoint);
    
    return { entryPoint, extractedFiles };
  } catch (error: any) {
    console.error('SCORM extraction error:', error);
    return {
      entryPoint: null,
      extractedFiles: new Map(),
      error: `SCORM 패키지 추출 중 오류 발생: ${error.message || '알 수 없는 오류'}`
    };
  }
};
