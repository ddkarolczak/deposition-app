import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createDocument = mutation({
  args: {
    fileName: v.string(),
    originalName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    storageId: v.optional(v.id("_storage")),
    metadata: v.optional(v.object({
      caseTitle: v.optional(v.string()),
      deponentName: v.optional(v.string()),
      depositionDate: v.optional(v.string()),
      court: v.optional(v.string()),
      attorneys: v.optional(v.array(v.string())),
    })),
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

    if (!user.firmId) {
      throw new Error("User does not belong to a firm");
    }

    // Check file size limits
    const firm = await ctx.db.get(user.firmId);
    const maxSize = firm?.settings?.maxUploadSize || 3 * 1024 * 1024 * 1024; // 3GB default
    if (args.fileSize > maxSize) {
      throw new Error(`File size exceeds limit of ${maxSize} bytes`);
    }

    // Check credits for processing (bypass for master accounts)
    const baseCredits = args.fileSize > 50 * 1024 * 1024 ? 2 : 1;
    const isMasterAccount = firm?.credits === 999999;
    
    if (!isMasterAccount && (firm?.credits || 0) < baseCredits) {
      throw new Error("Insufficient credits for processing this document");
    }

    // Create document record
    const documentId = await ctx.db.insert("documents", {
      firmId: user.firmId,
      userId: user._id,
      fileName: args.fileName,
      originalName: args.originalName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      storageId: args.storageId,
      uploadedAt: Date.now(),
      status: "queued",
      metadata: args.metadata,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      firmId: user.firmId,
      userId: user._id,
      action: "document_uploaded",
      resourceType: "document",
      resourceId: documentId,
      details: {
        fileName: args.originalName,
        fileSize: args.fileSize,
        mimeType: args.mimeType,
      },
      timestamp: Date.now(),
    });

    return documentId;
  },
});

export const getDocuments = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("uploading"),
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("deleted")
    )),
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

    if (!user || !user.firmId) {
      throw new Error("User not found or not part of a firm");
    }

    let documents;
    
    if (args.status) {
      documents = await ctx.db
        .query("documents")
        .withIndex("by_firm_status", (q) => 
          q.eq("firmId", user.firmId).eq("status", args.status)
        )
        .order("desc")
        .take(args.limit || 50)
        .collect();
    } else {
      documents = await ctx.db
        .query("documents")
        .withIndex("by_firm", (q) => q.eq("firmId", user.firmId))
        .order("desc")
        .take(args.limit || 50)
        .collect();
    }

    return documents.map((doc) => ({
      id: doc._id,
      fileName: doc.fileName,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      uploadedAt: doc.uploadedAt,
      status: doc.status,
      processingStarted: doc.processingStarted,
      processingCompleted: doc.processingCompleted,
      pageCount: doc.pageCount,
      wordCount: doc.wordCount,
      errorMessage: doc.errorMessage,
      metadata: doc.metadata,
    }));
  },
});

export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user || !user.firmId) {
      throw new Error("User not found or not part of a firm");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document || document.firmId !== user.firmId) {
      throw new Error("Document not found or access denied");
    }

    return document;
  },
});

export const updateDocumentStatus = mutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(
      v.literal("uploading"),
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("deleted")
    ),
    processingStarted: v.optional(v.number()),
    processingCompleted: v.optional(v.number()),
    pageCount: v.optional(v.number()),
    wordCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
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

    if (!user || !user.firmId) {
      throw new Error("User not found or not part of a firm");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document || document.firmId !== user.firmId) {
      throw new Error("Document not found or access denied");
    }

    const updateData: any = {
      status: args.status,
    };

    if (args.processingStarted !== undefined) {
      updateData.processingStarted = args.processingStarted;
    }
    if (args.processingCompleted !== undefined) {
      updateData.processingCompleted = args.processingCompleted;
    }
    if (args.pageCount !== undefined) {
      updateData.pageCount = args.pageCount;
    }
    if (args.wordCount !== undefined) {
      updateData.wordCount = args.wordCount;
    }
    if (args.errorMessage !== undefined) {
      updateData.errorMessage = args.errorMessage;
    }

    await ctx.db.patch(args.documentId, updateData);

    return { success: true };
  },
});

export const getDocumentStats = query({
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

    if (!user || !user.firmId) {
      throw new Error("User not found or not part of a firm");
    }

    // Get document counts by status
    const allDocuments = await ctx.db
      .query("documents")
      .withIndex("by_firm", (q) => q.eq("firmId", user.firmId))
      .collect();

    const stats = {
      total: allDocuments.length,
      uploading: 0,
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      deleted: 0,
      totalSize: 0,
      totalPages: 0,
      totalObjections: 0,
    };

    for (const doc of allDocuments) {
      const status = doc.status as keyof typeof stats;
      if (typeof stats[status] === 'number') {
        (stats[status] as number) += 1;
      }
      stats.totalSize += doc.fileSize;
      stats.totalPages += doc.pageCount || 0;
    }

    // Get total objections
    const objections = await ctx.db
      .query("objections")
      .withIndex("by_firm", (q) => q.eq("firmId", user.firmId))
      .collect();
    
    stats.totalObjections = objections.length;

    return stats;
  },
});