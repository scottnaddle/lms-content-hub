
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
        try {
          // Both SCORM 1.2 and 2004 APIs
          currentWindow.parent.API = API;
          currentWindow.parent.API_1484_11 = API_1484_11;
          
          console.log(`SCORM API injected into ancestor frame level ${i+1}`);
          currentWindow = currentWindow.parent;
        } catch (e) {
          console.warn(`Failed to inject API into ancestor level ${i+1}:`, e);
          break;
        }
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
  try {
    if (!iframeWindow.frames || iframeWindow.frames.length === 0) return;
    
    console.log(`Attempting to inject API into ${iframeWindow.frames.length} subframes`);
    
    for (let i = 0; i < iframeWindow.frames.length; i++) {
      try {
        const frame = iframeWindow.frames[i];
        if (frame) {
          (frame as any).API = API;
          try {
            (frame as any).parent.API = API;
          } catch (e) {
            console.warn(`Could not inject API into parent of subframe ${i}:`, e);
          }
          console.log(`SCORM API injected into subframe ${i}`);
        }
      } catch (err) {
        console.warn(`Could not inject API into subframe ${i}:`, err);
      }
    }
  } catch (err) {
    console.warn('Error while injecting API into subframes:', err);
  }
};

/**
 * SCORM API가 제대로 주입되었는지 확인
 */
export const validateAPIInjection = (iframe: HTMLIFrameElement): boolean => {
  try {
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return false;
    
    // Try different approaches to validation
    let apiFound = false;
    
    // 1. Direct check in window
    if ((iframeWindow as any).API) {
      console.log('API found directly in window');
      apiFound = true;
    }
    
    // 2. Check in parent
    try {
      if (iframeWindow.parent && (iframeWindow.parent as any).API) {
        console.log('API found in parent frame');
        apiFound = true;
      }
    } catch (e) {
      console.warn('Failed to check API in parent frame:', e);
    }
    
    // 3. Check ancestors (up to 2 levels)
    try {
      let currentWindow: any = iframeWindow;
      for (let i = 0; i < 2; i++) {
        if (currentWindow.parent && currentWindow.parent !== currentWindow) {
          currentWindow = currentWindow.parent;
          if (currentWindow.API) {
            console.log(`API found in ancestor frame level ${i+1}`);
            apiFound = true;
            break;
          }
        } else {
          break;
        }
      }
    } catch (e) {
      console.warn('Failed to check API in ancestor frames:', e);
    }
    
    // 4. Check for global API in window
    if ((window as any).API) {
      console.log('API found in global window');
      apiFound = true;
    }
    
    if (!apiFound) {
      console.warn('SCORM API validation failed, API not found in window hierarchy');
    }
    
    return apiFound;
  } catch (err) {
    console.error('Error validating SCORM API:', err);
    return false;
  }
};
