import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with roles and permissions
  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("safety_officer"),
      v.literal("data_entry"),
      v.literal("reviewer"),
      v.literal("viewer")
    ),
    department: v.string(),
    permissions: v.array(v.string()),
    isActive: v.boolean(),
    lastLogin: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Adverse event cases
  cases: defineTable({
    caseNumber: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("closed")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    
    // Patient information
    patientAge: v.optional(v.number()),
    patientGender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    patientWeight: v.optional(v.number()),
    
    // Product information
    productName: v.string(),
    batchNumber: v.optional(v.string()),
    indication: v.optional(v.string()),
    dosage: v.optional(v.string()),
    
    // Event information
    adverseEvent: v.string(),
    eventDescription: v.string(),
    eventDate: v.number(),
    reportDate: v.number(),
    seriousness: v.boolean(),
    outcome: v.optional(v.union(
      v.literal("recovered"),
      v.literal("recovering"),
      v.literal("not_recovered"),
      v.literal("fatal"),
      v.literal("unknown")
    )),
    
    // Reporter information
    reporterType: v.union(
      v.literal("healthcare_professional"),
      v.literal("consumer"),
      v.literal("regulatory_authority"),
      v.literal("company")
    ),
    reporterCountry: v.string(),
    
    // Regulatory
    regulatoryStatus: v.object({
      fda: v.optional(v.object({
        submitted: v.boolean(),
        submissionDate: v.optional(v.number()),
        acknowledgmentNumber: v.optional(v.string())
      })),
      ema: v.optional(v.object({
        submitted: v.boolean(),
        submissionDate: v.optional(v.number()),
        acknowledgmentNumber: v.optional(v.string())
      })),
      ich: v.optional(v.object({
        submitted: v.boolean(),
        submissionDate: v.optional(v.number()),
        acknowledgmentNumber: v.optional(v.string())
      }))
    }),
    
    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),
    lastModifiedBy: v.id("users"),
  })
    .index("by_case_number", ["caseNumber"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_product", ["productName"])
    .searchIndex("search_cases", {
      searchField: "adverseEvent",
      filterFields: ["status", "priority", "productName"]
    }),

  // Case workflow tracking
  caseWorkflow: defineTable({
    caseId: v.id("cases"),
    fromStatus: v.optional(v.string()),
    toStatus: v.string(),
    action: v.string(),
    comments: v.optional(v.string()),
    performedBy: v.id("users"),
    timestamp: v.number(),
  }).index("by_case", ["caseId"]),

  // Audit trail
  auditLog: defineTable({
    entityType: v.union(v.literal("case"), v.literal("user"), v.literal("system")),
    entityId: v.string(),
    action: v.string(),
    changes: v.optional(v.object({
      field: v.string(),
      oldValue: v.optional(v.string()),
      newValue: v.optional(v.string())
    })),
    performedBy: v.id("users"),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
  }).index("by_entity", ["entityType", "entityId"]),

  // Signal detection data
  signals: defineTable({
    signalName: v.string(),
    description: v.string(),
    productName: v.string(),
    adverseEvent: v.string(),
    detectionMethod: v.union(
      v.literal("statistical"),
      v.literal("clinical_review"),
      v.literal("literature"),
      v.literal("regulatory")
    ),
    strength: v.union(v.literal("weak"), v.literal("moderate"), v.literal("strong")),
    status: v.union(
      v.literal("detected"),
      v.literal("under_evaluation"),
      v.literal("confirmed"),
      v.literal("refuted"),
      v.literal("closed")
    ),
    relatedCases: v.array(v.id("cases")),
    createdBy: v.id("users"),
    assignedTo: v.optional(v.id("users")),
  })
    .index("by_product", ["productName"])
    .index("by_status", ["status"])
    .index("by_strength", ["strength"]),

  // Reports and dashboards
  reports: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("periodic_safety_update"),
      v.literal("signal_detection"),
      v.literal("regulatory_submission"),
      v.literal("custom")
    ),
    parameters: v.object({
      dateRange: v.object({
        start: v.number(),
        end: v.number()
      }),
      products: v.optional(v.array(v.string())),
      regions: v.optional(v.array(v.string())),
      filters: v.optional(v.object({}))
    }),
    generatedBy: v.id("users"),
    generatedAt: v.number(),
    status: v.union(v.literal("generating"), v.literal("completed"), v.literal("failed")),
    fileId: v.optional(v.id("_storage")),
  }).index("by_type", ["type"]),

  // Data integration logs
  dataImports: defineTable({
    fileName: v.string(),
    source: v.string(),
    recordsProcessed: v.number(),
    recordsSuccessful: v.number(),
    recordsFailed: v.number(),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
    errors: v.optional(v.array(v.string())),
    importedBy: v.id("users"),
    importedAt: v.number(),
  }).index("by_status", ["status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
