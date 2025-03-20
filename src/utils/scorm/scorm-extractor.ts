
import JSZip from 'jszip';
import { getContentType } from './mime-types';

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
    
    // SCORM 패키지 다운로드
    const response = await fetch(fileUrl, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download SCORM package: ${response.statusText} (${response.status})`);
    }
    
    const zipData = await response.arrayBuffer();
    console.log('SCORM package downloaded, size:', zipData.byteLength);
    
    // JSZip을 사용하여 ZIP 파일 추출
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipData);
    
    // SCORM 콘텐츠의 모든 파일을 저장할 맵
    const extractedFiles = new Map<string, string>();
    
    // SCORM 메타데이터 파일 (imsmanifest.xml)를 찾기 위한 변수
    let manifestFile = null;
    let manifestPath = '';
    
    // SCORM 진입점 파일 (일반적으로 index.html, index_lms.html, 또는 imsmanifest.xml에 지정된 파일)
    let entryPoint: string | null = null;
    
    // 가능한 공통 진입점 파일 경로 목록
    const commonEntryPaths = [
      'index.html',
      'story.html',
      'scormdriver/indexAPI.html',
      'scormcontent/index.html',
      'shared/launchpage.html',
      'res/index.html',
      'content/index.html',
      'courseimages/index.html',
    ];
    
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
          if (filename.toLowerCase().endsWith(commonPath.toLowerCase())) {
            entryPoint = filename;
            break;
          }
        }
      }
    });
    
    // 모든 파일 추출 및 Blob URL 생성
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
      } catch (err) {
        console.error(`Failed to extract file: ${filename}`, err);
      }
    });
    
    // 모든 파일 추출이 완료될 때까지 대기
    await Promise.all(extractPromises);
    
    console.log('Extraction complete, files:', extractedFiles.size);
    
    // imsmanifest.xml 파일로부터 진입점 파일 찾기 (진입점이 아직 결정되지 않은 경우)
    if (manifestFile && (!entryPoint || entryPoint.includes('imsmanifest.xml'))) {
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
            entryPoint = manifestEntryPoint;
            console.log('Entry point found in manifest:', entryPoint);
          }
        }
      } catch (err) {
        console.error('Failed to extract entrypoint from manifest:', err);
      }
    }
    
    // 진입점이 여전히 결정되지 않은 경우, HTML 파일 중에서 가장 적합한 것 찾기
    if (!entryPoint) {
      const htmlFiles = Array.from(extractedFiles.keys()).filter(filename => 
        filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm')
      );
      
      // HTML 파일이 하나라도 있다면 첫 번째 것을 사용
      if (htmlFiles.length > 0) {
        // 최상위 디렉토리의 index.html 파일을 찾기
        const rootIndexFile = htmlFiles.find(file => 
          file === 'index.html' || file.match(/^[^\/]+\/index\.html$/)
        );
        
        entryPoint = rootIndexFile || htmlFiles[0];
      }
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
