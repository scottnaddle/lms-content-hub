
/**
 * SCORM 패키지의 디렉토리 관련 유틸리티 함수
 */
import JSZip from 'jszip';

/**
 * 디렉토리 존재 여부 확인 함수
 */
export const directoryExists = (loadedZip: JSZip, path: string): boolean => {
  return !!loadedZip.files[path] || Object.keys(loadedZip.files).some(name => name.startsWith(path + '/'));
};
