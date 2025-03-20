
import React from 'react';
import { Progress } from '@/components/ui/progress';

type ScormStage = 'downloading' | 'extracting' | 'loading' | 'complete' | 'error';

interface ScormProgressProps {
  stage: ScormStage;
  downloadProgress: number;
  extractionProgress: number;
}

const ScormProgress: React.FC<ScormProgressProps> = ({ 
  stage, 
  downloadProgress, 
  extractionProgress 
}) => {
  // Progress status text
  const getStageText = () => {
    switch (stage) {
      case 'downloading':
        return `SCORM 콘텐츠 다운로드 중... (${downloadProgress}%)`;
      case 'extracting':
        return `SCORM 패키지 압축 해제 중... (${extractionProgress}%)`;
      case 'loading':
        return 'SCORM 콘텐츠 초기화 중...';
      case 'complete':
        return 'SCORM 콘텐츠가 로드되었습니다.';
      case 'error':
        return '오류가 발생했습니다.';
      default:
        return 'SCORM 콘텐츠를 로드 중입니다...';
    }
  };
  
  // Current progress value based on stage
  const getCurrentProgress = () => {
    switch (stage) {
      case 'downloading':
        return downloadProgress;
      case 'extracting':
        return extractionProgress;
      case 'loading':
        return 100;
      case 'complete':
        return 100;
      case 'error':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-col space-y-4 py-8">
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></div>
        <p>{getStageText()}</p>
      </div>
      
      <Progress value={getCurrentProgress()} className="w-full h-2" />
      
      <p className="text-xs text-muted-foreground">
        {stage === 'downloading' && '콘텐츠를 다운로드하는 동안 잠시 기다려 주세요.'}
        {stage === 'extracting' && '압축 해제에는 시간이 걸릴 수 있습니다. 패키지 크기에 따라 다릅니다.'}
        {stage === 'loading' && 'SCORM 콘텐츠를 초기화하는 중입니다.'}
      </p>
    </div>
  );
};

export default ScormProgress;
