import React, { useEffect, useRef, useState } from 'react';
import { injectScormApi } from '@/utils/scorm';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Home, 
  Layers, 
  Menu, 
  X 
} from 'lucide-react';
import { Scorm2004API, Scorm12API } from 'scorm-again';

interface ScormFrameProps {
  entryPointUrl: string;
  title: string;
  extractedFiles: Map<string, string>;
}

const ScormFrame: React.FC<ScormFrameProps> = ({ 
  entryPointUrl, 
  title,
  extractedFiles
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scormApiRef = useRef<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showProblemSolvingUI, setShowProblemSolvingUI] = useState(false);
  const [showNavControls, setShowNavControls] = useState(true);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [scormVersion, setScormVersion] = useState<'1.2' | '2004' | null>(null);
  
  console.log('ScormFrame mounting with entry point:', entryPointUrl);
  
  // Initialize SCORM API
  useEffect(() => {
    try {
      console.log('Initializing SCORM API in parent window');
      injectScormApi(null);
      
      // Initialize scorm-again API
      if (!scormApiRef.current) {
        // Try to detect which SCORM version to use based on the entry point path
        const is2004 = entryPointUrl.includes('2004') || 
                    extractedFiles.size > 0 && 
                    Array.from(extractedFiles.keys()).some(key => 
                      key.includes('imsmanifest.xml') && 
                      extractedFiles.get(key)?.includes('adlcp:scormType')
                    );
        
        setScormVersion(is2004 ? '2004' : '1.2');
        
        const commonSettings = {
          autocommit: true,
          autocommitSeconds: 30,
          logLevel: 4, // Debug level
          persistencePrefix: 'scorm_', // Used for storing data in localStorage
        };
        
        if (is2004) {
          scormApiRef.current = new Scorm2004API(commonSettings);
          
          // Listen for specific SCORM events
          scormApiRef.current.on('Initialize', () => {
            console.log('SCORM 2004 API initialized');
          });
          
          // Listen for all SetValue events
          scormApiRef.current.on('SetValue.cmi.*', (element: string, value: any) => {
            console.log(`SCORM data set: ${element} = ${value}`);
          });
        } else {
          scormApiRef.current = new Scorm12API(commonSettings);
          
          // Listen for specific SCORM events
          scormApiRef.current.on('LMSInitialize', () => {
            console.log('SCORM 1.2 API initialized');
          });
          
          // Listen for all SetValue events
          scormApiRef.current.on('LMSSetValue.cmi.*', (element: string, value: any) => {
            console.log(`SCORM 1.2 data set: ${element} = ${value}`);
          });
        }
        
        // Add event listeners
        window.addEventListener('message', handleScormMessage);
      }
    } catch (error) {
      console.error('Error initializing SCORM API:', error);
    }
    
    return () => {
      window.removeEventListener('message', handleScormMessage);
      
      // Clean up SCORM API session when component unmounts
      if (scormApiRef.current) {
        try {
          if (scormVersion === '2004') {
            scormApiRef.current.off('SetValue.cmi.*');
            scormApiRef.current.off('Initialize');
          } else {
            scormApiRef.current.off('LMSSetValue.cmi.*');
            scormApiRef.current.off('LMSInitialize');
          }
          scormApiRef.current.terminate();
        } catch (e) {
          console.warn('Error terminating SCORM API:', e);
        }
      }
    };
  }, [entryPointUrl, extractedFiles, scormVersion]);
  
  // Handle SCORM messages from the iframe
  const handleScormMessage = (event: MessageEvent) => {
    if (!event.data || typeof event.data !== 'object') return;
    
    // Handle SCORM specific messages
    if (event.data.scormAction) {
      console.log('Received SCORM message:', event.data.scormAction);
      
      const { scormAction, data } = event.data;
      
      switch (scormAction) {
        case 'navigate-prev':
          handlePrevious();
          break;
        case 'navigate-next':
          handleNext();
          break;
        case 'get-status': {
          if (scormApiRef.current) {
            let completionStatus, successStatus;
            
            if (scormVersion === '2004') {
              completionStatus = scormApiRef.current.getValue('cmi.completion_status');
              successStatus = scormApiRef.current.getValue('cmi.success_status');
            } else {
              // SCORM 1.2 uses lesson_status for both completion and success
              const lessonStatus = scormApiRef.current.getValue('cmi.core.lesson_status');
              completionStatus = lessonStatus;
              successStatus = lessonStatus;
            }
            
            // Send status back to the content
            if (iframeRef.current && iframeRef.current.contentWindow) {
              iframeRef.current.contentWindow.postMessage({
                scormStatus: {
                  completion: completionStatus,
                  success: successStatus,
                  version: scormVersion
                }
              }, '*');
            }
          }
          break;
        }
        case 'commit':
          // Commit data to the SCORM API
          if (scormApiRef.current) {
            try {
              scormVersion === '2004' 
                ? scormApiRef.current.commit()
                : scormApiRef.current.LMSCommit('');
              console.log('SCORM data committed');
            } catch (e) {
              console.error('Error committing SCORM data:', e);
            }
          }
          break;
      }
    }
  };
  
  // Handle frame loading
  useEffect(() => {
    if (!entryPointUrl) {
      setLoadError('SCORM 콘텐츠의 시작 지점을 찾을 수 없습니다.');
      return;
    }
    
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    console.log('Setting up iframe with entry point:', entryPointUrl);
    
    let loadTimeout: NodeJS.Timeout;
    let blankScreenTimeout: NodeJS.Timeout;
    
    const handleLoad = () => {
      console.log('Iframe content loaded successfully');
      clearTimeout(loadTimeout);
      
      // Clear any previous error
      setLoadError(null);
      
      // Inject SCORM API helper into the iframe
      try {
        if (iframe.contentWindow && iframe.contentDocument) {
          // Add SCORM API hooks from scorm-again
          if (scormApiRef.current) {
            // Create a bridge between the iframe and our API
            const script = document.createElement('script');
            script.textContent = `
              (function() {
                console.log('SCORM Bridge initialized for version: ${scormVersion}');
                
                // Create API object based on SCORM version
                ${scormVersion === '2004' ? 
                  `window.API_1484_11 = window.parent.API_1484_11;` : 
                  `window.API = window.parent.API;`}
                
                // Enhanced navigation helper
                const ScormNavHelper = {
                  init: function() {
                    console.log('SCORM navigation helper initialized');
                    this.enhanceNavigation();
                    this.addKeyboardListeners();
                    this.observeContentChanges();
                  },
                  
                  // Add keyboard navigation
                  addKeyboardListeners: function() {
                    document.addEventListener('keydown', function(e) {
                      if (e.key === 'ArrowLeft') {
                        window.parent.postMessage({ scormAction: 'navigate-prev' }, '*');
                      } else if (e.key === 'ArrowRight') {
                        window.parent.postMessage({ scormAction: 'navigate-next' }, '*');
                      }
                    });
                  },
                  
                  // Find and enhance nav buttons
                  enhanceNavigation: function() {
                    // Common selectors for navigation buttons
                    const prevSelectors = [
                      'button.prev', '.prev', '#prev', 
                      'button.previous', '.previous', '#previous',
                      'button[title="Previous"]', 'a[title="Previous"]',
                      '.prevButton', '.btnPrevious',
                      'button.BackButton', '.BackButton'
                    ];
                    
                    const nextSelectors = [
                      'button.next', '.next', '#next', 
                      'button[title="Next"]', 'a[title="Next"]',
                      '.nextButton', '.btnNext', '.continue', '.btnContinue',
                      'button.ContinueButton', '.ContinueButton'
                    ];
                    
                    // Enhance prev buttons
                    this.enhanceButtons(prevSelectors, 'navigate-prev');
                    
                    // Enhance next buttons
                    this.enhanceButtons(nextSelectors, 'navigate-next');
                    
                    // Look for any button with text content
                    this.findButtonsByText('prev', 'back', '이전', 'navigate-prev');
                    this.findButtonsByText('next', 'continue', '다음', 'navigate-next');
                  },
                  
                  // Enhance buttons with selectors
                  enhanceButtons: function(selectors, action) {
                    selectors.forEach(selector => {
                      try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(el => {
                          if (el && typeof el.addEventListener === 'function') {
                            console.log('Enhanced button:', el, action);
                            
                            // Store original click handler
                            const originalClick = el.onclick;
                            
                            // Replace with our handler
                            el.onclick = function(e) {
                              console.log('Intercepted button click:', action);
                              
                              // Commit any pending SCORM data
                              window.parent.postMessage({ scormAction: 'commit' }, '*');
                              
                              // Notify parent for navigation
                              window.parent.postMessage({ scormAction: action }, '*');
                              
                              // Call original handler if it exists
                              if (typeof originalClick === 'function') {
                                return originalClick.call(this, e);
                              }
                            };
                          }
                        });
                      } catch (e) {
                        console.warn('Error enhancing buttons:', e);
                      }
                    });
                  },
                  
                  // Find buttons by text content
                  findButtonsByText: function(text1, text2, text3, action) {
                    try {
                      const allButtons = document.querySelectorAll('button, a, div[role="button"], span[role="button"]');
                      allButtons.forEach(btn => {
                        const text = (btn.textContent || '').toLowerCase();
                        const title = (btn.getAttribute('title') || '').toLowerCase();
                        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
                        
                        if (text.includes(text1) || text.includes(text2) || text.includes(text3) || 
                            title.includes(text1) || title.includes(text2) || title.includes(text3) ||
                            ariaLabel.includes(text1) || ariaLabel.includes(text2) || ariaLabel.includes(text3)) {
                          
                          console.log('Found button by text:', btn, action);
                          
                          // Store original click handler
                          const originalClick = btn.onclick;
                          
                          // Replace with our handler
                          btn.onclick = function(e) {
                            console.log('Intercepted text button click:', action);
                            
                            // Commit any pending SCORM data
                            window.parent.postMessage({ scormAction: 'commit' }, '*');
                            
                            // Notify parent for navigation
                            window.parent.postMessage({ scormAction: action }, '*');
                            
                            // Call original handler if it exists
                            if (typeof originalClick === 'function') {
                              return originalClick.call(this, e);
                            }
                          };
                        }
                      });
                    } catch (e) {
                      console.warn('Error finding buttons by text:', e);
                    }
                  },
                  
                  // Observe content for dynamic changes
                  observeContentChanges: function() {
                    // Set up MutationObserver to detect DOM changes
                    const observer = new MutationObserver(() => {
                      this.enhanceNavigation();
                    });
                    
                    // Start observing
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true
                    });
                  },
                  
                  // Get SCORM status from parent
                  getStatus: function() {
                    window.parent.postMessage({ scormAction: 'get-status' }, '*');
                  }
                };
                
                // Initialize when DOM is ready
                if (document.readyState === 'complete') {
                  ScormNavHelper.init();
                } else {
                  window.addEventListener('load', () => ScormNavHelper.init());
                }
                
                // Listen for status updates from parent
                window.addEventListener('message', function(event) {
                  if (event.data && event.data.scormStatus) {
                    console.log('Received SCORM status:', event.data.scormStatus);
                  }
                });
                
                // Make helpers available
                window.ScormNavHelper = ScormNavHelper;
              })();
            `;
            
            try {
              iframe.contentDocument.head.appendChild(script);
              console.log('SCORM Bridge script injected successfully');
            } catch (e) {
              console.warn('Could not inject script directly:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error injecting SCORM Bridge:', error);
      }
      
      // Set a timeout to detect potential blank screen issues
      blankScreenTimeout = setTimeout(() => {
        console.log('Checking if content is still displayed after delay');
        setShowProblemSolvingUI(true);
      }, 5000);
    };
    
    const handleError = () => {
      console.error('Iframe failed to load content');
      setLoadError('SCORM 콘텐츠를 로드하는데 실패했습니다.');
    };
    
    // Set a timeout to detect if content doesn't load
    loadTimeout = setTimeout(() => {
      console.warn('Content load timeout reached');
      // Don't set error yet, but begin showing problem-solving UI
      setShowProblemSolvingUI(true);
    }, 10000);
    
    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);
    
    // Set iframe src
    iframe.src = entryPointUrl;
    
    return () => {
      clearTimeout(loadTimeout);
      clearTimeout(blankScreenTimeout);
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [entryPointUrl, scormVersion]);
  
  // Create keyboard handler for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process keyboard navigation when navigation controls are shown
      if (!showNavControls) return;
      
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNavControls]);
  
  // Handle content reload
  const handleReload = () => {
    const iframe = iframeRef.current;
    if (iframe) {
      console.log('Reloading SCORM content');
      iframe.src = entryPointUrl;
    }
  };

  // Navigation controls for SCORM content
  const handlePrevious = () => {
    console.log('Navigating to previous page');
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    try {
      // Method 1: Direct iframe communication
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ action: 'navigate-previous' }, '*');
      }
      
      // Method 2: Using the scorm-again API if available
      if (scormApiRef.current) {
        try {
          // Commit any pending data before navigation
          if (scormVersion === '2004') {
            scormApiRef.current.commit();
            
            // Use standard SCORM 2004 navigation request
            if (typeof scormApiRef.current.processNavigationRequest === 'function') {
              scormApiRef.current.processNavigationRequest('previous');
            }
          } else {
            scormApiRef.current.LMSCommit('');
          }
        } catch (e) {
          console.log('SCORM API navigation error:', e);
        }
      }
      
      // Method 3: Try to access the iframe's ScormNavHelper
      try {
        if (iframe.contentWindow) {
          // Use safer access pattern with any type
          const win = iframe.contentWindow as any;
          if (win.ScormNavHelper) {
            win.ScormNavHelper.findButtonsByText('prev', 'back', '이전', 'navigate-prev');
          }
        }
      } catch (e) {
        console.log('Error accessing ScormNavHelper:', e);
      }
      
      // Method A: Inject script to find previous buttons if we can access the contentDocument
      try {
        if (iframe.contentDocument) {
          const script = document.createElement('script');
          script.textContent = `
            (function() {
              // Try to find navigation buttons by common selectors
              const selectors = [
                'button.prev', '.prev', '#prev', 
                'button.previous', '.previous', '#previous',
                'button[title="Previous"]', 'a[title="Previous"]',
                'button:contains("Previous")', 'a:contains("Previous")',
                'button:contains("이전")', 'a:contains("이전")',
                '.prevButton', '.btnPrevious',
                'button.BackButton', '.BackButton',
                'button:contains("Back")', 'a:contains("Back")'
              ];
              
              let foundButton = null;
              
              // Try each selector
              for (const selector of selectors) {
                try {
                  let buttons;
                  if (selector.includes(':contains')) {
                    const text = selector.match(/:contains\\(["'](.+?)["']\\)/)[1];
                    buttons = Array.from(document.querySelectorAll('button, a, div, span')).filter(el => 
                      el.textContent && el.textContent.indexOf(text) !== -1
                    );
                  } else {
                    buttons = document.querySelectorAll(selector);
                  }
                  
                  if (buttons && buttons.length > 0) {
                    foundButton = buttons[0];
                    break;
                  }
                } catch (e) {}
              }
              
              // Click the button if found
              if (foundButton) {
                foundButton.click();
                console.log('Previous button clicked:', foundButton);
              } else {
                console.log('No previous button found by selector');
                
                // Try to find any button with "previous" or "back" in its text or attributes
                const allButtons = document.querySelectorAll('button, a, div[role="button"], span[role="button"]');
                for (const btn of allButtons) {
                  const text = (btn.textContent || '').toLowerCase();
                  const title = (btn.getAttribute('title') || '').toLowerCase();
                  const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
                  
                  if (text.includes('prev') || text.includes('back') || text.includes('이전') || 
                      title.includes('prev') || title.includes('back') ||
                      ariaLabel.includes('prev') || ariaLabel.includes('back')) {
                    console.log('Found likely prev button by text:', btn);
                    btn.click();
                    return;
                  }
                }
                
                // Dispatch left arrow key event as fallback
                document.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'ArrowLeft',
                  code: 'ArrowLeft',
                  keyCode: 37,
                  which: 37,
                  bubbles: true
                }));
              }
            })();
          `;
          
          const scriptElement = iframe.contentDocument.createElement('script');
          scriptElement.textContent = script.textContent;
          iframe.contentDocument.body.appendChild(scriptElement);
        }
      } catch (e) {
        console.log('Cannot inject script - cross origin policy:', e);
      }
    } catch (error) {
      console.error('Error navigating to previous page:', error);
    }
  };

  const handleNext = () => {
    console.log('Navigating to next page');
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    try {
      // Method 1: Direct iframe communication
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ action: 'navigate-next' }, '*');
      }
      
      // Method 2: Using the scorm-again API if available
      if (scormApiRef.current) {
        try {
          // Commit any pending data before navigation
          if (scormVersion === '2004') {
            scormApiRef.current.commit();
            
            // Use standard SCORM 2004 navigation request
            if (typeof scormApiRef.current.processNavigationRequest === 'function') {
              scormApiRef.current.processNavigationRequest('continue');
            }
          } else {
            scormApiRef.current.LMSCommit('');
          }
        } catch (e) {
          console.log('SCORM API navigation error:', e);
        }
      }
      
      // Method 3: Try to access the iframe's ScormNavHelper
      try {
        if (iframe.contentWindow) {
          // Use safer access pattern with any type
          const win = iframe.contentWindow as any;
          if (win.ScormNavHelper) {
            win.ScormNavHelper.findButtonsByText('next', 'continue', '다음', 'navigate-next');
          }
        }
      } catch (e) {
        console.log('Error accessing ScormNavHelper:', e);
      }
      
      // Method A: Inject script to find next buttons if we can access the contentDocument
      try {
        if (iframe.contentDocument) {
          const script = document.createElement('script');
          script.textContent = `
            (function() {
              // Try to find navigation buttons by common selectors
              const selectors = [
                'button.next', '.next', '#next', 
                'button[title="Next"]', 'a[title="Next"]',
                'button:contains("Next")', 'a:contains("Next")',
                'button:contains("다음")', 'a:contains("다음")',
                '.nextButton', '.btnNext', '.continue', '.btnContinue',
                'button:contains("Continue")', 'a:contains("Continue")'
              ];
              
              let foundButton = null;
              
              // Try each selector
              for (const selector of selectors) {
                try {
                  let buttons;
                  if (selector.includes(':contains')) {
                    const text = selector.match(/:contains\\(["'](.+?)["']\\)/)[1];
                    buttons = Array.from(document.querySelectorAll('button, a, div, span')).filter(el => 
                      el.textContent && el.textContent.indexOf(text) !== -1
                    );
                  } else {
                    buttons = document.querySelectorAll(selector);
                  }
                  
                  if (buttons && buttons.length > 0) {
                    foundButton = buttons[0];
                    break;
                  }
                } catch (e) {}
              }
              
              // Click the button if found
              if (foundButton) {
                foundButton.click();
                console.log('Next button clicked:', foundButton);
              } else {
                console.log('No next button found by selector');
                
                // Try to find any button with "next" or "continue" in its text or attributes
                const allButtons = document.querySelectorAll('button, a, div[role="button"], span[role="button"]');
                for (const btn of allButtons) {
                  const text = (btn.textContent || '').toLowerCase();
                  const title = (btn.getAttribute('title') || '').toLowerCase();
                  const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
                  
                  if (text.includes('next') || text.includes('continue') || text.includes('다음') || 
                      title.includes('next') || title.includes('continue') ||
                      ariaLabel.includes('next') || ariaLabel.includes('continue')) {
                    console.log('Found likely next button by text:', btn);
                    btn.click();
                    return;
                  }
                }
                
                // Try to find submit buttons as they're often used as "Next"
                const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"]');
                if (submitButtons.length > 0) {
                  console.log('Found submit button, using as next:', submitButtons[0]);
                  submitButtons[0].click();
                  return;
                }
                
                // Dispatch right arrow key event as fallback
                document.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'ArrowRight',
                  code: 'ArrowRight',
                  keyCode: 39,
                  which: 39,
                  bubbles: true
                }));
              }
            })();
          `;
          
          const scriptElement = iframe.contentDocument.createElement('script');
          scriptElement.textContent = script.textContent;
          iframe.contentDocument.body.appendChild(scriptElement);
        }
      } catch (e) {
        console.log('Cannot inject script - cross origin policy:', e);
      }
    } catch (error) {
      console.error('Error navigating to next page:', error);
    }
  };

  const handleHome = () => {
    const iframe = iframeRef.current;
    if (iframe) {
      // Reload the content to go back to the start
      iframe.src = entryPointUrl;
    }
  };

  const toggleNavigationMenu = () => {
    setShowNavMenu(!showNavMenu);
  };

  const toggleNavigationControls = () => {
    setShowNavControls(!showNavControls);
  };

  return (
    <div className="w-full h-full relative">
      {loadError && (
        <Alert variant="destructive" className="mb-4 absolute top-0 left-0 right-0 z-10">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}
      
      {showProblemSolvingUI && !loadError && (
        <div className="absolute top-2 right-2 z-20 bg-white p-2 rounded-md shadow-md">
          <p className="text-sm mb-2">콘텐츠가 제대로 표시되지 않나요?</p>
          <button 
            onClick={handleReload}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            새로고침
          </button>
        </div>
      )}
      
      {/* SCORM Navigation Controls */}
      {showNavControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-2">
          <div className="bg-gray-900/80 text-white rounded-full p-2 flex items-center space-x-2 backdrop-blur-sm">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-700 rounded-full"
              title="이전 페이지"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={handleReload}
              className="p-2 hover:bg-gray-700 rounded-full"
              title="다시 로드"
            >
              <RotateCcw size={20} />
            </button>
            
            <button
              onClick={handleHome}
              className="p-2 hover:bg-gray-700 rounded-full"
              title="처음으로"
            >
              <Home size={20} />
            </button>
            
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-700 rounded-full"
              title="다음 페이지"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <button
            onClick={toggleNavigationControls}
            className="bg-gray-900/80 text-white rounded-full p-2 hover:bg-gray-700"
            title="내비게이션 숨기기"
          >
            <X size={20} />
          </button>
        </div>
      )}
      
      {/* Show control toggle button when nav controls are hidden */}
      {!showNavControls && (
        <button
          onClick={toggleNavigationControls}
          className="absolute bottom-4 right-4 z-20 bg-gray-900/80 text-white rounded-full p-2 hover:bg-gray-700"
          title="내비게이션 표시"
        >
          <Menu size={20} />
        </button>
      )}
      
      {/* Navigation Menu Overlay */}
      {showNavMenu && (
        <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">콘텐츠 내비게이션</h3>
              <button 
                onClick={toggleNavigationMenu}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                SCORM 콘텐츠의 네비게이션을 제어할 수 있습니다.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    handlePrevious();
                    toggleNavigationMenu();
                  }}
                  className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 p-3 rounded"
                >
                  <ChevronLeft size={16} />
                  <span>이전 페이지</span>
                </button>
                
                <button
                  onClick={() => {
                    handleNext();
                    toggleNavigationMenu();
                  }}
                  className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 p-3 rounded"
                >
                  <span>다음 페이지</span>
                  <ChevronRight size={16} />
                </button>
                
                <button
                  onClick={() => {
                    handleHome();
                    toggleNavigationMenu();
                  }}
                  className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 p-3 rounded"
                >
                  <Home size={16} />
                  <span>처음으로</span>
                </button>
                
                <button
                  onClick={() => {
                    handleReload();
                    toggleNavigationMenu();
                  }}
                  className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 p-3 rounded"
                >
                  <RotateCcw size={16} />
                  <span>다시 로드</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <iframe 
        ref={iframeRef}
        title={title}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
};

export default ScormFrame;
