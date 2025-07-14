#!/usr/bin/env node

// Master Account Setup Script
// Run this after authentication to set up unlimited credits

const { ConvexHttpClient } = require("convex/browser");

async function setupMasterAccount() {
  console.log("🔧 Setting up Master Account...");
  
  // Initialize Convex client
  const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL);
  
  try {
    // Create master account
    const result = await convex.mutation("admin:createMasterAccount", {
      email: "dominique@yourcompany.com", // Update with your email
      name: "Master Admin"
    });
    
    console.log("✅ Master account created successfully!");
    console.log("📧 Email: dominique@yourcompany.com");
    console.log("💳 Credits: Unlimited (999,999)");
    console.log("👥 Members: Unlimited");
    console.log("📁 Upload limit: 10GB");
    
    // Get stats
    const stats = await convex.query("admin:getMasterAccountStats", {});
    console.log("\n📊 System Stats:");
    console.log(`- Total Firms: ${stats.totalFirms}`);
    console.log(`- Total Users: ${stats.totalUsers}`);
    console.log(`- Total Documents: ${stats.totalDocuments}`);
    console.log(`- Total Objections: ${stats.totalObjections}`);
    
  } catch (error) {
    console.error("❌ Error setting up master account:", error.message);
    console.log("\n💡 Make sure you:");
    console.log("1. Have authenticated with Convex (npx convex dev)");
    console.log("2. Are using a master account email");
    console.log("3. Have deployed the schema and functions");
  }
}

// Run the setup
setupMasterAccount();