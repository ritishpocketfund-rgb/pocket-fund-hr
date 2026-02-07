import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Bell, Search, Plus, Filter, Clock, AlertCircle, CheckCircle2, MessageSquare, Calendar, Users, TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal, Send, X, ChevronDown, LogOut, User, Settings, Paperclip, Eye, EyeOff, RefreshCw, Trash2, Edit3, Check, AlertTriangle, Home, FileText, BarChart3, UserCheck, Mail, Lock, Megaphone, BellRing, Pin, Archive, Volume2, VolumeX, Moon, Sun, Palette, Shield, ChevronRight, Star, Globe, Briefcase, Wallet, IndianRupee, CircleDot, Wifi, WifiOff, Sparkles, Bot, MessageCircle, Phone, MapPin, Building, CreditCard, Heart, Camera, ChevronLeft, Upload, Image, Coffee } from 'lucide-react';
import { storage } from './lib/supabase';

// ============ UTILITY FUNCTIONS ============
const generateId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

// Allowed email domains for signup
const ALLOWED_DOMAINS = ['pocket-fund.com', 'pocketfund.org'];

// ============ INITIAL DATA ============
const DEPARTMENTS = ['Business Analyst', 'Marketing', 'Tech', 'HR', 'Admin', 'Finance', 'Other'];
const TICKET_TYPES = ['Complaint', 'Suggestion', 'General Query'];
const TICKET_CATEGORIES = ['HR', 'Payroll', 'Tech/Tools', 'Operations', 'Management', 'Work Culture', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const TICKET_STATUSES = ['Open', 'In Review', 'In Progress', 'Waiting for Employee', 'Resolved', 'Closed'];
const LEAVE_TYPES = ['Personal Leave', 'Sick Leave', 'Exam Leave', 'Unpaid Leave', 'Emergency Leave'];
const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected'];
const ANNOUNCEMENT_PRIORITIES = ['Normal', 'Important', 'Urgent'];
const ANNOUNCEMENT_CATEGORIES = ['General', 'Policy Update', 'Event', 'Maintenance', 'Achievement', 'Reminder'];
const NOTIFICATION_TYPES = ['ticket_update', 'leave_update', 'announcement', 'comment', 'assignment', 'system', 'salary_update', 'referral_update'];
const REFERRAL_STATUSES = ['Submitted', 'Under Review', 'Interview', 'Selected', 'Joined', 'Completed 6 Months', 'Bonus Paid', 'Rejected'];
const REFERRAL_RELATIONS = ['Friend', 'Ex-Colleague', 'College Mate', 'Family', 'Professional Network', 'Other'];
const NOTICE_PERIODS = ['Immediate', '15 Days', '1 Month', '2 Months', '3 Months', 'Currently Serving'];

// ============ 2026 HOLIDAY CALENDAR ============
const MAX_OPTIONAL_HOLIDAYS = 5;

const FIXED_HOLIDAYS_2026 = [
  { id: 'FH-1', name: "New Year's Day", date: '2026-01-01', day: 'Thursday' },
  { id: 'FH-2', name: 'Republic Day', date: '2026-01-26', day: 'Monday' },
  { id: 'FH-3', name: 'Holi', date: '2026-03-04', day: 'Wednesday' },
  { id: 'FH-4', name: 'Maharashtra Day', date: '2026-05-01', day: 'Friday' },
  { id: 'FH-5', name: 'Independence Day', date: '2026-08-15', day: 'Saturday' },
];

const OPTIONAL_HOLIDAYS_2026 = [
  { id: 'OH-1', name: 'Eid al-Fitr', date: '2026-03-20', day: 'Friday', note: 'Date may vary' },
  { id: 'OH-2', name: 'Gudi Padwa', date: '2026-03-20', day: 'Friday' },
  { id: 'OH-3', name: 'Raksha Bandhan', date: '2026-08-19', day: 'Wednesday' },
  { id: 'OH-4', name: 'Janmashtami', date: '2026-08-22', day: 'Saturday' },
  { id: 'OH-5', name: 'Ganesh Chaturthi', date: '2026-09-15', day: 'Tuesday' },
  { id: 'OH-6', name: 'Gandhi Jayanti', date: '2026-10-02', day: 'Friday' },
  { id: 'OH-7', name: 'Vijaya Dashami (Dussehra)', date: '2026-10-21', day: 'Wednesday' },
  { id: 'OH-8', name: 'Diwali Holiday (Day 1)', date: '2026-11-09', day: 'Monday' },
  { id: 'OH-9', name: 'Diwali Holiday (Day 2)', date: '2026-11-10', day: 'Tuesday' },
  { id: 'OH-10', name: 'Christmas Day', date: '2026-12-25', day: 'Friday' },
];

const ALL_HOLIDAYS_2026 = [
  ...FIXED_HOLIDAYS_2026.map(h => ({ ...h, type: 'fixed' })),
  ...OPTIONAL_HOLIDAYS_2026.map(h => ({ ...h, type: 'optional' })),
].sort((a, b) => new Date(a.date) - new Date(b.date));

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry','Jammu & Kashmir','Ladakh'];

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'UAE', 'Japan', 'South Korea', 'Netherlands', 'Ireland', 'New Zealand', 'Other'];

const COUNTRY_STATES = {
  'India': INDIAN_STATES,
  'United States': ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming','District of Columbia'],
  'United Kingdom': ['England','Scotland','Wales','Northern Ireland'],
  'Canada': ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan','Northwest Territories','Nunavut','Yukon'],
  'Australia': ['New South Wales','Victoria','Queensland','South Australia','Western Australia','Tasmania','Australian Capital Territory','Northern Territory'],
  'Germany': ['Baden-Württemberg','Bavaria','Berlin','Brandenburg','Bremen','Hamburg','Hesse','Lower Saxony','Mecklenburg-Vorpommern','North Rhine-Westphalia','Rhineland-Palatinate','Saarland','Saxony','Saxony-Anhalt','Schleswig-Holstein','Thuringia'],
  'France': ['Île-de-France','Provence-Alpes-Côte d\'Azur','Auvergne-Rhône-Alpes','Nouvelle-Aquitaine','Occitanie','Hauts-de-France','Grand Est','Pays de la Loire','Brittany','Normandy','Burgundy-Franche-Comté','Centre-Val de Loire','Corsica'],
  'Singapore': ['Central Region','East Region','North Region','North-East Region','West Region'],
  'UAE': ['Abu Dhabi','Dubai','Sharjah','Ajman','Umm Al Quwain','Ras Al Khaimah','Fujairah'],
  'Japan': ['Tokyo','Osaka','Kyoto','Hokkaido','Aichi','Fukuoka','Kanagawa','Hyogo','Saitama','Chiba'],
  'South Korea': ['Seoul','Busan','Incheon','Daegu','Daejeon','Gwangju','Ulsan','Sejong','Gyeonggi','Jeju'],
  'Netherlands': ['North Holland','South Holland','Utrecht','North Brabant','Gelderland','Overijssel','Limburg','Flevoland','Groningen','Friesland','Drenthe','Zeeland'],
  'Ireland': ['Dublin','Cork','Galway','Limerick','Waterford','Kerry','Wicklow','Donegal','Mayo','Clare','Kildare','Meath','Tipperary'],
  'New Zealand': ['Auckland','Wellington','Canterbury','Waikato','Bay of Plenty','Manawatu-Wanganui','Otago','Hawke\'s Bay','Taranaki','Northland','Southland'],
};

const COUNTRY_POSTAL_CONFIG = {
  'India': { label: 'Pincode', placeholder: '6-digit pincode', maxLen: 6, regex: /\D/g },
  'United States': { label: 'ZIP Code', placeholder: '5-digit ZIP', maxLen: 5, regex: /\D/g },
  'United Kingdom': { label: 'Postcode', placeholder: 'e.g. SW1A 1AA', maxLen: 8, regex: /[^A-Za-z0-9 ]/g },
  'Canada': { label: 'Postal Code', placeholder: 'e.g. K1A 0B1', maxLen: 7, regex: /[^A-Za-z0-9 ]/g },
  'Australia': { label: 'Postcode', placeholder: '4-digit', maxLen: 4, regex: /\D/g },
  'Germany': { label: 'PLZ', placeholder: '5-digit', maxLen: 5, regex: /\D/g },
  'France': { label: 'Code Postal', placeholder: '5-digit', maxLen: 5, regex: /\D/g },
  'Singapore': { label: 'Postal Code', placeholder: '6-digit', maxLen: 6, regex: /\D/g },
  'UAE': { label: 'P.O. Box', placeholder: 'P.O. Box number', maxLen: 10, regex: /\D/g },
  'Japan': { label: 'Postal Code', placeholder: '7-digit', maxLen: 8, regex: /[^0-9-]/g },
  'South Korea': { label: 'Postal Code', placeholder: '5-digit', maxLen: 5, regex: /\D/g },
  'Netherlands': { label: 'Postcode', placeholder: 'e.g. 1234 AB', maxLen: 7, regex: /[^A-Za-z0-9 ]/g },
  'Ireland': { label: 'Eircode', placeholder: 'e.g. D02 AF30', maxLen: 7, regex: /[^A-Za-z0-9 ]/g },
  'New Zealand': { label: 'Postcode', placeholder: '4-digit', maxLen: 4, regex: /\D/g },
};
const getPostalConfig = (country) => COUNTRY_POSTAL_CONFIG[country] || { label: 'Postal Code', placeholder: 'Postal/ZIP code', maxLen: 10, regex: /[^A-Za-z0-9 -]/g };
const getStatesForCountry = (country) => COUNTRY_STATES[country] || [];

// Default extended profile fields
const DEFAULT_EXTENDED_PROFILE = {
  gender: '',
  dob: '',
  phone: '',
  profilePhoto: '',
  address: { line1: '', landmark: '', city: '', state: '', pincode: '', country: 'India' },
  emergencyContact: { name: '', phone: '', relation: '' },
  bankDetails: { holderName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' },
};

// Salary / Stipend status values
const SALARY_STATUSES = ['Not Processed', 'In Progress', 'Delayed', 'Processed', 'On Hold'];
const SALARY_STATUS_CONFIG = {
  'Not Processed': { color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: "Payroll hasn't started yet" },
  'In Progress':   { color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'HR has started processing payments' },
  'Delayed':       { color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Payment is delayed' },
  'Processed':     { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Payment completed' },
  'On Hold':       { color: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-400', label: 'Payment on hold — contact HR' },
};

// Pre-registered users with 6-digit passcodes
const INITIAL_EMPLOYEES = [
  { id: 'ADMIN-001', name: 'Pocket Fund Admin', email: 'hello@pocket-fund.com', passcode: '920537', dept: 'Management', role: 'admin', profileComplete: true, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-001', name: 'Aabhas', email: 'aabhas@pocketfund.org', passcode: '847291', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-002', name: 'Anmol', email: 'anmol@pocketfund.org', passcode: '362518', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-003', name: 'Aryan Solanki', email: 'aryan.solanki@pocketfund.org', passcode: '591734', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-004', name: 'Darshana', email: 'darshana@pocketfund.org', passcode: '428163', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-005', name: 'Aum', email: 'aum@pocket-fund.com', passcode: '735926', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-006', name: 'Dev', email: 'dev@pocket-fund.com', passcode: '614852', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-007', name: 'Ganesh', email: 'ganesh@pocketfund.org', passcode: '283947', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-008', name: 'Harish', email: 'harish@pocketfund.org', passcode: '952361', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-009', name: 'Kavya', email: 'kavya@pocketfund.org', passcode: '174639', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-010', name: 'Manas', email: 'manas@pocketfund.org', passcode: '839274', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-011', name: 'Neil', email: 'neil@pocketfund.org', passcode: '461582', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-012', name: 'Pushkar', email: 'pushkar@pocketfund.org', passcode: '527193', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-013', name: 'Raghav', email: 'raghav@pocketfund.org', passcode: '698415', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-014', name: 'Rahul', email: 'rahul@pocketfund.org', passcode: '345876', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-015', name: 'Ritish', email: 'ritish@pocketfund.org', passcode: '713248', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-016', name: 'Rizwan', email: 'rizwan@pocketfund.org', passcode: '256934', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-017', name: 'Sellers', email: 'sellers@pocketfund.org', passcode: '482617', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
  { id: 'EMP-018', name: 'Siddhant', email: 'siddhant@pocketfund.org', passcode: '591843', dept: '', role: 'employee', profileComplete: false, leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 }, settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' } },
];

const createInitialTickets = () => {
  return [];
};

const createInitialLeaves = () => {
  return [];
};

const createInitialActivities = () => {
  return [];
};

const createInitialAnnouncements = () => {
  return [];
};

const createInitialNotifications = () => {
  return [];
};

const createInitialSalaryRecords = () => {
  return [];
};

// Helper: get month string like "January 2026"
const getMonthString = (date = new Date()) => {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

// Helper: get month key like "2026-01" for data storage
const getMonthKey = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// Generate month options (current + past 5 months)
const getMonthOptions = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: getMonthKey(d), label: getMonthString(d) });
  }
  return months;
};

// ============ AI HELPER ============
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

const POCKET_FUND_HR_POLICY = `
POCKET FUND — Internal Policies & Compliance Framework
Effective Date: 24 November 2025
Approved By: Dev Shah — Founder, SKATECULTURE WEAR LLP (Pocket Fund)
Applies To: All employees, interns, contractors, remote/on-site/hybrid staff
Office: Jade Office, B-2, Madhu Estate, Lower Parel, Mumbai, Maharashtra 400013

=== WORK MODE & ATTENDANCE POLICY ===
Working days: Monday to Saturday. Alternate Saturdays will be working, as communicated in the monthly schedule.
Minimum 6-7 productive hours per working day expected.
All team members must remain reachable during official working hours unless approved otherwise.

Work Modes:
- On-Site: Mandatory physical presence in Mumbai office as per schedule.
- Remote: Work from off-site location with full online availability.
- Hybrid: Combination of remote and on-site days, pre-approved by team lead or founder.
Employees/interns may NOT unilaterally change their work mode without prior approval.

Attendance Tracking via Jibble (Mobile Version):
- Face Recognition + Location Tracking is compulsory for all modes.
- Clock-In and Clock-Out must be done in real time.
- Manual entries strictly prohibited unless pre-approved.
- Incorrect location or device tampering = invalid attendance.
Jibble Violation Policy:
- 1st Instance: Warning
- 2nd Instance: Deduction equal to one full working day from stipend/salary
- Further: Additional pay cuts per instance
- Intentional misuse (falsifying location, face data, altering hours) = disciplinary action including possible immediate removal.

Manual Entry, Missed Punches & Misconduct (compliance breaches):
- Manually updating entries without approval
- Purposely missing clock-in/out
- Falsifying location or face-recognition data
- Editing working hours to inflate attendance
Consequences: Warning → Formal performance review → Termination. Severe misconduct = immediate removal.

=== LEAVE, ABSENCE & HOLIDAY POLICY ===
Leave Categories:
- Personal Leave: 1 per month. Only for genuine commitments (weddings, family medical emergencies, unavoidable personal matters). NOT for casual gatherings, social events, or non-urgent plans.
- Sick Leave: 1 per month. Onsite = work from home. Remote = half day. Full day requires valid doctor's note.
- Exam Leave: As needed, with proof of exam (compulsory upload).
- Unpaid Leave: Available anytime, no limit.
- Emergency Leave: Case by case, needs founder approval.

Leave Rules:
- All leave requests MUST be submitted through the Pocket Fund Dashboard only.
- No leave requests via email, Slack, WhatsApp, phone, or personal messages will be accepted.
- Request leave at least 24 hours in advance (except emergencies).
- Leave balances reset at end of each month. No carry forward.
- Uninformed absence = Leave Without Pay (LWP) + misconduct.
- A leave is considered paid only if: prior approval + valid reason + doctor's note for sick leave where applicable.
- If no approval reply, the leave is NOT approved.
- Any leave taken without approval = unpaid.

=== OUTREACH PLATFORM & DAILY LOG COMPLIANCE ===
The Outreach Platform is a core operational system. All analysts and interns must:
- Log all outreach activity on the same working day
- Update outreach status (sent, replied, follow-up, pipeline) accurately
- Submit the Daily Log every working day without exception
Failure = non-performance, not a technical issue.

Daily Log is non-negotiable and directly linked to performance evaluation and stipend eligibility.
No assumptions, backdated entries, or bulk updates accepted.

Minimum Daily Outreach: 10 verified reachouts per working day.
Valid reachout criteria: logged same day, includes platform (LinkedIn/Gmail/X/Instagram), status marked as Sent, not a duplicate.
Does NOT count: drafted but unsent, duplicates, backdated/bulk entries, incomplete entries, no proper status.

Pay Cut for non-compliance:
- 1st Instance: Formal warning
- 2nd Instance: Stipend deduction = one full working day
- Repeated: Additional pay cuts per Policy Violation & Pay Cut Framework
No excuses accepted (forgetting, workload, internet issues without prior communication).

If facing technical issues, access problems, or platform confusion: inform Dev or Aum immediately, same day. Silence = non-compliance.

=== CODE OF CONDUCT ===
- Treat all colleagues, founders, sellers, clients, and external partners with respect.
- Harassment, discrimination, or misconduct = disciplinary action.
- Maintain integrity in communication, reporting, and representation.
- Represent Pocket Fund professionally across all interactions.
- No use of company name, brand, email, or assets without approval.
- Public statements, social media posts, or press interactions must be pre-approved.

=== CONFIDENTIALITY & DATA HANDLING ===
Confidential information includes: seller data, MRR, financials, Stripe screenshots, client lists, deal sheets, LOIs, NDAs, internal processes, Notion databases, research files, employee/org data.
- Do not share/disclose to unauthorised persons.
- Only access files necessary for your role.
- No personal storage of company data without approval.
- Use only approved platforms (Notion, Slack, Teams, GDrive).
- Passwords must not be shared.
Breach = immediate termination + legal action under Indian Contract Law, IT Act, and LLP Agreements.

=== DELIVERABLES & PERFORMANCE REVIEW ===
Tasks assigned via Slack, Notion, or Teams with expected deliverables, deadlines, and quality benchmarks.
Performance criteria: output quality, consistency, accountability, communication, initiative.
Review: Weekly updates mandatory, monthly review with team lead/founder. Underperformance may lead to PIP.

=== DEVICE & TOOLS USAGE ===
Approved tools: Email, Slack, Notion, Google Workspace, Microsoft Teams, Internal systems.
Personal devices must be secure and updated. Company accounts must not be shared. No unauthorised recordings.

=== STIPEND & PAYMENT POLICY ===
Payment cycle: 1st-7th of each month for previous month.
Eligibility based on: attendance, task completion, behaviour, quality, overall performance.
Deductions for: poor attendance, low performance/minimum outreach, policy violations, repeated delays, wrong Jibble entries, misuse of tools.
Structure: 1st mistake = warning, 2nd = one working day deduction, further = continued pay cuts per violation count.

=== POLICY VIOLATION & PAY CUT FRAMEWORK ===
Violation categories: attendance, Jibble misuse, delayed/incomplete work, poor communication, behavioural misconduct, confidentiality breach, failure to follow instructions.
Deductions based on: severity, frequency, impact on team, monthly performance.
Possible: warning → one-day deduction → percentage-based (5-35%) → complete stipend hold (severe breaches).
Non-negotiable violations (immediate termination): data mishandling, fake clock-ins, attendance tampering, sharing confidential info.

=== MONTHLY BONUS & RECOGNITION ===
One team member selected monthly based on: attendance quality, performance, consistency, Jibble accuracy, initiative, policy compliance.
Rewards: company gifts, branded merchandise, monetary vouchers, shopping vouchers.
All active employees/interns/analysts eligible. Policy violations during month = disqualification.
Winners announced last week of following month on Slack/official channels.

=== REFERRAL POLICY ===
Refer a candidate → if they join, perform well, stay 6 months → referral bonus up to Rs 25,000.
Must be new applicant not in pipeline. Bonus processed after 6 months + HR verification. First referral gets priority.

=== INTERNSHIP & CONFIRMATION ===
Defined start/end dates, weekly hour commitment, conversion depends on performance.
Exit: log out all apps, transfer files/access, delete confidential data from personal devices, return assets, complete exit clearance. Failure = stipend withheld.

=== TRAVEL & REIMBURSEMENT ===
Only for on-site employees/interns. Remote/hybrid not eligible unless assigned by founder.
Approved transport: Bus, Local Train, Metro only.
NOT covered: Cab (Uber/Ola), Auto, Taxi, personal vehicle fuel, premium travel.
Requires: original ticket/receipt, date and route, attendance report.
Monthly limit: Rs 1,500. Above requires prior written approval.
Processing: 5-6 working days after valid proof submission.
Fraudulent/inflated claims = disciplinary action.
`;

const callClaude = async (systemPrompt, userMessage) => {
  if (!ANTHROPIC_API_KEY) {
    return 'AI features require an Anthropic API key. Add VITE_ANTHROPIC_API_KEY to your .env file.';
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
    const data = await res.json();
    return data.content?.map(b => b.text || '').join('\n') || 'No response.';
  } catch (e) {
    console.error('Claude API error:', e);
    return 'AI is temporarily unavailable. Please try again.';
  }
};

// Status Badge Component
const StatusBadge = ({ status, size = 'md' }) => {
  const styles = {
    'Open': 'bg-blue-50 text-blue-700 border-blue-200',
    'In Review': 'bg-amber-50 text-amber-700 border-amber-200',
    'In Progress': 'bg-purple-50 text-purple-700 border-purple-200',
    'Waiting for Employee': 'bg-slate-100 text-slate-600 border-slate-200',
    'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Closed': 'bg-slate-50 text-slate-500 border-slate-200',
    'Pending': 'bg-orange-50 text-orange-700 border-orange-200',
    'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Rejected': 'bg-red-50 text-red-600 border-red-200',
  };
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`${sizeClasses} font-medium rounded-full border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
};

// Priority Indicator
const PriorityBadge = ({ priority, showLabel = false }) => {
  const styles = {
    'High': { bg: 'bg-red-500', text: 'text-red-600' },
    'Medium': { bg: 'bg-amber-500', text: 'text-amber-600' },
    'Low': { bg: 'bg-emerald-500', text: 'text-emerald-600' },
  };
  const style = styles[priority] || styles['Low'];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${style.bg}`} />
      {showLabel && <span className={`text-sm font-medium ${style.text}`}>{priority}</span>}
    </div>
  );
};

// Metric Card
const MetricCard = ({ title, value, change, changeType, icon: Icon, color, subtitle }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            {changeType === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{change}</span>
            <span className="text-slate-400 font-normal">vs last week</span>
          </div>
        )}
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

// Slide Panel Component
const SlidePanel = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Toast Notification
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-6 right-6 ${styles[type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom duration-300 z-50`}>
      {type === 'success' && <CheckCircle2 size={20} />}
      {type === 'error' && <AlertTriangle size={20} />}
      {type === 'info' && <AlertCircle size={20} />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

// Empty State
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <Icon size={28} className="text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
    <p className="text-slate-500 text-sm mb-4 max-w-sm">{description}</p>
    {action}
  </div>
);

// ============ DASHBOARD CALENDAR ============
const DashboardCalendar = ({ holidaySelections, currentUser }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const myOptionals = holidaySelections.filter(s => s.employeeId === currentUser?.id).map(s => s.holidayId);

  const getHolidayForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const fixed = FIXED_HOLIDAYS_2026.find(h => h.date === dateStr);
    if (fixed) return { ...fixed, type: 'fixed' };
    const opt = OPTIONAL_HOLIDAYS_2026.find(h => h.date === dateStr);
    if (opt && myOptionals.includes(opt.id)) return { ...opt, type: 'optional-selected' };
    if (opt) return { ...opt, type: 'optional' };
    const custom = holidaySelections.find(s => s.employeeId === currentUser?.id && s.type === 'custom' && s.date === dateStr);
    if (custom) return { name: custom.name, date: dateStr, type: 'custom' };
    return null;
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => setViewDate(new Date());

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft size={16} className="text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
          {(month !== today.getMonth() || year !== today.getFullYear()) && (
            <button onClick={goToToday} className="text-xs text-violet-600 font-medium hover:text-violet-700">Today</button>
          )}
        </div>
        <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="h-10" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const holiday = getHolidayForDate(day);
          const isSunday = new Date(year, month, day).getDay() === 0;

          return (
            <div
              key={day}
              className={`h-10 flex items-center justify-center rounded-lg text-sm relative group cursor-default transition-colors ${
                isToday ? 'bg-violet-600 text-white font-bold ring-2 ring-violet-300' :
                holiday?.type === 'fixed' ? 'bg-emerald-100 text-emerald-800 font-semibold' :
                holiday?.type === 'optional-selected' ? 'bg-amber-100 text-amber-800 font-semibold' :
                holiday?.type === 'optional' ? 'bg-amber-50 text-amber-600' :
                holiday?.type === 'custom' ? 'bg-violet-100 text-violet-800 font-semibold' :
                isSunday ? 'text-red-400' :
                'text-slate-700 hover:bg-slate-50'
              }`}
              title={holiday ? `${holiday.name}${holiday.type === 'fixed' ? ' (Fixed)' : holiday.type === 'optional-selected' ? ' (Your Pick)' : holiday.type === 'optional' ? ' (Optional)' : ' (Custom)'}` : ''}
            >
              {day}
              {holiday && !isToday && (
                <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                  holiday.type === 'fixed' ? 'bg-emerald-500' :
                  holiday.type === 'optional-selected' || holiday.type === 'custom' ? 'bg-amber-500' :
                  'bg-amber-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-500">Fixed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-500">Your Picks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="text-xs text-slate-500">Optional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
          <span className="text-xs text-slate-500">Today</span>
        </div>
      </div>
    </div>
  );
};

// ============ HOLIDAYS PAGE ============
const HolidaysPage = ({ currentUser, isAdmin, holidaySelections, onSaveSelections, employees, getEmployee, showToast }) => {
  const [customName, setCustomName] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [viewMode, setViewMode] = useState('my'); // 'my' or 'team' (admin)

  const mySelections = holidaySelections.filter(s => s.employeeId === currentUser.id && s.type === 'optional');
  const myCustoms = holidaySelections.filter(s => s.employeeId === currentUser.id && s.type === 'custom');
  const selectedCount = mySelections.length + myCustoms.length;
  const remaining = MAX_OPTIONAL_HOLIDAYS - selectedCount;

  const isOptionalSelected = (holidayId) => mySelections.some(s => s.holidayId === holidayId);

  const toggleOptionalHoliday = (holiday) => {
    if (isOptionalSelected(holiday.id)) {
      // Remove
      const updated = holidaySelections.filter(s => !(s.employeeId === currentUser.id && s.holidayId === holiday.id && s.type === 'optional'));
      onSaveSelections(updated);
      showToast(`Removed ${holiday.name} from your holidays`, 'info');
    } else {
      if (remaining <= 0) {
        showToast(`You've already selected ${MAX_OPTIONAL_HOLIDAYS} holidays. Remove one to add another.`, 'error');
        return;
      }
      const newSelection = {
        id: generateId('HOL'),
        employeeId: currentUser.id,
        holidayId: holiday.id,
        name: holiday.name,
        date: holiday.date,
        type: 'optional',
        selectedAt: Date.now(),
      };
      onSaveSelections([...holidaySelections, newSelection]);
      showToast(`Added ${holiday.name} to your holidays`, 'success');
    }
  };

  const addCustomHoliday = () => {
    if (!customName.trim() || !customDate) {
      showToast('Please enter a festival name and date', 'error');
      return;
    }
    if (remaining <= 0) {
      showToast(`You've already selected ${MAX_OPTIONAL_HOLIDAYS} holidays. Remove one to add another.`, 'error');
      return;
    }
    const newCustom = {
      id: generateId('CHOL'),
      employeeId: currentUser.id,
      type: 'custom',
      name: customName.trim(),
      date: customDate,
      reason: customReason.trim(),
      selectedAt: Date.now(),
    };
    onSaveSelections([...holidaySelections, newCustom]);
    showToast(`Custom holiday "${customName.trim()}" added!`, 'success');
    setCustomName('');
    setCustomDate('');
    setCustomReason('');
  };

  const removeCustomHoliday = (holId) => {
    const updated = holidaySelections.filter(s => s.id !== holId);
    onSaveSelections(updated);
    showToast('Custom holiday removed', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">2026 Holiday Calendar</h2>
          <p className="text-sm text-slate-500 mt-0.5">Fixed holidays are for everyone. Choose up to {MAX_OPTIONAL_HOLIDAYS} optional or custom festival holidays.</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            <button onClick={() => setViewMode('my')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'my' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>My Holidays</button>
            <button onClick={() => setViewMode('team')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'team' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Team Overview</button>
          </div>
        )}
      </div>

      {/* Selection Counter */}
      {viewMode === 'my' && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-900">Your Optional Holidays</p>
              <p className="text-xs text-violet-600 mt-0.5">
                {selectedCount} of {MAX_OPTIONAL_HOLIDAYS} selected · {remaining > 0 ? `${remaining} remaining` : 'All slots filled'}
              </p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_OPTIONAL_HOLIDAYS }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < selectedCount ? 'bg-violet-600' : 'bg-violet-200'}`} />
              ))}
            </div>
          </div>
          <div className="w-full bg-violet-200 rounded-full h-1.5 mt-3">
            <div className="bg-violet-600 h-1.5 rounded-full transition-all" style={{ width: `${(selectedCount / MAX_OPTIONAL_HOLIDAYS) * 100}%` }} />
          </div>
        </div>
      )}

      {viewMode === 'my' ? (
        <>
          {/* Fixed Holidays */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Shield size={16} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900">Fixed Holidays</h3>
                <span className="text-xs text-slate-400 ml-1">Full day off for everyone</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {FIXED_HOLIDAYS_2026.map(h => (
                <div key={h.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex flex-col items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold leading-none">{new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric' })}</span>
                    <span className="text-[10px] leading-none mt-0.5">{new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{h.name}</p>
                    <p className="text-xs text-slate-500">{h.day}, {formatDate(h.date + 'T00:00:00')}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">Fixed</span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Holidays */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Star size={16} className="text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900">Optional Holidays</h3>
                <span className="text-xs text-slate-400 ml-1">Select up to {MAX_OPTIONAL_HOLIDAYS} based on your observance</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {OPTIONAL_HOLIDAYS_2026.map(h => {
                const selected = isOptionalSelected(h.id);
                return (
                  <div key={h.id} className={`flex items-center gap-4 p-4 transition-colors ${selected ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}>
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 ${
                      selected ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-slate-200'
                    }`}>
                      <span className={`text-sm font-bold leading-none ${!selected ? 'text-slate-600' : ''}`}>{new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric' })}</span>
                      <span className={`text-[10px] leading-none mt-0.5 ${!selected ? 'text-slate-500' : ''}`}>{new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${selected ? 'text-slate-900' : 'text-slate-700'}`}>{h.name}</p>
                      <p className="text-xs text-slate-500">{h.day}, {formatDate(h.date + 'T00:00:00')}</p>
                      {h.note && <p className="text-xs text-amber-600 mt-0.5">{h.note}</p>}
                    </div>
                    <button
                      onClick={() => toggleOptionalHoliday(h)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selected
                          ? 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                          : remaining > 0
                            ? 'bg-violet-600 text-white hover:bg-violet-700'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!selected && remaining <= 0}
                    >
                      {selected ? '✓ Selected' : '+ Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Festival Request */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-100 rounded-lg">
                  <Plus size={16} className="text-violet-600" />
                </div>
                <h3 className="font-bold text-slate-900">Request Custom Festival Holiday</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                If your religion or festival is not listed above, add it here. This counts toward your {MAX_OPTIONAL_HOLIDAYS} optional holiday limit.
              </p>
            </div>

            {/* Existing custom holidays */}
            {myCustoms.length > 0 && (
              <div className="divide-y divide-slate-100 border-b border-slate-100">
                {myCustoms.map(c => (
                  <div key={c.id} className="flex items-center gap-4 p-4 bg-violet-50/50">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex flex-col items-center justify-center text-white flex-shrink-0">
                      <span className="text-sm font-bold leading-none">{new Date(c.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric' })}</span>
                      <span className="text-[10px] leading-none mt-0.5">{new Date(c.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{formatDate(c.date + 'T00:00:00')}</p>
                      {c.reason && <p className="text-xs text-violet-600 mt-0.5">{c.reason}</p>}
                    </div>
                    <button
                      onClick={() => removeCustomHoliday(c.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Festival name (e.g., Pongal, Onam)"
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
                <input
                  type="date"
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  min="2026-01-01"
                  max="2026-12-31"
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <input
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="Brief reason (optional)"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                onClick={addCustomHoliday}
                disabled={!customName.trim() || !customDate || remaining <= 0}
                className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={16} />
                Add Custom Holiday {remaining <= 0 ? '(No slots left)' : `(${remaining} left)`}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Team Overview (Admin) */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Team Holiday Selections</h3>
            <p className="text-xs text-slate-500 mt-0.5">Overview of optional holidays chosen by each team member</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Employee</th>
                  <th className="text-center px-3 py-3 font-semibold text-slate-600">Selected</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Holidays Chosen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.filter(e => e.role !== 'admin').map(emp => {
                  const empSelections = holidaySelections.filter(s => s.employeeId === emp.id);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{emp.name}</p>
                        <p className="text-xs text-slate-400">{emp.dept || 'No dept'}</p>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          empSelections.length === MAX_OPTIONAL_HOLIDAYS ? 'bg-emerald-50 text-emerald-700' :
                          empSelections.length > 0 ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {empSelections.length}/{MAX_OPTIONAL_HOLIDAYS}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {empSelections.length === 0 ? (
                          <span className="text-xs text-slate-400">No holidays selected yet</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {empSelections.map(s => (
                              <span key={s.id} className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                s.type === 'custom' ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ MAIN APP ============
export default function PocketFundDashboard() {
  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [holidaySelections, setHolidaySelections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showNewLeaveModal, setShowNewLeaveModal] = useState(false);
  const [showTicketPanel, setShowTicketPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all', type: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [showNewAnnouncementModal, setShowNewAnnouncementModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showNewSuggestionModal, setShowNewSuggestionModal] = useState(false);
  const [showNewReferralModal, setShowNewReferralModal] = useState(false);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // FORCE FRESH START - Clear all old data and start clean
        // Set to true ONLY when you intentionally want to wipe everything
        const forceReset = false;
        
        // Data version — bump this when adding new storage keys
        // IMPORTANT: This now does ADDITIVE migration only (no data wipe)
        const DATA_VERSION = '8';
        let versionResult;
        try {
          versionResult = await storage.get('pocketfund-version');
        } catch (e) {
          versionResult = null;
        }
        
        const isFirstLoad = !versionResult?.value;
        const needsMigration = versionResult?.value && versionResult.value !== DATA_VERSION;
        
        if (forceReset) {
          // Only runs if you explicitly set forceReset = true
          await storage.set('pocketfund-employees', JSON.stringify(INITIAL_EMPLOYEES));
          await storage.set('pocketfund-tickets', JSON.stringify([]));
          await storage.set('pocketfund-leaves', JSON.stringify([]));
          await storage.set('pocketfund-activities', JSON.stringify([]));
          await storage.set('pocketfund-announcements', JSON.stringify([]));
          await storage.set('pocketfund-notifications', JSON.stringify([]));
          await storage.set('pocketfund-salary', JSON.stringify([]));
          await storage.set('pocketfund-suggestions', JSON.stringify([]));
          await storage.set('pocketfund-holidays', JSON.stringify([]));
          await storage.set('pocketfund-version', DATA_VERSION);
          try { await storage.delete('pocketfund-currentuser'); } catch(e) {}
          
          setEmployees(INITIAL_EMPLOYEES);
          setTickets([]);
          setLeaves([]);
          setActivities([]);
          setAnnouncements([]);
          setNotifications([]);
          setSalaryRecords([]);
          setSuggestions([]);
          setHolidaySelections([]);
          setIsLoading(false);
          return;
        }

        if (isFirstLoad) {
          // First time ever — initialize all storage keys
          await storage.set('pocketfund-employees', JSON.stringify(INITIAL_EMPLOYEES));
          await storage.set('pocketfund-tickets', JSON.stringify([]));
          await storage.set('pocketfund-leaves', JSON.stringify([]));
          await storage.set('pocketfund-activities', JSON.stringify([]));
          await storage.set('pocketfund-announcements', JSON.stringify([]));
          await storage.set('pocketfund-notifications', JSON.stringify([]));
          await storage.set('pocketfund-salary', JSON.stringify([]));
          await storage.set('pocketfund-suggestions', JSON.stringify([]));
          await storage.set('pocketfund-holidays', JSON.stringify([]));
          await storage.set('pocketfund-version', DATA_VERSION);
          
          setEmployees(INITIAL_EMPLOYEES);
          setTickets([]);
          setLeaves([]);
          setActivities([]);
          setAnnouncements([]);
          setNotifications([]);
          setSalaryRecords([]);
          setSuggestions([]);
          setHolidaySelections([]);
          setIsLoading(false);
          return;
        }

        if (needsMigration) {
          // Additive migration — only initialize NEW keys that don't exist yet
          // This preserves all existing data (leaves, profiles, tickets, etc.)
          const keysToEnsure = [
            'pocketfund-employees', 'pocketfund-tickets', 'pocketfund-leaves',
            'pocketfund-activities', 'pocketfund-announcements', 'pocketfund-notifications',
            'pocketfund-salary', 'pocketfund-suggestions', 'pocketfund-holidays',
          ];
          for (const key of keysToEnsure) {
            try {
              const existing = await storage.get(key);
              if (!existing?.value) {
                await storage.set(key, key === 'pocketfund-employees' ? JSON.stringify(INITIAL_EMPLOYEES) : JSON.stringify([]));
              }
            } catch (e) {
              await storage.set(key, key === 'pocketfund-employees' ? JSON.stringify(INITIAL_EMPLOYEES) : JSON.stringify([]));
            }
          }
          await storage.set('pocketfund-version', DATA_VERSION);
        }

        // Load employees/users
        let employeesResult;
        try {
          employeesResult = await storage.get('pocketfund-employees');
        } catch (e) {
          employeesResult = null;
        }
        if (employeesResult?.value) {
          setEmployees(JSON.parse(employeesResult.value));
        } else {
          setEmployees(INITIAL_EMPLOYEES);
          await storage.set('pocketfund-employees', JSON.stringify(INITIAL_EMPLOYEES));
        }

        // Load tickets
        let ticketsResult;
        try {
          ticketsResult = await storage.get('pocketfund-tickets');
        } catch (e) {
          ticketsResult = null;
        }
        if (ticketsResult?.value) {
          setTickets(JSON.parse(ticketsResult.value));
        } else {
          const initialTickets = createInitialTickets();
          setTickets(initialTickets);
          await storage.set('pocketfund-tickets', JSON.stringify(initialTickets));
        }

        // Load leaves
        let leavesResult;
        try {
          leavesResult = await storage.get('pocketfund-leaves');
        } catch (e) {
          leavesResult = null;
        }
        if (leavesResult?.value) {
          setLeaves(JSON.parse(leavesResult.value));
        } else {
          const initialLeaves = createInitialLeaves();
          setLeaves(initialLeaves);
          await storage.set('pocketfund-leaves', JSON.stringify(initialLeaves));
        }

        // Load activities
        let activitiesResult;
        try {
          activitiesResult = await storage.get('pocketfund-activities');
        } catch (e) {
          activitiesResult = null;
        }
        if (activitiesResult?.value) {
          setActivities(JSON.parse(activitiesResult.value));
        } else {
          const initialActivities = createInitialActivities();
          setActivities(initialActivities);
          await storage.set('pocketfund-activities', JSON.stringify(initialActivities));
        }

        // Load announcements
        let announcementsResult;
        try {
          announcementsResult = await storage.get('pocketfund-announcements');
        } catch (e) {
          announcementsResult = null;
        }
        if (announcementsResult?.value) {
          setAnnouncements(JSON.parse(announcementsResult.value));
        } else {
          const initialAnnouncements = createInitialAnnouncements();
          setAnnouncements(initialAnnouncements);
          await storage.set('pocketfund-announcements', JSON.stringify(initialAnnouncements));
        }

        // Load notifications
        let notificationsResult;
        try {
          notificationsResult = await storage.get('pocketfund-notifications');
        } catch (e) {
          notificationsResult = null;
        }
        if (notificationsResult?.value) {
          setNotifications(JSON.parse(notificationsResult.value));
        } else {
          const initialNotifications = createInitialNotifications();
          setNotifications(initialNotifications);
          await storage.set('pocketfund-notifications', JSON.stringify(initialNotifications));
        }

        // Load salary records
        let salaryResult;
        try {
          salaryResult = await storage.get('pocketfund-salary');
        } catch (e) {
          salaryResult = null;
        }
        if (salaryResult?.value) {
          setSalaryRecords(JSON.parse(salaryResult.value));
        } else {
          const initialSalary = createInitialSalaryRecords();
          setSalaryRecords(initialSalary);
          await storage.set('pocketfund-salary', JSON.stringify(initialSalary));
        }

        // Load suggestions
        let suggestionsResult;
        try {
          suggestionsResult = await storage.get('pocketfund-suggestions');
        } catch (e) {
          suggestionsResult = null;
        }
        if (suggestionsResult?.value) {
          setSuggestions(JSON.parse(suggestionsResult.value));
        } else {
          setSuggestions([]);
          await storage.set('pocketfund-suggestions', JSON.stringify([]));
        }

        // Load referrals
        let referralsResult;
        try {
          referralsResult = await storage.get('pocketfund-referrals');
        } catch (e) {
          referralsResult = null;
        }
        if (referralsResult?.value) {
          setReferrals(JSON.parse(referralsResult.value));
        } else {
          setReferrals([]);
          await storage.set('pocketfund-referrals', JSON.stringify([]));
        }

        // Load holiday selections
        let holidaysResult;
        try {
          holidaysResult = await storage.get('pocketfund-holidays');
        } catch (e) {
          holidaysResult = null;
        }
        if (holidaysResult?.value) {
          setHolidaySelections(JSON.parse(holidaysResult.value));
        } else {
          setHolidaySelections([]);
          await storage.set('pocketfund-holidays', JSON.stringify([]));
        }

        // Load current user preference
        let userResult;
        try {
          userResult = await storage.get('pocketfund-currentuser');
        } catch (e) {
          userResult = null;
        }
        if (userResult?.value) {
          setCurrentUser(JSON.parse(userResult.value));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // ============ AUTO-REFRESH (multi-user sync every 30s) ============
  const refreshData = useCallback(async (silent = true) => {
    if (!silent) setIsSyncing(true);
    try {
      const [empR, tktR, lvR, actR, annR, ntfR, salR, sugR, refR, holR] = await Promise.all([
        storage.get('pocketfund-employees'),
        storage.get('pocketfund-tickets'),
        storage.get('pocketfund-leaves'),
        storage.get('pocketfund-activities'),
        storage.get('pocketfund-announcements'),
        storage.get('pocketfund-notifications'),
        storage.get('pocketfund-salary'),
        storage.get('pocketfund-suggestions'),
        storage.get('pocketfund-referrals').catch(() => null),
        storage.get('pocketfund-holidays').catch(() => null),
      ]);
      if (empR?.value) setEmployees(JSON.parse(empR.value));
      if (tktR?.value) setTickets(JSON.parse(tktR.value));
      if (lvR?.value) setLeaves(JSON.parse(lvR.value));
      if (actR?.value) setActivities(JSON.parse(actR.value));
      if (annR?.value) setAnnouncements(JSON.parse(annR.value));
      if (ntfR?.value) setNotifications(JSON.parse(ntfR.value));
      if (salR?.value) setSalaryRecords(JSON.parse(salR.value));
      if (sugR?.value) setSuggestions(JSON.parse(sugR.value));
      if (refR?.value) setReferrals(JSON.parse(refR.value));
      if (holR?.value) setHolidaySelections(JSON.parse(holR.value));
      setLastSynced(new Date());
    } catch (e) {
      console.error('Sync failed:', e);
    }
    if (!silent) setIsSyncing(false);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => refreshData(true), 30000);
    return () => clearInterval(interval);
  }, [currentUser, refreshData]);

  // Save employees to storage
  const saveEmployees = async (newEmployees) => {
    setEmployees(newEmployees);
    await storage.set('pocketfund-employees', JSON.stringify(newEmployees));
  };

  // Save data to storage
  const saveTickets = async (newTickets) => {
    setTickets(newTickets);
    await storage.set('pocketfund-tickets', JSON.stringify(newTickets));
  };

  const saveLeaves = async (newLeaves) => {
    setLeaves(newLeaves);
    await storage.set('pocketfund-leaves', JSON.stringify(newLeaves));
  };

  const saveActivities = async (newActivities) => {
    setActivities(newActivities);
    await storage.set('pocketfund-activities', JSON.stringify(newActivities));
  };

  const addActivity = async (activity) => {
    const newActivity = { id: generateId('ACT'), ...activity, at: Date.now() };
    const newActivities = [newActivity, ...activities].slice(0, 50);
    await saveActivities(newActivities);
  };

  // Save announcements
  const saveAnnouncements = async (newAnnouncements) => {
    setAnnouncements(newAnnouncements);
    await storage.set('pocketfund-announcements', JSON.stringify(newAnnouncements));
  };

  // Save notifications
  const saveNotifications = async (newNotifications) => {
    setNotifications(newNotifications);
    await storage.set('pocketfund-notifications', JSON.stringify(newNotifications));
  };

  // Save salary records
  const saveSalaryRecords = async (newRecords) => {
    setSalaryRecords(newRecords);
    await storage.set('pocketfund-salary', JSON.stringify(newRecords));
  };

  // Save suggestions
  const saveSuggestions = async (newSuggestions) => {
    setSuggestions(newSuggestions);
    await storage.set('pocketfund-suggestions', JSON.stringify(newSuggestions));
  };

  // Save referrals
  const saveReferrals = async (newReferrals) => {
    setReferrals(newReferrals);
    await storage.set('pocketfund-referrals', JSON.stringify(newReferrals));
  };

  // Save holiday selections
  const saveHolidaySelections = async (newSelections) => {
    setHolidaySelections(newSelections);
    await storage.set('pocketfund-holidays', JSON.stringify(newSelections));
  };

  // Add notification helper
  const addNotification = async (notif) => {
    const newNotif = { id: generateId('NTF'), ...notif, read: false, at: Date.now() };
    const newNotifications = [newNotif, ...notifications].slice(0, 100);
    await saveNotifications(newNotifications);
  };

  // Mark notification as read
  const markNotificationRead = async (notifId) => {
    const updated = notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
    await saveNotifications(updated);
  };

  // Mark all notifications as read
  const markAllNotificationsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    await saveNotifications(updated);
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    await saveNotifications([]);
  };

  // Unread notification count
  const unreadNotifCount = useMemo(() => {
    return notifications.filter(n => !n.read && ((!n.forUser && !n.forUsers) || n.forUser === currentUser?.id || n.forUser === 'all' || (n.forUsers && n.forUsers.includes(currentUser?.id)))).length;
  }, [notifications, currentUser]);

  // Show toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Login handler
  const handleLogin = async (user) => {
    const userWithoutPasscode = { ...user };
    delete userWithoutPasscode.passcode;
    setCurrentUser(userWithoutPasscode);
    await storage.set('pocketfund-currentuser', JSON.stringify(userWithoutPasscode));
    showToast(`Welcome back, ${user.name}!`);
  };

  // Profile completion handler (first login)
  const handleCompleteProfile = async (profileData) => {
    const updatedUser = { ...currentUser, ...profileData, profileComplete: true };
    setCurrentUser(updatedUser);
    await storage.set('pocketfund-currentuser', JSON.stringify(updatedUser));
    
    const newEmployees = employees.map(e => 
      e.id === updatedUser.id ? { ...e, ...profileData, profileComplete: true } : e
    );
    await saveEmployees(newEmployees);
    showToast(`Profile set up! Welcome, ${updatedUser.name}!`);
  };

  // Skip profile setup — mark as complete so they can use the app, they can fill details later in Settings
  const handleSkipProfile = async () => {
    const updatedUser = { ...currentUser, profileComplete: true };
    setCurrentUser(updatedUser);
    await storage.set('pocketfund-currentuser', JSON.stringify(updatedUser));
    
    const newEmployees = employees.map(e => 
      e.id === updatedUser.id ? { ...e, profileComplete: true } : e
    );
    await saveEmployees(newEmployees);
    showToast(`Welcome, ${updatedUser.name}! You can complete your profile later in Settings.`);
  };

  // Logout handler
  const handleLogout = async () => {
    setCurrentUser(null);
    await storage.delete('pocketfund-currentuser');
    setActiveTab('dashboard');
  };

  // Create ticket
  const handleCreateTicket = async (ticketData) => {
    const newTicket = {
      id: generateId('TKT'),
      ...ticketData,
      employeeId: currentUser.id,
      dept: currentUser.dept,
      status: 'Open',
      assignedTo: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      comments: [],
      internalNotes: [],
    };
    const newTickets = [newTicket, ...tickets];
    await saveTickets(newTickets);
    await addActivity({ type: 'ticket_created', ticketId: newTicket.id, by: currentUser.id });
    // Notify only the creator and admins (tickets are confidential)
    const adminIdsForTicket = employees.filter(e => e.role === 'admin').map(e => e.id);
    await addNotification({ type: 'ticket_update', title: 'New Ticket', message: `${currentUser.name} created ticket: ${ticketData.title}`, forUsers: [currentUser.id, ...adminIdsForTicket], relatedId: newTicket.id });
    setShowNewTicketModal(false);
    showToast('Ticket created successfully!');
  };

  // Update ticket
  const handleUpdateTicket = async (ticketId, updates) => {
    const newTickets = tickets.map(t => {
      if (t.id === ticketId) {
        const updated = { ...t, ...updates, updatedAt: Date.now() };
        if (updates.status === 'Resolved' && t.status !== 'Resolved') {
          updated.resolvedAt = Date.now();
        }
        return updated;
      }
      return t;
    });
    await saveTickets(newTickets);
    
    if (updates.status) {
      await addActivity({ type: 'status_changed', ticketId, by: currentUser.id, newStatus: updates.status });
      
      // Notify relevant parties on status changes
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        const adminIdsForStatus = employees.filter(e => e.role === 'admin').map(e => e.id);
        if (updates.status === 'Closed' && currentUser.role === 'employee') {
          // Employee closed their ticket — notify admins
          await addNotification({ type: 'ticket_update', title: 'Ticket Closed', message: `${currentUser.name} closed ticket: ${ticket.title}`, forUsers: adminIdsForStatus, relatedId: ticketId });
        } else if (updates.status === 'Open' && currentUser.role === 'employee') {
          // Employee reopened their ticket — notify admins
          await addNotification({ type: 'ticket_update', title: 'Ticket Reopened', message: `${currentUser.name} reopened ticket: ${ticket.title}`, forUsers: adminIdsForStatus, relatedId: ticketId });
        } else if (updates.status === 'Resolved' && currentUser.role === 'admin') {
          // Admin resolved a ticket — notify the employee
          await addNotification({ type: 'ticket_update', title: 'Ticket Resolved', message: `Your ticket "${ticket.title}" has been resolved`, forUser: ticket.employeeId, relatedId: ticketId });
        }
      }
    }
    if (updates.assignedTo && updates.assignedTo !== tickets.find(t => t.id === ticketId)?.assignedTo) {
      await addActivity({ type: 'ticket_assigned', ticketId, by: currentUser.id, to: updates.assignedTo });
    }
    
    setSelectedTicket(newTickets.find(t => t.id === ticketId));
    showToast('Ticket updated!');
  };

  // Add comment to ticket
  const handleAddComment = async (ticketId, text, isInternal = false) => {
    const newTickets = tickets.map(t => {
      if (t.id === ticketId) {
        const newItem = { by: currentUser.id, text, at: Date.now() };
        return {
          ...t,
          [isInternal ? 'internalNotes' : 'comments']: [...(t[isInternal ? 'internalNotes' : 'comments'] || []), newItem],
          updatedAt: Date.now(),
        };
      }
      return t;
    });
    await saveTickets(newTickets);
    await addActivity({ type: isInternal ? 'note_added' : 'comment_added', ticketId, by: currentUser.id });
    setSelectedTicket(newTickets.find(t => t.id === ticketId));
    showToast(isInternal ? 'Note added!' : 'Comment added!');
  };

  // Rate ticket
  const handleRateTicket = async (ticketId, rating) => {
    const newTickets = tickets.map(t => t.id === ticketId ? { ...t, rating } : t);
    await saveTickets(newTickets);
    setSelectedTicket(newTickets.find(t => t.id === ticketId));
    showToast('Thank you for your feedback!');
  };

  // Create leave request
  const handleCreateLeave = async (leaveData) => {
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = {
      id: generateId('LV'),
      employeeId: currentUser.id,
      ...leaveData,
      days,
      status: 'Pending',
      createdAt: Date.now(),
      approvedBy: null,
    };
    const newLeaves = [newLeave, ...leaves];
    await saveLeaves(newLeaves);
    await addActivity({ type: 'leave_requested', leaveId: newLeave.id, by: currentUser.id });
    // Notify only admins and the requesting employee (not all employees)
    const adminIds = employees.filter(e => e.role === 'admin').map(e => e.id);
    await addNotification({ type: 'leave_update', title: 'New Leave Request', message: `${currentUser.name} requested ${leaveData.type}`, forUsers: [currentUser.id, ...adminIds], relatedId: newLeave.id });
    setShowNewLeaveModal(false);
    showToast('Leave request submitted!');
  };

  // Approve/Reject leave
  const handleLeaveAction = async (leaveId, action) => {
    const newLeaves = leaves.map(l => {
      if (l.id === leaveId) {
        return {
          ...l,
          status: action === 'approve' ? 'Approved' : 'Rejected',
          approvedBy: currentUser.id,
          updatedAt: Date.now(),
        };
      }
      return l;
    });
    await saveLeaves(newLeaves);
    await addActivity({ type: action === 'approve' ? 'leave_approved' : 'leave_rejected', leaveId, by: currentUser.id });
    const leave = leaves.find(l => l.id === leaveId);
    if (leave) {
      await addNotification({ type: 'leave_update', title: `Leave ${action === 'approve' ? 'Approved' : 'Rejected'}`, message: `Your ${leave.type} request has been ${action === 'approve' ? 'approved' : 'rejected'}`, forUser: leave.employeeId, relatedId: leaveId });
    }
    showToast(`Leave ${action === 'approve' ? 'approved' : 'rejected'}!`);
  };

  // Create announcement (admin only)
  const handleCreateAnnouncement = async (announcementData) => {
    const newAnnouncement = {
      id: generateId('ANN'),
      ...announcementData,
      createdBy: currentUser.id,
      createdAt: Date.now(),
      pinned: announcementData.pinned || false,
      archived: false,
    };
    const newAnnouncements = [newAnnouncement, ...announcements];
    await saveAnnouncements(newAnnouncements);
    await addActivity({ type: 'announcement_created', announcementId: newAnnouncement.id, by: currentUser.id });
    await addNotification({ type: 'announcement', title: 'New Announcement', message: announcementData.title, forUser: 'all', relatedId: newAnnouncement.id });
    setShowNewAnnouncementModal(false);
    showToast('Announcement posted!');
  };

  // Pin/unpin announcement
  const handleTogglePinAnnouncement = async (announcementId) => {
    const updated = announcements.map(a => a.id === announcementId ? { ...a, pinned: !a.pinned } : a);
    await saveAnnouncements(updated);
    showToast('Announcement updated!');
  };

  // Archive announcement
  const handleArchiveAnnouncement = async (announcementId) => {
    const updated = announcements.map(a => a.id === announcementId ? { ...a, archived: true } : a);
    await saveAnnouncements(updated);
    showToast('Announcement archived!');
  };

  // Delete announcement
  const handleDeleteAnnouncement = async (announcementId) => {
    const updated = announcements.filter(a => a.id !== announcementId);
    await saveAnnouncements(updated);
    showToast('Announcement deleted!');
  };

  // Update user settings
  const handleUpdateSettings = async (newSettings) => {
    const updatedUser = { ...currentUser, settings: { ...currentUser.settings, ...newSettings } };
    setCurrentUser(updatedUser);
    await storage.set('pocketfund-currentuser', JSON.stringify(updatedUser));
    const newEmployees = employees.map(e => 
      e.id === updatedUser.id ? { ...e, settings: updatedUser.settings } : e
    );
    await saveEmployees(newEmployees);
    showToast('Settings saved!');
  };

  // Update profile info
  const handleUpdateProfile = async (profileData) => {
    const updatedUser = { ...currentUser, ...profileData };
    setCurrentUser(updatedUser);
    await storage.set('pocketfund-currentuser', JSON.stringify(updatedUser));
    const newEmployees = employees.map(e => 
      e.id === updatedUser.id ? { ...e, ...profileData } : e
    );
    await saveEmployees(newEmployees);
    showToast('Profile updated!');
  };

  // Add new team member (admin only)
  const handleAddEmployee = async (memberData) => {
    const newId = `EMP-${String(employees.length).padStart(3, '0')}`;
    const newEmployee = {
      id: newId,
      name: memberData.name,
      email: memberData.email,
      passcode: memberData.passcode,
      dept: memberData.dept || '',
      role: memberData.role || 'employee',
      profileComplete: false,
      leaveBalance: { personal: 1, sick: 1, exam: 0, unpaid: 0, emergency: 0 },
      settings: { theme: 'light', notifications: { tickets: true, leaves: true, announcements: true, comments: true }, bio: '' },
    };
    const newEmployees = [...employees, newEmployee];
    await saveEmployees(newEmployees);
    await addActivity({ type: 'member_added', by: currentUser.id, memberId: newId });
    // Only notify admins about new team members
    const adminIdsForNotif = employees.filter(e => e.role === 'admin').map(e => e.id);
    await addNotification({ type: 'system', title: 'New Team Member', message: `${memberData.name} has been added to the team`, forUsers: adminIdsForNotif });
    setShowAddMemberModal(false);
    showToast(`${memberData.name} added successfully!`);
  };

  // Remove team member (admin only)
  const handleRemoveEmployee = async (employeeId) => {
    const emp = getEmployee(employeeId);
    if (!emp) return;
    if (!confirm(`Are you sure you want to remove ${emp.name}? This will revoke their access permanently.`)) return;
    const newEmployees = employees.filter(e => e.id !== employeeId);
    await saveEmployees(newEmployees);
    // Clean up related data
    const newTickets = tickets.filter(t => t.employeeId !== employeeId);
    await saveTickets(newTickets);
    const newLeaves = leaves.filter(l => l.employeeId !== employeeId);
    await saveLeaves(newLeaves);
    await addActivity({ type: 'member_removed', by: currentUser.id, memberName: emp.name });
    showToast(`${emp.name} has been removed`);
  };

  // Update salary/stipend status (admin only)
  const handleUpdateSalaryStatus = async ({ employeeIds, month, status, note }) => {
    const now = Date.now();
    let updatedRecords = [...salaryRecords];

    for (const empId of employeeIds) {
      // Find existing record for this employee + month
      const existingIdx = updatedRecords.findIndex(r => r.userId === empId && r.month === month);
      const record = {
        userId: empId,
        month,
        status,
        updatedAt: now,
        updatedBy: currentUser.id,
        note: status === 'Delayed' ? (note || '') : (note || ''),
      };

      if (existingIdx >= 0) {
        updatedRecords[existingIdx] = record;
      } else {
        updatedRecords.push(record);
      }

      // Notify the employee
      const emp = getEmployee(empId);
      const monthLabel = getMonthOptions().find(m => m.key === month)?.label || month;
      await addNotification({
        type: 'salary_update',
        title: 'Salary Status Updated',
        message: `Your salary for ${monthLabel} is now: ${status}${note ? ` — ${note}` : ''}`,
        forUser: empId,
        relatedId: `salary-${empId}-${month}`,
      });
    }

    await saveSalaryRecords(updatedRecords);
    await addActivity({ type: 'salary_updated', by: currentUser.id, count: employeeIds.length });
    showToast(`Salary status updated for ${employeeIds.length} employee${employeeIds.length > 1 ? 's' : ''}!`);
  };

  // Get salary record for a specific employee and month
  const getSalaryRecord = (userId, month) => {
    return salaryRecords.find(r => r.userId === userId && r.month === month) || null;
  };

  // Create anonymous suggestion (NO identity stored)
  const handleCreateSuggestion = async (suggestionData) => {
    const newSuggestion = {
      id: generateId('SUG'),
      title: suggestionData.title,
      body: suggestionData.body,
      category: suggestionData.category || 'General',
      status: 'New',
      createdAt: Date.now(),
      adminResponse: null,
      respondedAt: null,
      // NOTE: No employeeId, no name, no dept — fully anonymous
    };
    const newSuggestions = [newSuggestion, ...suggestions];
    await saveSuggestions(newSuggestions);
    await addActivity({ type: 'suggestion_created', by: 'anonymous' });
    // Only notify admins about new suggestions
    const adminIdsForSuggestion = employees.filter(e => e.role === 'admin').map(e => e.id);
    await addNotification({ type: 'system', title: 'New Anonymous Suggestion', message: `Someone submitted a suggestion: "${suggestionData.title}"`, forUsers: adminIdsForSuggestion });
    setShowNewSuggestionModal(false);
    showToast('Suggestion submitted anonymously!');
  };

  // Update suggestion status / respond (admin only)
  const handleUpdateSuggestion = async (suggestionId, updates) => {
    const newSuggestions = suggestions.map(s => {
      if (s.id === suggestionId) {
        return { ...s, ...updates, respondedAt: updates.adminResponse ? Date.now() : s.respondedAt };
      }
      return s;
    });
    await saveSuggestions(newSuggestions);
    showToast('Suggestion updated!');
  };

  // Delete suggestion (admin only)
  const handleDeleteSuggestion = async (suggestionId) => {
    if (!confirm('Delete this suggestion permanently?')) return;
    const newSuggestions = suggestions.filter(s => s.id !== suggestionId);
    await saveSuggestions(newSuggestions);
    showToast('Suggestion deleted');
  };

  // ============ REFERRAL HANDLERS ============
  const handleCreateReferral = async (referralData) => {
    const newReferral = {
      id: generateId('REF'),
      submittedBy: currentUser.id,
      ...referralData,
      status: 'Submitted',
      createdAt: Date.now(),
      updatedAt: null,
      adminNotes: '',
      joinDate: null,
      sixMonthDate: null,
    };
    const newReferrals = [newReferral, ...referrals];
    await saveReferrals(newReferrals);
    await addActivity({ type: 'referral_submitted', by: currentUser.id });
    // Notify admins only
    const adminIdsForRef = employees.filter(e => e.role === 'admin').map(e => e.id);
    await addNotification({ type: 'referral_update', title: 'New Referral', message: `${currentUser.name} referred ${referralData.candidateName}`, forUsers: [...adminIdsForRef, currentUser.id] });
    setShowNewReferralModal(false);
    showToast('Referral submitted successfully!');
  };

  const handleUpdateReferral = async (referralId, updates) => {
    const referral = referrals.find(r => r.id === referralId);
    const newReferrals = referrals.map(r => {
      if (r.id === referralId) {
        return { ...r, ...updates, updatedAt: Date.now() };
      }
      return r;
    });
    await saveReferrals(newReferrals);
    // Notify the employee who submitted the referral
    if (referral) {
      const statusMsg = updates.status ? `Status updated to: ${updates.status}` : 'Referral updated';
      await addNotification({ type: 'referral_update', title: 'Referral Update', message: `Your referral for ${referral.candidateName} — ${statusMsg}`, forUser: referral.submittedBy, relatedId: referralId });
    }
    showToast('Referral updated!');
  };

  const handleDeleteReferral = async (referralId) => {
    if (!confirm('Delete this referral permanently?')) return;
    const newReferrals = referrals.filter(r => r.id !== referralId);
    await saveReferrals(newReferrals);
    showToast('Referral deleted');
  };

  // Reset all data
  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      const initialTickets = createInitialTickets();
      const initialLeaves = createInitialLeaves();
      const initialActivities = createInitialActivities();
      await saveTickets(initialTickets);
      await saveLeaves(initialLeaves);
      await saveActivities(initialActivities);
      await saveEmployees(INITIAL_EMPLOYEES);
      await saveAnnouncements([]);
      await saveNotifications([]);
      await saveSalaryRecords([]);
      await saveSuggestions([]);
      await saveReferrals([]);
      // Log out since employee records are reset
      setCurrentUser(null);
      try { await storage.delete('pocketfund-currentuser'); } catch(e) {}
      showToast('Data reset to initial state', 'info');
    }
  };

  // Computed values
  const getEmployee = (id) => employees.find(e => e.id === id);

  const filteredTickets = useMemo(() => {
    let result = tickets;
    
    // Filter by user role - employees see only their tickets
    if (currentUser?.role === 'employee') {
      result = result.filter(t => t.employeeId === currentUser.id);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(query) ||
        t.title.toLowerCase().includes(query) ||
        getEmployee(t.employeeId)?.name.toLowerCase().includes(query)
      );
    }
    
    // Apply filters
    if (filters.status !== 'all') result = result.filter(t => t.status === filters.status);
    if (filters.priority !== 'all') result = result.filter(t => t.priority === filters.priority);
    if (filters.category !== 'all') result = result.filter(t => t.category === filters.category);
    if (filters.type !== 'all') result = result.filter(t => t.type === filters.type);
    
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [tickets, currentUser, searchQuery, filters, employees]);

  const filteredLeaves = useMemo(() => {
    let result = leaves;
    if (currentUser?.role === 'employee') {
      result = result.filter(l => l.employeeId === currentUser.id);
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [leaves, currentUser]);

  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const userTickets = currentUser?.role === 'employee' 
      ? tickets.filter(t => t.employeeId === currentUser.id) 
      : tickets;
    const openTickets = userTickets.filter(t => !['Resolved', 'Closed'].includes(t.status)).length;
    const resolvedThisWeek = userTickets.filter(t => t.resolvedAt && t.resolvedAt > weekAgo).length;
    const resolvedLastWeek = userTickets.filter(t => t.resolvedAt && t.resolvedAt > twoWeeksAgo && t.resolvedAt <= weekAgo).length;
    
    const resolvedTickets = userTickets.filter(t => t.resolvedAt);
    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => sum + (t.resolvedAt - t.createdAt), 0) / resolvedTickets.length / 3600000
      : 0;

    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

    const categoryBreakdown = TICKET_CATEGORIES.map(cat => ({
      name: cat,
      count: tickets.filter(t => t.category === cat).length,
    })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

    const priorityBreakdown = PRIORITIES.map(p => ({
      name: p,
      value: tickets.filter(t => t.priority === p && !['Resolved', 'Closed'].includes(t.status)).length,
      color: p === 'High' ? '#ef4444' : p === 'Medium' ? '#f59e0b' : '#22c55e',
    }));

    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      return {
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        opened: tickets.filter(t => t.createdAt >= dayStart && t.createdAt < dayEnd).length,
        resolved: tickets.filter(t => t.resolvedAt && t.resolvedAt >= dayStart && t.resolvedAt < dayEnd).length,
      };
    });

    const deptBreakdown = DEPARTMENTS.map(dept => ({
      name: dept,
      count: tickets.filter(t => t.dept === dept).length,
    })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

    return {
      openTickets,
      resolvedThisWeek,
      resolvedLastWeek,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      pendingLeaves,
      categoryBreakdown,
      priorityBreakdown,
      weeklyTrend,
      deptBreakdown,
      totalTickets: tickets.length,
      satisfactionScore: resolvedTickets.filter(t => t.rating).length > 0
        ? (resolvedTickets.filter(t => t.rating).reduce((sum, t) => sum + t.rating, 0) / resolvedTickets.filter(t => t.rating).length).toFixed(1)
        : 'N/A',
    };
  }, [tickets, leaves, currentUser]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!currentUser) {
    return (
      <AuthScreen 
        employees={employees}
        onLogin={handleLogin}
        toast={toast}
        setToast={setToast}
      />
    );
  }

  // First-login profile setup
  if (!currentUser.profileComplete) {
    return (
      <ProfileSetupScreen
        currentUser={currentUser}
        onComplete={handleCompleteProfile}
        onSkip={handleSkipProfile}
        onLogout={handleLogout}
        toast={toast}
        setToast={setToast}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-['DM_Sans',sans-serif]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white z-50 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-bold text-lg">
              P
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Pocket Fund</h1>
              <p className="text-xs text-slate-400">Internal Support</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto sidebar-nav" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.sidebar-nav::-webkit-scrollbar { display: none; }`}</style>
          <div className="space-y-1 pb-2">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: Home },
              { id: 'tickets', name: 'Tickets', icon: MessageSquare },
              { id: 'leaves', name: 'Leave Requests', icon: Calendar },
              { id: 'salary', name: 'Salary Status', icon: Wallet },
              { id: 'attendance', name: 'Attendance', icon: Clock },
              { id: 'announcements', name: 'Announcements', icon: Megaphone },
              { id: 'suggestions', name: 'Suggestions', icon: MessageCircle },
              { id: 'referrals', name: 'Referrals', icon: UserCheck },
              { id: 'holidays', name: 'Holidays', icon: Star },
              ...(isAdmin ? [
                { id: 'team', name: 'Team Members', icon: Users },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
              ] : [
                { id: 'directory', name: 'Directory', icon: Globe },
              ]),
              { id: 'settings', name: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
                {item.id === 'tickets' && stats.openTickets > 0 && (
                  <span className="ml-auto bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.openTickets}</span>
                )}
                {item.id === 'leaves' && stats.pendingLeaves > 0 && isAdmin && (
                  <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pendingLeaves}</span>
                )}
                {item.id === 'announcements' && announcements.filter(a => !a.archived && a.pinned).length > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">{announcements.filter(a => !a.archived && a.pinned).length}</span>
                )}
                {item.id === 'suggestions' && isAdmin && suggestions.filter(s => s.status === 'New').length > 0 && (
                  <span className="ml-auto bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">{suggestions.filter(s => s.status === 'New').length}</span>
                )}
                {item.id === 'referrals' && isAdmin && referrals.filter(r => r.status === 'Submitted').length > 0 && (
                  <span className="ml-auto bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">{referrals.filter(r => r.status === 'Submitted').length}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 capitalize">{currentUser.role === 'hr' ? 'HR Team' : currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-40">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 capitalize">
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab}
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {currentUser.role === 'employee' ? 'Employee View' : currentUser.role === 'hr' ? 'HR & Support View' : 'Admin View'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl w-72 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all"
                />
              </div>
              {/* AI Chat Toggle */}
              <button
                onClick={() => setShowAIChat(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  showAIChat 
                    ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-200' 
                    : 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-600 hover:from-violet-100 hover:to-purple-100 border border-violet-200'
                }`}
                title="PF AI"
              >
                <Sparkles size={15} />
                <span className="hidden lg:inline">PF AI</span>
              </button>
              {/* Sync Indicator */}
              <button
                onClick={() => refreshData(false)}
                disabled={isSyncing}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors group relative"
                title={lastSynced ? `Last synced: ${lastSynced.toLocaleTimeString()}` : 'Sync now'}
              >
                {isSyncing ? (
                  <RefreshCw size={18} className="text-violet-500 animate-spin" />
                ) : (
                  <Wifi size={18} className="text-emerald-500" />
                )}
              </button>
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotificationPanel(true)}
                className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Bell size={20} className="text-slate-500" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>
              {/* Calendar Popup Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowCalendarPopup(prev => !prev)}
                  className={`p-2.5 rounded-xl transition-colors ${showCalendarPopup ? 'bg-violet-100 text-violet-700' : 'hover:bg-slate-100 text-slate-500'}`}
                  title="Calendar"
                >
                  <Calendar size={20} />
                </button>
                {showCalendarPopup && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCalendarPopup(false)} />
                    <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900">Calendar</h4>
                        <button onClick={() => { setShowCalendarPopup(false); setActiveTab('holidays'); }} className="text-xs text-violet-600 font-medium hover:text-violet-700">All Holidays →</button>
                      </div>
                      <DashboardCalendar holidaySelections={holidaySelections} currentUser={currentUser} />
                    </div>
                  </>
                )}
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group"
                title="Logout"
              >
                <LogOut size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
              </button>
              {!isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewTicketModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                  >
                    <Plus size={18} />
                    New Ticket
                  </button>
                  <button
                    onClick={() => setShowNewLeaveModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                  >
                    <Calendar size={18} />
                    Apply Leave
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <MetricCard
                  title="Open Tickets"
                  value={stats.openTickets}
                  change={stats.resolvedThisWeek > stats.resolvedLastWeek ? `${Math.round((stats.resolvedThisWeek - stats.resolvedLastWeek) / (stats.resolvedLastWeek || 1) * 100)}%` : null}
                  changeType={stats.resolvedThisWeek > stats.resolvedLastWeek ? 'up' : 'down'}
                  icon={AlertCircle}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <MetricCard
                  title="Avg. Resolution Time"
                  value={`${stats.avgResolutionTime}h`}
                  icon={Clock}
                  color="bg-gradient-to-br from-violet-500 to-purple-600"
                />
                <MetricCard
                  title="Resolved This Week"
                  value={stats.resolvedThisWeek}
                  icon={CheckCircle2}
                  color="bg-gradient-to-br from-emerald-500 to-green-600"
                />
                <MetricCard
                  title={isAdmin ? "Pending Leaves" : "My Pending Leaves"}
                  value={isAdmin ? stats.pendingLeaves : filteredLeaves.filter(l => l.status === 'Pending').length}
                  icon={Calendar}
                  color="bg-gradient-to-br from-amber-500 to-orange-500"
                />
              </div>

              {/* Upcoming Holidays + Salary Status Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                {/* Upcoming Holidays Strip */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-50 rounded-lg">
                        <Star size={16} className="text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">Upcoming Holidays</h3>
                    </div>
                    <button onClick={() => setActiveTab('holidays')} className="text-xs text-violet-600 font-medium hover:text-violet-700">
                      View All →
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {(() => {
                      const today = new Date().toISOString().split('T')[0];
                      const myOptionals = holidaySelections.filter(s => s.employeeId === currentUser?.id).map(s => s.holidayId);
                      const upcoming = ALL_HOLIDAYS_2026.filter(h => {
                        if (h.date < today) return false;
                        if (h.type === 'fixed') return true;
                        if (h.type === 'optional' && myOptionals.includes(h.id)) return true;
                        if (h.type === 'custom') return true;
                        return false;
                      }).slice(0, 4);
                      if (upcoming.length === 0) return (
                        <p className="text-sm text-slate-400 py-2">No upcoming holidays</p>
                      );
                      return upcoming.map(h => (
                        <div key={h.id} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border flex-shrink-0 ${
                          h.type === 'fixed' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                        }`}>
                          <div className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-white ${
                            h.type === 'fixed' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-amber-500 to-orange-500'
                          }`}>
                            <span className="text-xs font-bold leading-none">{new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric' })}</span>
                            <span className="text-[9px] leading-none mt-0.5">{new Date(h.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{h.name}</p>
                            <p className="text-[10px] text-slate-500">{h.day}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Salary Status Mini Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  {(() => {
                    const currentMonth = getMonthKey();
                    const monthLabel = getMonthString();
                    if (currentUser.role === 'employee') {
                      const record = getSalaryRecord(currentUser.id, currentMonth);
                      const cfg = record ? SALARY_STATUS_CONFIG[record.status] : SALARY_STATUS_CONFIG['Not Processed'];
                      const statusText = record ? record.status : 'Not Processed';
                      return (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-violet-50 rounded-lg">
                                <Wallet size={16} className="text-violet-600" />
                              </div>
                              <h3 className="font-bold text-slate-900 text-sm">Salary Status</h3>
                            </div>
                            <button onClick={() => setActiveTab('salary')} className="text-xs text-violet-600 font-medium hover:text-violet-700">
                              Details →
                            </button>
                          </div>
                          <div className="flex items-center gap-2.5 mb-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                            <span className={`text-lg font-bold ${
                              statusText === 'Processed' ? 'text-emerald-700' :
                              statusText === 'In Progress' ? 'text-blue-700' :
                              statusText === 'Delayed' ? 'text-amber-700' :
                              statusText === 'On Hold' ? 'text-orange-600' :
                              'text-slate-600'
                            }`}>{statusText}</span>
                          </div>
                          <p className="text-xs text-slate-500">{cfg.label}</p>
                          <p className="text-[10px] text-slate-400 mt-2">{monthLabel}</p>
                        </>
                      );
                    } else {
                      // Admin: show summary
                      const allEmps = employees.filter(e => e.role !== 'admin');
                      const processed = allEmps.filter(e => { const r = getSalaryRecord(e.id, currentMonth); return r && r.status === 'Processed'; }).length;
                      const inProgress = allEmps.filter(e => { const r = getSalaryRecord(e.id, currentMonth); return r && r.status === 'In Progress'; }).length;
                      const pending = allEmps.length - processed - inProgress;
                      return (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-violet-50 rounded-lg">
                                <Wallet size={16} className="text-violet-600" />
                              </div>
                              <h3 className="font-bold text-slate-900 text-sm">Salary Overview</h3>
                            </div>
                            <button onClick={() => setActiveTab('salary')} className="text-xs text-violet-600 font-medium hover:text-violet-700">
                              Manage →
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400 mb-3">{monthLabel}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Processed</span>
                              <span className="text-sm font-bold text-slate-900">{processed}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />In Progress</span>
                              <span className="text-sm font-bold text-slate-900">{inProgress}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" />Not Processed</span>
                              <span className="text-sm font-bold text-slate-900">{pending}</span>
                            </div>
                          </div>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Pinned Announcements Banner */}
              {announcements.filter(a => a.pinned && !a.archived).length > 0 && (
                <div className="mb-8 space-y-3">
                  {announcements.filter(a => a.pinned && !a.archived).slice(0, 3).map(ann => (
                    <div key={ann.id} className={`rounded-2xl p-4 flex items-start gap-4 border ${
                      ann.priority === 'Urgent' ? 'bg-red-50 border-red-200' :
                      ann.priority === 'Important' ? 'bg-amber-50 border-amber-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                        ann.priority === 'Urgent' ? 'bg-red-100' :
                        ann.priority === 'Important' ? 'bg-amber-100' :
                        'bg-blue-100'
                      }`}>
                        <Pin size={16} className={
                          ann.priority === 'Urgent' ? 'text-red-600' :
                          ann.priority === 'Important' ? 'text-amber-600' :
                          'text-blue-600'
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-semibold uppercase tracking-wider ${
                            ann.priority === 'Urgent' ? 'text-red-600' :
                            ann.priority === 'Important' ? 'text-amber-600' :
                            'text-blue-600'
                          }`}>{ann.category}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-400">{formatDateTime(ann.createdAt)}</span>
                        </div>
                        <p className="font-semibold text-slate-900 text-sm">{ann.title}</p>
                        <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">{ann.body}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('announcements')}
                        className="text-xs text-violet-600 font-medium hover:text-violet-700 flex-shrink-0"
                      >
                        View →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions for Employees */}
              {currentUser.role === 'employee' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
                    <h3 className="font-bold text-lg mb-2">Need help with something?</h3>
                    <p className="text-violet-100 text-sm mb-4">Raise a ticket and our HR team will get back to you.</p>
                    <button
                      onClick={() => setShowNewTicketModal(true)}
                      className="bg-white text-violet-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-violet-50 transition-colors"
                    >
                      Create Ticket
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                    <h3 className="font-bold text-lg mb-2">Planning time off?</h3>
                    <p className="text-emerald-100 text-sm mb-4">Submit your leave request for quick approval.</p>
                    <button
                      onClick={() => setShowNewLeaveModal(true)}
                      className="bg-white text-emerald-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors"
                    >
                      Apply Leave
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Tickets & Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">
                      {currentUser.role === 'employee' ? 'My Recent Tickets' : 'Recent Tickets'}
                    </h3>
                    <button
                      onClick={() => setActiveTab('tickets')}
                      className="text-sm text-violet-600 font-medium hover:text-violet-700"
                    >
                      View All →
                    </button>
                  </div>
                  {filteredTickets.length === 0 ? (
                    <EmptyState
                      icon={MessageSquare}
                      title="No tickets yet"
                      description={currentUser.role === 'employee' ? "You haven't created any tickets. Need help with something?" : "No tickets in the system yet."}
                      action={!isAdmin && (
                        <button
                          onClick={() => setShowNewTicketModal(true)}
                          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                        >
                          Create First Ticket
                        </button>
                      )}
                    />
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredTickets.slice(0, 5).map(ticket => (
                        <div
                          key={ticket.id}
                          onClick={() => { setSelectedTicket(ticket); setShowTicketPanel(true); }}
                          className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-violet-600">{ticket.id}</span>
                                <PriorityBadge priority={ticket.priority} />
                              </div>
                              <p className="font-medium text-slate-900 truncate">{ticket.title}</p>
                              <p className="text-sm text-slate-500 mt-1">
                                {isAdmin ? `${getEmployee(ticket.employeeId)?.name} · ${ticket.dept}` : ticket.category}
                                {' · '}{formatDateTime(ticket.createdAt)}
                              </p>
                            </div>
                            <StatusBadge status={ticket.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Feed */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Recent Activity</h3>
                  </div>
                  <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {activities.slice(0, 10).map(activity => {
                      const actor = getEmployee(activity.by);
                      let text = '';
                      let color = 'bg-slate-400';
                      
                      switch (activity.type) {
                        case 'ticket_created':
                          text = `created ticket ${activity.ticketId}`;
                          color = 'bg-blue-500';
                          break;
                        case 'ticket_resolved':
                          text = `resolved ${activity.ticketId}`;
                          color = 'bg-emerald-500';
                          break;
                        case 'ticket_assigned':
                          text = `assigned ${activity.ticketId}`;
                          color = 'bg-violet-500';
                          break;
                        case 'status_changed':
                          text = `updated ${activity.ticketId} to ${activity.newStatus}`;
                          color = 'bg-amber-500';
                          break;
                        case 'comment_added':
                          text = `commented on ${activity.ticketId}`;
                          color = 'bg-blue-400';
                          break;
                        case 'note_added':
                          text = `added note to ${activity.ticketId}`;
                          color = 'bg-slate-500';
                          break;
                        case 'leave_requested':
                          text = `requested leave`;
                          color = 'bg-orange-500';
                          break;
                        case 'leave_approved':
                          text = `approved leave ${activity.leaveId}`;
                          color = 'bg-emerald-500';
                          break;
                        case 'leave_rejected':
                          text = `rejected leave ${activity.leaveId}`;
                          color = 'bg-red-500';
                          break;
                        default:
                          text = activity.type;
                      }
                      
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900">
                              <span className="font-medium">{actor?.name || 'System'}</span>
                              {' '}{text}
                            </p>
                            <p className="text-xs text-slate-400">{formatDateTime(activity.at)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">
                  {currentUser.role === 'employee' ? 'My Tickets' : 'All Tickets'}
                  <span className="text-slate-400 font-normal ml-2">({filteredTickets.length})</span>
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      showFilters ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Filter size={16} />
                    Filters
                    {Object.values(filters).filter(v => v !== 'all').length > 0 && (
                      <span className="w-5 h-5 bg-violet-600 text-white rounded-full text-xs flex items-center justify-center">
                        {Object.values(filters).filter(v => v !== 'all').length}
                      </span>
                    )}
                  </button>
                  {!isAdmin && (
                    <button
                      onClick={() => setShowNewTicketModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                    >
                      <Plus size={16} />
                      New Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="p-5 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="all">All Statuses</option>
                    {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="all">All Priorities</option>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="all">All Categories</option>
                    {TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="all">All Types</option>
                    {TICKET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button
                    onClick={() => setFilters({ status: 'all', priority: 'all', category: 'all', type: 'all' })}
                    className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Tickets List */}
              {filteredTickets.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No tickets found"
                  description={searchQuery || Object.values(filters).some(v => v !== 'all') 
                    ? "Try adjusting your search or filters" 
                    : "No tickets have been created yet"}
                  action={!isAdmin && !searchQuery && (
                    <button
                      onClick={() => setShowNewTicketModal(true)}
                      className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                    >
                      Create First Ticket
                    </button>
                  )}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Ticket</th>
                        {isAdmin && <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Employee</th>}
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Category</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Priority</th>
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                        {isAdmin && <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Assigned To</th>}
                        <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTickets.map(ticket => (
                        <tr
                          key={ticket.id}
                          onClick={() => { setSelectedTicket(ticket); setShowTicketPanel(true); }}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-violet-600 text-sm">{ticket.id}</p>
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{ticket.type}</span>
                              </div>
                              <p className="text-slate-900 text-sm truncate max-w-[250px]">{ticket.title}</p>
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="px-5 py-4">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{getEmployee(ticket.employeeId)?.name}</p>
                                <p className="text-xs text-slate-500">{ticket.dept}</p>
                              </div>
                            </td>
                          )}
                          <td className="px-5 py-4 text-sm text-slate-600">{ticket.category}</td>
                          <td className="px-5 py-4">
                            <PriorityBadge priority={ticket.priority} showLabel />
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={ticket.status} />
                          </td>
                          {isAdmin && (
                            <td className="px-5 py-4 text-sm text-slate-600">
                              {ticket.assignedTo ? getEmployee(ticket.assignedTo)?.name : '—'}
                            </td>
                          )}
                          <td className="px-5 py-4 text-sm text-slate-500">{formatDateTime(ticket.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Leaves Tab */}
          {activeTab === 'leaves' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">
                    {isAdmin ? 'Leave Requests' : 'My Leave Requests'}
                  </h3>
                  {!isAdmin && (
                    <button
                      onClick={() => setShowNewLeaveModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                    >
                      <Plus size={16} />
                      Apply Leave
                    </button>
                  )}
                </div>

                {filteredLeaves.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No leave requests"
                    description={currentUser.role === 'employee' ? "You haven't applied for any leave yet." : "No leave requests in the system."}
                    action={!isAdmin && (
                      <button
                        onClick={() => setShowNewLeaveModal(true)}
                        className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                      >
                        Apply for Leave
                      </button>
                    )}
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredLeaves.map(leave => {
                      const employee = getEmployee(leave.employeeId);
                      return (
                        <div key={leave.id} className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                                <span className="font-semibold text-violet-600 text-sm">
                                  {employee?.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{employee?.name}</p>
                                <p className="text-sm text-slate-500">{employee?.dept} · {leave.type}</p>
                                <p className="text-xs text-slate-400 mt-1">{leave.reason}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <StatusBadge status={leave.status} />
                              <p className="text-sm font-medium text-slate-900 mt-2">
                                {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                              </p>
                              <p className="text-xs text-slate-500">{leave.days} day{leave.days > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          
                          {/* Attachment / Exam Proof */}
                          {leave.attachment && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <Paperclip size={15} className="text-blue-600 flex-shrink-0" />
                                <span className="text-xs font-medium text-blue-700 truncate">{leave.attachment.name}</span>
                                <span className="text-xs text-blue-500 flex-shrink-0">({(leave.attachment.size / 1024).toFixed(0)} KB)</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const win = window.open();
                                  if (win) {
                                    if (leave.attachment.type === 'application/pdf') {
                                      win.document.write(`<iframe src="${leave.attachment.data}" style="width:100%;height:100%;border:none;"></iframe>`);
                                    } else {
                                      win.document.write(`<img src="${leave.attachment.data}" style="max-width:100%;height:auto;" />`);
                                    }
                                    win.document.title = leave.attachment.name;
                                  }
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1 flex-shrink-0"
                              >
                                <Eye size={13} />
                                View Proof
                              </button>
                            </div>
                          )}
                          {leave.type === 'Exam Leave' && !leave.attachment && (
                            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                              <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                              <span className="text-xs text-amber-700 font-medium">No exam proof attached — cannot approve</span>
                            </div>
                          )}
                          {leave.status === 'Pending' && isAdmin && leave.employeeId !== currentUser.id && (
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                              <button
                                onClick={() => handleLeaveAction(leave.id, 'approve')}
                                disabled={leave.type === 'Exam Leave' && !leave.attachment}
                                className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Check size={16} />
                                {leave.type === 'Exam Leave' && !leave.attachment ? 'No Proof — Can\'t Approve' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleLeaveAction(leave.id, 'reject')}
                                className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                              >
                                <X size={16} />
                                Reject
                              </button>
                            </div>
                          )}
                          {leave.approvedBy && (
                            <p className="text-xs text-slate-400 mt-3">
                              {leave.status} by {getEmployee(leave.approvedBy)?.name}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Leave Balance (for employees) */}
              {!isAdmin && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4">Leave Balance</h3>
                  <p className="text-xs text-slate-500 mb-4">Monthly leaves reset at end of month. No carry forward.</p>
                  <div className="space-y-3">
                    {[
                      { type: 'Personal Leave', key: 'personal', desc: 'For weddings, important matters', hasBalance: true },
                      { type: 'Sick Leave', key: 'sick', desc: 'Apply within 72h window (before or after)', hasBalance: true },
                      { type: 'Exam Leave', key: 'exam', desc: 'Unlimited — exam timetable proof required', hasBalance: false, badge: '∞' },
                      { type: 'Emergency Leave', key: 'emergency', desc: 'Case by case — reason required, proof optional', hasBalance: false, badge: 'Case by case' },
                      { type: 'Unpaid Leave', key: 'unpaid', desc: 'No restrictions — apply as needed', hasBalance: false, badge: 'No limit' },
                    ].map(item => {
                      const balance = currentUser.leaveBalance?.[item.key] || 0;
                      const used = filteredLeaves.filter(l => 
                        l.type === item.type && l.status === 'Approved'
                      ).reduce((sum, l) => sum + l.days, 0);
                      
                      return (
                        <div key={item.key} className="p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700">{item.type}</span>
                            <span className="text-sm font-semibold text-slate-900">
                              {item.hasBalance ? `${balance} remaining` : item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                          {used > 0 && (
                            <p className="text-xs text-amber-600 mt-1">Used: {used} day(s)</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-700">
                      <strong>Note:</strong> All leave requests must be submitted through this dashboard only. No email, Slack, or personal messages accepted.
                    </p>
                  </div>
                </div>
              )}

              {/* Leave Stats (for Admin) */}
              {isAdmin && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4">Leave Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                      <span className="text-sm text-orange-700">Pending</span>
                      <span className="text-lg font-bold text-orange-700">{leaves.filter(l => l.status === 'Pending').length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                      <span className="text-sm text-emerald-700">Approved (This Month)</span>
                      <span className="text-lg font-bold text-emerald-700">{leaves.filter(l => l.status === 'Approved').length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                      <span className="text-sm text-red-600">Rejected</span>
                      <span className="text-lg font-bold text-red-600">{leaves.filter(l => l.status === 'Rejected').length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Team Members Tab (Admin only) */}
          {activeTab === 'team' && isAdmin && (
            <div className="space-y-6">
              {/* Header with Add button */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {employees.filter(e => e.role !== 'admin').length} members · {employees.filter(e => e.role === 'admin').length} admin
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  <Plus size={18} />
                  Add Member
                </button>
              </div>

              {/* Admin(s) Section */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Shield size={16} className="text-violet-600" />
                    Admins
                  </h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {employees.filter(e => e.role === 'admin').map(emp => (
                    <div key={emp.id} className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <span className="font-semibold text-white text-sm">{emp.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{emp.name}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Passcode</p>
                          <p className="text-sm font-mono font-bold text-slate-700 tracking-wider">{emp.passcode}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">Admin</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employees Section */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Users size={16} className="text-slate-600" />
                    Team Members ({employees.filter(e => e.role !== 'admin').length})
                  </h3>
                </div>

                {employees.filter(e => e.role !== 'admin').length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No team members yet"
                    description="Click 'Add Member' to invite employees to the dashboard."
                    action={
                      <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                      >
                        <Plus size={16} />
                        Add First Member
                      </button>
                    }
                  />
                ) : (
                  <>
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-3">Name</div>
                      <div className="col-span-3">Email</div>
                      <div className="col-span-1">Dept</div>
                      <div className="col-span-1">Passcode</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-2">ID</div>
                      <div className="col-span-1 text-right">Action</div>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {employees.filter(e => e.role !== 'admin').map(emp => (
                        <div key={emp.id} className="px-5 py-4 hover:bg-slate-50 transition-colors group">
                          <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                            {/* Name + Avatar */}
                            <div className="col-span-3 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                                <span className="font-semibold text-slate-600 text-xs">{emp.name.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                              <span className="font-medium text-slate-900 text-sm truncate">{emp.name}</span>
                            </div>
                            {/* Email */}
                            <div className="col-span-3">
                              <span className="text-sm text-slate-600 truncate block">{emp.email}</span>
                            </div>
                            {/* Dept */}
                            <div className="col-span-1">
                              <span className="text-xs text-slate-500">{emp.dept || '—'}</span>
                            </div>
                            {/* Passcode */}
                            <div className="col-span-1">
                              <span className="font-mono text-sm font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md tracking-wider">{emp.passcode}</span>
                            </div>
                            {/* Profile Status */}
                            <div className="col-span-1">
                              {emp.profileComplete ? (
                                <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                  <CheckCircle2 size={13} /> Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                                  <Clock size={13} /> Pending
                                </span>
                              )}
                            </div>
                            {/* ID */}
                            <div className="col-span-2">
                              <span className="text-xs text-slate-400 font-mono">{emp.id}</span>
                            </div>
                            {/* Remove Button */}
                            <div className="col-span-1 text-right flex justify-end gap-1">
                              <button
                                onClick={() => setViewingEmployee(emp)}
                                className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="View details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleRemoveEmployee(emp.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Remove member"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          {/* Mobile layout */}
                          <div className="md:hidden">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                  <span className="font-semibold text-slate-600 text-sm">{emp.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">{emp.name}</p>
                                  <p className="text-xs text-slate-500">{emp.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveEmployee(emp.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="mt-3 flex items-center gap-4 pl-13">
                              <span className="font-mono text-sm font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md tracking-wider">{emp.passcode}</span>
                              <span className="text-xs text-slate-400">{emp.dept || 'No dept'}</span>
                              {emp.profileComplete ? (
                                <span className="text-emerald-600 text-xs font-medium">Active</span>
                              ) : (
                                <span className="text-amber-600 text-xs font-medium">Pending setup</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab (Admin only) */}
          {activeTab === 'analytics' && isAdmin && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <MetricCard
                  title="Total Tickets"
                  value={stats.totalTickets}
                  icon={FileText}
                  color="bg-gradient-to-br from-slate-600 to-slate-700"
                />
                <MetricCard
                  title="Open Tickets"
                  value={stats.openTickets}
                  icon={AlertCircle}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <MetricCard
                  title="Avg. Resolution"
                  value={`${stats.avgResolutionTime}h`}
                  icon={Clock}
                  color="bg-gradient-to-br from-violet-500 to-purple-600"
                />
                <MetricCard
                  title="Satisfaction"
                  value={stats.satisfactionScore === 'N/A' ? 'N/A' : `${stats.satisfactionScore}/5`}
                  icon={UserCheck}
                  color="bg-gradient-to-br from-emerald-500 to-green-600"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Weekly Trend */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4">Weekly Ticket Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={stats.weeklyTrend}>
                      <defs>
                        <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="opened" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorOpened)" />
                      <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span className="text-sm text-slate-600">Opened</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm text-slate-600">Resolved</span>
                    </div>
                  </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4">Open Tickets by Priority</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.priorityBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.priorityBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    {stats.priorityBreakdown.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-slate-600">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4">Tickets by Category</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.categoryBreakdown} layout="vertical">
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={80} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Department Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4">Tickets by Department</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.deptBreakdown} layout="vertical">
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={80} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              {isAdmin && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowNewAnnouncementModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                  >
                    <Megaphone size={18} />
                    New Announcement
                  </button>
                </div>
              )}

              {announcements.filter(a => !a.archived).length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <EmptyState
                    icon={Megaphone}
                    title="No announcements"
                    description={isAdmin ? "Post an announcement to keep the team informed." : "No company announcements right now."}
                    action={isAdmin && (
                      <button
                        onClick={() => setShowNewAnnouncementModal(true)}
                        className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
                      >
                        Post First Announcement
                      </button>
                    )}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pinned first, then by date */}
                  {announcements
                    .filter(a => !a.archived)
                    .sort((a, b) => {
                      if (a.pinned && !b.pinned) return -1;
                      if (!a.pinned && b.pinned) return 1;
                      return b.createdAt - a.createdAt;
                    })
                    .map(ann => {
                      const author = getEmployee(ann.createdBy);
                      return (
                        <div key={ann.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                          ann.pinned ? 'border-violet-200 ring-1 ring-violet-100' : 'border-slate-100'
                        }`}>
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  {ann.pinned && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                                      <Pin size={10} /> Pinned
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                                    ann.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                                    ann.priority === 'Important' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-slate-50 text-slate-600 border-slate-200'
                                  }`}>{ann.priority}</span>
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{ann.category}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{ann.title}</h3>
                                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{ann.body}</p>
                                <div className="flex items-center gap-3 mt-4">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-violet-600">{author?.name?.charAt(0) || '?'}</span>
                                  </div>
                                  <span className="text-sm text-slate-500">
                                    {author?.name || 'Unknown'} · {formatDateTime(ann.createdAt)}
                                  </span>
                                </div>
                              </div>
                              {isAdmin && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => handleTogglePinAnnouncement(ann.id)}
                                    className={`p-2 rounded-xl transition-colors ${ann.pinned ? 'bg-violet-100 text-violet-700' : 'hover:bg-slate-100 text-slate-400'}`}
                                    title={ann.pinned ? 'Unpin' : 'Pin'}
                                  >
                                    <Pin size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleArchiveAnnouncement(ann.id)}
                                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                                    title="Archive"
                                  >
                                    <Archive size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAnnouncement(ann.id)}
                                    className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              )}

              {/* Archived Announcements (Admin only) */}
              {isAdmin && announcements.filter(a => a.archived).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Archived</h3>
                  <div className="space-y-3">
                    {announcements.filter(a => a.archived).sort((a, b) => b.createdAt - a.createdAt).map(ann => (
                      <div key={ann.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-4 opacity-60">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-700">{ann.title}</p>
                            <p className="text-xs text-slate-400">{formatDateTime(ann.createdAt)}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Employee Directory (for employees) */}
          {activeTab === 'directory' && !isAdmin && (
            <EmployeeDirectory employees={employees.filter(e => e.profileComplete)} currentUser={currentUser} />
          )}

          {/* Salary Status Tab */}
          {activeTab === 'salary' && (
            <SalaryStatusPage
              currentUser={currentUser}
              employees={employees}
              salaryRecords={salaryRecords}
              getSalaryRecord={getSalaryRecord}
              onUpdateStatus={handleUpdateSalaryStatus}
              isAdmin={isAdmin}
            />
          )}

          {/* Attendance Tab (Jibble Integration) */}
          {activeTab === 'attendance' && (
            <AttendancePage
              currentUser={currentUser}
              employees={employees}
              isAdmin={isAdmin}
              showToast={showToast}
            />
          )}

          {/* Anonymous Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <SuggestionsPage
              suggestions={suggestions}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onCreateSuggestion={() => setShowNewSuggestionModal(true)}
              onUpdateSuggestion={handleUpdateSuggestion}
              onDeleteSuggestion={handleDeleteSuggestion}
            />
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <ReferralsPage
              referrals={referrals}
              currentUser={currentUser}
              isAdmin={isAdmin}
              getEmployee={getEmployee}
              onCreateReferral={() => setShowNewReferralModal(true)}
              onUpdateReferral={handleUpdateReferral}
              onDeleteReferral={handleDeleteReferral}
            />
          )}

          {/* Holidays Tab */}
          {activeTab === 'holidays' && (
            <HolidaysPage
              currentUser={currentUser}
              isAdmin={isAdmin}
              holidaySelections={holidaySelections}
              onSaveSelections={saveHolidaySelections}
              employees={employees}
              getEmployee={getEmployee}
              showToast={showToast}
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onUpdateSettings={handleUpdateSettings}
              onLogout={handleLogout}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {/* New Ticket Modal */}
      <Modal
        isOpen={showNewTicketModal}
        onClose={() => setShowNewTicketModal(false)}
        title="Create New Ticket"
        size="md"
      >
        <NewTicketForm onSubmit={handleCreateTicket} onCancel={() => setShowNewTicketModal(false)} />
      </Modal>

      {/* New Leave Modal */}
      <Modal
        isOpen={showNewLeaveModal}
        onClose={() => setShowNewLeaveModal(false)}
        title="Apply for Leave"
        size="md"
      >
        <NewLeaveForm 
          onSubmit={handleCreateLeave} 
          onCancel={() => setShowNewLeaveModal(false)}
          leaveBalance={currentUser?.leaveBalance}
        />
      </Modal>

      {/* Ticket Detail Panel */}
      <SlidePanel
        isOpen={showTicketPanel && selectedTicket}
        onClose={() => { setShowTicketPanel(false); setSelectedTicket(null); }}
        title={selectedTicket?.id || ''}
      >
        {selectedTicket && (
          <TicketDetailPanel
            ticket={selectedTicket}
            currentUser={currentUser}
            employees={employees.filter(e => e.role === 'admin')}
            getEmployee={getEmployee}
            onUpdate={handleUpdateTicket}
            onAddComment={handleAddComment}
            onRate={handleRateTicket}
            isAdmin={isAdmin}
          />
        )}
      </SlidePanel>

      {/* New Announcement Modal */}
      <Modal
        isOpen={showNewAnnouncementModal}
        onClose={() => setShowNewAnnouncementModal(false)}
        title="Post Announcement"
        size="md"
      >
        <NewAnnouncementForm onSubmit={handleCreateAnnouncement} onCancel={() => setShowNewAnnouncementModal(false)} />
      </Modal>

      {/* Add Team Member Modal (Admin) */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title="Add Team Member"
        size="md"
      >
        <AddMemberForm
          employees={employees}
          onSubmit={handleAddEmployee}
          onCancel={() => setShowAddMemberModal(false)}
        />
      </Modal>

      {/* New Anonymous Suggestion Modal */}
      <Modal
        isOpen={showNewSuggestionModal}
        onClose={() => setShowNewSuggestionModal(false)}
        title="Submit Anonymous Suggestion"
        size="md"
      >
        <NewSuggestionForm onSubmit={handleCreateSuggestion} onCancel={() => setShowNewSuggestionModal(false)} />
      </Modal>

      {/* New Referral Modal */}
      <Modal
        isOpen={showNewReferralModal}
        onClose={() => setShowNewReferralModal(false)}
        title="Submit a Referral"
        size="lg"
      >
        <NewReferralForm onSubmit={handleCreateReferral} onCancel={() => setShowNewReferralModal(false)} />
      </Modal>

      {/* Notification Panel */}
      <SlidePanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
        title="Notifications"
      >
        <NotificationPanel
          notifications={notifications.filter(n => (!n.forUser && !n.forUsers) || n.forUser === currentUser?.id || n.forUser === 'all' || (n.forUsers && n.forUsers.includes(currentUser?.id)))}
          onMarkRead={markNotificationRead}
          onMarkAllRead={markAllNotificationsRead}
          onClearAll={clearAllNotifications}
          getEmployee={getEmployee}
        />
      </SlidePanel>

      {/* Employee Detail Panel (Admin) */}
      <SlidePanel
        isOpen={!!viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        title={viewingEmployee?.name || 'Employee Details'}
      >
        {viewingEmployee && (
          <EmployeeDetailPanel
            employee={viewingEmployee}
            onUpdate={async (updates) => {
              const newEmployees = employees.map(e => e.id === viewingEmployee.id ? { ...e, ...updates } : e);
              await saveEmployees(newEmployees);
              setViewingEmployee({ ...viewingEmployee, ...updates });
              showToast('Employee details updated!');
            }}
          />
        )}
      </SlidePanel>

      {/* AI Leave Policy Chat */}
      {showAIChat && <LeaveQABot onClose={() => setShowAIChat(false)} />}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ============ AUTH SCREEN ============
function AuthScreen({ employees, onLogin, toast, setToast }) {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  const handleLogin = () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!passcode.trim()) {
      setError('Please enter your 6-digit passcode');
      return;
    }

    const user = employees.find(e => 
      e.email.toLowerCase() === email.toLowerCase().trim() && 
      e.passcode === passcode.trim()
    );

    if (!user) {
      setError('Invalid email or passcode. Please check your credentials.');
      return;
    }

    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4 font-['DM_Sans',sans-serif]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Pocket Fund</h1>
          <p className="text-slate-500 mt-1">Internal Support Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome</h2>
            <p className="text-slate-500 text-sm mb-6">Sign in with your work email and passcode</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@pocket-fund.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit Passcode</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    maxLength={6}
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={!email.trim() || passcode.length !== 6}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign In
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Your passcode was shared by the admin. Contact <span className="font-medium text-slate-500">hello@pocket-fund.com</span> if you need help.
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ============ PROFILE SETUP SCREEN (First Login) ============
function ProfileSetupScreen({ currentUser, onComplete, onSkip, onLogout, toast, setToast }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: currentUser.name || '',
    dept: currentUser.dept || 'Engineering',
    gender: '',
    dob: '',
    phone: '',
    profilePhoto: '',
    address: { line1: '', landmark: '', city: '', state: '', pincode: '', country: 'India' },
    emergencyContact: { name: '', phone: '', relation: '' },
    bankDetails: { holderName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' },
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { setError('Photo must be under 500KB'); return; }
    const reader = new FileReader();
    reader.onload = () => setProfileData(p => ({ ...p, profilePhoto: reader.result }));
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!profileData.name.trim()) { setError('Full name is required'); return false; }
      if (!profileData.dept) { setError('Department is required'); return false; }
      if (!profileData.gender) { setError('Gender is required'); return false; }
      if (!profileData.dob) { setError('Date of birth is required'); return false; }
      if (!profileData.phone || profileData.phone.length < 10) { setError('Valid phone number is required'); return false; }
    } else if (step === 2) {
      if (!profileData.address.line1.trim()) { setError('Address is required'); return false; }
      if (!profileData.address.city.trim()) { setError('City is required'); return false; }
      if (!profileData.address.country) { setError('Country is required'); return false; }
      const statesAvailable = getStatesForCountry(profileData.address.country);
      if (statesAvailable.length > 0 && !profileData.address.state) { setError('State/Province is required'); return false; }
      if (!profileData.address.pincode) { setError('Postal/ZIP code is required'); return false; }
    } else if (step === 3) {
      if (!profileData.emergencyContact.name.trim()) { setError('Emergency contact name is required'); return false; }
      if (!profileData.emergencyContact.phone || profileData.emergencyContact.phone.length < 10) { setError('Valid emergency phone is required'); return false; }
      if (!profileData.emergencyContact.relation.trim()) { setError('Relation is required'); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => Math.min(s + 1, totalSteps)); };
  const handleBack = () => { setError(''); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = () => {
    // Bank details are optional but if partially filled, validate
    onComplete({
      name: profileData.name.trim(),
      dept: profileData.dept,
      gender: profileData.gender,
      dob: profileData.dob,
      phone: profileData.phone,
      profilePhoto: profileData.profilePhoto,
      address: profileData.address,
      emergencyContact: profileData.emergencyContact,
      bankDetails: profileData.bankDetails,
    });
  };

  const updateAddress = (key, val) => setProfileData(p => ({ ...p, address: { ...p.address, [key]: val } }));
  const updateEmergency = (key, val) => setProfileData(p => ({ ...p, emergencyContact: { ...p.emergencyContact, [key]: val } }));
  const updateBank = (key, val) => setProfileData(p => ({ ...p, bankDetails: { ...p.bankDetails, [key]: val } }));

  const inputCls = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4 font-['DM_Sans',sans-serif]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/30">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Complete Your Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Step {step} of {totalSteps}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-violet-500' : 'bg-slate-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100">
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><User size={18} className="text-violet-600" /> Personal Information</h3>
                {/* Photo Upload */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profileData.profilePhoto ? (
                      <img src={profileData.profilePhoto} className="w-16 h-16 rounded-xl object-cover" alt="Profile" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center"><Camera size={24} className="text-slate-400" /></div>
                    )}
                    <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-violet-700 transition-colors">
                      <Upload size={13} className="text-white" />
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Profile Photo</p>
                    <p className="text-xs text-slate-400">Optional · Max 500KB</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                    <input type="text" value={profileData.name} onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Department *</label>
                    <select value={profileData.dept} onChange={e => setProfileData(p => ({ ...p, dept: e.target.value }))} className={inputCls}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Gender *</label>
                    <select value={profileData.gender} onChange={e => setProfileData(p => ({ ...p, gender: e.target.value }))} className={inputCls}>
                      <option value="">Select</option>
                      {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth *</label>
                    <input type="date" value={profileData.dob} onChange={e => setProfileData(p => ({ ...p, dob: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number *</label>
                    <input type="tel" value={profileData.phone} onChange={e => setProfileData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="10-digit number" className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><MapPin size={18} className="text-violet-600" /> Home Address</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Country *</label>
                  <select value={profileData.address.country} onChange={e => { updateAddress('country', e.target.value); updateAddress('state', ''); }} className={inputCls}>
                    <option value="">Select Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Address Line *</label>
                  <input type="text" value={profileData.address.line1} onChange={e => updateAddress('line1', e.target.value)} placeholder="House/Flat No., Street, Area" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Landmark</label>
                  <input type="text" value={profileData.address.landmark} onChange={e => updateAddress('landmark', e.target.value)} placeholder="Near..." className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">City *</label>
                    <input type="text" value={profileData.address.city} onChange={e => updateAddress('city', e.target.value)} placeholder="City" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">State / Province {getStatesForCountry(profileData.address.country).length > 0 ? '*' : ''}</label>
                    {getStatesForCountry(profileData.address.country).length > 0 ? (
                      <select value={profileData.address.state} onChange={e => updateAddress('state', e.target.value)} className={inputCls}>
                        <option value="">Select</option>
                        {getStatesForCountry(profileData.address.country).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={profileData.address.state} onChange={e => updateAddress('state', e.target.value)} placeholder="State/Province" className={inputCls} />
                    )}
                  </div>
                  <div>
                    {(() => { const pc = getPostalConfig(profileData.address.country); return (<>
                      <label className="block text-xs font-medium text-slate-600 mb-1">{pc.label} *</label>
                      <input type="text" value={profileData.address.pincode} onChange={e => updateAddress('pincode', e.target.value.replace(pc.regex, '').slice(0, pc.maxLen))} placeholder={pc.placeholder} className={inputCls} />
                    </>); })()}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Emergency Contact */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><Heart size={18} className="text-red-500" /> Emergency Contact</h3>
                <p className="text-xs text-slate-500">This person will be contacted in case of an emergency.</p>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contact Name *</label>
                  <input type="text" value={profileData.emergencyContact.name} onChange={e => updateEmergency('name', e.target.value)} placeholder="Full name" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contact Phone *</label>
                  <input type="tel" value={profileData.emergencyContact.phone} onChange={e => updateEmergency('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Relation *</label>
                  <input type="text" value={profileData.emergencyContact.relation} onChange={e => updateEmergency('relation', e.target.value)} placeholder="e.g. Father, Mother, Spouse" className={inputCls} />
                </div>
              </div>
            )}

            {/* Step 4: Bank Details */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><CreditCard size={18} className="text-violet-600" /> Bank / Payment Details</h3>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs text-amber-700"><strong>Optional but recommended.</strong> Used for salary/stipend processing. You can add this later in Settings.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Account Holder Name</label>
                  <input type="text" value={profileData.bankDetails.holderName} onChange={e => updateBank('holderName', e.target.value)} placeholder="As per bank records" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Account Number</label>
                    <input type="text" value={profileData.bankDetails.accountNumber} onChange={e => updateBank('accountNumber', e.target.value.replace(/\D/g, ''))} placeholder="Account number" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">IFSC Code</label>
                    <input type="text" value={profileData.bankDetails.ifsc} onChange={e => updateBank('ifsc', e.target.value.toUpperCase().slice(0, 11))} placeholder="e.g. SBIN0001234" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Bank Name</label>
                  <input type="text" value={profileData.bankDetails.bankName} onChange={e => updateBank('bankName', e.target.value)} placeholder="e.g. State Bank of India" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">UPI ID</label>
                  <input type="text" value={profileData.bankDetails.upiId} onChange={e => updateBank('upiId', e.target.value)} placeholder="yourname@upi" className={inputCls} />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                {step > 1 ? (
                  <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : (
                  <button onClick={onLogout} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Sign out</button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onSkip} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                  Skip for now
                </button>
              {step < totalSteps ? (
                <button onClick={handleNext} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors text-sm flex items-center gap-1.5">
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors text-sm">
                  Complete Setup →
                </button>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ============ FORM COMPONENTS ============

function NewTicketForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'Complaint',
    category: 'HR',
    priority: 'Medium',
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  const aiCategorize = async () => {
    if (!formData.description.trim()) return;
    setAiLoading(true);
    setAiDone(false);
    const systemPrompt = `You are a ticket categorization AI for Pocket Fund HR. Given a ticket description, respond ONLY with a JSON object like: {"category":"HR","priority":"Medium","suggested_title":"Short title","type":"Complaint"}\nCategories: ${TICKET_CATEGORIES.join(', ')}\nTypes: ${TICKET_TYPES.join(', ')}\nPriorities: Low, Medium, High. Assess urgency from the description.`;
    const result = await callClaude(systemPrompt, formData.description);
    try {
      const cleaned = result.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setFormData(prev => ({
        ...prev,
        category: parsed.category || prev.category,
        priority: parsed.priority || prev.priority,
        type: parsed.type || prev.type,
        title: prev.title || parsed.suggested_title || prev.title,
      }));
      setAiDone(true);
    } catch {
      // AI response wasn't parseable, that's fine
    }
    setAiLoading(false);
  };

  const handleSubmit = () => {
    setError('');
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Description FIRST for AI analysis */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setAiDone(false); }}
          placeholder="Describe your issue or suggestion in detail..."
          rows={4}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 resize-none"
        />
      </div>

      {/* AI Categorize Button */}
      <button
        type="button"
        onClick={aiCategorize}
        disabled={aiLoading || !formData.description.trim()}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          aiDone
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : aiLoading
            ? 'bg-violet-50 text-violet-400 border border-violet-200'
            : formData.description.trim()
            ? 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200 hover:from-violet-100 hover:to-purple-100'
            : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
        }`}
      >
        <Sparkles size={16} />
        {aiLoading ? 'AI analyzing...' : aiDone ? '✓ AI categorized — adjust below if needed' : 'Auto-categorize with AI'}
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
          >
            {TICKET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
          >
            {TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
        <div className="flex gap-2">
          {PRIORITIES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setFormData({ ...formData, priority: p })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                formData.priority === p
                  ? p === 'High' ? 'bg-red-100 text-red-700 border-2 border-red-300'
                    : p === 'Medium' ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                    : 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief summary of your issue"
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
        >
          Create Ticket
        </button>
      </div>
    </div>
  );
}

function NewLeaveForm({ onSubmit, onCancel, leaveBalance }) {
  const today = new Date().toISOString().split('T')[0];
  
  // Sick leave date bounds: 3 days back, 3 days forward (72h window)
  const sickMinDate = (() => { const d = new Date(); d.setDate(d.getDate() - 3); return d.toISOString().split('T')[0]; })();
  const sickMaxDate = (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0]; })();

  const [formData, setFormData] = useState({
    type: 'Personal Leave',
    startDate: today,
    endDate: today,
    reason: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');

  const leaveTypeToKey = {
    'Personal Leave': 'personal',
    'Sick Leave': 'sick',
    'Exam Leave': 'exam',
    'Unpaid Leave': 'unpaid',
    'Emergency Leave': 'emergency',
  };

  const isExamLeave = formData.type === 'Exam Leave';
  const isSickLeave = formData.type === 'Sick Leave';
  const isEmergencyLeave = formData.type === 'Emergency Leave';
  const isUnpaidLeave = formData.type === 'Unpaid Leave';
  const needsRequiredAttachment = isExamLeave;
  const showOptionalAttachment = isEmergencyLeave;
  const showAttachmentUpload = needsRequiredAttachment || showOptionalAttachment;
  const reasonRequired = !isUnpaidLeave; // reason optional only for unpaid

  const getLeaveLabel = (type) => {
    const key = leaveTypeToKey[type];
    if (key === 'exam') return `${type} (Unlimited — proof required)`;
    if (key === 'emergency') return `${type} (Case by case)`;
    if (key === 'unpaid') return `${type} (No restrictions)`;
    if (key === 'sick') return `${type} (Within 72h window)`;
    return `${type} (${leaveBalance?.[key] || 0} days available)`;
  };

  const getLeaveHint = () => {
    if (isExamLeave) return 'Unlimited — upload your exam timetable as proof';
    if (isSickLeave) return 'You can apply up to 3 days before or after. Forgot to apply yesterday? No worries.';
    if (isEmergencyLeave) return 'Approved case by case. Reason is required, proof is optional but helps.';
    if (isUnpaidLeave) return 'No restrictions — apply as needed.';
    const key = leaveTypeToKey[formData.type];
    return `You have ${leaveBalance?.[key] || 0} days of ${formData.type} available`;
  };

  // Date constraints per leave type
  const getMinDate = () => {
    if (isSickLeave) return sickMinDate;
    return today; // all others: today or future
  };
  const getMaxDate = () => {
    if (isSickLeave) return sickMaxDate;
    return ''; // no max for others
  };

  const handleTypeChange = (newType) => {
    setAttachment(null);
    setError('');
    // Reset dates to today when switching types
    setFormData(prev => ({ ...prev, type: newType, startDate: today, endDate: today }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setAttachment(null); return; }

    if (file.size > 2 * 1024 * 1024) {
      setError('File must be under 2MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result,
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setFormData(prev => ({
      ...prev,
      startDate: newStart,
      endDate: prev.endDate < newStart ? newStart : prev.endDate
    }));
  };

  const handleEndDateChange = (e) => {
    setFormData(prev => ({ ...prev, endDate: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.startDate) { setError('Please select a start date'); return; }
    if (!formData.endDate) { setError('Please select an end date'); return; }
    if (formData.endDate < formData.startDate) { setError('End date cannot be before start date'); return; }

    // Reason required for all except unpaid
    if (reasonRequired && !formData.reason.trim()) {
      setError('Please provide a reason for your leave');
      return;
    }

    // Sick leave: validate date is within 72h window
    if (isSickLeave) {
      if (formData.startDate < sickMinDate || formData.startDate > sickMaxDate) {
        setError('Sick leave can only be applied within a 72-hour window (3 days before or after today)');
        return;
      }
      if (formData.endDate < sickMinDate || formData.endDate > sickMaxDate) {
        setError('Sick leave end date must be within the 72-hour window');
        return;
      }
    }

    // Exam leave: attachment mandatory
    if (isExamLeave && !attachment) {
      setError('Exam timetable / proof is required for Exam Leave');
      return;
    }

    // Emergency leave: reason is mandatory (already handled above)
    
    onSubmit({ ...formData, attachment: attachment || null });
  };

  const endMinDate = (() => {
    const startOrToday = formData.startDate || today;
    const typeMin = getMinDate();
    return startOrToday > typeMin ? startOrToday : typeMin;
  })();

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
        <select
          value={formData.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
        >
          {LEAVE_TYPES.map(t => (
            <option key={t} value={t}>{getLeaveLabel(t)}</option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">{getLeaveHint()}</p>
      </div>

      {/* Sick leave info banner */}
      {isSickLeave && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-700">
            <strong>72-hour window:</strong> You can apply for sick leave from <strong>{formatDate(sickMinDate)}</strong> to <strong>{formatDate(sickMaxDate)}</strong>. 
            Feeling sick today? Apply for tomorrow. Forgot to apply yesterday? Apply now.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={handleStartDateChange}
            min={getMinDate()}
            max={getMaxDate() || undefined}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={handleEndDateChange}
            min={endMinDate}
            max={getMaxDate() || undefined}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
          />
        </div>
      </div>
      
      {formData.startDate && formData.endDate && (
        <div className="p-3 bg-violet-50 rounded-xl">
          <p className="text-sm text-violet-700">
            <strong>Duration:</strong> {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Reason {reasonRequired && <span className="text-red-500">*</span>}
          {!reasonRequired && <span className="text-slate-400 font-normal">(optional)</span>}
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder={isUnpaidLeave ? "Optional — add a reason if you'd like" : "Please provide a reason for your leave request..."}
          rows={3}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 resize-none"
        />
      </div>

      {/* File Upload — Exam (required) / Emergency (optional) */}
      {showAttachmentUpload && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {isExamLeave ? 'Exam Timetable / Proof' : 'Supporting Document'}
            {needsRequiredAttachment ? <span className="text-red-500 ml-0.5">*</span> : <span className="text-slate-400 font-normal ml-1">(optional)</span>}
          </label>
          <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
            attachment ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-violet-300'
          }`}>
            {attachment ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip size={16} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-emerald-700 truncate">{attachment.name}</span>
                  <span className="text-xs text-emerald-500 flex-shrink-0">({(attachment.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="p-1 hover:bg-emerald-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X size={16} className="text-emerald-600" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Paperclip size={24} className="text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">Click to upload {isExamLeave ? 'proof' : 'document'}</p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — max 2MB</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}

function TicketDetailPanel({ ticket, currentUser, employees, getEmployee, onUpdate, onAddComment, onRate, isAdmin }) {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [assignTo, setAssignTo] = useState(ticket.assignedTo || '');
  const [status, setStatus] = useState(ticket.status);
  const [rating, setRating] = useState(ticket.rating || 0);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const employee = getEmployee(ticket.employeeId);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onAddComment(ticket.id, newComment, isInternal);
    setNewComment('');
  };

  const handleUpdate = () => {
    const updates = {};
    if (status !== ticket.status) updates.status = status;
    if (assignTo !== (ticket.assignedTo || '')) updates.assignedTo = assignTo || null;
    if (Object.keys(updates).length > 0) {
      onUpdate(ticket.id, updates);
    }
  };

  const handleRate = (r) => {
    setRating(r);
    onRate(ticket.id, r);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} showLabel />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">{ticket.title}</h3>
        <p className="text-sm text-slate-500 mt-1">
          {employee?.name} · {ticket.dept} · {ticket.category}
        </p>
        <p className="text-xs text-slate-400 mt-1">Created {formatDateTime(ticket.createdAt)}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Description */}
        <div className="p-5 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Description</h4>
          <p className="text-sm text-slate-600">{ticket.description}</p>
        </div>

        {/* HR/Admin Controls */}
        {isAdmin && (
          <div className="p-5 border-b border-slate-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
              <select
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="">Unassigned</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button
              onClick={handleUpdate}
              disabled={status === ticket.status && assignTo === (ticket.assignedTo || '')}
              className="w-full py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Ticket
            </button>
          </div>
        )}

        {/* Rating (for employees on resolved tickets) */}
        {!isAdmin && ['Resolved', 'Closed'].includes(ticket.status) && (
          <div className="p-5 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Rate your experience</h4>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  onClick={() => handleRate(r)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                    r <= rating ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Close Ticket — Employee can close their resolved ticket */}
        {!isAdmin && ticket.status === 'Resolved' && (
          <div className="p-5 border-b border-slate-100">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm text-emerald-800 mb-3">Your ticket has been resolved. If you're satisfied, you can close it. If not, add a comment to reopen the conversation.</p>
              <button
                onClick={() => onUpdate(ticket.id, { status: 'Closed' })}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm flex items-center gap-2"
              >
                <CheckCircle2 size={16} /> Close Ticket
              </button>
            </div>
          </div>
        )}

        {/* Reopen — Employee can reopen a closed ticket */}
        {!isAdmin && ticket.status === 'Closed' && (
          <div className="p-5 border-b border-slate-100">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-600 mb-3">This ticket is closed. If your issue isn't resolved, you can reopen it.</p>
              <button
                onClick={() => onUpdate(ticket.id, { status: 'Open' })}
                className="px-5 py-2.5 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
              >
                <RefreshCw size={16} /> Reopen Ticket
              </button>
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="p-5">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Comments</h4>
          {ticket.comments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No comments yet</p>
          ) : (
            <div className="space-y-3 mb-4">
              {ticket.comments.map((comment, i) => {
                const author = getEmployee(comment.by);
                const isOwn = comment.by === currentUser.id;
                return (
                  <div key={i} className={`p-3 rounded-xl ${isOwn ? 'bg-violet-50' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">{author?.name}</span>
                      <span className="text-xs text-slate-400">{formatDateTime(comment.at)}</span>
                    </div>
                    <p className="text-sm text-slate-600">{comment.text}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Internal Notes (Admin only) */}
          {isAdmin && ticket.internalNotes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <EyeOff size={14} />
                Internal Notes
              </h4>
              <div className="space-y-3">
                {ticket.internalNotes.map((note, i) => {
                  const author = getEmployee(note.by);
                  return (
                    <div key={i} className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-amber-900">{author?.name}</span>
                        <span className="text-xs text-amber-600">{formatDateTime(note.at)}</span>
                      </div>
                      <p className="text-sm text-amber-800">{note.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comment Input */}
      {!['Closed'].includes(ticket.status) && (
        <div className="p-5 border-t border-slate-100">
          {/* AI Smart Reply (Admin only) */}
          {isAdmin && (
            <div className="mb-3">
              <button
                type="button"
                onClick={async () => {
                  setAiLoading(true);
                  setAiSuggestions([]);
                  const systemPrompt = `You are an HR assistant for Pocket Fund, a Venture Capital firm. Generate exactly 3 professional reply suggestions for an HR support ticket. Return them as a JSON array of 3 strings. Each reply should be 1-3 sentences, professional but warm. Only return the JSON array, nothing else.`;
                  const userMsg = `Ticket: "${ticket.title}"\nDescription: "${ticket.description}"\nCategory: ${ticket.category}\nPriority: ${ticket.priority}\nExisting comments: ${ticket.comments.map(c => c.text).join('; ') || 'None'}`;
                  const result = await callClaude(systemPrompt, userMsg);
                  try {
                    const cleaned = result.replace(/```json|```/g, '').trim();
                    const parsed = JSON.parse(cleaned);
                    setAiSuggestions(Array.isArray(parsed) ? parsed : []);
                  } catch {
                    setAiSuggestions([result]);
                  }
                  setAiLoading(false);
                }}
                disabled={aiLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  aiLoading
                    ? 'bg-violet-50 text-violet-400 border border-violet-200'
                    : 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200 hover:from-violet-100 hover:to-purple-100'
                }`}
              >
                <Sparkles size={13} />
                {aiLoading ? 'Generating...' : 'AI Smart Reply'}
              </button>
              {aiSuggestions.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {aiSuggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setNewComment(s); setAiSuggestions([]); }}
                      className="w-full text-left p-2.5 bg-violet-50 hover:bg-violet-100 border border-violet-100 hover:border-violet-200 rounded-xl text-xs text-violet-800 transition-all leading-relaxed"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {isAdmin && (
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setIsInternal(false)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  !isInternal ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Eye size={12} className="inline mr-1" />
                Public
              </button>
              <button
                onClick={() => setIsInternal(true)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isInternal ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <EyeOff size={12} className="inline mr-1" />
                Internal
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isInternal ? "Add internal note..." : "Add a comment..."}
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ NEW ANNOUNCEMENT FORM ============
function NewAnnouncementForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    priority: 'Normal',
    category: 'General',
    pinned: false,
  });
  const [error, setError] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiDraft, setShowAiDraft] = useState(false);

  const generateDraft = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    const systemPrompt = `You are an HR communications writer for Pocket Fund, a Venture Capital firm. Write a company announcement. Return ONLY a JSON object: {"title":"Short title","body":"Announcement body (2-4 sentences, ${aiTone} tone)","priority":"Normal","category":"General"}. No markdown, no code fences. Categories: ${ANNOUNCEMENT_CATEGORIES.join(', ')}. Priorities: ${ANNOUNCEMENT_PRIORITIES.join(', ')}.`;
    const result = await callClaude(systemPrompt, `Topic: ${aiTopic}`);
    try {
      const cleaned = result.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setFormData(prev => ({
        ...prev,
        title: parsed.title || prev.title,
        body: parsed.body || prev.body,
        priority: parsed.priority || prev.priority,
        category: parsed.category || prev.category,
      }));
    } catch {
      setFormData(prev => ({ ...prev, body: result }));
    }
    setAiLoading(false);
    setShowAiDraft(false);
  };

  const handleSubmit = () => {
    setError('');
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!formData.body.trim()) {
      setError('Please enter the announcement message');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Draft Toggle */}
      <button
        type="button"
        onClick={() => setShowAiDraft(!showAiDraft)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-200 hover:from-violet-100 hover:to-purple-100 transition-all"
      >
        <Sparkles size={16} />
        {showAiDraft ? 'Hide AI Drafter' : 'Draft with AI'}
      </button>

      {/* AI Draft Section */}
      {showAiDraft && (
        <div className="p-4 bg-violet-50 rounded-xl border border-violet-200 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-violet-700 mb-1">What's it about?</label>
            <textarea
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g. Office closed next Friday for team outing..."
              rows={2}
              className="w-full px-3 py-2 bg-white border border-violet-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-violet-700 mb-1">Tone</label>
            <div className="flex gap-1.5">
              {['professional', 'friendly', 'urgent', 'celebratory'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAiTone(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    aiTone === t ? 'bg-violet-600 text-white' : 'bg-white text-violet-600 border border-violet-200 hover:bg-violet-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={generateDraft}
            disabled={aiLoading || !aiTopic.trim()}
            className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {aiLoading ? '✦ Generating...' : '✦ Generate Draft'}
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Announcement title"
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
          >
            {ANNOUNCEMENT_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
          >
            {ANNOUNCEMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
        <textarea
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          placeholder="Write your announcement..."
          rows={5}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 resize-none"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer p-3 bg-violet-50 rounded-xl">
        <input
          type="checkbox"
          checked={formData.pinned}
          onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
          className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
        />
        <div>
          <span className="text-sm font-medium text-violet-900">Pin to Dashboard</span>
          <p className="text-xs text-violet-600">Pinned announcements appear as banners on everyone's dashboard</p>
        </div>
      </label>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
        >
          Post Announcement
        </button>
      </div>
    </div>
  );
}

// ============ ADD MEMBER FORM (Admin) ============
function AddMemberForm({ employees, onSubmit, onCancel }) {
  const generatePasscode = () => String(Math.floor(100000 + Math.random() * 900000));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dept: '',
    role: 'employee',
    passcode: generatePasscode(),
  });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const regeneratePasscode = () => {
    setFormData(prev => ({ ...prev, passcode: generatePasscode() }));
    setCopied(false);
  };

  const copyPasscode = () => {
    navigator.clipboard.writeText(formData.passcode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    setError('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    // Check email domain
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    if (!emailDomain || !ALLOWED_DOMAINS.includes(emailDomain)) {
      setError(`Email must be from: ${ALLOWED_DOMAINS.join(' or ')}`);
      return;
    }

    // Check duplicate email
    if (employees.some(e => e.email.toLowerCase() === formData.email.toLowerCase().trim())) {
      setError('This email is already registered');
      return;
    }

    // Passcode must be 6 digits
    if (!/^\d{6}$/.test(formData.passcode)) {
      setError('Passcode must be exactly 6 digits');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Rahul Sharma"
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="name@pocket-fund.com"
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
        />
        <p className="text-xs text-slate-400 mt-1">Must be @pocket-fund.com or @pocketfund.org</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
          <select
            value={formData.dept}
            onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
          >
            <option value="">Assign later</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Passcode Section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Login Passcode</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={formData.passcode}
              onChange={(e) => setFormData({ ...formData, passcode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              maxLength={6}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-lg tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
            />
          </div>
          <button
            type="button"
            onClick={regeneratePasscode}
            className="px-3 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            title="Generate new passcode"
          >
            <RefreshCw size={18} />
          </button>
          <button
            type="button"
            onClick={copyPasscode}
            className={`px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              copied
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
            }`}
          >
            {copied ? <Check size={18} /> : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          Share this passcode privately with the member. They'll use it to log in.
        </p>
      </div>

      {/* Preview Card */}
      {formData.name && formData.email && (
        <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2">Preview</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-200 to-purple-200 flex items-center justify-center">
              <span className="font-semibold text-violet-700 text-sm">{formData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-900">{formData.name}</p>
              <p className="text-xs text-violet-600">{formData.email} · Passcode: <span className="font-mono font-bold">{formData.passcode}</span></p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
        >
          Add Member
        </button>
      </div>
    </div>
  );
}

// ============ NOTIFICATION PANEL ============
function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onClearAll, getEmployee }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'ticket_update': return <MessageSquare size={16} className="text-blue-500" />;
      case 'leave_update': return <Calendar size={16} className="text-emerald-500" />;
      case 'announcement': return <Megaphone size={16} className="text-violet-500" />;
      case 'comment': return <Send size={16} className="text-amber-500" />;
      case 'assignment': return <UserCheck size={16} className="text-purple-500" />;
      case 'referral_update': return <UserCheck size={16} className="text-indigo-500" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Actions */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </span>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs font-medium text-violet-600 hover:text-violet-700 px-2 py-1 rounded-lg hover:bg-violet-50 transition-colors"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs font-medium text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <BellRing size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No notifications</p>
            <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => !notif.read && onMarkRead(notif.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  notif.read ? 'bg-white' : 'bg-violet-50/40 hover:bg-violet-50/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-slate-100 flex-shrink-0">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${notif.read ? 'text-slate-700' : 'text-slate-900 font-semibold'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDateTime(notif.at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ EMPLOYEE DIRECTORY ============
function EmployeeDirectory({ employees, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = employees.filter(e => e.role !== 'admin');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.dept?.toLowerCase().includes(q)
      );
    }
    if (deptFilter !== 'all') {
      result = result.filter(e => e.dept === deptFilter);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, searchQuery, deptFilter]);

  const activeDepts = [...new Set(employees.filter(e => e.dept && e.role !== 'admin').map(e => e.dept))].sort();

  const avatarColors = [
    'from-violet-400 to-purple-500',
    'from-emerald-400 to-teal-500',
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-blue-400 to-indigo-500',
    'from-cyan-400 to-sky-500',
    'from-fuchsia-400 to-purple-500',
    'from-lime-400 to-green-500',
  ];
  const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="all">All Departments</option>
          {activeDepts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Dept Stats */}
      <div className="flex flex-wrap gap-2">
        {activeDepts.map(dept => {
          const count = employees.filter(e => e.dept === dept && e.role !== 'admin').length;
          return (
            <button
              key={dept}
              onClick={() => setDeptFilter(deptFilter === dept ? 'all' : dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                deptFilter === dept ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept} ({count})
            </button>
          );
        })}
      </div>

      {/* Employee Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState
            icon={Users}
            title="No employees found"
            description="Try adjusting your search or filter."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <div key={emp.id} className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all ${
              emp.id === currentUser.id ? 'border-violet-200 ring-1 ring-violet-100' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-semibold`}>
                  {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {emp.name}
                    {emp.id === currentUser.id && <span className="text-xs text-violet-500 ml-1">(You)</span>}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                  {emp.dept || 'Unassigned'}
                </span>
                <span className="text-xs text-slate-400">ID: {emp.id}</span>
              </div>
              {emp.settings?.bio && (
                <p className="mt-3 text-xs text-slate-500 italic line-clamp-2">"{emp.settings.bio}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ SETTINGS PAGE ============
function SettingsPage({ currentUser, onUpdateProfile, onUpdateSettings, onLogout, showToast }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: currentUser.name || '',
    dept: currentUser.dept || '',
    bio: currentUser.settings?.bio || '',
    gender: currentUser.gender || '',
    dob: currentUser.dob || '',
    phone: currentUser.phone || '',
    profilePhoto: currentUser.profilePhoto || '',
    address: currentUser.address || { line1: '', landmark: '', city: '', state: '', pincode: '', country: 'India' },
    emergencyContact: currentUser.emergencyContact || { name: '', phone: '', relation: '' },
    bankDetails: currentUser.bankDetails || { holderName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' },
  });
  const [notifPrefs, setNotifPrefs] = useState(
    currentUser.settings?.notifications || { tickets: true, leaves: true, announcements: true, comments: true }
  );
  const [profileSaving, setProfileSaving] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { showToast('Photo must be under 500KB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setProfileData(p => ({ ...p, profilePhoto: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    if (!profileData.name.trim()) { showToast('Name is required', 'error'); return; }
    setProfileSaving(true);
    await onUpdateProfile({
      name: profileData.name.trim(),
      dept: profileData.dept,
      gender: profileData.gender,
      dob: profileData.dob,
      phone: profileData.phone,
      profilePhoto: profileData.profilePhoto,
      address: profileData.address,
      emergencyContact: profileData.emergencyContact,
      bankDetails: profileData.bankDetails,
    });
    await onUpdateSettings({ bio: profileData.bio, notifications: notifPrefs });
    setProfileSaving(false);
  };

  const handleNotifToggle = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    await onUpdateSettings({ notifications: updated });
  };

  const updateAddress = (key, val) => setProfileData(p => ({ ...p, address: { ...p.address, [key]: val } }));
  const updateEmergency = (key, val) => setProfileData(p => ({ ...p, emergencyContact: { ...p.emergencyContact, [key]: val } }));
  const updateBank = (key, val) => setProfileData(p => ({ ...p, bankDetails: { ...p.bankDetails, [key]: val } }));

  const sections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'address', name: 'Address', icon: MapPin },
    { id: 'emergency', name: 'Emergency Contact', icon: Heart },
    { id: 'bank', name: 'Bank Details', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'account', name: 'Account', icon: Shield },
  ];

  const avatarColors = [
    'from-violet-400 to-purple-500',
    'from-emerald-400 to-teal-500',
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-blue-400 to-indigo-500',
  ];
  const avatarColor = avatarColors[currentUser.name.charCodeAt(0) % avatarColors.length];
  const inputCls = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Settings Nav */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {profileData.profilePhoto ? (
                <img src={profileData.profilePhoto} className="w-12 h-12 rounded-xl object-cover" alt="" />
              ) : (
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-semibold`}>
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${
                  activeSection === sec.id ? 'bg-violet-50 text-violet-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <sec.icon size={16} />
                {sec.name}
                <ChevronRight size={14} className="ml-auto text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="lg:col-span-3">
        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              <p className="text-sm text-slate-500 mt-1">Update your personal details and photo</p>
            </div>
            <div className="p-6 space-y-5">
              {/* Photo */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  {profileData.profilePhoto ? (
                    <img src={profileData.profilePhoto} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                  ) : (
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-2xl`}>
                      {profileData.name.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                    </div>
                  )}
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-violet-700 transition-colors shadow-md">
                    <Camera size={14} className="text-white" />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{profileData.name || 'Your Name'}</p>
                  <p className="text-sm text-slate-500">{currentUser.email}</p>
                  <p className="text-xs text-slate-400 mt-1">ID: {currentUser.id} · {currentUser.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                  <input type="text" value={profileData.name} onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                  <select value={profileData.dept} onChange={e => setProfileData(p => ({ ...p, dept: e.target.value }))} className={inputCls}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                  <select value={profileData.gender} onChange={e => setProfileData(p => ({ ...p, gender: e.target.value }))} className={inputCls}>
                    <option value="">Select</option>
                    {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                  <input type="date" value={profileData.dob} onChange={e => setProfileData(p => ({ ...p, dob: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                  <input type="tel" value={profileData.phone} onChange={e => setProfileData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="10-digit" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input type="email" value={currentUser.email} disabled className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Bio</label>
                <textarea value={profileData.bio} onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))} placeholder="A short bio about yourself..." rows={3} maxLength={200} className={`${inputCls} resize-none`} />
                <p className="text-xs text-slate-400 mt-1">{profileData.bio.length}/200</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button onClick={handleProfileSave} disabled={profileSaving} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Address Section */}
        {activeSection === 'address' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Home Address</h3>
              <p className="text-sm text-slate-500 mt-1">Your residential address for company records</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                <select value={profileData.address.country} onChange={e => { updateAddress('country', e.target.value); updateAddress('state', ''); }} className={inputCls}>
                  <option value="">Select Country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Address Line</label>
                <input type="text" value={profileData.address.line1} onChange={e => updateAddress('line1', e.target.value)} placeholder="House/Flat No., Street, Area" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Landmark</label>
                <input type="text" value={profileData.address.landmark} onChange={e => updateAddress('landmark', e.target.value)} placeholder="Near..." className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                  <input type="text" value={profileData.address.city} onChange={e => updateAddress('city', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">State / Province</label>
                  {getStatesForCountry(profileData.address.country).length > 0 ? (
                    <select value={profileData.address.state} onChange={e => updateAddress('state', e.target.value)} className={inputCls}>
                      <option value="">Select</option>
                      {getStatesForCountry(profileData.address.country).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={profileData.address.state} onChange={e => updateAddress('state', e.target.value)} placeholder="State/Province" className={inputCls} />
                  )}
                </div>
                <div>
                  {(() => { const pc = getPostalConfig(profileData.address.country); return (<>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{pc.label}</label>
                    <input type="text" value={profileData.address.pincode} onChange={e => updateAddress('pincode', e.target.value.replace(pc.regex, '').slice(0, pc.maxLen))} placeholder={pc.placeholder} className={inputCls} />
                  </>); })()}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button onClick={handleProfileSave} disabled={profileSaving} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
                  {profileSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact Section */}
        {activeSection === 'emergency' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Emergency Contact</h3>
              <p className="text-sm text-slate-500 mt-1">Person to contact in case of emergency</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Contact Name</label>
                <input type="text" value={profileData.emergencyContact.name} onChange={e => updateEmergency('name', e.target.value)} placeholder="Full name" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                <input type="tel" value={profileData.emergencyContact.phone} onChange={e => updateEmergency('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Relation</label>
                <input type="text" value={profileData.emergencyContact.relation} onChange={e => updateEmergency('relation', e.target.value)} placeholder="e.g. Father, Mother, Spouse" className={inputCls} />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button onClick={handleProfileSave} disabled={profileSaving} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
                  {profileSaving ? 'Saving...' : 'Save Emergency Contact'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bank Details Section */}
        {activeSection === 'bank' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Bank / Payment Details</h3>
              <p className="text-sm text-slate-500 mt-1">Used for salary and stipend processing</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 flex items-center gap-2"><Lock size={12} /> Your bank details are stored securely and visible only to you and the admin.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Account Holder Name</label>
                <input type="text" value={profileData.bankDetails.holderName} onChange={e => updateBank('holderName', e.target.value)} placeholder="As per bank records" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Account Number</label>
                  <input type="text" value={profileData.bankDetails.accountNumber} onChange={e => updateBank('accountNumber', e.target.value.replace(/\D/g, ''))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">IFSC Code</label>
                  <input type="text" value={profileData.bankDetails.ifsc} onChange={e => updateBank('ifsc', e.target.value.toUpperCase().slice(0, 11))} placeholder="SBIN0001234" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Bank Name</label>
                <input type="text" value={profileData.bankDetails.bankName} onChange={e => updateBank('bankName', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">UPI ID</label>
                <input type="text" value={profileData.bankDetails.upiId} onChange={e => updateBank('upiId', e.target.value)} placeholder="yourname@upi" className={inputCls} />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button onClick={handleProfileSave} disabled={profileSaving} className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50">
                  {profileSaving ? 'Saving...' : 'Save Bank Details'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Preferences */}
        {activeSection === 'notifications' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Notification Preferences</h3>
              <p className="text-sm text-slate-500 mt-1">Choose what you want to be notified about</p>
            </div>
            <div className="p-6 space-y-1">
              {[
                { key: 'tickets', label: 'Ticket Updates', desc: 'Get notified when tickets are created, updated, or assigned', icon: MessageSquare, color: 'text-blue-500' },
                { key: 'leaves', label: 'Leave Updates', desc: 'Get notified about leave approvals and rejections', icon: Calendar, color: 'text-emerald-500' },
                { key: 'announcements', label: 'Announcements', desc: 'Get notified when new announcements are posted', icon: Megaphone, color: 'text-violet-500' },
                { key: 'comments', label: 'Comments & Replies', desc: 'Get notified about new comments on your tickets', icon: Send, color: 'text-amber-500' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-100 rounded-xl">
                      <item.icon size={18} className={item.color} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotifToggle(item.key)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${
                      notifPrefs[item.key] ? 'bg-violet-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      notifPrefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Section */}
        {activeSection === 'account' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Account</h3>
                <p className="text-sm text-slate-500 mt-1">Manage your account settings</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Account Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Account Type</p>
                      <p className="text-xs text-slate-500">{currentUser.role === 'admin' ? 'Administrator' : 'Employee'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      currentUser.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {currentUser.role === 'admin' ? 'Admin' : 'Employee'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Employee ID</p>
                      <p className="text-xs text-slate-500">{currentUser.id}</p>
                    </div>
                    <span className="text-sm font-mono text-slate-600">{currentUser.id}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Department</p>
                      <p className="text-xs text-slate-500">Your current department</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-medium">
                      {currentUser.dept || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm">
              <div className="p-6">
                <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4">Danger Zone</h4>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-red-900">Sign Out</p>
                    <p className="text-xs text-red-600">You'll need your passcode to sign back in</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ ATTENDANCE PAGE (Coming Soon) ============
function AttendancePage({ currentUser, employees, isAdmin, showToast }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
          <Clock size={40} className="text-violet-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center animate-bounce">
          <Sparkles size={18} className="text-amber-500" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Attendance</h2>
      <p className="text-lg font-semibold text-violet-600 mb-3">Coming Soon</p>
      <p className="text-sm text-slate-500 text-center max-w-md mb-6">
        We're building a seamless attendance tracking experience powered by Jibble integration. 
        Track work hours, view timesheets, and manage attendance — all in one place.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {['Time Tracking', 'Monthly Calendar', 'Jibble Sync', 'Work Hours Analytics'].map(feature => (
          <span key={feature} className="px-3 py-1.5 bg-violet-50 text-violet-600 rounded-full text-xs font-medium border border-violet-100">
            {feature}
          </span>
        ))}
      </div>
      <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-sm text-slate-600">Under Development — Stay Tuned!</span>
      </div>
    </div>
  );
}


// ============ SALARY STATUS PAGE ============
function SalaryStatusPage({ currentUser, employees, salaryRecords, getSalaryRecord, onUpdateStatus, isAdmin }) {
  const monthOptions = getMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].key);

  // ---- ADMIN STATE ----
  const [adminMonth, setAdminMonth] = useState(monthOptions[0].key);
  const [adminStatus, setAdminStatus] = useState('Not Processed');
  const [adminNote, setAdminNote] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [updating, setUpdating] = useState(false);

  const activeEmployees = employees.filter(e => e.role !== 'admin');

  const filteredAdminEmployees = useMemo(() => {
    if (!adminSearch) return activeEmployees;
    const q = adminSearch.toLowerCase();
    return activeEmployees.filter(e => e.name.toLowerCase().includes(q) || e.dept?.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
  }, [activeEmployees, adminSearch]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredAdminEmployees.map(e => e.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleBulkUpdate = async () => {
    if (selectedEmployees.length === 0) return;
    if (adminStatus === 'Delayed' && !adminNote.trim()) return;
    setUpdating(true);
    await onUpdateStatus({
      employeeIds: selectedEmployees,
      month: adminMonth,
      status: adminStatus,
      note: adminNote.trim(),
    });
    setAdminNote('');
    setSelectedEmployees([]);
    setSelectAll(false);
    setUpdating(false);
  };

  // ---- EMPLOYEE VIEW ----
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Salary / Stipend Status</h2>
          <p className="text-sm text-slate-500 mt-1">Track your monthly salary processing status</p>
        </div>

        {/* Month selector */}
        <div className="flex gap-2 flex-wrap">
          {monthOptions.map(m => (
            <button
              key={m.key}
              onClick={() => setSelectedMonth(m.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedMonth === m.key
                  ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Status Card */}
        {(() => {
          const record = getSalaryRecord(currentUser.id, selectedMonth);
          const cfg = record ? SALARY_STATUS_CONFIG[record.status] : SALARY_STATUS_CONFIG['Not Processed'];
          const statusText = record ? record.status : 'Not Processed';
          const monthLabel = monthOptions.find(m => m.key === selectedMonth)?.label || selectedMonth;

          return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8">
                {/* Big status display */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    statusText === 'Processed' ? 'bg-emerald-100' :
                    statusText === 'In Progress' ? 'bg-blue-100' :
                    statusText === 'Delayed' ? 'bg-amber-100' :
                    statusText === 'On Hold' ? 'bg-orange-100' :
                    'bg-slate-100'
                  }`}>
                    {statusText === 'Processed' ? <CheckCircle2 size={28} className="text-emerald-600" /> :
                     statusText === 'In Progress' ? <RefreshCw size={28} className="text-blue-600" /> :
                     statusText === 'Delayed' ? <Clock size={28} className="text-amber-600" /> :
                     statusText === 'On Hold' ? <AlertCircle size={28} className="text-orange-500" /> :
                     <CircleDot size={28} className="text-slate-400" />
                    }
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Status for {monthLabel}</p>
                    <p className={`text-2xl font-bold ${
                      statusText === 'Processed' ? 'text-emerald-700' :
                      statusText === 'In Progress' ? 'text-blue-700' :
                      statusText === 'Delayed' ? 'text-amber-700' :
                      statusText === 'On Hold' ? 'text-orange-600' :
                      'text-slate-600'
                    }`}>{statusText}</p>
                  </div>
                </div>

                {/* Status description */}
                <div className={`p-4 rounded-xl border ${cfg.color} mb-4`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <p className="text-sm font-medium">{cfg.label}</p>
                  </div>
                </div>

                {/* Note from HR */}
                {record?.note && (
                  <div className="p-4 bg-slate-50 rounded-xl mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Note from HR</p>
                    <p className="text-sm text-slate-700">{record.note}</p>
                  </div>
                )}

                {/* Updated timestamp */}
                {record?.updatedAt && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>Last updated: {formatDateTime(record.updatedAt)}</span>
                  </div>
                )}
                {!record && (
                  <p className="text-xs text-slate-400">No update yet for this month.</p>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Lock size={11} />
                  Salary amounts are confidential and not shown here.
                </p>
              </div>
            </div>
          );
        })()}

        {/* Past months summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">History</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {monthOptions.map(m => {
              const record = getSalaryRecord(currentUser.id, m.key);
              const statusText = record ? record.status : 'Not Processed';
              const cfg = SALARY_STATUS_CONFIG[statusText];
              return (
                <div
                  key={m.key}
                  onClick={() => setSelectedMonth(m.key)}
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedMonth === m.key ? 'bg-violet-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <span className="text-sm font-medium text-slate-700">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${cfg.color}`}>{statusText}</span>
                    {record?.updatedAt && <span className="text-xs text-slate-400">{formatDateTime(record.updatedAt)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---- ADMIN VIEW ----
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Salary / Stipend Management</h2>
        <p className="text-sm text-slate-500 mt-1">Update salary processing status for employees. No amounts shown.</p>
      </div>

      {/* Admin Control Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Shield size={18} className="text-violet-600" />
            Update Status
          </h3>
        </div>
        <div className="p-5 space-y-5">
          {/* Month + Status row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
              <select
                value={adminMonth}
                onChange={(e) => setAdminMonth(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
              >
                {monthOptions.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
              >
                {SALARY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Note field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Note {adminStatus === 'Delayed' ? <span className="text-red-500">*</span> : <span className="text-slate-400">(optional)</span>}
            </label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value.slice(0, 100))}
              placeholder={adminStatus === 'Delayed' ? 'Reason for delay (required)' : 'Optional note for employees'}
              className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 ${
                adminStatus === 'Delayed' && !adminNote.trim() ? 'border-amber-300' : 'border-slate-200'
              }`}
              maxLength={100}
            />
            <p className="text-xs text-slate-400 mt-1">{adminNote.length}/100 characters</p>
          </div>

          {/* Employee selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Select Employees</label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{selectedEmployees.length} selected</span>
                <button onClick={handleSelectAll} className="text-xs font-medium text-violet-600 hover:text-violet-700">
                  {selectAll ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search employees..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Employee list */}
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {filteredAdminEmployees.length === 0 ? (
                <p className="p-4 text-sm text-slate-400 text-center">No employees found</p>
              ) : (
                filteredAdminEmployees.map(emp => {
                  const isSelected = selectedEmployees.includes(emp.id);
                  const currentRecord = getSalaryRecord(emp.id, adminMonth);
                  const currentStatus = currentRecord?.status || 'Not Processed';
                  const cfg = SALARY_STATUS_CONFIG[currentStatus];
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployee(emp.id)}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-violet-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-violet-600 border-violet-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{emp.name}</p>
                        <p className="text-xs text-slate-400">{emp.dept || 'No dept'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${cfg.color}`}>{currentStatus}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleBulkUpdate}
              disabled={selectedEmployees.length === 0 || (adminStatus === 'Delayed' && !adminNote.trim()) || updating}
              className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updating ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
              {updating ? 'Updating...' : `Update ${selectedEmployees.length} Employee${selectedEmployees.length !== 1 ? 's' : ''}`}
            </button>
            {adminStatus === 'Delayed' && !adminNote.trim() && (
              <p className="text-xs text-amber-600 font-medium">A reason is required when status is "Delayed"</p>
            )}
          </div>
        </div>
      </div>

      {/* Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-slate-900">
            Overview — {monthOptions.find(m => m.key === adminMonth)?.label}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {SALARY_STATUSES.map(s => {
              const count = activeEmployees.filter(e => (getSalaryRecord(e.id, adminMonth)?.status || 'Not Processed') === s).length;
              if (count === 0) return null;
              const cfg = SALARY_STATUS_CONFIG[s];
              return (
                <span key={s} className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${cfg.color}`}>
                  {s}: {count}
                </span>
              );
            })}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Employee</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Note</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeEmployees.map(emp => {
                const record = getSalaryRecord(emp.id, adminMonth);
                const statusText = record?.status || 'Not Processed';
                const cfg = SALARY_STATUS_CONFIG[statusText];
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-800">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{emp.dept || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {statusText}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 max-w-xs truncate">{record?.note || '—'}</td>
                    <td className="px-5 py-3 text-xs text-slate-400">{record?.updatedAt ? formatDateTime(record.updatedAt) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ AI LEAVE POLICY CHATBOT ============
// ============ ANONYMOUS SUGGESTION FORM ============
const SUGGESTION_CATEGORIES = ['General', 'Work Culture', 'Management', 'Tools & Tech', 'HR & Policies', 'Events & Fun', 'Other'];

function NewSuggestionForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: '', body: '', category: 'General', attachment: null });
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Attachment must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, attachment: { name: file.name, size: file.size, type: file.type, data: reader.result } }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setError('');
    if (!form.title.trim()) { setError('Please add a short title'); return; }
    if (!form.body.trim()) { setError('Please describe your suggestion'); return; }
    if (form.body.trim().length < 10) { setError('Please write at least 10 characters'); return; }
    onSubmit({ title: form.title.trim(), body: form.body.trim(), category: form.category, attachment: form.attachment });
  };

  return (
    <div className="space-y-5">
      <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-teal-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-teal-800">100% Anonymous</p>
          <p className="text-xs text-teal-600 mt-0.5">Your identity is never stored or shared. Admin will only see the suggestion text — not who wrote it.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief summary of your suggestion" maxLength={100} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300">
          {SUGGESTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Suggestion</label>
        <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Describe your suggestion, idea, or feedback in detail..." rows={5} maxLength={2000} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 resize-none" />
        <p className="text-xs text-slate-400 mt-1">{form.body.length}/2000</p>
      </div>

      {/* Attachment */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Attachment <span className="text-slate-400 font-normal">(optional)</span></label>
        {form.attachment ? (
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <Paperclip size={14} className="text-teal-600 flex-shrink-0" />
              <span className="text-sm text-slate-700 truncate">{form.attachment.name}</span>
              <span className="text-xs text-slate-400 flex-shrink-0">({(form.attachment.size / 1024).toFixed(0)} KB)</span>
            </div>
            <button onClick={() => setForm(f => ({ ...f, attachment: null }))} className="p-1 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><X size={14} /></button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 hover:border-teal-300 transition-colors">
            <Upload size={16} className="text-slate-400" />
            <span className="text-sm text-slate-500">Click to attach a file (max 2MB)</span>
            <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv" />
          </label>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
        <button onClick={handleSubmit} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
          <Send size={16} /> Submit Anonymously
        </button>
      </div>
    </div>
  );
}

// ============ SUGGESTIONS PAGE ============
const SUGGESTION_STATUSES = ['New', 'Acknowledged', 'Under Review', 'Accepted', 'Rejected'];
const SUGGESTION_STATUS_STYLES = {
  'New': 'bg-blue-50 text-blue-700 border-blue-200',
  'Acknowledged': 'bg-violet-50 text-violet-700 border-violet-200',
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Accepted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-50 text-red-600 border-red-200',
};
const SUGGESTION_STATUS_ICONS = {
  'New': '🆕',
  'Acknowledged': '👀',
  'Under Review': '🔍',
  'Accepted': '✅',
  'Rejected': '❌',
};

function SuggestionsPage({ suggestions, currentUser, isAdmin, onCreateSuggestion, onUpdateSuggestion, onDeleteSuggestion }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    let result = [...suggestions];
    if (filterStatus !== 'all') result = result.filter(s => s.status === filterStatus);
    if (filterCategory !== 'all') result = result.filter(s => s.category === filterCategory);
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [suggestions, filterStatus, filterCategory]);

  const handleRespond = async (suggestionId) => {
    const updates = {};
    if (selectedStatus) updates.status = selectedStatus;
    if (responseText.trim()) updates.adminResponse = responseText.trim();
    updates.respondedAt = Date.now();
    if (Object.keys(updates).length === 0) return;
    await onUpdateSuggestion(suggestionId, updates);
    setRespondingTo(null);
    setResponseText('');
    setSelectedStatus('');
  };

  const handleQuickAction = async (suggestionId, status) => {
    await onUpdateSuggestion(suggestionId, { status, respondedAt: Date.now() });
  };

  const statusCounts = useMemo(() => {
    const counts = { all: suggestions.length };
    SUGGESTION_STATUSES.forEach(s => { counts[s] = suggestions.filter(sg => sg.status === s).length; });
    return counts;
  }, [suggestions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <MessageCircle size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-bold">Anonymous Suggestions</h3>
            </div>
            <p className="text-sm text-teal-100 ml-[52px]">
              {isAdmin
                ? `${suggestions.length} suggestion${suggestions.length !== 1 ? 's' : ''} from your team · Identities are never recorded`
                : 'Share feedback, ideas, or suggestions. Your identity is never stored.'}
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={onCreateSuggestion}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 rounded-xl text-sm font-bold hover:bg-teal-50 transition-colors shadow-sm"
            >
              <Plus size={18} />
              New Suggestion
            </button>
          )}
        </div>

        {/* Quick stats for admin */}
        {isAdmin && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-5 ml-[52px]">
            {SUGGESTION_STATUSES.map(s => (
              statusCounts[s] > 0 && (
                <button
                  key={s}
                  onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === s
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {SUGGESTION_STATUS_ICONS[s]} {s}: {statusCounts[s]}
                </button>
              )
            ))}
            {filterStatus !== 'all' && (
              <button onClick={() => setFilterStatus('all')} className="px-3 py-1.5 text-xs text-teal-200 hover:text-white font-medium">
                ✕ Clear filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Filter */}
      {suggestions.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-slate-500 font-medium">Filter:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filterCategory === 'all' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              All ({statusCounts.all})
            </button>
            {SUGGESTION_CATEGORIES.map(c => {
              const count = suggestions.filter(s => s.category === c).length;
              if (count === 0) return null;
              return (
                <button
                  key={c}
                  onClick={() => setFilterCategory(filterCategory === c ? 'all' : c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    filterCategory === c ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Anonymity Banner (Employees) */}
      {!isAdmin && (
        <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-teal-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-teal-800">Your identity is protected</p>
            <p className="text-xs text-teal-600 mt-0.5">Suggestions are completely anonymous — your name, email, and department are never stored or visible to anyone, including admins.</p>
          </div>
        </div>
      )}

      {/* Suggestion List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-teal-400" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">
            {suggestions.length === 0 ? 'No suggestions yet' : 'No matching suggestions'}
          </h4>
          <p className="text-sm text-slate-500 mb-5 text-center max-w-sm">
            {isAdmin
              ? 'Suggestions from your team will appear here anonymously.'
              : 'Be the first to share a suggestion, idea, or piece of feedback!'}
          </p>
          {!isAdmin && suggestions.length === 0 && (
            <button
              onClick={onCreateSuggestion}
              className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              Share a Suggestion
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(suggestion => {
            const isExpanded = expandedId === suggestion.id;
            return (
              <div key={suggestion.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                suggestion.status === 'Accepted' ? 'border-emerald-200' :
                suggestion.status === 'Rejected' ? 'border-red-100' :
                'border-slate-100'
              }`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Status + Category + Time */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border ${SUGGESTION_STATUS_STYLES[suggestion.status]}`}>
                          <span>{SUGGESTION_STATUS_ICONS[suggestion.status]}</span>
                          {suggestion.status}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">{suggestion.category}</span>
                        <span className="text-xs text-slate-400 ml-1">{formatDateTime(suggestion.createdAt)}</span>
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-bold text-slate-900 mb-1.5">{suggestion.title}</h4>

                      {/* Body - truncated if not expanded */}
                      <p className={`text-sm text-slate-600 whitespace-pre-wrap ${!isExpanded && suggestion.body.length > 200 ? 'line-clamp-3' : ''}`}>
                        {suggestion.body}
                      </p>
                      {suggestion.body.length > 200 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                          className="text-xs text-teal-600 font-medium mt-1 hover:text-teal-700"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}

                      {/* Anonymous Label */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                          <User size={13} className="text-slate-400" />
                        </div>
                        <span className="text-xs text-slate-400 italic">Anonymous</span>
                      </div>

                      {/* Attachment */}
                      {suggestion.attachment && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip size={14} className="text-blue-600 flex-shrink-0" />
                            <span className="text-xs font-medium text-blue-700 truncate">{suggestion.attachment.name}</span>
                            <span className="text-xs text-blue-500 flex-shrink-0">({(suggestion.attachment.size / 1024).toFixed(0)} KB)</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const win = window.open();
                              if (win) {
                                if (suggestion.attachment.type === 'application/pdf') {
                                  win.document.write(`<iframe src="${suggestion.attachment.data}" style="width:100%;height:100%;border:none;"></iframe>`);
                                } else if (suggestion.attachment.type?.startsWith('image/')) {
                                  win.document.write(`<img src="${suggestion.attachment.data}" style="max-width:100%;height:auto;" />`);
                                } else {
                                  win.document.write(`<pre>${atob(suggestion.attachment.data.split(',')[1] || '')}</pre>`);
                                }
                                win.document.title = suggestion.attachment.name;
                              }
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1 flex-shrink-0"
                          >
                            <Eye size={13} /> View
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Admin Quick Actions */}
                    {isAdmin && respondingTo !== suggestion.id && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {suggestion.status !== 'Accepted' && (
                          <button
                            onClick={() => handleQuickAction(suggestion.id, 'Accepted')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="Accept"
                          >
                            <CheckCircle2 size={14} /> Accept
                          </button>
                        )}
                        {suggestion.status !== 'Rejected' && (
                          <button
                            onClick={() => handleQuickAction(suggestion.id, 'Rejected')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 border border-red-200 transition-colors"
                            title="Reject"
                          >
                            <X size={14} /> Reject
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setRespondingTo(suggestion.id);
                            setResponseText(suggestion.adminResponse || '');
                            setSelectedStatus(suggestion.status);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 border border-slate-200 transition-colors"
                          title="Respond"
                        >
                          <Edit3 size={14} /> Reply
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this suggestion?')) onDeleteSuggestion(suggestion.id); }}
                          className="flex items-center gap-1.5 px-3 py-2 hover:bg-red-50 text-slate-400 rounded-xl text-xs font-medium hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Admin Response (if exists and not currently editing) */}
                  {suggestion.adminResponse && respondingTo !== suggestion.id && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Shield size={12} className="text-violet-600" />
                        </div>
                        <span className="text-xs font-bold text-violet-700">Admin Response</span>
                        {suggestion.respondedAt && (
                          <span className="text-xs text-violet-400">· {formatDateTime(suggestion.respondedAt)}</span>
                        )}
                      </div>
                      <p className="text-sm text-violet-800 whitespace-pre-wrap ml-8">{suggestion.adminResponse}</p>
                    </div>
                  )}

                  {/* Admin Respond Form (inline) */}
                  {isAdmin && respondingTo === suggestion.id && (
                    <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Edit3 size={14} className="text-teal-600" />
                        <span className="text-sm font-bold text-slate-700">Respond to Suggestion</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Update Status</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        >
                          {SUGGESTION_STATUSES.map(s => <option key={s} value={s}>{SUGGESTION_STATUS_ICONS[s]} {s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Response (visible to everyone)</label>
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Share your response, feedback, or action plan..."
                          rows={3}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => { setRespondingTo(null); setResponseText(''); setSelectedStatus(''); }}
                          className="px-4 py-2.5 bg-white text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRespond(suggestion.id)}
                          className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors flex items-center gap-1.5"
                        >
                          <Check size={15} />
                          Save Response
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ REFERRAL FORM ============
function NewReferralForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    candidateName: '', candidateEmail: '', candidatePhone: '', linkedinUrl: '',
    resume: null, noticePeriod: '', relation: '', roleAppliedFor: '', notes: '',
  });
  const [error, setError] = useState('');

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Resume must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, resume: { name: file.name, size: file.size, type: file.type, data: reader.result } }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setError('');
    if (!form.candidateName.trim()) { setError('Candidate name is required'); return; }
    if (!form.candidatePhone.trim() && !form.candidateEmail.trim()) { setError('Provide at least email or phone'); return; }
    if (!form.relation) { setError('Select your relation with the candidate'); return; }
    onSubmit(form);
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Candidate Name *</label>
          <input value={form.candidateName} onChange={e => setForm(f => ({ ...f, candidateName: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300" placeholder="Full name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" value={form.candidateEmail} onChange={e => setForm(f => ({ ...f, candidateEmail: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300" placeholder="candidate@email.com" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
          <input value={form.candidatePhone} onChange={e => setForm(f => ({ ...f, candidatePhone: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300" placeholder="+91 XXXXX XXXXX" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
          <input value={form.linkedinUrl} onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300" placeholder="https://linkedin.com/in/..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Relation with Candidate *</label>
          <select value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300">
            <option value="">Select relation</option>
            {REFERRAL_RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notice Period</label>
          <select value={form.noticePeriod} onChange={e => setForm(f => ({ ...f, noticePeriod: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300">
            <option value="">Select notice period</option>
            {NOTICE_PERIODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Role Applied For</label>
        <input value={form.roleAppliedFor} onChange={e => setForm(f => ({ ...f, roleAppliedFor: e.target.value }))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300" placeholder="e.g. Business Analyst, Marketing Intern" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Resume / CV</label>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-violet-300 transition-colors cursor-pointer" onClick={() => document.getElementById('resumeUpload').click()}>
          <input id="resumeUpload" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
          {form.resume ? (
            <div className="flex items-center justify-center gap-2 text-sm text-violet-600">
              <FileText size={18} /> <span className="font-medium">{form.resume.name}</span>
              <button onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, resume: null })); }} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
            </div>
          ) : (
            <div><Upload size={20} className="mx-auto text-slate-400 mb-1" /><p className="text-sm text-slate-500">Click to upload PDF, DOC, or DOCX (max 5MB)</p></div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 resize-none" placeholder="Why do you think this person would be a good fit?" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
        <button onClick={handleSubmit} className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700">Submit Referral</button>
      </div>
    </div>
  );
}

// ============ REFERRALS PAGE ============
const REFERRAL_STATUS_CONFIG = {
  'Submitted': { color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Under Review': { color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Interview': { color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  'Selected': { color: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  'Joined': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Completed 6 Months': { color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-600' },
  'Bonus Paid': { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'Rejected': { color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' },
};

function ReferralsPage({ referrals, currentUser, isAdmin, getEmployee, onCreateReferral, onUpdateReferral, onDeleteReferral }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editJoinDate, setEditJoinDate] = useState('');

  const myReferrals = isAdmin ? referrals : referrals.filter(r => r.submittedBy === currentUser?.id);

  const filtered = useMemo(() => {
    let result = [...myReferrals];
    if (filterStatus !== 'all') result = result.filter(r => r.status === filterStatus);
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [myReferrals, filterStatus]);

  const successfulReferrals = referrals.filter(r => ['Completed 6 Months', 'Bonus Paid'].includes(r.status)).length;
  const activeReferrals = referrals.filter(r => !['Rejected', 'Bonus Paid'].includes(r.status)).length;

  const startEdit = (referral) => {
    setEditingId(referral.id);
    setEditStatus(referral.status);
    setEditNotes(referral.adminNotes || '');
    setEditJoinDate(referral.joinDate || '');
  };

  const handleSaveEdit = async (referralId) => {
    const updates = { status: editStatus, adminNotes: editNotes };
    if (editJoinDate) updates.joinDate = editJoinDate;
    if (editStatus === 'Joined' && editJoinDate) {
      const jd = new Date(editJoinDate);
      jd.setMonth(jd.getMonth() + 6);
      updates.sixMonthDate = jd.toISOString().split('T')[0];
    }
    await onUpdateReferral(referralId, updates);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <UserCheck size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-bold">Referrals</h3>
            </div>
            <p className="text-sm text-indigo-100 ml-[52px]">
              {isAdmin
                ? `${referrals.length} total referral${referrals.length !== 1 ? 's' : ''} · ${successfulReferrals} successful · ${activeReferrals} active`
                : `Refer great talent and earn up to ₹25,000 bonus!`}
            </p>
          </div>
          {!isAdmin && (
            <button onClick={onCreateReferral} className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm">
              <Plus size={18} /> Refer Someone
            </button>
          )}
        </div>

        {/* Stats */}
        {referrals.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-5 ml-[52px]">
            {REFERRAL_STATUSES.map(s => {
              const count = myReferrals.filter(r => r.status === s).length;
              if (count === 0) return null;
              return (
                <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s ? 'bg-white text-indigo-700 shadow-sm' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                  {s}: {count}
                </button>
              );
            })}
            {filterStatus !== 'all' && (
              <button onClick={() => setFilterStatus('all')} className="px-3 py-1.5 text-xs text-indigo-200 hover:text-white font-medium">✕ Clear</button>
            )}
          </div>
        )}
      </div>

      {/* Policy reminder */}
      {!isAdmin && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <IndianRupee size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-800">Referral Bonus up to ₹25,000</p>
            <p className="text-xs text-indigo-600 mt-0.5">If your referral joins, performs well, and completes 6 months — you're eligible for a bonus based on the role and performance.</p>
          </div>
        </div>
      )}

      {/* Referral Cards */}
      {filtered.length === 0 ? (
        <EmptyState icon={UserCheck} title="No referrals yet" description={isAdmin ? 'No referrals have been submitted.' : "Know someone great? Submit a referral and earn up to ₹25,000!"} action={!isAdmin && <button onClick={onCreateReferral} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"><Plus size={16} className="inline mr-1" />Refer Someone</button>} />
      ) : (
        <div className="space-y-4">
          {filtered.map(referral => {
            const isExpanded = expandedId === referral.id;
            const isEditing = editingId === referral.id;
            const submitter = getEmployee(referral.submittedBy);
            const statusConfig = REFERRAL_STATUS_CONFIG[referral.status] || REFERRAL_STATUS_CONFIG['Submitted'];

            return (
              <div key={referral.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                {/* Card Header */}
                <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : referral.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center font-bold text-indigo-700 text-lg">
                        {referral.candidateName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{referral.candidateName}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          {referral.roleAppliedFor && <span className="flex items-center gap-1"><Briefcase size={12} />{referral.roleAppliedFor}</span>}
                          {isAdmin && submitter && <span className="flex items-center gap-1"><User size={12} />by {submitter.name}</span>}
                          <span>{formatDateTime(referral.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}>{referral.status}</span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {referral.candidateEmail && <div><p className="text-xs text-slate-400 mb-0.5">Email</p><p className="text-sm text-slate-700 font-medium">{referral.candidateEmail}</p></div>}
                      {referral.candidatePhone && <div><p className="text-xs text-slate-400 mb-0.5">Phone</p><p className="text-sm text-slate-700 font-medium">{referral.candidatePhone}</p></div>}
                      {referral.linkedinUrl && <div><p className="text-xs text-slate-400 mb-0.5">LinkedIn</p><a href={referral.linkedinUrl} target="_blank" rel="noreferrer" className="text-sm text-violet-600 font-medium hover:underline">View Profile</a></div>}
                      {referral.relation && <div><p className="text-xs text-slate-400 mb-0.5">Relation</p><p className="text-sm text-slate-700 font-medium">{referral.relation}</p></div>}
                      {referral.noticePeriod && <div><p className="text-xs text-slate-400 mb-0.5">Notice Period</p><p className="text-sm text-slate-700 font-medium">{referral.noticePeriod}</p></div>}
                      {referral.resume && <div><p className="text-xs text-slate-400 mb-0.5">Resume</p><a href={referral.resume.data} download={referral.resume.name} className="text-sm text-violet-600 font-medium hover:underline flex items-center gap-1"><FileText size={14} />{referral.resume.name}</a></div>}
                      {referral.joinDate && <div><p className="text-xs text-slate-400 mb-0.5">Join Date</p><p className="text-sm text-slate-700 font-medium">{formatDate(referral.joinDate)}</p></div>}
                      {referral.sixMonthDate && <div><p className="text-xs text-slate-400 mb-0.5">6 Month Mark</p><p className="text-sm text-slate-700 font-medium">{formatDate(referral.sixMonthDate)}</p></div>}
                    </div>
                    {referral.notes && <div><p className="text-xs text-slate-400 mb-0.5">Notes from Referrer</p><p className="text-sm text-slate-600">{referral.notes}</p></div>}
                    {referral.adminNotes && <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl"><p className="text-xs text-amber-500 font-medium mb-0.5">Admin Notes</p><p className="text-sm text-amber-800">{referral.adminNotes}</p></div>}

                    {/* Admin Actions */}
                    {isAdmin && !isEditing && (
                      <div className="flex gap-2 pt-2">
                        <button onClick={(e) => { e.stopPropagation(); startEdit(referral); }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center gap-1.5"><Edit3 size={14} />Update Status</button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteReferral(referral.id); }} className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 flex items-center gap-1.5"><Trash2 size={14} />Delete</button>
                      </div>
                    )}

                    {/* Admin Edit Form */}
                    {isAdmin && isEditing && (
                      <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                            <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                              {REFERRAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Join Date</label>
                            <input type="date" value={editJoinDate} onChange={e => setEditJoinDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Admin Notes</label>
                          <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" placeholder="Internal notes..." />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(referral.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-white">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ EMPLOYEE DETAIL PANEL (Admin) ============
function EmployeeDetailPanel({ employee, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const startEdit = () => {
    setEditData({
      name: employee.name || '',
      dept: employee.dept || '',
      gender: employee.gender || '',
      dob: employee.dob || '',
      phone: employee.phone || '',
      address: employee.address || { line1: '', landmark: '', city: '', state: '', pincode: '', country: 'India' },
      emergencyContact: employee.emergencyContact || { name: '', phone: '', relation: '' },
      bankDetails: employee.bankDetails || { holderName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' },
    });
    setEditing(true);
  };

  const handleSave = async () => {
    await onUpdate(editData);
    setEditing(false);
  };

  const inputCls = "w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300";
  const InfoRow = ({ label, value }) => (
    <div className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-500 w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-900 text-right">{value || '—'}</span>
    </div>
  );

  const addr = employee.address || {};
  const ec = employee.emergencyContact || {};
  const bd = employee.bankDetails || {};

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        {employee.profilePhoto ? (
          <img src={employee.profilePhoto} className="w-16 h-16 rounded-xl object-cover" alt="" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-600">{employee.name?.split(' ').map(n => n[0]).join('')}</span>
          </div>
        )}
        <div className="flex-1">
          <p className="font-bold text-slate-900 text-lg">{employee.name}</p>
          <p className="text-sm text-slate-500">{employee.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 font-mono">{employee.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${employee.profileComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {employee.profileComplete ? 'Active' : 'Pending setup'}
            </span>
          </div>
        </div>
        <button onClick={editing ? handleSave : startEdit} className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
          editing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
        }`}>
          {editing ? <><Check size={14}/> Save</> : <><Edit3 size={14}/> Edit</>}
        </button>
      </div>

      {!editing ? (
        <>
          {/* Personal Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><User size={13}/> Personal</h4>
            <InfoRow label="Department" value={employee.dept} />
            <InfoRow label="Gender" value={employee.gender} />
            <InfoRow label="Date of Birth" value={employee.dob ? formatDate(employee.dob) : ''} />
            <InfoRow label="Phone" value={employee.phone} />
            <InfoRow label="Passcode" value={employee.passcode} />
          </div>

          {/* Address */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={13}/> Address</h4>
            <InfoRow label="Address" value={addr.line1} />
            <InfoRow label="Landmark" value={addr.landmark} />
            <InfoRow label="City" value={addr.city} />
            <InfoRow label="State" value={addr.state} />
            <InfoRow label="Pincode" value={addr.pincode} />
            <InfoRow label="Country" value={addr.country} />
          </div>

          {/* Emergency Contact */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Heart size={13} className="text-red-400"/> Emergency Contact</h4>
            <InfoRow label="Name" value={ec.name} />
            <InfoRow label="Phone" value={ec.phone} />
            <InfoRow label="Relation" value={ec.relation} />
          </div>

          {/* Bank Details */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CreditCard size={13}/> Bank Details</h4>
            <InfoRow label="Holder" value={bd.holderName} />
            <InfoRow label="Account No." value={bd.accountNumber ? `****${bd.accountNumber.slice(-4)}` : ''} />
            <InfoRow label="IFSC" value={bd.ifsc} />
            <InfoRow label="Bank" value={bd.bankName} />
            <InfoRow label="UPI" value={bd.upiId} />
          </div>
        </>
      ) : (
        <>
          {/* Edit Mode */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><User size={13}/> Personal</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">Name</label>
                <input type="text" value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">Dept</label>
                <select value={editData.dept} onChange={e => setEditData(d => ({ ...d, dept: e.target.value }))} className={inputCls}>
                  <option value="">Select</option>
                  {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">Gender</label>
                <select value={editData.gender} onChange={e => setEditData(d => ({ ...d, gender: e.target.value }))} className={inputCls}>
                  <option value="">Select</option>
                  {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">DOB</label>
                <input type="date" value={editData.dob} onChange={e => setEditData(d => ({ ...d, dob: e.target.value }))} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-0.5">Phone</label>
                <input type="tel" value={editData.phone} onChange={e => setEditData(d => ({ ...d, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className={inputCls} />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={13}/> Address</h4>
            <select value={editData.address?.country || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, country: e.target.value, state: '' } }))} className={inputCls}>
              <option value="">Country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" value={editData.address?.line1 || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, line1: e.target.value } }))} placeholder="Address" className={inputCls} />
            <input type="text" value={editData.address?.landmark || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, landmark: e.target.value } }))} placeholder="Landmark" className={inputCls} />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={editData.address?.city || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, city: e.target.value } }))} placeholder="City" className={inputCls} />
              {getStatesForCountry(editData.address?.country).length > 0 ? (
                <select value={editData.address?.state || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, state: e.target.value } }))} className={inputCls}>
                  <option value="">State/Province</option>
                  {getStatesForCountry(editData.address?.country).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <input type="text" value={editData.address?.state || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, state: e.target.value } }))} placeholder="State/Province" className={inputCls} />
              )}
              {(() => { const pc = getPostalConfig(editData.address?.country); return (
                <input type="text" value={editData.address?.pincode || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, pincode: e.target.value.replace(pc.regex, '').slice(0, pc.maxLen) } }))} placeholder={pc.placeholder} className={inputCls} />
              ); })()}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Heart size={13} className="text-red-400"/> Emergency</h4>
            <input type="text" value={editData.emergencyContact?.name || ''} onChange={e => setEditData(d => ({ ...d, emergencyContact: { ...d.emergencyContact, name: e.target.value } }))} placeholder="Name" className={inputCls} />
            <input type="tel" value={editData.emergencyContact?.phone || ''} onChange={e => setEditData(d => ({ ...d, emergencyContact: { ...d.emergencyContact, phone: e.target.value.replace(/\D/g, '').slice(0, 10) } }))} placeholder="Phone" className={inputCls} />
            <input type="text" value={editData.emergencyContact?.relation || ''} onChange={e => setEditData(d => ({ ...d, emergencyContact: { ...d.emergencyContact, relation: e.target.value } }))} placeholder="Relation" className={inputCls} />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><CreditCard size={13}/> Bank</h4>
            <input type="text" value={editData.bankDetails?.holderName || ''} onChange={e => setEditData(d => ({ ...d, bankDetails: { ...d.bankDetails, holderName: e.target.value } }))} placeholder="Account holder name" className={inputCls} />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={editData.bankDetails?.accountNumber || ''} onChange={e => setEditData(d => ({ ...d, bankDetails: { ...d.bankDetails, accountNumber: e.target.value.replace(/\D/g, '') } }))} placeholder="Account number" className={inputCls} />
              <input type="text" value={editData.bankDetails?.ifsc || ''} onChange={e => setEditData(d => ({ ...d, bankDetails: { ...d.bankDetails, ifsc: e.target.value.toUpperCase().slice(0, 11) } }))} placeholder="IFSC" className={inputCls} />
            </div>
            <input type="text" value={editData.bankDetails?.bankName || ''} onChange={e => setEditData(d => ({ ...d, bankDetails: { ...d.bankDetails, bankName: e.target.value } }))} placeholder="Bank name" className={inputCls} />
            <input type="text" value={editData.bankDetails?.upiId || ''} onChange={e => setEditData(d => ({ ...d, bankDetails: { ...d.bankDetails, upiId: e.target.value } }))} placeholder="UPI ID" className={inputCls} />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditing(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 flex items-center justify-center gap-1.5"><Check size={15}/>Save Changes</button>
          </div>
        </>
      )}
    </div>
  );
}

// ============ AI LEAVE Q&A BOT ============
function LeaveQABot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm PF AI — Pocket Fund's HR assistant. I know all company policies including leave, attendance, Jibble, outreach, stipend, code of conduct, confidentiality, travel reimbursement, and more. Ask me anything!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const systemPrompt = `You are PF AI, the official HR assistant for Pocket Fund (SKATECULTURE WEAR LLP). You have complete knowledge of all company policies. Answer questions based on this comprehensive policy document:\n${POCKET_FUND_HR_POLICY}\nIMPORTANT RULES:\n- Always emphasize that leave requests MUST be submitted through the Pocket Fund Dashboard only — no email, Slack, WhatsApp, phone, or personal messages accepted.\n- Be accurate and cite specific policy sections when relevant.\n- Be concise (2-5 sentences max). If a question needs a longer answer, keep it structured.\n- If you don't know something or it's not in the policy, say so honestly.\n- Be friendly, professional, and helpful.\n- Do not use markdown formatting.\n- You can answer about: leaves, attendance, Jibble, outreach platform, daily log, code of conduct, confidentiality, performance reviews, stipend/payment, pay cuts, monthly bonus, referrals, internship, travel reimbursement, and all other company policies.`;

    const history = messages.slice(-6).map(m => `${m.role}: ${m.text}`).join('\n');
    const result = await callClaude(systemPrompt, `${history}\nuser: ${userMsg}`);

    setMessages(prev => [...prev, { role: 'assistant', text: result }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-5 right-5 w-96 h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-[60]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">PF AI</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Online
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-violet-600 text-white rounded-2xl rounded-br-md'
                : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-md'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask PF AI anything..."
          className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="px-3 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
