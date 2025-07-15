import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface FileWithProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "completed" | "failed";
  documentId?: string;
  jobId?: string;
  error?: string;
}

interface UploadFormProps {
  onUploadComplete?: (documentId: string) => void;
  onUploadStart?: () => void;
}

export function UploadForm({ onUploadComplete, onUploadStart }: UploadFormProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [metadata, setMetadata] = useState({
    documentName: "",
    depositionDate: "",
  });

  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
  const completeUpload = useMutation(api.uploads.completeUpload);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true,
  });

  const uploadFile = async (fileWithProgress: FileWithProgress, index: number) => {
    try {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: "uploading" } : f
      ));

      onUploadStart?.();

      // Generate upload URL
      console.log("Generating upload URL...");
      const uploadUrl = await generateUploadUrl();
      console.log("Upload URL generated:", uploadUrl);

      // Upload file with progress tracking
      const formData = new FormData();
      formData.append("file", fileWithProgress.file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress } : f
          ));
        }
      };

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          console.log("Upload completed with status:", xhr.status);
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            console.log("Upload response:", response);
            resolve(response.storageId);
          } else {
            console.error("Upload failed:", xhr.statusText, xhr.responseText);
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => {
          console.error("Upload error occurred");
          reject(new Error("Upload failed"));
        };
      });

      xhr.open("POST", uploadUrl);
      xhr.send(formData);

      console.log("Starting file upload...");
      const storageId = await uploadPromise;
      console.log("File uploaded, storageId:", storageId);

      // Complete upload and create document
      console.log("Completing upload with data:", {
        storageId,
        fileName: metadata.documentName || fileWithProgress.file.name,
        originalName: fileWithProgress.file.name,
        fileSize: fileWithProgress.file.size,
        mimeType: fileWithProgress.file.type,
        metadata: {
          documentName: metadata.documentName || undefined,
          depositionDate: metadata.depositionDate || undefined,
        },
      });
      
      const result = await completeUpload({
        storageId,
        fileName: metadata.documentName || fileWithProgress.file.name,
        originalName: fileWithProgress.file.name,
        fileSize: fileWithProgress.file.size,
        mimeType: fileWithProgress.file.type,
        metadata: {
          documentName: metadata.documentName || undefined,
          depositionDate: metadata.depositionDate || undefined,
        },
      });
      
      console.log("Upload completion result:", result);

      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: "processing", 
          progress: 100,
          documentId: result.documentId,
          jobId: result.jobId,
        } : f
      ));

      toast.success(`Upload completed: ${fileWithProgress.file.name}`);
      onUploadComplete?.(result.documentId);

    } catch (error) {
      console.error("Upload failed:", error);
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error"
        } : f
      ));
      toast.error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Deposition Transcripts</CardTitle>
          <CardDescription>
            Upload PDF or Word documents for objection analysis. Maximum file size: 100MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop deposition files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, and DOCX files up to 100MB
                </p>
              </div>
            )}
          </div>

          {/* Metadata Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="documentName">Document Name</Label>
              <Input
                id="documentName"
                placeholder="Enter document name (optional)"
                value={metadata.documentName}
                onChange={(e) => setMetadata(prev => ({ ...prev, documentName: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to use original filename
              </p>
            </div>
            <div>
              <Label htmlFor="depositionDate">Deposition Date</Label>
              <Input
                id="depositionDate"
                type="date"
                value={metadata.depositionDate}
                onChange={(e) => setMetadata(prev => ({ ...prev, depositionDate: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                For easier searching later
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Files to Upload:</h3>
              {files.map((fileWithProgress, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{fileWithProgress.file.name}</span>
                      <span className="text-sm text-gray-500">
                        ({formatFileSize(fileWithProgress.file.size)})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {fileWithProgress.status === "failed" && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={fileWithProgress.status === "uploading"}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                  {fileWithProgress.status !== "pending" && (
                    <div className="space-y-2">
                      <Progress value={fileWithProgress.progress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{fileWithProgress.status}</span>
                        <span>{Math.round(fileWithProgress.progress)}%</span>
                      </div>
                      {fileWithProgress.error && (
                        <p className="text-sm text-red-600">{fileWithProgress.error}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {files.some(f => f.status === "pending") && (
            <Button
              onClick={() => {
                files.forEach((file, index) => {
                  if (file.status === "pending") {
                    uploadFile(file, index);
                  }
                });
              }}
              className="w-full"
              disabled={files.some(f => f.status === "uploading")}
            >
              Upload Files
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}