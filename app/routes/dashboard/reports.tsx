import { data } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { BarChart3, FileText, TrendingUp, AlertCircle } from "lucide-react";
import type { Route } from "./+types/reports";

export const meta = () => {
  return [
    { title: "Reports - Deposition Objection Automation" },
    { name: "description", content: "View analytics and reports for your deposition objections" },
  ];
};

export const loader = async (args: Route.LoaderArgs) => {
  const { userId } = await getAuth(args);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return data({
    reports: [],
  });
};

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            View detailed analytics and reports for your deposition objection analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Objections</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2m</div>
              <p className="text-xs text-muted-foreground">
                -0.8m from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed Reports
            </CardTitle>
            <CardDescription>
              Advanced analytics and reporting features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Reports Coming Soon</span>
              </div>
              <p className="text-sm text-blue-800">
                Advanced reporting and analytics features will be available in the next update.
                This will include detailed objection analysis, trend reports, and exportable charts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}