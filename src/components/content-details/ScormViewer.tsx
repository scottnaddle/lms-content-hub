
import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface ScormViewerProps {
  fileUrl?: string;
  title: string;
  onDownload: () => void;
}

const ScormViewer: React.FC<ScormViewerProps> = ({ 
  fileUrl, 
  title,
  onDownload
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  
  useEffect(() => {
    if (!fileUrl) {
      setError("SCORM 파일을 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }

    // SCORM 패키지의 압축을 푸는 로직 또는 
    // SCORM 콘텐츠를 표시하기 위한 로직이 필요합니다.
    // 실제 구현에서는 서버 측에서 ZIP 압축을 풀고 
    // 추출된 콘텐츠의 index.html 위치를 반환하는 로직이 필요합니다.
    
    // 예시 목적으로 간단히 시뮬레이션합니다:
    const scormBaseUrl = fileUrl.replace('.zip', '');
    const scormIndexUrl = `${scormBaseUrl}/index.html`;
    
    // iframe 로드 이벤트 핸들러
    const handleIframeLoad = () => {
      setIsLoading(false);
    };
    
    // iframe 오류 이벤트 핸들러
    const handleIframeError = () => {
      setError("SCORM 콘텐츠를 로드하는 데 실패했습니다.");
      setIsLoading(false);
    };
    
    if (iframeRef.current) {
      iframeRef.current.onload = handleIframeLoad;
      iframeRef.current.onerror = handleIframeError;
      
      // 실제 구현에서는 서버 측에서 SCORM 내용에 접근하기 위한 URL로 설정합니다.
      // iframeRef.current.src = scormIndexUrl;
      
      // 예시를 위해 임시로 사용할 테스트 HTML 페이지 사용:
      // 실제 구현에서는 실제 SCORM 콘텐츠 URL로 대체됩니다.
      iframeRef.current.src = "about:blank";
      
      // 이 부분은 실제 환경에서 서버 측의 구현이 필요합니다:
      setTimeout(() => {
        setIsLoading(false);
        
        if (Math.random() > 0.3) { // 테스트 목적의 임의 오류
          // SCORM API 초기화 시뮬레이션
          const iframeDoc = iframeRef.current?.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(`
              <html>
                <head>
                  <title>SCORM ${title}</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .scorm-container { 
                      display: flex; 
                      flex-direction: column; 
                      align-items: center;
                      justify-content: center;
                      height: 100%;
                      text-align: center;
                    }
                    h1 { color: #333; }
                    .navigation { margin-top: 20px; }
                    button {
                      background: #4361ee;
                      color: white;
                      border: none;
                      padding: 10px 20px;
                      border-radius: 4px;
                      cursor: pointer;
                      margin: 5px;
                    }
                    button:hover {
                      background: #3a56d4;
                    }
                    .progress {
                      width: 80%;
                      height: 20px;
                      background: #eee;
                      border-radius: 10px;
                      margin: 20px 0;
                      overflow: hidden;
                    }
                    .progress-bar {
                      height: 100%;
                      background: #4361ee;
                      width: 30%;
                      transition: width 0.3s ease;
                    }
                  </style>
                </head>
                <body>
                  <div class="scorm-container">
                    <h1>SCORM 콘텐츠: ${title}</h1>
                    <p>이것은 SCORM 콘텐츠를 보여주기 위한 시뮬레이션입니다.</p>
                    
                    <div class="progress">
                      <div class="progress-bar" id="progress"></div>
                    </div>
                    
                    <div class="navigation">
                      <button onclick="prevPage()">이전</button>
                      <button onclick="nextPage()">다음</button>
                    </div>
                  </div>
                  
                  <script>
                    let currentProgress = 30;
                    
                    function nextPage() {
                      currentProgress += 10;
                      if (currentProgress > 100) currentProgress = 100;
                      updateProgress();
                    }
                    
                    function prevPage() {
                      currentProgress -= 10;
                      if (currentProgress < 0) currentProgress = 0;
                      updateProgress();
                    }
                    
                    function updateProgress() {
                      document.getElementById('progress').style.width = currentProgress + '%';
                    }
                  </script>
                </body>
              </html>
            `);
            iframeDoc.close();
          }
        } else {
          setError("SCORM 패키지를 실행하는 데 문제가 발생했습니다. 다운로드하여 로컬에서 실행해보세요.");
        }
      }, 1500);
    }
    
    return () => {
      if (iframeRef.current) {
        iframeRef.current.onload = null;
        iframeRef.current.onerror = null;
      }
    };
  }, [fileUrl, title]);

  return (
    <div className="w-full flex flex-col space-y-4">
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="mb-3 text-yellow-700 dark:text-yellow-400">{error}</p>
          <Button onClick={onDownload} variant="outline">
            {t('downloadPackage')}
          </Button>
        </div>
      )}
      
      <div className={`w-full h-[70vh] border rounded-lg overflow-hidden ${(isLoading || error) ? 'hidden' : ''}`}>
        <iframe 
          ref={iframeRef}
          title={title}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
};

export default ScormViewer;
