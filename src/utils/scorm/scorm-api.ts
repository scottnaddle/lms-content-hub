
/**
 * SCORM API를 iframe에 주입하는 함수
 * 이 함수는 SCORM 2004 또는 SCORM 1.2 API를 시뮬레이션합니다.
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
    
    // SCORM 1.2 API
    const API = {
      LMSInitialize: function(param: string) { 
        console.log('SCORM API: LMSInitialize called with', param); 
        return 'true'; 
      },
      LMSFinish: function(param: string) { 
        console.log('SCORM API: LMSFinish called with', param); 
        return 'true'; 
      },
      LMSGetValue: function(element: string) {
        console.log('SCORM API: LMSGetValue', element);
        
        // 간단한 경로 기반 값 조회 (실제로는 더 복잡한 구현 필요)
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
        
        // 일부 중요 값만 처리 (실제로는 더 많은 값을 처리해야 함)
        const parts = element.split('.');
        
        // 점수 업데이트
        if (element === 'cmi.core.score.raw') {
          scormData.cmi.core.score.raw = parseFloat(value);
        }
        // 진행 상태 업데이트
        else if (element === 'cmi.core.lesson_status') {
          scormData.cmi.core.lesson_status = value;
        }
        // 진행 위치 업데이트
        else if (element === 'cmi.core.lesson_location') {
          scormData.cmi.core.lesson_location = value;
        }
        // 세션 시간 업데이트
        else if (element === 'cmi.core.session_time') {
          scormData.cmi.core.session_time = value;
        }
        // 중단 데이터 업데이트
        else if (element === 'cmi.suspend_data') {
          scormData.cmi.suspend_data = value;
        }
        // 학생 ID 업데이트
        else if (element === 'cmi.core.student_id') {
          scormData.cmi.core.student_id = value;
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
    
    // API 객체를 iframe의 window 객체에 추가
    try {
      Object.defineProperty(iframeWindow, 'API', {
        value: API,
        writable: false,
        enumerable: true,
        configurable: true
      });
      console.log('SCORM 1.2 API injected into iframe');
    } catch (err) {
      console.error('Failed to inject SCORM 1.2 API:', err);
    }
    
    try {
      Object.defineProperty(iframeWindow, 'API_1484_11', {
        value: API_1484_11,
        writable: false,
        enumerable: true,
        configurable: true
      });
      console.log('SCORM 2004 API injected into iframe');
    } catch (err) {
      console.error('Failed to inject SCORM 2004 API:', err);
    }
    
    console.log('SCORM API has been injected into iframe');
  } catch (error) {
    console.error('Failed to inject SCORM API:', error);
    throw error;
  }
};
