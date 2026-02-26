import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const selections = await ctx.db.query("holiday_selections").collect();
    selections.sort((a, b) => (b.selectedAt || 0) - (a.selectedAt || 0));
    return selections;
  },
});

export const create = mutation({
  args: { selection: v.any() },
  handler: async (ctx, { selection }) => {
    await ctx.db.insert("holiday_selections", selection);
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db
      .query("holiday_selections")
      .withIndex("idx_id", (q) => q.eq("id", id))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const replaceAll = mutation({
  args: { selections: v.array(v.any()) },
  handler: async (ctx, { selections }) => {
    const all = await ctx.db.query("holiday_selections").collect();
    for (const item of all) await ctx.db.delete(item._id);
    for (const sel of selections) {
      await ctx.db.insert("holiday_selections", sel);
    }
  },
});

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("holiday_selections").collect();
    for (const item of all) await ctx.db.delete(item._id);
  },
});
