
/**
 * SCORM 1.2 API 구현
 * SCORM 1.2 표준: https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/
 */

import { ScormData } from '../types/scorm-data';

/**
 * SCORM 1.2 API 구현 - LMS에서 제공해야 하는 API
 */
export const createScorm12API = (scormData: ScormData) => {
  return {
    LMSInitialize: function(param: string) { 
      console.log('SCORM API: LMSInitialize called with', param); 
      return 'true'; // SCORM 1.2는 문자열 'true'/'false' 반환
    },
    
    LMSFinish: function(param: string) { 
      console.log('SCORM API: LMSFinish called with', param); 
      return 'true'; 
    },
    
    LMSGetValue: function(element: string) {
      console.log('SCORM API: LMSGetValue', element);
      
      // 경로 기반 값 조회
      const parts = element.split('.');
      let obj: any = scormData;
      
      for (const part of parts) {
        if (obj && obj[part] !== undefined) {
          obj = obj[part];
        } else {
          console.log('SCORM: Value not found for', element);
          return '';
        }
      }
      
      console.log('SCORM: Returning value for', element, ':', obj);
      return typeof obj === 'object' ? JSON.stringify(obj) : String(obj);
    },
    
    LMSSetValue: function(element: string, value: string) {
      console.log('SCORM API: LMSSetValue', element, value);
      
      // 주요 SCORM 데이터 처리
      if (element === 'cmi.core.score.raw') {
        scormData.cmi.core.score.raw = parseFloat(value);
      }
      else if (element === 'cmi.core.lesson_status') {
        scormData.cmi.core.lesson_status = value;
      }
      else if (element === 'cmi.core.lesson_location') {
        scormData.cmi.core.lesson_location = value;
      }
      else if (element === 'cmi.core.session_time') {
        scormData.cmi.core.session_time = value;
      }
      else if (element === 'cmi.suspend_data') {
        scormData.cmi.suspend_data = value;
      }
      
      return 'true';
    },
    
    LMSCommit: function(param: string) { 
      console.log('SCORM API: LMSCommit called with', param); 
      return 'true'; 
    },
    
    LMSGetLastError: function() { 
      return '0'; 
    },
    
    LMSGetErrorString: function(errorCode: string) { 
      return 'No error'; 
    },
    
    LMSGetDiagnostic: function(errorCode: string) { 
      return 'No diagnostic information available'; 
    }
  };
};
