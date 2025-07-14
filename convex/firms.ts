import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createFirm = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated");
    }

    // Find the user by their token identifier
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already has a firm
    if (user.firmId) {
      throw new Error("User already belongs to a firm");
    }

    // Create the firm
    const firmId = await ctx.db.insert("firms", {
      name: args.name,
      ownerId: user._id,
      createdAt: Date.now(),
      credits: 0, // Start with 0 credits
      maxMembers: 10, // Default limit
      settings: {
        allowMemberInvites: true,
        maxUploadSize: 3 * 1024 * 1024 * 1024, // 3GB
        retentionDays: 365,
      },
    });

    // Update user to be admin of the firm
    await ctx.db.patch(user._id, {
      firmId: firmId,
      role: "admin",
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      firmId: firmId,
      userId: user._id,
      action: "firm_created",
      resourceType: "firm",
      resourceId: firmId,
      details: { firmName: args.name },
      timestamp: Date.now(),
    });

    return firmId;
  },
});

export const getFirmByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user?.firmId) {
      return null;
    }

    const firm = await ctx.db.get(user.firmId);
    return firm;
  },
});

export const getFirmMembers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user?.firmId) {
      throw new Error("User does not belong to a firm");
    }

    const members = await ctx.db
      .query("users")
      .withIndex("by_firm", (q) => q.eq("firmId", user.firmId))
      .collect();

    return members.map((member) => ({
      id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      invitedAt: member.invitedAt,
      verifiedAt: member.verifiedAt,
    }));
  },
});

export const updateFirmSettings = mutation({
  args: {
    settings: v.object({
      allowMemberInvites: v.optional(v.boolean()),
      maxUploadSize: v.optional(v.number()),
      retentionDays: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user?.firmId || user.role !== "admin") {
      throw new Error("Only firm admins can update settings");
    }

    const firm = await ctx.db.get(user.firmId);
    if (!firm) {
      throw new Error("Firm not found");
    }

    await ctx.db.patch(user.firmId, {
      settings: {
        ...firm.settings,
        ...args.settings,
      },
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      firmId: user.firmId,
      userId: user._id,
      action: "firm_settings_updated",
      resourceType: "firm",
      resourceId: user.firmId,
      details: { updatedSettings: args.settings },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const getFirmCredits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user?.firmId) {
      throw new Error("User does not belong to a firm");
    }

    const firm = await ctx.db.get(user.firmId);
    return firm?.credits || 0;
  },
});

export const updateFirmCredits = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
    type: v.union(
      v.literal("document_processing"),
      v.literal("credit_purchase"),
      v.literal("subscription_fee"),
      v.literal("refund")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user?.firmId) {
      throw new Error("User does not belong to a firm");
    }

    const firm = await ctx.db.get(user.firmId);
    if (!firm) {
      throw new Error("Firm not found");
    }

    // Don't update credits for master accounts (they stay at 999999)
    if (firm.credits !== 999999) {
      // Update credits
      const newCredits = Math.max(0, firm.credits + args.amount);
      await ctx.db.patch(user.firmId, {
        credits: newCredits,
      });
    }

    // Create billing record
    await ctx.db.insert("billingRecords", {
      firmId: user.firmId,
      userId: user._id,
      type: args.type,
      creditsUsed: args.amount < 0 ? Math.abs(args.amount) : undefined,
      creditsAdded: args.amount > 0 ? args.amount : undefined,
      amountCents: 0, // Will be updated by billing webhook
      description: args.description,
      createdAt: Date.now(),
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      firmId: user.firmId,
      userId: user._id,
      action: "credits_updated",
      resourceType: "firm",
      resourceId: user.firmId,
      details: { 
        previousCredits: firm.credits,
        newCredits: firm.credits,
        change: args.amount,
        type: args.type,
      },
      timestamp: Date.now(),
    });

    return { success: true, newCredits: firm.credits };
  },
});