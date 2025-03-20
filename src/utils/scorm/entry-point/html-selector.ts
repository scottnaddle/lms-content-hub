
/**
 * HTML 파일 선택 유틸리티
 */

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
