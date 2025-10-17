import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCase = mutation({
  args: {
    productName: v.string(),
    adverseEvent: v.string(),
    eventDescription: v.string(),
    eventDate: v.number(),
    reportDate: v.number(),
    seriousness: v.boolean(),
    patientAge: v.optional(v.number()),
    patientGender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    reporterType: v.union(
      v.literal("healthcare_professional"),
      v.literal("consumer"),
      v.literal("regulatory_authority"),
      v.literal("company")
    ),
    reporterCountry: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Generate case number
    const caseCount = await ctx.db.query("cases").collect();
    const caseNumber = `PV-${Date.now()}-${String(caseCount.length + 1).padStart(4, '0')}`;
    
    const caseId = await ctx.db.insert("cases", {
      caseNumber,
      status: "draft",
      priority: args.priority,
      productName: args.productName,
      adverseEvent: args.adverseEvent,
      eventDescription: args.eventDescription,
      eventDate: args.eventDate,
      reportDate: args.reportDate,
      seriousness: args.seriousness,
      patientAge: args.patientAge,
      patientGender: args.patientGender,
      reporterType: args.reporterType,
      reporterCountry: args.reporterCountry,
      regulatoryStatus: {
        fda: { submitted: false },
        ema: { submitted: false },
        ich: { submitted: false }
      },
      createdBy: userId,
      lastModifiedBy: userId,
    });
    
    // Log workflow action
    await ctx.db.insert("caseWorkflow", {
      caseId,
      toStatus: "draft",
      action: "Case created",
      performedBy: userId,
      timestamp: Date.now(),
    });
    
    // Log audit trail
    await ctx.db.insert("auditLog", {
      entityType: "case",
      entityId: caseId,
      action: "CREATE",
      performedBy: userId,
      timestamp: Date.now(),
    });
    
    return caseId;
  },
});

export const getCases = query({
  args: {
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    let cases;
    
    if (args.status) {
      cases = await ctx.db
        .query("cases")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .take(args.limit || 50);
    } else if (args.priority) {
      cases = await ctx.db
        .query("cases")
        .withIndex("by_priority", (q) => q.eq("priority", args.priority as any))
        .order("desc")
        .take(args.limit || 50);
    } else if (args.assignedTo) {
      cases = await ctx.db
        .query("cases")
        .withIndex("by_assigned_to", (q) => q.eq("assignedTo", args.assignedTo))
        .order("desc")
        .take(args.limit || 50);
    } else {
      cases = await ctx.db
        .query("cases")
        .order("desc")
        .take(args.limit || 50);
    }
    
    // Get creator and assignee information
    const casesWithUsers = await Promise.all(
      cases.map(async (case_) => {
        const creator = await ctx.db.get(case_.createdBy);
        const assignee = case_.assignedTo ? await ctx.db.get(case_.assignedTo) : null;
        
        return {
          ...case_,
          creator: creator?.name || creator?.email,
          assignee: assignee?.name || assignee?.email,
        };
      })
    );
    
    return casesWithUsers;
  },
});

export const getCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const case_ = await ctx.db.get(args.caseId);
    if (!case_) throw new Error("Case not found");
    
    // Get workflow history
    const workflow = await ctx.db
      .query("caseWorkflow")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .collect();
    
    // Get workflow with user names
    const workflowWithUsers = await Promise.all(
      workflow.map(async (w) => {
        const user = await ctx.db.get(w.performedBy);
        return {
          ...w,
          performedByName: user?.name || user?.email,
        };
      })
    );
    
    return {
      ...case_,
      workflow: workflowWithUsers,
    };
  },
});

export const updateCaseStatus = mutation({
  args: {
    caseId: v.id("cases"),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("closed")
    ),
    comments: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const case_ = await ctx.db.get(args.caseId);
    if (!case_) throw new Error("Case not found");
    
    const oldStatus = case_.status;
    
    await ctx.db.patch(args.caseId, {
      status: args.status,
      lastModifiedBy: userId,
    });
    
    // Log workflow action
    await ctx.db.insert("caseWorkflow", {
      caseId: args.caseId,
      fromStatus: oldStatus,
      toStatus: args.status,
      action: `Status changed from ${oldStatus} to ${args.status}`,
      comments: args.comments,
      performedBy: userId,
      timestamp: Date.now(),
    });
    
    // Log audit trail
    await ctx.db.insert("auditLog", {
      entityType: "case",
      entityId: args.caseId,
      action: "UPDATE_STATUS",
      changes: {
        field: "status",
        oldValue: oldStatus,
        newValue: args.status,
      },
      performedBy: userId,
      timestamp: Date.now(),
    });
  },
});

export const assignCase = mutation({
  args: {
    caseId: v.id("cases"),
    assignedTo: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const case_ = await ctx.db.get(args.caseId);
    if (!case_) throw new Error("Case not found");
    
    const oldAssignee = case_.assignedTo;
    
    await ctx.db.patch(args.caseId, {
      assignedTo: args.assignedTo,
      lastModifiedBy: userId,
    });
    
    // Log workflow action
    const assignee = await ctx.db.get(args.assignedTo);
    await ctx.db.insert("caseWorkflow", {
      caseId: args.caseId,
      toStatus: case_.status,
      action: `Case assigned to ${assignee?.name || assignee?.email}`,
      performedBy: userId,
      timestamp: Date.now(),
    });
    
    // Log audit trail
    await ctx.db.insert("auditLog", {
      entityType: "case",
      entityId: args.caseId,
      action: "ASSIGN",
      changes: {
        field: "assignedTo",
        oldValue: oldAssignee || "",
        newValue: args.assignedTo,
      },
      performedBy: userId,
      timestamp: Date.now(),
    });
  },
});

export const searchCases = query({
  args: {
    searchTerm: v.string(),
    filters: v.optional(v.object({
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      productName: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const results = await ctx.db
      .query("cases")
      .withSearchIndex("search_cases", (q) => {
        let query = q.search("adverseEvent", args.searchTerm);
        
        if (args.filters?.status) {
          query = query.eq("status", args.filters.status as any);
        }
        if (args.filters?.priority) {
          query = query.eq("priority", args.filters.priority as any);
        }
        if (args.filters?.productName) {
          query = query.eq("productName", args.filters.productName);
        }
        
        return query;
      })
      .take(20);
    
    return results;
  },
});

export const getCaseStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const allCases = await ctx.db.query("cases").collect();
    
    const stats = {
      total: allCases.length,
      byStatus: {
        draft: allCases.filter(c => c.status === "draft").length,
        submitted: allCases.filter(c => c.status === "submitted").length,
        under_review: allCases.filter(c => c.status === "under_review").length,
        approved: allCases.filter(c => c.status === "approved").length,
        rejected: allCases.filter(c => c.status === "rejected").length,
        closed: allCases.filter(c => c.status === "closed").length,
      },
      byPriority: {
        low: allCases.filter(c => c.priority === "low").length,
        medium: allCases.filter(c => c.priority === "medium").length,
        high: allCases.filter(c => c.priority === "high").length,
        urgent: allCases.filter(c => c.priority === "urgent").length,
      },
      serious: allCases.filter(c => c.seriousness).length,
      thisMonth: allCases.filter(c => {
        const caseDate = new Date(c._creationTime);
        const now = new Date();
        return caseDate.getMonth() === now.getMonth() && 
               caseDate.getFullYear() === now.getFullYear();
      }).length,
    };
    
    return stats;
  },
});
