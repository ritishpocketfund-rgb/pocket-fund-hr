import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// ============================================================
// Convex HTTP Client (imperative calls, drop-in for Supabase)
// ============================================================
const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  console.error('Missing VITE_CONVEX_URL env var');
}
const client = new ConvexHttpClient(convexUrl);

// Helper to strip Convex internal fields (_id, _creationTime) from results
// so downstream code sees the same shape as Supabase rows
function stripConvexFields(obj) {
  if (!obj) return obj;
  const { _id, _creationTime, ...rest } = obj;
  return rest;
}

function stripAll(arr) {
  return (arr || []).map(stripConvexFields);
}

// ==================== EMPLOYEES ====================

export async function fetchEmployees() {
  const data = await client.query(api.employees.list);
  return stripAll(data);
}

export async function upsertEmployee(emp) {
  await client.mutation(api.employees.upsert, { employee: emp });
}

export async function deleteEmployee(id) {
  await client.mutation(api.employees.remove, { id });
}

// ==================== TICKETS ====================

export async function fetchTickets() {
  const data = await client.query(api.tickets.list);
  return stripAll(data);
}

export async function createTicket(ticket) {
  await client.mutation(api.tickets.create, { ticket });
}

export async function updateTicket(id, updates) {
  await client.mutation(api.tickets.update, { id, updates });
}

export async function deleteTicket(id) {
  await client.mutation(api.tickets.remove, { id });
}

export async function addTicketComment(ticketId, by, text, isInternal, at) {
  await client.mutation(api.tickets.addComment, { ticketId, by, text, isInternal, at });
}

// ==================== LEAVES ====================

export async function fetchLeaves() {
  const data = await client.query(api.leaves.list);
  return stripAll(data);
}

export async function createLeave(leave) {
  await client.mutation(api.leaves.create, { leave });
}

export async function updateLeave(id, updates) {
  await client.mutation(api.leaves.update, { id, updates });
}

// ==================== ACTIVITIES ====================

export async function fetchActivities() {
  const data = await client.query(api.activities.list);
  return stripAll(data);
}

export async function createActivity(activity) {
  await client.mutation(api.activities.create, { activity });
}

// ==================== ANNOUNCEMENTS ====================

export async function fetchAnnouncements() {
  const data = await client.query(api.announcements.list);
  return stripAll(data);
}

export async function createAnnouncement(ann) {
  await client.mutation(api.announcements.create, { announcement: ann });
}

export async function updateAnnouncement(id, updates) {
  await client.mutation(api.announcements.update, { id, updates });
}

export async function deleteAnnouncement(id) {
  await client.mutation(api.announcements.remove, { id });
}

// ==================== NOTIFICATIONS ====================

export async function fetchNotifications() {
  const data = await client.query(api.notifications.list);
  return stripAll(data);
}

export async function createNotification(notif) {
  await client.mutation(api.notifications.create, { notification: notif });
}

export async function updateNotification(id, updates) {
  await client.mutation(api.notifications.update, { id, updates });
}

export async function bulkUpdateNotifications(ids, updates) {
  await client.mutation(api.notifications.bulkUpdate, { ids, updates });
}

export async function clearAllNotifications() {
  await client.mutation(api.notifications.clearAll);
}

// ==================== SALARY RECORDS ====================

export async function fetchSalaryRecords() {
  const data = await client.query(api.salaryRecords.list);
  return stripAll(data);
}

export async function upsertSalaryRecord(record) {
  await client.mutation(api.salaryRecords.upsert, { record });
}

// ==================== SUGGESTIONS ====================

export async function fetchSuggestions() {
  const data = await client.query(api.suggestions.list);
  return stripAll(data);
}

export async function createSuggestion(sug) {
  await client.mutation(api.suggestions.create, { suggestion: sug });
}

export async function updateSuggestion(id, updates) {
  await client.mutation(api.suggestions.update, { id, updates });
}

export async function deleteSuggestion(id) {
  await client.mutation(api.suggestions.remove, { id });
}

// ==================== REFERRALS ====================

export async function fetchReferrals() {
  const data = await client.query(api.referrals.list);
  return stripAll(data);
}

export async function createReferral(ref) {
  await client.mutation(api.referrals.create, { referral: ref });
}

export async function updateReferral(id, updates) {
  await client.mutation(api.referrals.update, { id, updates });
}

export async function deleteReferral(id) {
  await client.mutation(api.referrals.remove, { id });
}

// ==================== HOLIDAY SELECTIONS ====================

export async function fetchHolidaySelections() {
  const data = await client.query(api.holidaySelections.list);
  return stripAll(data);
}

export async function createHolidaySelection(sel) {
  await client.mutation(api.holidaySelections.create, { selection: sel });
}

export async function deleteHolidaySelection(id) {
  await client.mutation(api.holidaySelections.remove, { id });
}

export async function replaceHolidaySelections(selections) {
  await client.mutation(api.holidaySelections.replaceAll, { selections });
}

// ==================== RESET ALL DATA ====================
// Replaces the direct supabase.from(...).delete() calls in App.jsx
export async function resetAllData() {
  await client.mutation(api.tickets.deleteAll);
  await client.mutation(api.leaves.deleteAll);
  await client.mutation(api.activities.deleteAll);
  await client.mutation(api.announcements.deleteAll);
  await client.mutation(api.notifications.clearAll);
  await client.mutation(api.salaryRecords.deleteAll);
  await client.mutation(api.suggestions.deleteAll);
  await client.mutation(api.referrals.deleteAll);
  await client.mutation(api.holidaySelections.deleteAll);
}

// ==================== SESSION (localStorage — unchanged) ====================

export function getCurrentUser() {
  try {
    const val = localStorage.getItem('pocketfund-currentuser');
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem('pocketfund-currentuser', JSON.stringify(user));
    } else {
      localStorage.removeItem('pocketfund-currentuser');
    }
  } catch (e) { console.error('setCurrentUser:', e); }
}

export function clearCurrentUser() {
  try { localStorage.removeItem('pocketfund-currentuser'); } catch {}
}
