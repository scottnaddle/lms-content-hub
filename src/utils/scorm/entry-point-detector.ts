
/**
 * SCORM 패키지의 진입점(entry point) 감지를 위한 유틸리티
 */
import JSZip from 'jszip';

/**
 * 디렉토리 존재 여부 확인 함수
 */
export const directoryExists = (loadedZip: JSZip, path: string): boolean => {
  return !!loadedZip.files[path] || Object.keys(loadedZip.files).some(name => name.startsWith(path + '/'));
};

/**
 * 공통 SCORM 진입점 경로 목록
 */
export const commonEntryPaths = [
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

/**
 * 특정 패턴의 디렉토리 안에서 진입점 찾기
 */
export const findEntryInDirectory = (
  loadedZip: JSZip, 
  dirPattern: string
): string | null => {
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

/**
 * 특정 SCORM 패키지 타입 감지 및 진입점 찾기
 */
export const detectScormPackageType = (
  loadedZip: JSZip
): string | null => {
  const files = Object.keys(loadedZip.files);
  
  // Articulate Storyline 패턴 확인
  if (directoryExists(loadedZip, 'story_content') || directoryExists(loadedZip, 'mobile')) {
    const storylineEntry = files.find(name => 
      name === 'story.html' || name === 'index.html' || name === 'story_html5.html'
    );
    if (storylineEntry) {
      console.log('Detected Articulate Storyline package, entry point:', storylineEntry);
      return storylineEntry;
    }
  }
  
  // Adobe Captivate 패턴 확인
  if (directoryExists(loadedZip, 'assets') || directoryExists(loadedZip, 'lib')) {
    const captivateEntry = files.find(name => 
      name === 'index.html' || name.endsWith('/index.html')
    );
    if (captivateEntry) {
      console.log('Detected Adobe Captivate package, entry point:', captivateEntry);
      return captivateEntry;
    }
  }
  
  // iSpring 패턴 확인
  if (directoryExists(loadedZip, 'data')) {
    const iSpringEntry = files.find(name => 
      name === 'index.html' || name === 'player.html'
    );
    if (iSpringEntry) {
      console.log('Detected iSpring package, entry point:', iSpringEntry);
      return iSpringEntry;
    }
  }
  
  return null;
};

/**
 * 가장 적합한 HTML 파일 선택
 */
export const selectBestHtmlFile = (files: string[]): string | null => {
  if (files.length === 0) return null;
  
  // 경로 깊이에 따른 정렬 (짧은 경로 우선)
  files.sort((a, b) => {
    const depthA = a.split('/').length;
    const depthB = b.split('/').length;
    return depthA - depthB;
  });
  
  // 최상위 디렉토리의 index.html 파일을 찾기
  const rootIndexFile = files.find(file => 
    file === 'index.html' || file.match(/^[^\/]+\/index\.html$/)
  );
  
  // index.html, launch.html 또는 기타 일반적인 진입점 이름 선호
  const preferredNameFile = files.find(file => {
    const fileName = file.split('/').pop()?.toLowerCase() || '';
    return fileName === 'index.html' || fileName === 'story.html' || 
           fileName === 'launch.html' || fileName === 'player.html' || 
           fileName === 'start.html' || fileName === 'default.html';
  });
  
  return rootIndexFile || preferredNameFile || files[0];
};
