'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { UploadedDocument } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface DocumentUploadProps {
  onDocumentsUploaded: (documents: UploadedDocument[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

const defaultAcceptedTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('image')) return 'IMG';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'XLS';
  return 'DOC';
};

export default function DocumentUpload({
  onDocumentsUploaded,
  acceptedFileTypes = defaultAcceptedTypes,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
}: DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setUploadError(null);

      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((f) => {
          if (f.errors[0]?.code === 'file-too-large') {
            return `${f.file.name}: File exceeds ${formatFileSize(maxFileSize)} limit`;
          }
          if (f.errors[0]?.code === 'file-invalid-type') {
            return `${f.file.name}: Invalid file type`;
          }
          return `${f.file.name}: ${f.errors[0]?.message || 'Upload failed'}`;
        });
        setUploadError(errors.join('; '));
      }

      const newDocuments: UploadedDocument[] = acceptedFiles.map((file) => ({
        id: uuidv4(),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadDate: new Date(),
        status: 'pending' as const,
      }));

      setUploadedFiles((prev) => [...prev, ...newDocuments]);
      onDocumentsUploaded(newDocuments);
    },
    [maxFileSize, onDocumentsUploaded]
  );

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple: true,
  });

  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-audit-accent animate-spin" />;
      case 'extracted':
        return <CheckCircle className="w-4 h-4 text-audit-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-audit-error" />;
    }
  };

  return (
    <div className="audit-card">
      <h2 className="text-xl font-semibold text-audit-primary mb-4">
        Document Upload
      </h2>

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-audit-accent font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              Drag and drop files here, or click to select
            </p>
            <p className="text-sm text-gray-400">
              Supported: PDF, JPEG, PNG, TIFF, Excel (max {formatFileSize(maxFileSize)})
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Uploaded Documents ({uploadedFiles.length})
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-audit-primary text-white rounded flex items-center justify-center text-xs font-semibold">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.fileSize)} • {doc.uploadDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(doc.status)}
                  <button
                    onClick={() => removeFile(doc.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
