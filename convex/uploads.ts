import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
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

    // Generate upload URL for file storage
    return await ctx.storage.generateUploadUrl();
  },
});

export const completeUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    originalName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (!user || !user.firmId) {
      throw new Error("User not found or not part of a firm");
    }

    // Check file size limits
    const firm = await ctx.db.get(user.firmId);
    const maxSize = firm?.settings?.maxUploadSize || 100 * 1024 * 1024; // 100MB default
    if (args.fileSize > maxSize) {
      throw new Error(`File size exceeds limit of ${maxSize} bytes`);
    }

    // Check file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (!allowedMimeTypes.includes(args.mimeType)) {
      throw new Error("Only PDF and Word documents are supported");
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

    // Create initial processing job
    const jobId = await ctx.db.insert("jobs", {
      documentId: documentId,
      firmId: user.firmId,
      userId: user._id,
      type: "extract_text",
      status: "pending",
      progress: 0,
      retryCount: 0,
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
        jobId: jobId,
      },
      timestamp: Date.now(),
    });

    return { documentId, jobId };
  },
});

export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
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

    // Find document with this storage ID to verify access
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_firm", (q) => q.eq("firmId", user.firmId!))
      .collect();
    
    const document = documents.find((doc: any) => doc.storageId === args.storageId);

    if (!document) {
      throw new Error("Storage file not found or access denied");
    }

    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getRecentUploads = query({
  args: { limit: v.optional(v.number()) },
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

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_firm", (q) => q.eq("firmId", user.firmId!))
      .order("desc")
      .take(args.limit || 10);

    return documents.map((doc: any) => ({
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
      metadata: doc.metadata,
    }));
  },
});