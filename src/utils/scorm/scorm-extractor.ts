
import { 
  commonEntryPaths, 
  extractEntryFromManifest, 
  findEntryInDirectory, 
  detectScormPackageType, 
  selectBestHtmlFile 
} from './entry-point-detector';
import { downloadAndLoadZip, extractAllFiles } from './zip-handler';

/**
 * SCORM 패키지(ZIP)를 다운로드하고 추출하는 함수
 * @param fileUrl SCORM 패키지 URL
 * @returns 추출된 콘텐츠의 HTML 엔트리 포인트와 추출된 파일들의 URL 맵
 */
export const extractScormPackage = async (fileUrl: string): Promise<{
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
    
    // ZIP 파일 다운로드 및 로드
    const { zip: loadedZip } = await downloadAndLoadZip(fileUrl);
    
    // SCORM 콘텐츠의 모든 파일을 추출
    const extractedFiles = await extractAllFiles(loadedZip);
    
    // SCORM 메타데이터 파일 (imsmanifest.xml)를 찾기 위한 변수
    let manifestFile = null;
    let manifestPath = '';
    
    // SCORM 진입점 파일 (일반적으로 index.html, index_lms.html, 또는 imsmanifest.xml에 지정된 파일)
    let entryPoint: string | null = null;
    
    // 모든 파일 목록을 먼저 확인하여 manifest 및 가능한 진입점 찾기
    Object.keys(loadedZip.files).forEach(filename => {
      const file = loadedZip.files[filename];
      if (file.dir) return;
      
      // manifest 파일 찾기
      if (filename.toLowerCase().endsWith('imsmanifest.xml')) {
        manifestFile = file;
        manifestPath = filename;
      }
      
      // 진입점 후보 확인
      if (!entryPoint) {
        // 공통 진입점 패턴 확인
        for (const commonPath of commonEntryPaths) {
          // 정확히 일치하는 경우
          if (filename.toLowerCase() === commonPath.toLowerCase()) {
            entryPoint = filename;
            console.log('Found exact entry point match:', filename);
            break;
          }
          // 끝부분이 일치하는 경우
          else if (filename.toLowerCase().endsWith('/' + commonPath.toLowerCase())) {
            entryPoint = filename;
            console.log('Found entry point match at end of path:', filename);
            break;
          }
        }
      }
    });
    
    // 특정 타입의 SCORM 패키지 감지 및 진입점 찾기
    if (!entryPoint) {
      entryPoint = detectScormPackageType(loadedZip);
    }
    
    // SCORM Cloud 패턴 확인
    if (!entryPoint) {
      entryPoint = findEntryInDirectory(loadedZip, 'scorm');
      if (entryPoint) {
        console.log('Detected SCORM Cloud package, entry point:', entryPoint);
      }
    }
    
    // imsmanifest.xml 파일로부터 진입점 파일 찾기 (진입점이 아직 결정되지 않은 경우)
    if (manifestFile && (!entryPoint || entryPoint.includes('imsmanifest.xml'))) {
      entryPoint = await extractEntryFromManifest(manifestFile, manifestPath, extractedFiles);
    }
    
    // 진입점이 여전히 결정되지 않은 경우, HTML 파일 중에서 가장 적합한 것 찾기
    if (!entryPoint) {
      const htmlFiles = Array.from(extractedFiles.keys()).filter(filename => 
        filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm')
      );
      
      console.log('No entry point found, looking at HTML files:', htmlFiles.length);
      
      // HTML 파일이 하나라도 있다면 선택
      if (htmlFiles.length > 0) {
        entryPoint = selectBestHtmlFile(htmlFiles);
        console.log('Selected HTML file as entry point:', entryPoint);
      }
    }
    
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
