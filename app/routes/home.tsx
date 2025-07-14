import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchAction, fetchQuery } from "convex/nextjs";
import ContentSection from "~/components/homepage/content";
import Footer from "~/components/homepage/footer";
import Integrations from "~/components/homepage/integrations";
import Pricing from "~/components/homepage/pricing";
import Team from "~/components/homepage/team";
import { api } from "../../convex/_generated/api";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  const title = "Deposition Objection Automation - AI-Powered Legal Document Analysis";
  const description =
    "Automatically detect and analyze objections in deposition transcripts. Save hours of manual work with AI-powered legal document processing.";
  const keywords = "deposition, objection, legal, AI, automation, transcript, analysis, law";
  const siteUrl = "https://deposition-objection-tool.vercel.app/";
  const imageUrl =
    "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/rsk-image-FcUcfBMBgsjNLo99j3NhKV64GT2bQl.png";

  return [
    { title },
    {
      name: "description",
      content: description,
    },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: siteUrl },
    { property: "og:site_name", content: "Deposition Objection Automation" },
    { property: "og:image", content: imageUrl },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    {
      name: "twitter:description",
      content: description,
    },
    { name: "twitter:image", content: imageUrl },
    {
      name: "keywords",
      content: keywords,
    },
    { name: "author", content: "Deposition Objection Tool" },
    { name: "favicon", content: imageUrl },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return {
      isSignedIn: false,
      hasActiveSubscription: false,
      plans: {
        items: [],
        pagination: { totalCount: 0 }
      },
    };
  }

  // Get user info to check if master account
  const user = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  }).then(res => res.json());

  // Check if this is a master account
  const masterAccounts = [
    "ddk@karplawfirm.com",
    "dominique@yourcompany.com",
    "admin@depositiontool.com",
    "demo@depositiontool.com",
  ];

  const userEmail = user.email_addresses?.[0]?.email_address?.toLowerCase() || "";
  const isMasterAccount = masterAccounts.includes(userEmail);

  // Master accounts have "active subscription" for UI purposes
  return {
    isSignedIn: true,
    hasActiveSubscription: isMasterAccount,
    plans: {
      items: [],
      pagination: { totalCount: 0 }
    },
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Integrations loaderData={loaderData} />
      <ContentSection />
      <Team />
      <Pricing loaderData={loaderData} />
      <Footer />
    </>
  );
}
