
/**
 * SCORM API를 iframe에 주입하는 함수
 */
import { createDefaultScormData } from '../types/scorm-data';
import { createScorm12API } from './scorm12-api';
import { createScorm2004API } from './scorm2004-api';
import { injectAPIIntoAncestors, injectAPIIntoSubframes, validateAPIInjection } from './injection-utils';

/**
 * SCORM API를 iframe에 주입하는 함수
 * 이 함수는 SCORM 2004 또는 SCORM 1.2 API를 시뮬레이션합니다.
 */
export const injectScormApi = (iframe: HTMLIFrameElement): boolean => {
  try {
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) {
      console.error('Cannot access iframe content window');
      return false;
    }
    
    console.log('Injecting SCORM API into iframe');
    
    // SCORM 데이터 저장소 초기화
    const scormData = createDefaultScormData();
    
    // SCORM 1.2 API 생성
    const API = createScorm12API(scormData);
    
    // SCORM 2004 API 생성
    const API_1484_11 = createScorm2004API(scormData);
    
    // API를 window.API로 직접 할당
    try {
      // 부모 프레임에 API 배치 (SCORM 1.2 표준에 따라)
      (iframeWindow as any).parent.API = API;
      console.log('SCORM 1.2 API injected into parent frame');
      
      // 직접 window에도 API 배치
      (iframeWindow as any).API = API;
      console.log('SCORM 1.2 API also injected directly into window');
      
      // SCORM 2004 API 추가
      (iframeWindow as any).parent.API_1484_11 = API_1484_11;
      (iframeWindow as any).API_1484_11 = API_1484_11;
      console.log('SCORM 2004 API injected');
      
      // 하위 프레임에 API 주입
      injectAPIIntoSubframes(iframeWindow, API);
      
      // 조상 프레임에 API 주입
      injectAPIIntoAncestors(iframeWindow, API, API_1484_11);
      
      // AICC 호환성
      (iframeWindow as any).AICC_API = API;
      console.log('AICC API injected for backward compatibility');
      
      // iframe 상태 확인
      console.log('iframe content document:', iframe.contentDocument ? 'available' : 'not available');
      console.log('iframe readyState:', iframe.contentDocument?.readyState);
      
      console.log('SCORM API injection complete');
      
      // API 주입 확인
      return validateAPIInjection(iframe);
    } catch (error) {
      console.error('Failed to inject SCORM API:', error);
      return false;
    }
  } catch (error) {
    console.error('Failed to inject SCORM API:', error);
    return false;
  }
};
