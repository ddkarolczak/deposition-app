import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
    firmId: v.optional(v.id("firms")),
    role: v.optional(v.union(v.literal("admin"), v.literal("member"))),
    invitedBy: v.optional(v.id("users")),
    invitedAt: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
  }).index("by_token", ["tokenIdentifier"])
    .index("by_firm", ["firmId"])
    .index("by_email", ["email"]),
  
  firms: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    createdAt: v.number(),
    credits: v.number(),
    maxMembers: v.optional(v.number()),
    settings: v.optional(v.object({
      allowMemberInvites: v.optional(v.boolean()),
      maxUploadSize: v.optional(v.number()),
      retentionDays: v.optional(v.number()),
    })),
  }).index("by_owner", ["ownerId"]),

  documents: defineTable({
    firmId: v.id("firms"),
    userId: v.id("users"),
    fileName: v.string(),
    originalName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    storageId: v.optional(v.id("_storage")),
    uploadedAt: v.number(),
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
    metadata: v.optional(v.object({
      caseTitle: v.optional(v.string()),
      deponentName: v.optional(v.string()),
      depositionDate: v.optional(v.string()),
      court: v.optional(v.string()),
      attorneys: v.optional(v.array(v.string())),
    })),
  }).index("by_firm", ["firmId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_firm_status", ["firmId", "status"]),

  jobs: defineTable({
    documentId: v.id("documents"),
    firmId: v.id("firms"),
    userId: v.id("users"),
    type: v.union(
      v.literal("extract_text"),
      v.literal("detect_objections"),
      v.literal("generate_reports")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    progress: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    payload: v.optional(v.any()),
    result: v.optional(v.any()),
    retryCount: v.optional(v.number()),
    nextRetryAt: v.optional(v.number()),
  }).index("by_document", ["documentId"])
    .index("by_firm", ["firmId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  objections: defineTable({
    documentId: v.id("documents"),
    firmId: v.id("firms"),
    jobId: v.id("jobs"),
    category: v.string(),
    subType: v.optional(v.string()),
    pageStart: v.number(),
    lineStart: v.number(),
    pageEnd: v.optional(v.number()),
    lineEnd: v.optional(v.number()),
    attorney: v.optional(v.string()),
    sequencePattern: v.union(
      v.literal("Q-O-A"),
      v.literal("Q-O-Q-A"),
      v.literal("Q-O-No Answer"),
      v.literal("Other")
    ),
    contextBefore: v.optional(v.string()),
    objectionText: v.string(),
    contextAfter: v.optional(v.string()),
    response: v.optional(v.string()),
    ruling: v.optional(v.union(v.literal("sustained"), v.literal("overruled"))),
    confidence: v.optional(v.number()),
    flags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }).index("by_document", ["documentId"])
    .index("by_firm", ["firmId"])
    .index("by_job", ["jobId"])
    .index("by_category", ["category"])
    .index("by_attorney", ["attorney"])
    .index("by_sequence", ["sequencePattern"]),

  billingRecords: defineTable({
    firmId: v.id("firms"),
    userId: v.id("users"),
    documentId: v.optional(v.id("documents")),
    type: v.union(
      v.literal("document_processing"),
      v.literal("credit_purchase"),
      v.literal("subscription_fee"),
      v.literal("refund")
    ),
    creditsUsed: v.optional(v.number()),
    creditsAdded: v.optional(v.number()),
    amountCents: v.number(),
    description: v.string(),
    createdAt: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_firm", ["firmId"])
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_date", ["createdAt"]),

  auditLogs: defineTable({
    firmId: v.id("firms"),
    userId: v.id("users"),
    action: v.string(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    details: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_firm", ["firmId"])
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"]),

  invitations: defineTable({
    firmId: v.id("firms"),
    email: v.string(),
    invitedBy: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    token: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    expiresAt: v.number(),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
    acceptedBy: v.optional(v.id("users")),
  }).index("by_firm", ["firmId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"])
    .index("by_status", ["status"]),

  subscriptions: defineTable({
    userId: v.optional(v.string()),
    polarId: v.optional(v.string()),
    polarPriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("polarId", ["polarId"]),
  
  webhookEvents: defineTable({
    type: v.string(),
    polarEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("polarEventId", ["polarEventId"]),
});
