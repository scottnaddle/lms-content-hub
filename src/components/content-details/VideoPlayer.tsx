
import React from 'react';

interface VideoPlayerProps {
  fileUrl: string | undefined;
  thumbnailUrl: string | undefined;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  fileUrl, 
  thumbnailUrl, 
  title 
}) => {
  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      {fileUrl ? (
        <video 
          src={fileUrl} 
          controls 
          className="w-full h-full object-contain"
          poster={thumbnailUrl || undefined}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/80">
          <p className="text-white/70">비디오를 불러올 수 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
