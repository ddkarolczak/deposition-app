import { data } from "react-router";
import { useLoaderData } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Upload, FileText, AlertCircle } from "lucide-react";
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <CardDescription>
              Upload deposition transcripts for AI-powered objection analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF or Word documents (MAX 100MB)</p>
                </div>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
              </label>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Upload Feature Coming Soon</span>
              </div>
              <p className="text-sm text-blue-800">
                Document upload and AI objection analysis will be available in the next update.
                Master accounts will have unlimited processing credits.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Last updated: {new Date().toLocaleString()} - New Repo Deploy: {Date.now()}
              </p>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Firm:</strong> {firm.name}</p>
              <p><strong>Available Credits:</strong> {credits === 999999 ? 'Unlimited' : credits}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}