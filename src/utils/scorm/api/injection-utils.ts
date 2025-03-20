
/**
 * SCORM API 주입 유틸리티 함수들
 */

/**
 * 모든 조상 프레임에 API 주입
 */
export const injectAPIIntoAncestors = (
  iframeWindow: Window,
  API: any,
  API_1484_11: any,
  maxLevels = 3
) => {
  try {
    let currentWindow: any = iframeWindow;
    for (let i = 0; i < maxLevels; i++) {
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
};

/**
 * 모든 하위 프레임에 API 주입
 */
export const injectAPIIntoSubframes = (
  iframeWindow: Window,
  API: any
) => {
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
};

/**
 * SCORM API가 제대로 주입되었는지 확인
 */
export const validateAPIInjection = (iframe: HTMLIFrameElement): boolean => {
  try {
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return false;
    
    // 직접 API 확인
    if ((iframeWindow as any).API) {
      console.log('API found directly in window');
      return true;
    }
    
    // 부모에 API 확인
    if (iframeWindow.parent && (iframeWindow.parent as any).API) {
      console.log('API found in parent frame');
      return true;
    }
    
    // 최대 2단계 상위 프레임까지 확인
    let currentWindow = iframeWindow;
    for (let i = 0; i < 2; i++) {
      if (currentWindow.parent && currentWindow.parent !== currentWindow) {
        currentWindow = currentWindow.parent;
        if ((currentWindow as any).API) {
          console.log(`API found in ancestor frame level ${i+1}`);
          return true;
        }
      } else {
        break;
      }
    }
    
    console.warn('SCORM API validation failed, API not found in window hierarchy');
    return false;
  } catch (err) {
    console.error('Error validating SCORM API:', err);
    return false;
  }
};
