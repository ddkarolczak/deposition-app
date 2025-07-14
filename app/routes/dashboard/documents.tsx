import { data } from "react-router";
import { Link, useLoaderData } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { FileText, Upload, Download, Eye, Trash2 } from "lucide-react";
import type { Route } from "./+types/documents";

export const meta = () => {
  return [
    { title: "Documents - Deposition Objection Automation" },
    { name: "description", content: "View and manage your deposition documents" },
  ];
};

export const loader = async (args: Route.LoaderArgs) => {
  const { userId } = await getAuth(args);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Mock data for now to avoid build issues
  const documents: any[] = [];
  const stats = {
    total: 12,
    processing: 3,
    completed: 9,
    totalObjections: 247,
  };

  return data({
    documents,
    stats,
  });
};

export default function DocumentsPage() {
  const { documents, stats } = useLoaderData<typeof loader>();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "queued":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Documents
            </h1>
            <p className="text-gray-600">
              Manage your deposition transcripts and view processing status.
            </p>
          </div>
          <Link to="/dashboard/upload">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New Document
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                documents uploaded
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.processing}
              </div>
              <p className="text-xs text-muted-foreground">
                currently processing
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completed}
              </div>
              <p className="text-xs text-muted-foreground">
                ready for review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Objections</CardTitle>
              <div className="h-4 w-4 rounded-full bg-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalObjections}
              </div>
              <p className="text-xs text-muted-foreground">
                objections detected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>
              Your recently uploaded deposition transcripts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mock data - replace with actual data */}
                {[
                  {
                    id: "1",
                    originalName: "Johnson_Deposition_2024.pdf",
                    fileSize: 15234567,
                    status: "completed",
                    pageCount: 247,
                    uploadedAt: Date.now() - 3600000,
                  },
                  {
                    id: "2",
                    originalName: "Smith_Testimony_Final.docx",
                    fileSize: 8765432,
                    status: "processing",
                    pageCount: 156,
                    uploadedAt: Date.now() - 1800000,
                  },
                  {
                    id: "3",
                    originalName: "Medical_Expert_Deposition.pdf",
                    fileSize: 23456789,
                    status: "queued",
                    pageCount: null,
                    uploadedAt: Date.now() - 900000,
                  },
                ].map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        {doc.originalName}
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doc.pageCount ? `${doc.pageCount} pages` : "—"}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {doc.status === "completed" && (
                          <>
                            <Link to={`/dashboard/documents/${doc.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}