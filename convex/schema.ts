import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  employees: defineTable({
    id: v.string(),
    name: v.string(),
    email: v.string(),
    passcode: v.optional(v.string()),
    role: v.optional(v.string()),
    department: v.optional(v.string()),
    joinDate: v.optional(v.string()),
    status: v.optional(v.string()),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    gender: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    address: v.optional(v.any()),
    emergencyContact: v.optional(v.any()),
    bankDetails: v.optional(v.any()),
    theme: v.optional(v.string()),
    notificationsEnabled: v.optional(v.boolean()),
    soundEnabled: v.optional(v.boolean()),
    personalEmail: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    bio: v.optional(v.string()),
    createdAt: v.optional(v.any()),
    updatedAt: v.optional(v.any()),
    lastLogin: v.optional(v.any()),
    profileComplete: v.optional(v.any()),
  })
    .index("idx_id", ["id"])
    .index("idx_email", ["email"]),

  tickets: defineTable({
    id: v.string(),
    type: v.optional(v.string()),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
    subject: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdByName: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    assignedToName: v.optional(v.string()),
    department: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    createdAt: v.optional(v.any()),
    updatedAt: v.optional(v.any()),
    resolvedAt: v.optional(v.any()),
    rating: v.optional(v.any()),
  })
    .index("idx_id", ["id"])
    .index("idx_createdAt", ["createdAt"]),

  ticket_comments: defineTable({
    ticketId: v.string(),
    by: v.string(),
    text: v.string(),
    isInternal: v.boolean(),
    at: v.any(),
  }).index("idx_ticketId", ["ticketId"]),

  leaves: defineTable({
    id: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    type: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    reason: v.optional(v.string()),
    status: v.optional(v.string()),
    department: v.optional(v.string()),
    reviewedBy: v.optional(v.string()),
    reviewedByName: v.optional(v.string()),
    reviewedAt: v.optional(v.any()),
    rejectionReason: v.optional(v.string()),
    createdAt: v.optional(v.any()),
    days: v.optional(v.any()),
    halfDay: v.optional(v.any()),
  })
    .index("idx_id", ["id"])
    .index("idx_createdAt", ["createdAt"]),

  activities: defineTable({
    id: v.string(),
    type: v.optional(v.string()),
    message: v.optional(v.string()),
    userId: v.optional(v.string()),
    at: v.optional(v.any()),
  }).index("idx_at", ["at"]),

  announcements: defineTable({
    id: v.string(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdByName: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
    createdAt: v.optional(v.any()),
  })
    .index("idx_id", ["id"])
    .index("idx_createdAt", ["createdAt"]),

  notifications: defineTable({
    id: v.string(),
    type: v.optional(v.string()),
    message: v.optional(v.string()),
    userId: v.optional(v.string()),
    read: v.optional(v.boolean()),
    linkTo: v.optional(v.string()),
    at: v.optional(v.any()),
  })
    .index("idx_id", ["id"])
    .index("idx_at", ["at"]),

  salary_records: defineTable({
    id: v.optional(v.string()),
    uniqueKey: v.string(),
    userId: v.string(),
    month: v.string(),
    baseSalary: v.optional(v.any()),
    bonus: v.optional(v.any()),
    deductions: v.optional(v.any()),
    netSalary: v.optional(v.any()),
    status: v.optional(v.string()),
    paidAt: v.optional(v.any()),
    note: v.optional(v.string()),
  }).index("idx_uniqueKey", ["uniqueKey"]),

  suggestions: defineTable({
    id: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    createdByName: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    adminResponse: v.optional(v.string()),
    upvotes: v.optional(v.any()),
    upvotedBy: v.optional(v.any()),
    createdAt: v.optional(v.any()),
  })
    .index("idx_id", ["id"])
    .index("idx_createdAt", ["createdAt"]),

  referrals: defineTable({
    id: v.string(),
    referredBy: v.optional(v.string()),
    referredByName: v.optional(v.string()),
    candidateName: v.optional(v.string()),
    candidateEmail: v.optional(v.string()),
    candidatePhone: v.optional(v.string()),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
    relation: v.optional(v.string()),
    experience: v.optional(v.string()),
    noticePeriod: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    bonusAmount: v.optional(v.any()),
    createdAt: v.optional(v.any()),
    updatedAt: v.optional(v.any()),
    currentCTC: v.optional(v.any()),
    expectedCTC: v.optional(v.any()),
    linkedinUrl: v.optional(v.string()),
  })
    .index("idx_id", ["id"])
    .index("idx_createdAt", ["createdAt"]),

  holiday_selections: defineTable({
    id: v.string(),
    holidayId: v.string(),
    userId: v.string(),
    selectedAt: v.optional(v.any()),
    holidayName: v.optional(v.string()),
    holidayDate: v.optional(v.string()),
  })
    .index("idx_id", ["id"])
    .index("idx_selectedAt", ["selectedAt"]),
}, { schemaValidation: false });
