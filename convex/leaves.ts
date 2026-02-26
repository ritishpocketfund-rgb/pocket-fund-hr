import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const leaves = await ctx.db.query("leaves").collect();
    leaves.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return leaves;
  },
});

export const create = mutation({
  args: { leave: v.any() },
  handler: async (ctx, { leave }) => {
    await ctx.db.insert("leaves", leave);
  },
});

export const update = mutation({
  args: { id: v.string(), updates: v.any() },
  handler: async (ctx, { id, updates }) => {
    const existing = await ctx.db
      .query("leaves")
      .withIndex("idx_id", (q) => q.eq("id", id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, updates);
    }
  },
});

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("leaves").collect();
    for (const item of all) await ctx.db.delete(item._id);
  },
});
