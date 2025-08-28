import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { UploadedFile } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { uploadApi } from '../../utils/api';

interface PDFUploadProps {
  className?: string;
  onFileUploaded?: (file: UploadedFile) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const PDFUpload: React.FC<PDFUploadProps> = ({ className = '', onFileUploaded }) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadStatus('uploading');
    setError('');

    try {
      const response = await uploadApi.uploadPDF(file);

      if (response.success && response.data) {
        const uploadedFileData: UploadedFile = {
          id: response.data.fileId,
          name: response.data.fileName,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
        };

        setUploadedFile(uploadedFileData);
        setUploadStatus('success');
        onFileUploaded?.(uploadedFileData);
      } else {
        setError(response.error || 'Upload failed');
        setUploadStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadStatus('error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        handleFileUpload(file);
      } else {
        setError('Please upload a PDF file only');
        setUploadStatus('error');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Upload PDF Document</h3>
            <p className="text-sm text-muted-foreground">
              Upload a PDF file to analyze and chat about its contents
            </p>
          </div>

          {uploadStatus === 'idle' && (
            <div
              className={`upload-zone rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragOver ? 'border-primary bg-primary/5' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PDF files only (max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="text-center p-8">
              <LoadingSpinner size={32} className="mx-auto mb-4" />
              <p className="text-sm font-medium">Uploading your PDF...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Please wait while we process your file
              </p>
            </div>
          )}

          {uploadStatus === 'success' && uploadedFile && (
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Upload successful!
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300 truncate">
                        {uploadedFile.name}
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ({formatFileSize(uploadedFile.size)})
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetUpload}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Upload failed
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetUpload}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetUpload}
                  className="text-red-700 dark:text-red-300"
                >
                  Try again
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { PDFUpload };
