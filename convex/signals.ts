import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createSignal = mutation({
  args: {
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
    relatedCases: v.array(v.id("cases")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.db.insert("signals", {
      ...args,
      status: "detected",
      createdBy: userId,
    });
  },
});

export const getSignals = query({
  args: {
    status: v.optional(v.string()),
    strength: v.optional(v.string()),
    productName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    let signals;
    
    if (args.status) {
      signals = await ctx.db
        .query("signals")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    } else if (args.strength) {
      signals = await ctx.db
        .query("signals")
        .withIndex("by_strength", (q) => q.eq("strength", args.strength as any))
        .order("desc")
        .collect();
    } else if (args.productName) {
      signals = await ctx.db
        .query("signals")
        .withIndex("by_product", (q) => q.eq("productName", args.productName!))
        .order("desc")
        .collect();
    } else {
      signals = await ctx.db
        .query("signals")
        .order("desc")
        .collect();
    }
    
    // Get creator information
    const signalsWithUsers = await Promise.all(
      signals.map(async (signal) => {
        const creator = await ctx.db.get(signal.createdBy);
        const assignee = signal.assignedTo ? await ctx.db.get(signal.assignedTo) : null;
        
        return {
          ...signal,
          creator: creator?.name || creator?.email,
          assignee: assignee?.name || assignee?.email,
        };
      })
    );
    
    return signalsWithUsers;
  },
});

export const updateSignalStatus = mutation({
  args: {
    signalId: v.id("signals"),
    status: v.union(
      v.literal("detected"),
      v.literal("under_evaluation"),
      v.literal("confirmed"),
      v.literal("refuted"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    await ctx.db.patch(args.signalId, {
      status: args.status,
    });
    
    // Log audit trail
    await ctx.db.insert("auditLog", {
      entityType: "case",
      entityId: args.signalId,
      action: "UPDATE_SIGNAL_STATUS",
      changes: {
        field: "status",
        oldValue: "",
        newValue: args.status,
      },
      performedBy: userId,
      timestamp: Date.now(),
    });
  },
});

export const getSignalStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const signals = await ctx.db.query("signals").collect();
    
    return {
      total: signals.length,
      byStatus: {
        detected: signals.filter(s => s.status === "detected").length,
        under_evaluation: signals.filter(s => s.status === "under_evaluation").length,
        confirmed: signals.filter(s => s.status === "confirmed").length,
        refuted: signals.filter(s => s.status === "refuted").length,
        closed: signals.filter(s => s.status === "closed").length,
      },
      byStrength: {
        weak: signals.filter(s => s.strength === "weak").length,
        moderate: signals.filter(s => s.strength === "moderate").length,
        strong: signals.filter(s => s.strength === "strong").length,
      },
    };
  },
});
