
import React from 'react';
import FileUploadZone from './FileUploadZone';
import ContentMetadataForm from './ContentMetadataForm';
import { useContentUpload } from '@/hooks/use-content-upload';

const UploadContent: React.FC = () => {
  const {
    file,
    fileType,
    isUploading,
    title,
    description,
    tags,
    setTitle,
    setDescription,
    setFileType,
    setTags,
    handleFile,
    handleRemoveFile,
    handleSubmit
  } = useContentUpload();

  return (
    <div className="w-full max-w-3xl mx-auto animate-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FileUploadZone
          file={file}
          fileType={fileType}
          onFileChange={handleFile}
          onRemoveFile={handleRemoveFile}
        />

        {file && (
          <ContentMetadataForm
            title={title}
            description={description}
            fileType={fileType}
            tags={tags}
            isUploading={isUploading}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onFileTypeChange={setFileType}
            onTagsChange={setTags}
            onSubmit={handleSubmit}
          />
        )}
      </form>
    </div>
  );
};

export default UploadContent;
