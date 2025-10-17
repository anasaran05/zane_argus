import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const user = await ctx.db.get(userId);
    if (!user) return null;
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    return {
      ...user,
      profile
    };
  },
});

export const createUserProfile = mutation({
  args: {
    role: v.union(
      v.literal("admin"),
      v.literal("safety_officer"),
      v.literal("data_entry"),
      v.literal("reviewer"),
      v.literal("viewer")
    ),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (existingProfile) {
      throw new Error("User profile already exists");
    }
    
    // Define permissions based on role
    const rolePermissions = {
      admin: ["read", "write", "delete", "manage_users", "manage_system"],
      safety_officer: ["read", "write", "review", "approve", "signal_detection"],
      data_entry: ["read", "write"],
      reviewer: ["read", "review"],
      viewer: ["read"]
    };
    
    return await ctx.db.insert("userProfiles", {
      userId,
      role: args.role,
      department: args.department,
      permissions: rolePermissions[args.role],
      isActive: true,
    });
  },
});

export const updateLastLogin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (profile) {
      await ctx.db.patch(profile._id, {
        lastLogin: Date.now(),
      });
    }
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if user has admin permissions
    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (!currentProfile?.permissions.includes("manage_users")) {
      throw new Error("Insufficient permissions");
    }
    
    const profiles = await ctx.db.query("userProfiles").collect();
    const users = await Promise.all(
      profiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return { ...user, profile };
      })
    );
    
    return users;
  },
});
