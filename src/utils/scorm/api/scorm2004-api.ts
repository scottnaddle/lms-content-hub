
/**
 * SCORM 2004 API 구현
 */

import { ScormData } from '../types/scorm-data';
import { createScorm12API } from './scorm12-api';

/**
 * SCORM 2004 API 구현
 */
export const createScorm2004API = (scormData: ScormData) => {
  const scorm12API = createScorm12API(scormData);
  
  return {
    Initialize: function(param: string) { 
      console.log('SCORM 2004 API: Initialize called with', param); 
      return 'true'; 
    },
    
    Terminate: function(param: string) { 
      console.log('SCORM 2004 API: Terminate called with', param); 
      return 'true'; 
    },
    
    GetValue: function(element: string) {
      console.log('SCORM 2004 API: GetValue', element);
      return scorm12API.LMSGetValue(element);
    },
    
    SetValue: function(element: string, value: string) {
      console.log('SCORM 2004 API: SetValue', element, value);
      return scorm12API.LMSSetValue(element, value);
    },
    
    Commit: function(param: string) { 
      console.log('SCORM 2004 API: Commit called with', param); 
      return 'true'; 
    },
    
    GetLastError: function() { 
      return '0'; 
    },
    
    GetErrorString: function(errorCode: string) { 
      return 'No error'; 
    },
    
    GetDiagnostic: function(errorCode: string) { 
      return 'No diagnostic information available'; 
    }
  };
};
