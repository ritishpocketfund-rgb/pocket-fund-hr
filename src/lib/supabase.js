import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// DATA ACCESS LAYER — Proper Supabase tables
// Each entity has fetch / create / update / upsert / delete
// Returns data shaped exactly like the old JSON blobs so
// App.jsx components need zero changes.
// ============================================================

// ==================== EMPLOYEES ====================

export async function fetchEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('id');
  if (error) { console.error('fetchEmployees:', error); return []; }
  return data || [];
}

export async function upsertEmployee(emp) {
  const { error } = await supabase
    .from('employees')
    .upsert(emp, { onConflict: 'id' });
  if (error) console.error('upsertEmployee:', error);
}

export async function deleteEmployee(id) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteEmployee:', error);
}

// ==================== TICKETS ====================

export async function fetchTickets() {
  // Fetch tickets
  const { data: tickets, error: tErr } = await supabase
    .from('tickets')
    .select('*')
    .order('createdAt', { ascending: false });
  if (tErr) { console.error('fetchTickets:', tErr); return []; }
  if (!tickets || tickets.length === 0) return [];

  // Fetch all comments for these tickets
  const ticketIds = tickets.map(t => t.id);
  const { data: comments, error: cErr } = await supabase
    .from('ticket_comments')
    .select('*')
    .in('ticketId', ticketIds)
    .order('at', { ascending: true });
  if (cErr) console.error('fetchTicketComments:', cErr);

  // Group comments onto tickets
  const commentsByTicket = {};
  (comments || []).forEach(c => {
    if (!commentsByTicket[c.ticketId]) commentsByTicket[c.ticketId] = { comments: [], internalNotes: [] };
    const shaped = { by: c.by, text: c.text, at: c.at };
    if (c.isInternal) {
      commentsByTicket[c.ticketId].internalNotes.push(shaped);
    } else {
      commentsByTicket[c.ticketId].comments.push(shaped);
    }
  });

  return tickets.map(t => ({
    ...t,
    comments: commentsByTicket[t.id]?.comments || [],
    internalNotes: commentsByTicket[t.id]?.internalNotes || [],
  }));
}

export async function createTicket(ticket) {
  // Separate comments/internalNotes from ticket row
  const { comments, internalNotes, ...row } = ticket;
  const { error } = await supabase.from('tickets').insert(row);
  if (error) console.error('createTicket:', error);
}

export async function updateTicket(id, updates) {
  // Don't send comments/internalNotes to tickets table
  const { comments, internalNotes, ...row } = updates;
  const { error } = await supabase.from('tickets').update(row).eq('id', id);
  if (error) console.error('updateTicket:', error);
}

export async function deleteTicket(id) {
  // CASCADE will delete comments too
  const { error } = await supabase.from('tickets').delete().eq('id', id);
  if (error) console.error('deleteTicket:', error);
}

export async function addTicketComment(ticketId, by, text, isInternal, at) {
  const { error } = await supabase.from('ticket_comments').insert({
    ticketId, by, text, isInternal, at,
  });
  if (error) console.error('addTicketComment:', error);
}

// ==================== LEAVES ====================

export async function fetchLeaves() {
  const { data, error } = await supabase
    .from('leaves')
    .select('*')
    .order('createdAt', { ascending: false });
  if (error) { console.error('fetchLeaves:', error); return []; }
  return data || [];
}

export async function createLeave(leave) {
  const { error } = await supabase.from('leaves').insert(leave);
  if (error) console.error('createLeave:', error);
}

export async function updateLeave(id, updates) {
  const { error } = await supabase.from('leaves').update(updates).eq('id', id);
  if (error) console.error('updateLeave:', error);
}

// ==================== ACTIVITIES ====================

export async function fetchActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('at', { ascending: false })
    .limit(200);
  if (error) { console.error('fetchActivities:', error); return []; }
  return data || [];
}

export async function createActivity(activity) {
  const { error } = await supabase.from('activities').insert(activity);
  if (error) console.error('createActivity:', error);
}

// ==================== ANNOUNCEMENTS ====================

export async function fetchAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('createdAt', { ascending: false });
  if (error) { console.error('fetchAnnouncements:', error); return []; }
  return data || [];
}

export async function createAnnouncement(ann) {
  const { error } = await supabase.from('announcements').insert(ann);
  if (error) console.error('createAnnouncement:', error);
}

export async function updateAnnouncement(id, updates) {
  const { error } = await supabase.from('announcements').update(updates).eq('id', id);
  if (error) console.error('updateAnnouncement:', error);
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) console.error('deleteAnnouncement:', error);
}

// ==================== NOTIFICATIONS ====================

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('at', { ascending: false })
    .limit(100);
  if (error) { console.error('fetchNotifications:', error); return []; }
  return data || [];
}

export async function createNotification(notif) {
  const { error } = await supabase.from('notifications').insert(notif);
  if (error) console.error('createNotification:', error);
}

export async function updateNotification(id, updates) {
  const { error } = await supabase.from('notifications').update(updates).eq('id', id);
  if (error) console.error('updateNotification:', error);
}

export async function bulkUpdateNotifications(ids, updates) {
  const { error } = await supabase.from('notifications').update(updates).in('id', ids);
  if (error) console.error('bulkUpdateNotifications:', error);
}

export async function clearAllNotifications() {
  const { error } = await supabase.from('notifications').delete().neq('id', '');
  if (error) console.error('clearAllNotifications:', error);
}

// ==================== SALARY RECORDS ====================

export async function fetchSalaryRecords() {
  const { data, error } = await supabase
    .from('salary_records')
    .select('*');
  if (error) { console.error('fetchSalaryRecords:', error); return []; }
  return data || [];
}

export async function upsertSalaryRecord(record) {
  const { error } = await supabase
    .from('salary_records')
    .upsert(record, { onConflict: 'userId,month' });
  if (error) console.error('upsertSalaryRecord:', error);
}

// ==================== SUGGESTIONS ====================

export async function fetchSuggestions() {
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .order('createdAt', { ascending: false });
  if (error) { console.error('fetchSuggestions:', error); return []; }
  return data || [];
}

export async function createSuggestion(sug) {
  const { error } = await supabase.from('suggestions').insert(sug);
  if (error) console.error('createSuggestion:', error);
}

export async function updateSuggestion(id, updates) {
  const { error } = await supabase.from('suggestions').update(updates).eq('id', id);
  if (error) console.error('updateSuggestion:', error);
}

export async function deleteSuggestion(id) {
  const { error } = await supabase.from('suggestions').delete().eq('id', id);
  if (error) console.error('deleteSuggestion:', error);
}

// ==================== REFERRALS ====================

export async function fetchReferrals() {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .order('createdAt', { ascending: false });
  if (error) { console.error('fetchReferrals:', error); return []; }
  return data || [];
}

export async function createReferral(ref) {
  const { error } = await supabase.from('referrals').insert(ref);
  if (error) console.error('createReferral:', error);
}

export async function updateReferral(id, updates) {
  const { error } = await supabase.from('referrals').update(updates).eq('id', id);
  if (error) console.error('updateReferral:', error);
}

export async function deleteReferral(id) {
  const { error } = await supabase.from('referrals').delete().eq('id', id);
  if (error) console.error('deleteReferral:', error);
}

// ==================== HOLIDAY SELECTIONS ====================

export async function fetchHolidaySelections() {
  const { data, error } = await supabase
    .from('holiday_selections')
    .select('*')
    .order('selectedAt', { ascending: false });
  if (error) { console.error('fetchHolidaySelections:', error); return []; }
  return data || [];
}

export async function createHolidaySelection(sel) {
  const { error } = await supabase.from('holiday_selections').insert(sel);
  if (error) console.error('createHolidaySelection:', error);
}

export async function deleteHolidaySelection(id) {
  const { error } = await supabase.from('holiday_selections').delete().eq('id', id);
  if (error) console.error('deleteHolidaySelection:', error);
}

export async function replaceHolidaySelections(selections) {
  // Delete all then re-insert — simple approach for bulk save
  const { error: delErr } = await supabase.from('holiday_selections').delete().neq('id', '');
  if (delErr) { console.error('clearHolidaySelections:', delErr); return; }
  if (selections.length > 0) {
    const { error: insErr } = await supabase.from('holiday_selections').insert(selections);
    if (insErr) console.error('insertHolidaySelections:', insErr);
  }
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
