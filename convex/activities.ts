import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const activities = await ctx.db.query("activities").collect();
    activities.sort((a, b) => (b.at || 0) - (a.at || 0));
    return activities.slice(0, 200);
  },
});

export const create = mutation({
  args: { activity: v.any() },
  handler: async (ctx, { activity }) => {
    await ctx.db.insert("activities", activity);
  },
});

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("activities").collect();
    for (const item of all) await ctx.db.delete(item._id);
  },
});
