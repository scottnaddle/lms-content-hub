
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
    // Add stronger cache-busting with unique identifier
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const cacheBustedUrl = fileUrl.includes('?') 
      ? `${fileUrl}&cacheBust=${timestamp}-${random}`
      : `${fileUrl}?cacheBust=${timestamp}-${random}`;
    
    const response = await fetch(cacheBustedUrl, {
      method: 'GET',
      cache: 'no-store', // Force network request
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      credentials: 'omit' // Don't send credentials for cross-origin requests
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download SCORM package: ${response.statusText} (${response.status})`);
    }
    
    // Get total file size for progress calculation
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    console.log('Download started, content length:', total);
    
    // Setup streaming download with progress tracking
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get reader from response');
    }
    
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];
    
    // Report initial progress
    if (onProgress) onProgress(0);
    
    // Process the stream chunks
    while(true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('Download completed, received total bytes:', receivedLength);
        break;
      }
      
      chunks.push(value);
      receivedLength += value.length;
      
      // Calculate and report progress (0-100)
      if (onProgress && total > 0) {
        const progress = Math.min(Math.round((receivedLength / total) * 100), 100);
        onProgress(progress);
      } else if (onProgress) {
        // If we can't determine total size, just use a simulated progress
        const simulatedProgress = Math.min(Math.round((receivedLength / 1000000) * 100), 99);
        onProgress(simulatedProgress);
      }
    }
    
    // Concatenate chunks into a single Uint8Array
    const allChunks = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }
    
    // Convert to ArrayBuffer and load with JSZip
    const zipData = allChunks.buffer;
    console.log('SCORM package downloaded, size:', zipData.byteLength);
    
    if (zipData.byteLength === 0) {
      throw new Error('Downloaded file is empty (0 bytes)');
    }
    
    const zip = new JSZip();
    try {
      const loadedZip = await zip.loadAsync(zipData);
      
      if (Object.keys(loadedZip.files).length === 0) {
        throw new Error('Archive is empty or not a valid ZIP file');
      }
      
      // Report completion
      if (onProgress) onProgress(100);
      
      return { zip: loadedZip, zipData };
    } catch (error: any) {
      console.error('Failed to load ZIP:', error);
      throw new Error(`파일을 압축 해제하는데 실패했습니다: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error downloading SCORM package:', error);
    throw error;
  }
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
  
  // Process files in smaller batches for better browser performance
  const batchSize = 5; // Reduced batch size
  for (let i = 0; i < fileEntries.length; i += batchSize) {
    const batch = fileEntries.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async ([filename, file]) => {
      try {
        // 파일 내용을 Blob으로 추출
        const content = await file.async('blob');
        const contentType = getContentType(filename);
        
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
    
    // Small delay between batches to let the browser breathe
    await new Promise(resolve => setTimeout(resolve, 10));
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
