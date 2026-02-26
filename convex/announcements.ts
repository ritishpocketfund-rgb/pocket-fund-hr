import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const announcements = await ctx.db.query("announcements").collect();
    announcements.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return announcements;
  },
});

export const create = mutation({
  args: { announcement: v.any() },
  handler: async (ctx, { announcement }) => {
    await ctx.db.insert("announcements", announcement);
  },
});

export const update = mutation({
  args: { id: v.string(), updates: v.any() },
  handler: async (ctx, { id, updates }) => {
    const existing = await ctx.db
      .query("announcements")
      .withIndex("idx_id", (q) => q.eq("id", id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, updates);
    }
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db
      .query("announcements")
      .withIndex("idx_id", (q) => q.eq("id", id))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("announcements").collect();
    for (const item of all) await ctx.db.delete(item._id);
  },
});
