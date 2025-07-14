import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Master account configuration
const MASTER_ACCOUNTS = [
  "dominique@yourcompany.com",
  "admin@depositiontool.com",
  "demo@depositiontool.com",
];

export const setupMasterAccount = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if this is a master account email
    if (!MASTER_ACCOUNTS.includes(args.email.toLowerCase())) {
      throw new Error("Not authorized for master account");
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found. Please sign up first.");
    }

    // Get or create firm
    let firm;
    if (user.firmId) {
      firm = await ctx.db.get(user.firmId);
    } else {
      // Create master firm
      const firmId = await ctx.db.insert("firms", {
        name: "Master Account - Unlimited",
        ownerId: user._id,
        createdAt: Date.now(),
        credits: 999999,
        maxMembers: 999,
        settings: {
          allowMemberInvites: true,
          maxUploadSize: 10 * 1024 * 1024 * 1024, // 10GB
          retentionDays: 99999,
        },
      });
      
      firm = await ctx.db.get(firmId);
      
      // Update user with firm
      await ctx.db.patch(user._id, {
        firmId: firmId,
        role: "admin",
      });
    }

    // Ensure unlimited credits
    if (firm && firm.credits !== 999999) {
      await ctx.db.patch(firm._id, {
        credits: 999999,
      });
    }

    return { success: true, firmId: firm?._id };
  },
});

export const checkMasterAccount = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return MASTER_ACCOUNTS.includes(args.email.toLowerCase());
  },
});

export const getMasterAccountStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Check if user is a master account
    const isMaster = MASTER_ACCOUNTS.includes(identity.email?.toLowerCase() || "");
    if (!isMaster) {
      throw new Error("Only master accounts can view these stats");
    }

    // Get all firms and their stats
    const firms = await ctx.db.query("firms").collect();
    const documents = await ctx.db.query("documents").collect();
    const objections = await ctx.db.query("objections").collect();
    const users = await ctx.db.query("users").collect();

    return {
      totalFirms: firms.length,
      totalUsers: users.length,
      totalDocuments: documents.length,
      totalObjections: objections.length,
      totalCreditsUsed: documents.length * 1,
      masterAccounts: MASTER_ACCOUNTS,
      systemHealth: "healthy",
    };
  },
});