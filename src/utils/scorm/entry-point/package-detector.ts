
/**
 * 특정 SCORM 패키지 타입 감지 유틸리티
 */
import JSZip from 'jszip';
import { directoryExists } from './directory-utils';

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
