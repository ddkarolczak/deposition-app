import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const findUserByToken = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    // Get the user's identity from the auth context
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // Check if we've already stored this identity before
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (user !== null) {
      return user;
    }

    return null;
  },
});

export const upsertUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (existingUser) {
      // Update if needed
      if (
        existingUser.name !== identity.name ||
        existingUser.email !== identity.email
      ) {
        await ctx.db.patch(existingUser._id, {
          name: identity.name,
          email: identity.email,
        });
      }
      
      // Check if this is a master account that needs setup
      const masterAccounts = [
        "ddk@karplawfirm.com",
        "dominique@yourcompany.com",
        "admin@depositiontool.com", 
        "demo@depositiontool.com"
      ];
      
      if (masterAccounts.includes(identity.email?.toLowerCase() || "")) {
        // Set up master account if not already done
        if (!existingUser.firmId || existingUser.role !== "admin") {
          // Create or update master firm
          let firmId = existingUser.firmId;
          if (!firmId) {
            firmId = await ctx.db.insert("firms", {
              name: "Master Account - Unlimited",
              ownerId: existingUser._id,
              createdAt: Date.now(),
              credits: 999999,
              maxMembers: 999,
              settings: {
                allowMemberInvites: true,
                maxUploadSize: 100 * 1024 * 1024, // 100MB
                retentionDays: 99999,
              },
            });
          } else {
            // Update existing firm to master status
            await ctx.db.patch(firmId, {
              credits: 999999,
              maxMembers: 999,
              settings: {
                allowMemberInvites: true,
                maxUploadSize: 100 * 1024 * 1024, // 100MB
                retentionDays: 99999,
              },
            });
          }
          
          // Update user to admin
          await ctx.db.patch(existingUser._id, {
            firmId: firmId,
            role: "admin",
          });
        }
      }
      
      return existingUser;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.subject,
    });

    const newUser = await ctx.db.get(userId);
    
    // Check if this is a master account
    const masterAccounts = [
      "ddk@karplawfirm.com",
      "dominique@yourcompany.com",
      "admin@depositiontool.com", 
      "demo@depositiontool.com"
    ];
    
    if (masterAccounts.includes(identity.email?.toLowerCase() || "")) {
      // Create master firm
      const firmId = await ctx.db.insert("firms", {
        name: "Master Account - Unlimited",
        ownerId: userId,
        createdAt: Date.now(),
        credits: 999999,
        maxMembers: 999,
        settings: {
          allowMemberInvites: true,
          maxUploadSize: 10 * 1024 * 1024 * 1024, // 10GB
          retentionDays: 99999,
        },
      });
      
      // Update user with firm and admin role
      await ctx.db.patch(userId, {
        firmId: firmId,
        role: "admin",
      });
    }

    return await ctx.db.get(userId);
  },
});
