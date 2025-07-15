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
    caseTitle: "",
    deponentName: "",
    depositionDate: "",
    court: "",
    attorneys: "",
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
    maxSize: 3 * 1024 * 1024 * 1024, // 3GB
    multiple: true,
  });

  const uploadFile = async (fileWithProgress: FileWithProgress, index: number) => {
    try {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: "uploading" } : f
      ));

      onUploadStart?.();

      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

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
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.storageId);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
      });

      xhr.open("POST", uploadUrl);
      xhr.send(formData);

      const storageId = await uploadPromise;

      // Complete upload and create document
      const attorneys = metadata.attorneys
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const result = await completeUpload({
        storageId,
        fileName: fileWithProgress.file.name,
        originalName: fileWithProgress.file.name,
        fileSize: fileWithProgress.file.size,
        mimeType: fileWithProgress.file.type,
        metadata: {
          caseTitle: metadata.caseTitle || undefined,
          deponentName: metadata.deponentName || undefined,
          depositionDate: metadata.depositionDate || undefined,
          court: metadata.court || undefined,
          attorneys: attorneys.length > 0 ? attorneys : undefined,
        },
      });

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
            Upload PDF or Word documents for objection analysis. Maximum file size: 3GB.
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
                  Supports PDF, DOC, and DOCX files up to 3GB
                </p>
              </div>
            )}
          </div>

          {/* Metadata Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="caseTitle">Case Title</Label>
              <Input
                id="caseTitle"
                placeholder="Enter case title"
                value={metadata.caseTitle}
                onChange={(e) => setMetadata(prev => ({ ...prev, caseTitle: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="deponentName">Deponent Name</Label>
              <Input
                id="deponentName"
                placeholder="Enter deponent name"
                value={metadata.deponentName}
                onChange={(e) => setMetadata(prev => ({ ...prev, deponentName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="depositionDate">Deposition Date</Label>
              <Input
                id="depositionDate"
                type="date"
                value={metadata.depositionDate}
                onChange={(e) => setMetadata(prev => ({ ...prev, depositionDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="court">Court</Label>
              <Input
                id="court"
                placeholder="Enter court name"
                value={metadata.court}
                onChange={(e) => setMetadata(prev => ({ ...prev, court: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="attorneys">Attorneys (comma-separated)</Label>
              <Input
                id="attorneys"
                placeholder="Enter attorney names separated by commas"
                value={metadata.attorneys}
                onChange={(e) => setMetadata(prev => ({ ...prev, attorneys: e.target.value }))}
              />
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