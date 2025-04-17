/**
 * SCORM 패키지의 ZIP 파일 처리를 위한 유틸리티
 */
import JSZip from 'jszip';
import { getContentType } from './mime-types';

/**
 * ZIP 파일 다운로드 및 로드 with progress tracking
 */
export const downloadAndLoadZip = async (
  fileUrl: string, 
  onProgress?: (progress: number) => void
): Promise<{ 
  zip: JSZip; 
  zipData: ArrayBuffer;
}> => {
  // SCORM 패키지 다운로드 시도
  console.log('Attempting to download SCORM package from URL:', fileUrl);
  
  try {
    // Generate a unique request ID for this download
    const requestId = Math.random().toString(36).substring(2, 15);
    
    // Add very aggressive cache-busting
    const timestamp = Date.now();
    const cacheBustedUrl = fileUrl.includes('?') 
      ? `${fileUrl}&_nocache=${timestamp}-${requestId}`
      : `${fileUrl}?_nocache=${timestamp}-${requestId}`;
    
    console.log(`Starting download with request ID: ${requestId}`);
    
    // Use XMLHttpRequest for better control and compatibility
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(Math.min(percentComplete, 99)); // Cap at 99% until fully loaded
        } else if (onProgress && event.loaded > 0) {
          // If length isn't computable, use a simulated progress based on bytes
          const simulatedProgress = Math.min(Math.round((event.loaded / 1000000) * 50), 99);
          onProgress(simulatedProgress);
        }
      };
      
      xhr.onload = async () => {
        if (xhr.status === 200) {
          console.log(`Download completed for request ${requestId}, received bytes:`, xhr.response.byteLength);
          
          if (xhr.response.byteLength === 0) {
            reject(new Error('Downloaded file is empty (0 bytes)'));
            return;
          }
          
          try {
            // Complete the progress
            if (onProgress) onProgress(100);
            
            // Load the ZIP file
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(xhr.response);
            
            if (Object.keys(loadedZip.files).length === 0) {
              reject(new Error('Archive is empty or not a valid ZIP file'));
              return;
            }
            
            resolve({ zip: loadedZip, zipData: xhr.response });
          } catch (error: any) {
            console.error(`ZIP loading error for request ${requestId}:`, error);
            reject(new Error(`파일을 압축 해제하는데 실패했습니다: ${error.message}`));
          }
        } else {
          console.error(`HTTP error for request ${requestId}:`, xhr.status, xhr.statusText);
          reject(new Error(`다운로드 실패: HTTP ${xhr.status} ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = () => {
        console.error(`Network error for request ${requestId}`);
        reject(new Error('네트워크 오류로 인해 다운로드에 실패했습니다.'));
      };
      
      xhr.onabort = () => {
        console.warn(`Download aborted for request ${requestId}`);
        reject(new Error('다운로드가 중단되었습니다.'));
      };
      
      xhr.ontimeout = () => {
        console.error(`Timeout error for request ${requestId}`);
        reject(new Error('다운로드 시간이 초과되었습니다.'));
      };
      
      // Open and send the request
      xhr.open('GET', cacheBustedUrl, true);
      xhr.responseType = 'arraybuffer';
      
      // Set headers to prevent caching
      xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      xhr.setRequestHeader('Pragma', 'no-cache');
      xhr.setRequestHeader('Expires', '0');
      
      // Set a generous timeout (30 seconds)
      xhr.timeout = 30000;
      
      // Start the request
      xhr.send();
      
      if (onProgress) onProgress(0); // Initialize progress
    });
  } catch (error: any) {
    console.error('Error in download process:', error);
    throw error;
  }
};

/**
 * 파일 확장자를 기반으로 MIME 타입을 개선하는 함수
 */
const getEnhancedContentType = (filename: string): string => {
  const lowerFilename = filename.toLowerCase();
  
  // Handle common SCORM-specific content types
  if (lowerFilename.endsWith('.js')) return 'application/javascript';
  if (lowerFilename.endsWith('.json')) return 'application/json';
  if (lowerFilename.endsWith('.css')) return 'text/css';
  if (lowerFilename.endsWith('.html') || lowerFilename.endsWith('.htm')) return 'text/html';
  if (lowerFilename.endsWith('.xml')) return 'application/xml';
  if (lowerFilename.endsWith('.png')) return 'image/png';
  if (lowerFilename.endsWith('.jpg') || lowerFilename.endsWith('.jpeg')) return 'image/jpeg';
  if (lowerFilename.endsWith('.gif')) return 'image/gif';
  if (lowerFilename.endsWith('.svg')) return 'image/svg+xml';
  if (lowerFilename.endsWith('.mp3')) return 'audio/mpeg';
  if (lowerFilename.endsWith('.mp4')) return 'video/mp4';
  if (lowerFilename.endsWith('.webm')) return 'video/webm';
  if (lowerFilename.endsWith('.woff')) return 'font/woff';
  if (lowerFilename.endsWith('.woff2')) return 'font/woff2';
  if (lowerFilename.endsWith('.ttf')) return 'font/ttf';
  if (lowerFilename.endsWith('.otf')) return 'font/otf';
  
  // Fallback to the base content type utility
  return getContentType(filename);
};

/**
 * ZIP 파일에서 모든 파일 추출 및 Blob URL 생성
 */
export const extractAllFiles = async (
  loadedZip: JSZip, 
  onProgress?: (progress: number) => void
): Promise<Map<string, string>> => {
  const extractedFiles = new Map<string, string>();
  const fileEntries = Object.entries(loadedZip.files).filter(([_, file]) => !file.dir);
  const fileCount = fileEntries.length;
  let processedCount = 0;
  
  // Report initial extraction progress
  if (onProgress) onProgress(0);
  
  // First identify HTML files and process them first
  const htmlEntries = fileEntries.filter(([filename]) => 
    filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm')
  );
  const otherEntries = fileEntries.filter(([filename]) => 
    !(filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm'))
  );
  
  console.log(`Processing ${htmlEntries.length} HTML files first, then ${otherEntries.length} other files`);
  
  // Function to process a batch of files
  const processBatch = async (batch: [string, JSZip.JSZipObject][]) => {
    await Promise.all(batch.map(async ([filename, file]) => {
      try {
        // 파일 내용을 Blob으로 추출
        const content = await file.async('blob');
        const contentType = getEnhancedContentType(filename);
        
        // Create a blob with the correct MIME type
        const blob = new Blob([content], { type: contentType });
        
        // Create a URL for the blob
        const blobUrl = URL.createObjectURL(blob);
        
        // 파일 경로와 Blob URL을 맵에 저장
        extractedFiles.set(filename, blobUrl);
        
        // 디버깅을 위해 첫 20개 파일 경로 출력
        if (extractedFiles.size <= 20) {
          console.log(`Extracted file ${extractedFiles.size}: ${filename} -> ${contentType}`);
        }
      } catch (err) {
        console.error(`Failed to extract file: ${filename}`, err);
      }
      
      // Update extraction progress
      if (onProgress) {
        processedCount++;
        const progress = Math.min(Math.round((processedCount / fileCount) * 100), 100);
        onProgress(progress);
      }
    }));
  };
  
  // Process HTML files first in batches
  const htmlBatchSize = 2;
  for (let i = 0; i < htmlEntries.length; i += htmlBatchSize) {
    const batch = htmlEntries.slice(i, i + htmlBatchSize);
    await processBatch(batch);
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  
  // Then process other files in batches
  const otherBatchSize = 5; 
  for (let i = 0; i < otherEntries.length; i += otherBatchSize) {
    const batch = otherEntries.slice(i, i + otherBatchSize);
    await processBatch(batch);
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  
  console.log('Extraction complete, total files:', extractedFiles.size);
  
  // Log important file types (html, js)
  const htmlFiles = Array.from(extractedFiles.keys()).filter(f => 
    f.toLowerCase().endsWith('.html') || f.toLowerCase().endsWith('.htm')
  );
  console.log('HTML files count:', htmlFiles.length);
  htmlFiles.slice(0, 10).forEach(f => console.log('HTML file:', f));
  
  return extractedFiles;
};
