import { json, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { getAuthUserId } from "@convex-dev/auth/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";
import { UploadForm } from "~/components/upload/upload-form";
import { toast } from "sonner";

export const meta = () => {
  return [
    { title: "Upload Documents - Deposition Objection Automation" },
    { name: "description", content: "Upload deposition transcripts for objection analysis" },
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const userId = await getAuthUserId(context);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Preload firm info and credits
  const firmQuery = preloadQuery(api.firms.getFirmByUser, {});
  const creditsQuery = preloadQuery(api.firms.getFirmCredits, {});

  return json({
    firmQuery,
    creditsQuery,
  });
};

export default function UploadPage() {
  const { firmQuery, creditsQuery } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleUploadComplete = (documentId: string) => {
    toast.success("Document uploaded successfully!");
    navigate(`/dashboard/documents/${documentId}`);
  };

  const handleUploadStart = () => {
    toast.info("Upload started...");
  };

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
          onUploadComplete={handleUploadComplete}
          onUploadStart={handleUploadStart}
        />
      </div>
    </div>
  );
}