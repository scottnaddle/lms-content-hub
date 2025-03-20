
/**
 * 특정 패턴의 디렉토리에서 진입점 찾기 유틸리티
 */
import JSZip from 'jszip';
import { commonEntryPaths } from './common-paths';

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
