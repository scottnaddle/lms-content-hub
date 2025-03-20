
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AudioPlayerProps {
  fileUrl: string | undefined;
  title: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ fileUrl, title }) => {
  const { t } = useLanguage();
  
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
            {t('audioNotSupported')}
          </audio>
        </div>
      ) : (
        <p className="text-muted-foreground">{t('audioLoadError')}</p>
      )}
    </div>
  );
};

export default AudioPlayer;
