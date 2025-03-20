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
    
    // SCORM 콘텐츠의 모든 파일을 저장할 맵
    const extractedFiles = new Map<string, string>();
    
    // SCORM 메타데이터 파일 (imsmanifest.xml)를 찾기 위한 변수
    let manifestFile = null;
    let manifestPath = '';
    
    // SCORM 진입점 파일 (일반적으로 index.html, index_lms.html, 또는 imsmanifest.xml에 지정된 파일)
    let entryPoint: string | null = null;
    
    // 가능한 공통 진입점 파일 경로 목록 (우선순위 순)
    const commonEntryPaths = [
      'index.html',
      'story.html',
      'story_html5.html',
      'index_lms.html',
      'launch.html',
      'player.html',
      'scormdriver/indexAPI.html',
      'scormcontent/index.html',
      'shared/launchpage.html',
      'res/index.html',
      'content/index.html',
      'courseimages/index.html',
    ];
    
    // 디렉토리 존재 여부 확인 함수
    const directoryExists = (path: string): boolean => {
      return !!loadedZip.files[path] || Object.keys(loadedZip.files).some(name => name.startsWith(path + '/'));
    };
    
    // 특정 패턴의 디렉토리 안에서 진입점 찾기
    const findEntryInDirectory = (dirPattern: string): string | null => {
      // 해당 패턴에 맞는 디렉토리 찾기
      const matchingDirs = Object.keys(loadedZip.files)
        .filter(name => loadedZip.files[name].dir && name.includes(dirPattern))
        .sort((a, b) => a.length - b.length); // 짧은 경로 우선
      
      if (matchingDirs.length === 0) return null;
      
      // 각 디렉토리에서 진입점 확인
      for (const dir of matchingDirs) {
        for (const entry of commonEntryPaths) {
          const potentialPath = dir + entry;
          if (loadedZip.files[potentialPath] && !loadedZip.files[potentialPath].dir) {
            return potentialPath;
          }
        }
      }
      
      return null;
    };
    
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
    
    // 특정 타입의 SCORM 패키지 감지 및 진입점 찾기 (Articulate Storyline, Adobe Captivate 등)
    if (!entryPoint) {
      // Articulate Storyline 패턴 확인
      if (directoryExists('story_content') || directoryExists('mobile')) {
        const storylineEntry = Object.keys(loadedZip.files).find(name => 
          name === 'story.html' || name === 'index.html' || name === 'story_html5.html'
        );
        if (storylineEntry) {
          entryPoint = storylineEntry;
          console.log('Detected Articulate Storyline package, entry point:', entryPoint);
        }
      }
      
      // Adobe Captivate 패턴 확인
      if (!entryPoint && (directoryExists('assets') || directoryExists('lib'))) {
        const captivateEntry = Object.keys(loadedZip.files).find(name => 
          name === 'index.html' || name.endsWith('/index.html')
        );
        if (captivateEntry) {
          entryPoint = captivateEntry;
          console.log('Detected Adobe Captivate package, entry point:', entryPoint);
        }
      }
      
      // iSpring 패턴 확인
      if (!entryPoint && directoryExists('data')) {
        const iSpringEntry = Object.keys(loadedZip.files).find(name => 
          name === 'index.html' || name === 'player.html'
        );
        if (iSpringEntry) {
          entryPoint = iSpringEntry;
          console.log('Detected iSpring package, entry point:', entryPoint);
        }
      }
      
      // SCORM Cloud 패턴 확인
      if (!entryPoint) {
        entryPoint = findEntryInDirectory('scorm');
        if (entryPoint) {
          console.log('Detected SCORM Cloud package, entry point:', entryPoint);
        }
      }
    }
    
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
          } else {
            console.log('Entry point in manifest not found in extracted files:', manifestEntryPoint);
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
      
      console.log('No entry point found, looking at HTML files:', htmlFiles.length);
      
      // HTML 파일이 하나라도 있다면 선택
      if (htmlFiles.length > 0) {
        // 경로 깊이에 따른 정렬 (짧은 경로 우선)
        htmlFiles.sort((a, b) => {
          const depthA = a.split('/').length;
          const depthB = b.split('/').length;
          return depthA - depthB;
        });
        
        // 최상위 디렉토리의 index.html 파일을 찾기
        const rootIndexFile = htmlFiles.find(file => 
          file === 'index.html' || file.match(/^[^\/]+\/index\.html$/)
        );
        
        // index.html, launch.html 또는 기타 일반적인 진입점 이름 선호
        const preferredNameFile = htmlFiles.find(file => {
          const fileName = file.split('/').pop()?.toLowerCase() || '';
          return fileName === 'index.html' || fileName === 'story.html' || 
                 fileName === 'launch.html' || fileName === 'player.html' || 
                 fileName === 'start.html' || fileName === 'default.html';
        });
        
        entryPoint = rootIndexFile || preferredNameFile || htmlFiles[0];
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
