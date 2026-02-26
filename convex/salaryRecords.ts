import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("salary_records").collect();
  },
});

export const upsert = mutation({
  args: { record: v.any() },
  handler: async (ctx, { record }) => {
    const uniqueKey = `${record.userId}-${record.month}`;
    const existing = await ctx.db
      .query("salary_records")
      .withIndex("idx_uniqueKey", (q) => q.eq("uniqueKey", uniqueKey))
      .first();
    const data = { ...record, uniqueKey };
    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("salary_records", data);
    }
  },
});

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("salary_records").collect();
    for (const item of all) await ctx.db.delete(item._id);
  },
});
