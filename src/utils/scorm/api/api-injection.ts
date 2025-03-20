/**
 * SCORM API를 iframe에 주입하는 함수
 */
import { createDefaultScormData } from '../types/scorm-data';
import { createScorm12API } from './scorm12-api';
import { createScorm2004API } from './scorm2004-api';

// Keep track of whether we've already injected the API
let apiInjected = false;

/**
 * SCORM API를 window에 주입하는 함수
 * iframe이 null이면 현재 window에만 주입합니다.
 * 이 함수는 SCORM 2004 또는 SCORM 1.2 API를 시뮬레이션합니다.
 */
export const injectScormApi = (iframe: HTMLIFrameElement | null): boolean => {
  try {
    // If we've already injected the API, don't do it again
    if (apiInjected) {
      console.log('SCORM API already injected, skipping');
      return true;
    }
    
    console.log('Injecting SCORM API into parent window');
    
    // SCORM 데이터 저장소 초기화
    const scormData = createDefaultScormData();
    
    // SCORM 1.2 API 생성
    const API = createScorm12API(scormData);
    
    // SCORM 2004 API 생성
    const API_1484_11 = createScorm2004API(scormData);
    
    // Inject APIs into the parent window
    // This is the safest approach as the iframe will look for API in parent
    try {
      // Primary approach: Add API to window
      window.API = API;
      window.API_1484_11 = API_1484_11;
      
      // Make window.parent also point to our APIs (needed for some SCORM packages)
      if (window.parent) {
        window.parent.API = API;
        window.parent.API_1484_11 = API_1484_11;
      }
      
      // Also add to window.top for nested frames
      if (window.top) {
        window.top.API = API;
        window.top.API_1484_11 = API_1484_11;
      }
      
      console.log('SCORM API successfully injected to parent window');
      
      // Add simple emulation for older AICC content
      try {
        window.AICC_API = API;
      } catch (e) {
        console.warn('Failed to add AICC API compatibility');
      }
      
      // Mark as injected
      apiInjected = true;
      
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

// Add API to the global window object
declare global {
  interface Window {
    API: any;
    API_1484_11: any;
    AICC_API?: any;
  }
}
