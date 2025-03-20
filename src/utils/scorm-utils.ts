
import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';

/**
 * SCORM 패키지(ZIP)를 다운로드하고 추출하는 함수
 * @param fileUrl SCORM 패키지 URL
 * @returns 추출된 콘텐츠의 HTML 엔트리 포인트와 추출된 파일들의 URL 맵
 */
export const extractScormPackage = async (fileUrl: string): Promise<{
  entryPoint: string | null;
  extractedFiles: Map<string, string>;
  error?: string;
}> => {
  try {
    // 파일 URL이 없는 경우
    if (!fileUrl) {
      return { entryPoint: null, extractedFiles: new Map(), error: 'SCORM 파일 URL이 제공되지 않았습니다.' };
    }

    console.log('Extracting SCORM package from URL:', fileUrl);
    
    // SCORM 패키지 다운로드
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download SCORM package: ${response.statusText}`);
    }
    
    const zipData = await response.arrayBuffer();
    console.log('SCORM package downloaded, size:', zipData.byteLength);
    
    // JSZip을 사용하여 ZIP 파일 추출
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipData);
    
    // SCORM 콘텐츠의 모든 파일을 저장할 맵
    const extractedFiles = new Map<string, string>();
    
    // SCORM 메타데이터 파일 (imsmanifest.xml)를 찾기 위한 변수
    let manifestFile = null;
    
    // SCORM 진입점 파일 (일반적으로 index.html, index_lms.html, 또는 imsmanifest.xml에 지정된 파일)
    let entryPoint: string | null = null;
    
    // 모든 파일 추출 및 Blob URL 생성
    const extractPromises = Object.keys(loadedZip.files).map(async (filename) => {
      const file = loadedZip.files[filename];
      
      // 디렉토리는 건너뛰기
      if (file.dir) return;
      
      // imsmanifest.xml 파일 찾기
      if (filename.toLowerCase() === 'imsmanifest.xml') {
        manifestFile = file;
      }
      
      // 일반적인 진입점 파일 확인
      if (!entryPoint) {
        const lowerFilename = filename.toLowerCase();
        if (
          lowerFilename === 'index.html' || 
          lowerFilename === 'index_lms.html' || 
          lowerFilename === 'story.html' ||
          lowerFilename.endsWith('/index.html')
        ) {
          entryPoint = filename;
        }
      }
      
      try {
        // 파일 내용을 Blob으로 추출
        const content = await file.async('blob');
        const contentType = getContentType(filename);
        const blob = new Blob([content], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);
        
        // 파일 경로와 Blob URL을 맵에 저장
        extractedFiles.set(filename, blobUrl);
      } catch (err) {
        console.error(`Failed to extract file: ${filename}`, err);
      }
    });
    
    // 모든 파일 추출이 완료될 때까지 대기
    await Promise.all(extractPromises);
    
    console.log('Extraction complete, files:', extractedFiles.size);
    
    // imsmanifest.xml 파일로부터 진입점 파일 찾기 (진입점이 아직 결정되지 않은 경우)
    if (manifestFile && !entryPoint) {
      try {
        const manifestContent = await manifestFile.async('text');
        // 간단한 정규식으로 리소스 파일 추출
        const resourceMatch = manifestContent.match(/href=['"]([^'"]+\.html)['"]/) || 
                             manifestContent.match(/identifier=['"]resource['"][^>]*href=['"]([^'"]+\.html)['"]/);
        
        if (resourceMatch && resourceMatch[1]) {
          entryPoint = resourceMatch[1];
        }
      } catch (err) {
        console.error('Failed to extract entrypoint from manifest:', err);
      }
    }
    
    // 진입점이 여전히 결정되지 않은 경우, 첫 번째 .html 파일 사용
    if (!entryPoint) {
      for (const filename of extractedFiles.keys()) {
        if (filename.toLowerCase().endsWith('.html')) {
          entryPoint = filename;
          break;
        }
      }
    }
    
    console.log('SCORM entry point determined:', entryPoint);
    
    return { entryPoint, extractedFiles };
  } catch (error: any) {
    console.error('SCORM extraction error:', error);
    return {
      entryPoint: null,
      extractedFiles: new Map(),
      error: `SCORM 패키지 추출 중 오류 발생: ${error.message || '알 수 없는 오류'}`
    };
  }
};

/**
 * 파일 확장자에 따른 MIME 타입 반환
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const mimeTypes: Record<string, string> = {
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'xml': 'application/xml',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'otf': 'font/otf',
    'eot': 'application/vnd.ms-fontobject',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * 추출된 SCORM 패키지의 리소스를 정리하는 함수
 */
export const cleanupScormResources = (extractedFiles: Map<string, string>) => {
  // 모든 Blob URL 해제
  extractedFiles.forEach(url => {
    URL.revokeObjectURL(url);
  });
  
  extractedFiles.clear();
};

/**
 * SCORM API를 iframe에 주입하는 함수
 * 이 함수는 SCORM 2004 또는 SCORM 1.2 API를 시뮬레이션합니다.
 */
export const injectScormApi = (iframe: HTMLIFrameElement): void => {
  try {
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;
    
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
          student_id: 'student_001'
        },
        suspend_data: '',
        comments: '',
        objectives: {},
        student_data: {
          mastery_score: '',
          max_time_allowed: '',
          time_limit_action: ''
        },
        completion_status: 'incomplete',
        progress_measure: 0,
        score: {
          raw: 0,
          min: 0,
          max: 100,
          scaled: 0
        }
      }
    };
    
    // SCORM 1.2 API
    const API = {
      LMSInitialize: function() { 
        console.log('SCORM API: LMSInitialize called'); 
        return 'true'; 
      },
      LMSFinish: function() { 
        console.log('SCORM API: LMSFinish called'); 
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
            return '';
          }
        }
        
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
        
        return 'true';
      },
      LMSCommit: function() { 
        console.log('SCORM API: LMSCommit called'); 
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
      Initialize: function() { 
        console.log('SCORM 2004 API: Initialize called'); 
        return 'true'; 
      },
      Terminate: function() { 
        console.log('SCORM 2004 API: Terminate called'); 
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
      Commit: function() { 
        console.log('SCORM 2004 API: Commit called'); 
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
    Object.defineProperty(iframeWindow, 'API', {
      value: API,
      writable: false
    });
    
    Object.defineProperty(iframeWindow, 'API_1484_11', {
      value: API_1484_11,
      writable: false
    });
    
    console.log('SCORM API has been injected into iframe');
  } catch (error) {
    console.error('Failed to inject SCORM API:', error);
  }
};
