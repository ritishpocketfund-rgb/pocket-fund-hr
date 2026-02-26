import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db.query("notifications").collect();
    notifications.sort((a, b) => (b.at || 0) - (a.at || 0));
    return notifications.slice(0, 100);
  },
});

export const create = mutation({
  args: { notification: v.any() },
  handler: async (ctx, { notification }) => {
    await ctx.db.insert("notifications", notification);
  },
});

export const update = mutation({
  args: { id: v.string(), updates: v.any() },
  handler: async (ctx, { id, updates }) => {
    const existing = await ctx.db
      .query("notifications")
      .withIndex("idx_id", (q) => q.eq("id", id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, updates);
    }
  },
});

export const bulkUpdate = mutation({
  args: { ids: v.array(v.string()), updates: v.any() },
  handler: async (ctx, { ids, updates }) => {
    for (const id of ids) {
      const existing = await ctx.db
        .query("notifications")
        .withIndex("idx_id", (q) => q.eq("id", id))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, updates);
      }
    }
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("notifications").collect();
    for (const item of all) await ctx.db.delete(item._id);
  },
});
