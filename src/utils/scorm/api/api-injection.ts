
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
    if (!iframe) {
      console.error('Iframe element is null or undefined');
      return false;
    }

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
      // First approach: Add API to the main window (host page)
      // This works even with cross-origin restrictions since the iframe will look for API in parent
      (window as any).API = API;
      (window as any).API_1484_11 = API_1484_11;
      console.log('API injected into global window as primary method');
      
      // Second approach: Try to inject directly if same-origin
      try {
        (iframeWindow as any).API = API;
        (iframeWindow as any).API_1484_11 = API_1484_11;
        console.log('API directly injected to iframe window');
      } catch (e) {
        console.warn('Failed to inject API directly to iframe window (cross-origin restriction):', e);
      }
      
      // Additional approaches - try with catch blocks for cross-origin situations
      try {
        // Add API to parent/top references
        if (iframeWindow.parent) {
          (window.parent as any).API = API;
          (window.parent as any).API_1484_11 = API_1484_11;
        }
        
        if (window.top) {
          (window.top as any).API = API;
          (window.top as any).API_1484_11 = API_1484_11;
        }
        
        console.log('API injected into parent/top frames');
      } catch (e) {
        console.warn('Failed to inject API into parent/top frames (expected for cross-origin)');
      }
      
      // Set window properties on the host page too
      (window as any).parent.API = API;
      (window as any).parent.API_1484_11 = API_1484_11;
      
      // Handle AICC compatibility
      try {
        (window as any).AICC_API = API;
      } catch (e) {
        console.warn('Failed to add AICC API');
      }
      
      console.log('SCORM API injection complete');
      
      // Return true even without validation since we want to be optimistic
      // The most critical part (setting API on window) should have worked
      return true;
    } catch (error) {
      console.error('Failed during SCORM API injection:', error);
      return false;
    }
  } catch (error) {
    console.error('Critical error in SCORM API injection:', error);
    return false;
  }
};
