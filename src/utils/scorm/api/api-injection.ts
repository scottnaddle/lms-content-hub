
/**
 * SCORM API를 iframe에 주입하는 함수
 */
import { createDefaultScormData } from '../types/scorm-data';
import { createScorm12API } from './scorm12-api';
import { createScorm2004API } from './scorm2004-api';

// Keep track of whether we've already injected the API
let apiInjected = false;
let scormAPI: any = null;
let scorm2004API: any = null;

/**
 * PostMessage 기반 SCORM API 통신 설정
 */
const setupMessageListener = () => {
  if (window.scormMessageHandlerSet) return;
  
  window.addEventListener('message', (event) => {
    try {
      const data = event.data;
      
      // Only process SCORM API requests
      if (!data || !data.scormAPICall) return;
      
      console.log('Received SCORM API call via postMessage:', data);
      
      const { scormVersion, method, params, callId } = data;
      let result;
      
      // Call the appropriate API method
      if (scormVersion === '2004') {
        if (scorm2004API && typeof scorm2004API[method] === 'function') {
          result = scorm2004API[method].apply(scorm2004API, params || []);
        }
      } else {
        // Default to SCORM 1.2
        if (scormAPI && typeof scormAPI[method] === 'function') {
          result = scormAPI[method].apply(scormAPI, params || []);
        }
      }
      
      // Send the result back to the iframe
      event.source?.postMessage({
        scormAPIResponse: true,
        callId,
        result
      }, '*');
      
    } catch (error) {
      console.error('Error processing SCORM API message:', error);
    }
  });
  
  // Mark that we've set up the handler
  window.scormMessageHandlerSet = true;
  console.log('SCORM postMessage handler installed');
};

/**
 * SCORM API를 window에 주입하는 함수
 * iframe이 null이면 현재 window에만 주입합니다.
 * 이 함수는 SCORM 2004 또는 SCORM 1.2 API를 시뮬레이션합니다.
 */
export const injectScormApi = (iframe: HTMLIFrameElement | null): boolean => {
  try {
    // If we've already created the APIs, just return
    if (apiInjected) {
      console.log('SCORM API already created, skipping initialization');
      return true;
    }
    
    console.log('Creating SCORM API handlers');
    
    // SCORM 데이터 저장소 초기화
    const scormData = createDefaultScormData();
    
    // SCORM 1.2 API 생성
    scormAPI = createScorm12API(scormData);
    
    // SCORM 2004 API 생성
    scorm2004API = createScorm2004API(scormData);
    
    // Set up message listener for cross-domain communication
    setupMessageListener();
    
    // Mark as API objects created
    apiInjected = true;
    
    // Inject APIs into window for same-origin content
    try {
      window.API = scormAPI;
      window.API_1484_11 = scorm2004API;
      console.log('SCORM API objects assigned to window for same-origin content');
    } catch (error) {
      console.warn('Note: Could not assign API to window directly:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Critical error in SCORM API creation:', error);
    return false;
  }
};

// Add API to the global window object
declare global {
  interface Window {
    API?: any;
    API_1484_11?: any;
    AICC_API?: any;
    scormMessageHandlerSet?: boolean;
  }
}
