
import React, { useState } from 'react';
import { Upload, X, FileText, Video, FileAudio, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const UploadContent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('video');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    // Auto-detect file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension) {
      if (['mp4', 'mov', 'webm', 'avi'].includes(fileExtension)) {
        setFileType('video');
      } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension)) {
        setFileType('audio');
      } else if (fileExtension === 'pdf') {
        setFileType('pdf');
      } else {
        setFileType('document');
      }
    }
    
    setFile(selectedFile);
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      setFile(null);
      toast({
        title: "Upload successful",
        description: "Your content has been uploaded successfully.",
      });
    }, 2000);
    
    // Here you would typically upload to Supabase
    // const { data, error } = await supabaseClient.storage
    //  .from('content')
    //  .upload(`${fileType}/${file.name}`, file);
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
    <div className="w-full max-w-3xl mx-auto animate-in">
      <form onSubmit={handleSubmit} className="space-y-6">
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
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4 mr-2" />
                Remove File
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">Drag and drop to upload</h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
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
                  <span>Browse Files</span>
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: MP4, MP3, PDF, DOC, DOCX, and more
              </p>
            </>
          )}
        </div>

        {file && (
          <div className="space-y-4 glass-panel p-6 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter content title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter content description" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select defaultValue={fileType} onValueChange={setFileType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" placeholder="e.g. lecture, math, beginner" />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Content"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default UploadContent;
