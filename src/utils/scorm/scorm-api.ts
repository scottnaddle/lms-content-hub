/**
 * SCORM API를 iframe에 주입하는 함수
 * 이 함수는 SCORM 2004 또는 SCORM 1.2 API를 시뮬레이션합니다.
 * SCORM 1.2 표준: https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/
 */
export const injectScormApi = (iframe: HTMLIFrameElement): void => {
  try {
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) {
      console.error('Cannot access iframe content window');
      return;
    }
    
    // SCORM 데이터 저장소
    const scormData = {
      cmi: {
        core: {
          lesson_status: 'incomplete',
          lesson_location: '',
          score: { raw: 0, min: 0, max: 100 },
          total_time: '0000:00:00',
          session_time: '0000:00:00',
          student_name: '학습자',
          student_id: 'student_001',
          exit: ''
        },
        suspend_data: '',
        comments: '',
        objectives: {},
        student_data: {
          mastery_score: '',
          max_time_allowed: '',
          time_limit_action: ''
        },
        interactions: [],
        completion_status: 'incomplete',
        progress_measure: 0,
        score: {
          raw: 0,
          min: 0,
          max: 100,
          scaled: 0
        },
        success_status: 'unknown',
        session_time: '0000:00:00',
        total_time: '0000:00:00'
      },
      sco_data: {}
    };
    
    // SCORM 1.2 API 구현 - LMS에서 제공해야 하는 API
    const API = {
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
    
    // SCORM 2004 API
    const API_1484_11 = {
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
        return API.LMSGetValue(element);
      },
      SetValue: function(element: string, value: string) {
        console.log('SCORM 2004 API: SetValue', element, value);
        return API.LMSSetValue(element, value);
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
      
      // 복수의 프레임 검색을 위한 API 주입
      if (iframeWindow.frames && iframeWindow.frames.length > 0) {
        for (let i = 0; i < iframeWindow.frames.length; i++) {
          try {
            (iframeWindow.frames[i] as any).API = API;
            (iframeWindow.frames[i] as any).parent.API = API;
            console.log(`SCORM API injected into subframe ${i}`);
          } catch (err) {
            console.warn(`Could not inject API into subframe ${i}:`, err);
          }
        }
      }
      
      // AICC 호환성
      (iframeWindow as any).AICC_API = API;
      console.log('AICC API injected for backward compatibility');
      
      // 프레임 조상 탐색 (일부 콘텐츠는 parent.parent 등으로 API 검색)
      try {
        let currentWindow: any = iframeWindow;
        for (let i = 0; i < 3; i++) { // 최대 3단계까지 조상 프레임 탐색
          if (currentWindow.parent && currentWindow.parent !== currentWindow) {
            currentWindow.parent.API = API;
            currentWindow.parent.API_1484_11 = API_1484_11;
            currentWindow = currentWindow.parent;
            console.log(`SCORM API injected into ancestor frame level ${i+1}`);
          } else {
            break;
          }
        }
      } catch (err) {
        console.warn('Could not inject API into all ancestor frames:', err);
      }
      
      console.log('SCORM API injection complete');
      
      // iframe 상태 확인
      console.log('iframe content document:', iframe.contentDocument ? 'available' : 'not available');
      console.log('iframe readyState:', iframe.contentDocument?.readyState);
    } catch (error) {
      console.error('Failed to inject SCORM API:', error);
    }
  } catch (error) {
    console.error('Failed to inject SCORM API:', error);
    throw error;
  }
};
