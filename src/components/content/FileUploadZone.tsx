
import React, { useState } from 'react';
import { Upload, X, FileText, Video, FileAudio, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface FileUploadZoneProps {
  file: File | null;
  fileType: string;
  onFileChange: (file: File) => void;
  onRemoveFile: () => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  file,
  fileType,
  onFileChange,
  onRemoveFile
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const renderFileTypeIcon = () => {
    switch (fileType) {
      case 'video':
        return <Video className="h-12 w-12 text-primary/50" />;
      case 'audio':
        return <FileAudio className="h-12 w-12 text-primary/50" />;
      case 'pdf':
        return <FileText className="h-12 w-12 text-primary/50" />;
      default:
        return <FileIcon className="h-12 w-12 text-primary/50" />;
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-12",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        file && "border-primary/40 bg-primary/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {file ? (
        <div className="text-center animate-scale-in">
          {renderFileTypeIcon()}
          <p className="mt-4 font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onRemoveFile}
          >
            <X className="h-4 w-4 mr-2" />
            {t('removeFile')}
          </Button>
        </div>
      ) : (
        <>
          <Upload className="h-10 w-10 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-1">{t('dropFilesHere')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('orBrowseFiles')}
          </p>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            asChild
            className="relative"
          >
            <label htmlFor="file-upload">
              <span>{t('browseFiles')}</span>
            </label>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            {t('supportedFormats')}
          </p>
        </>
      )}
    </div>
  );
};

export default FileUploadZone;
