
import React from 'react';

interface AudioPlayerProps {
  fileUrl: string | undefined;
  title: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ fileUrl, title }) => {
  return (
    <div className="p-8 rounded-lg bg-accent flex items-center justify-center">
      {fileUrl ? (
        <div className="w-full">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary text-5xl">♪</span>
          </div>
          <p className="text-lg font-medium text-center mb-4">{title}</p>
          <audio controls className="w-full">
            <source src={fileUrl} />
            브라우저가 오디오 재생을 지원하지 않습니다.
          </audio>
        </div>
      ) : (
        <p className="text-muted-foreground">오디오를 불러올 수 없습니다</p>
      )}
    </div>
  );
};

export default AudioPlayer;
