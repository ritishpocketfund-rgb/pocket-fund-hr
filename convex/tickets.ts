import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tickets = await ctx.db.query("tickets").collect();
    tickets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    const allComments = await ctx.db.query("ticket_comments").collect();
    const commentsByTicket = {};
    for (const c of allComments) {
      if (!commentsByTicket[c.ticketId]) {
        commentsByTicket[c.ticketId] = { comments: [], internalNotes: [] };
      }
      const shaped = { by: c.by, text: c.text, at: c.at };
      if (c.isInternal) {
        commentsByTicket[c.ticketId].internalNotes.push(shaped);
      } else {
        commentsByTicket[c.ticketId].comments.push(shaped);
      }
    }

    return tickets.map((t) => ({
      ...t,
      comments: commentsByTicket[t.id]?.comments || [],
      internalNotes: commentsByTicket[t.id]?.internalNotes || [],
    }));
  },
});

export const create = mutation({
  args: { ticket: v.any() },
  handler: async (ctx, { ticket }) => {
    const { comments, internalNotes, ...row } = ticket;
    await ctx.db.insert("tickets", row);
  },
});

export const update = mutation({
  args: { id: v.string(), updates: v.any() },
  handler: async (ctx, { id, updates }) => {
    const existing = await ctx.db
      .query("tickets")
      .withIndex("idx_id", (q) => q.eq("id", id))
      .first();
    if (existing) {
      const { comments, internalNotes, ...row } = updates;
      await ctx.db.patch(existing._id, row);
    }
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db
      .query("tickets")
      .withIndex("idx_id", (q) => q.eq("id", id))
      .first();
    if (existing) {
      const comments = await ctx.db
        .query("ticket_comments")
        .withIndex("idx_ticketId", (q) => q.eq("ticketId", id))
        .collect();
      for (const c of comments) await ctx.db.delete(c._id);
      await ctx.db.delete(existing._id);
    }
  },
});

export const addComment = mutation({
  args: {
    ticketId: v.string(),
    by: v.string(),
    text: v.string(),
    isInternal: v.boolean(),
    at: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ticket_comments", args);
  },
});

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const comments = await ctx.db.query("ticket_comments").collect();
    for (const c of comments) await ctx.db.delete(c._id);
    const tickets = await ctx.db.query("tickets").collect();
    for (const t of tickets) await ctx.db.delete(t._id);
  },
});
