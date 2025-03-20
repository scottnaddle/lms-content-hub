import React from 'react';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, Download, FileArchive, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScormStage } from './useScormLoader';

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

  // Get icon based on current stage
  const StageIcon = () => {
    switch (stage) {
      case 'downloading':
        return <Download className="h-6 w-6 text-primary animate-pulse" />;
      case 'extracting':
        return <FileArchive className="h-6 w-6 text-amber-500 animate-pulse" />;
      case 'loading':
        return <Play className="h-6 w-6 text-green-500 animate-pulse" />;
      default:
        return <Loader2 className="h-6 w-6 text-primary animate-spin" />;
    }
  };

  // Get hint text based on current stage
  const getHintText = () => {
    switch (stage) {
      case 'downloading':
        return '콘텐츠를 다운로드하는 동안 잠시 기다려 주세요.';
      case 'extracting':
        return '압축 해제에는 시간이 걸릴 수 있습니다. 패키지 크기에 따라 다릅니다.';
      case 'loading':
        return 'SCORM 콘텐츠를 초기화하는 중입니다.';
      default:
        return '';
    }
  };

  // Get background color based on progress
  const getGradientStyle = () => {
    const progress = getCurrentProgress();
    return {
      background: `linear-gradient(90deg, hsla(210, 100%, 60%, 0.1) 0%, hsla(210, 100%, 60%, 0.05) ${progress}%, transparent ${progress}%)`,
    }
  };

  return (
    <div className="flex flex-col space-y-6 py-8 px-4 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm animate-fade-in" style={getGradientStyle()}>
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm">
          <StageIcon />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium">{getStageText()}</h3>
          <p className={cn(
            "text-sm text-muted-foreground transition-opacity duration-300",
            stage === 'complete' || stage === 'error' ? "opacity-0" : "opacity-100"
          )}>
            {getHintText()}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={getCurrentProgress()} 
          className="w-full h-2 bg-secondary/50" 
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>{getCurrentProgress()}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default ScormProgress;
