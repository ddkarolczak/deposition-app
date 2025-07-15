import { data } from "react-router";
import { useLoaderData } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { UploadForm } from "~/components/upload/upload-form";
import { toast } from "sonner";
import type { Route } from "./+types/upload";

export const meta = () => {
  return [
    { title: "Upload Documents - Deposition Objection Automation" },
    { name: "description", content: "Upload deposition transcripts for objection analysis" },
  ];
};

export const loader = async (args: Route.LoaderArgs) => {
  const { userId } = await getAuth(args);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Mock data for now
  const firm = { name: "Sample Firm", credits: 999999 };
  const credits = 999999;

  return data({
    firm,
    credits,
  });
};

export default function UploadPage() {
  const { firm, credits } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Deposition Transcripts
          </h1>
          <p className="text-gray-600">
            Upload PDF or Word documents to automatically detect and analyze objections.
          </p>
        </div>

        <UploadForm 
          onUploadComplete={(documentId) => {
            toast.success("Document uploaded successfully!", {
              description: "Your document is now being processed for objection detection.",
              duration: 5000,
            });
            console.log('Document uploaded:', documentId);
          }}
          onUploadStart={() => {
            toast.info("Upload started", {
              description: "Uploading your document...",
            });
          }}
        />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Firm:</strong> {firm.name}</p>
                <p><strong>Available Credits:</strong> {credits === 999999 ? 'Unlimited' : credits}</p>
              </div>
              <div>
                <p><strong>Account Type:</strong> {credits === 999999 ? 'Master Account' : 'Standard'}</p>
                <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}