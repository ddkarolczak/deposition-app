import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { redirect, useLoaderData } from "react-router";
import { AppSidebar } from "~/components/dashboard/app-sidebar";
import { SiteHeader } from "~/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/layout";
import { createClerkClient } from "@clerk/react-router/api.server";
import { Outlet } from "react-router";
import { Toaster } from "sonner";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  // Redirect to sign-in if not authenticated
  if (!userId) {
    throw redirect("/sign-in");
  }

  // Ensure user is properly set up first
  await fetchMutation(api.users.upsertUser, {});

  // Get user info
  const user = await createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(userId);

  // Check if this is a master account
  const masterAccounts = [
    "ddk@karplawfirm.com",
    "dominique@yourcompany.com",
    "admin@depositiontool.com",
    "demo@depositiontool.com",
  ];

  const isMasterAccount = masterAccounts.includes(user.emailAddresses[0]?.emailAddress?.toLowerCase() || "");

  // Only check subscription for non-master accounts
  if (!isMasterAccount) {
    const subscriptionStatus = await fetchQuery(api.subscriptions.checkUserSubscriptionStatus, { userId });
    
    // Redirect to subscription-required if no active subscription
    if (!subscriptionStatus?.hasActiveSubscription) {
      throw redirect("/subscription-required");
    }
  }

  return { user, isMasterAccount };
}

export default function DashboardLayout() {
  const { user, isMasterAccount } = useLoaderData();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
