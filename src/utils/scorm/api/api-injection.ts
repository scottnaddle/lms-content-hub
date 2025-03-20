
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
    
    try {
      // First, check if we can access iframe document
      const iframeDoc = iframe.contentDocument || iframeWindow.document;
      if (!iframeDoc) {
        console.warn('Cannot access iframe document, injection may fail');
      }
      
      // Check iframe readiness
      const readyState = iframeDoc?.readyState;
      console.log('Iframe readyState:', readyState);
      
      // Based on the reference implementation, inject API in multiple locations:
      
      // 1. Direct injection to window object
      (iframeWindow as any).API = API;
      (iframeWindow as any).API_1484_11 = API_1484_11;
      
      // 2. Inject to parent window (this is critical for SCORM)
      try {
        // SCORM 1.2 API
        (iframeWindow as any).parent.API = API;
        
        // SCORM 2004 API
        (iframeWindow as any).parent.API_1484_11 = API_1484_11;
        
        console.log('API injected into parent frame');
      } catch (e) {
        console.warn('Failed to inject API into parent frame:', e);
      }
      
      // 3. Inject to other frames that might need it
      injectAPIIntoSubframes(iframeWindow, API);
      injectAPIIntoAncestors(iframeWindow, API, API_1484_11);
      
      // 4. Add to global window for maximum compatibility
      try {
        (window as any).API = API;
        (window as any).API_1484_11 = API_1484_11;
      } catch (e) {
        console.warn('Failed to add API to global window:', e);
      }
      
      // 5. AICC compatibility
      try {
        (iframeWindow as any).AICC_API = API;
        (window as any).AICC_API = API;
      } catch (e) {
        console.warn('Failed to add AICC API:', e);
      }
      
      // Log successful injection
      console.log('SCORM API injection complete in multiple contexts');
      
      // Validate API injection
      return validateAPIInjection(iframe);
    } catch (error) {
      console.error('Failed during SCORM API injection:', error);
      return false;
    }
  } catch (error) {
    console.error('Critical error in SCORM API injection:', error);
    return false;
  }
};
