
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
    duration,
    pageCount,
    subject,
    gradeLevel,
    language,
    learningObjectives,
    setTitle,
    setDescription,
    setFileType,
    setTags,
    setDuration,
    setPageCount,
    setSubject,
    setGradeLevel,
    setLanguage,
    setLearningObjectives,
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
            duration={duration}
            pageCount={pageCount}
            subject={subject}
            gradeLevel={gradeLevel}
            language={language}
            learningObjectives={learningObjectives}
            isUploading={isUploading}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onFileTypeChange={setFileType}
            onTagsChange={setTags}
            onDurationChange={setDuration}
            onPageCountChange={setPageCount}
            onSubjectChange={setSubject}
            onGradeLevelChange={setGradeLevel}
            onLanguageChange={setLanguage}
            onLearningObjectivesChange={setLearningObjectives}
            onSubmit={handleSubmit}
          />
        )}
      </form>
    </div>
  );
};

export default UploadContent;
