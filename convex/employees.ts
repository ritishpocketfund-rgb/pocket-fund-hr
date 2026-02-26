import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("employees").collect();
  },
});

export const upsert = mutation({
  args: { employee: v.any() },
  handler: async (ctx, { employee }) => {
    const existing = await ctx.db
      .query("employees")
      .withIndex("idx_id", (q) => q.eq("id", employee.id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, employee);
    } else {
      await ctx.db.insert("employees", employee);
    }
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db
      .query("employees")
      .withIndex("idx_id", (q) => q.eq("id", id))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    const tickets = await ctx.db
      .query("tickets")
      .filter((q) => q.eq(q.field("createdBy"), id))
      .collect();
    for (const t of tickets) {
      const comments = await ctx.db
        .query("ticket_comments")
        .withIndex("idx_ticketId", (q) => q.eq("ticketId", t.id))
        .collect();
      for (const c of comments) await ctx.db.delete(c._id);
      await ctx.db.delete(t._id);
    }
    const leaves = await ctx.db
      .query("leaves")
      .filter((q) => q.eq(q.field("userId"), id))
      .collect();
    for (const l of leaves) await ctx.db.delete(l._id);
  },
});
