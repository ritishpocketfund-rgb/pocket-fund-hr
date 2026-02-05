import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Bell, Search, Plus, Filter, Clock, AlertCircle, CheckCircle2, MessageSquare, Calendar, Users, TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal, Send, X, ChevronDown, LogOut, User, Settings, Paperclip, Eye, EyeOff, RefreshCw, Trash2, Edit3, Check, AlertTriangle, Home, FileText, BarChart3, UserCheck, Mail, Lock, Megaphone, BellRing, Pin, Archive, Volume2, VolumeX, Moon, Sun, Palette, Shield, ChevronRight, Star, Globe, Briefcase, Wallet, IndianRupee, CircleDot, Wifi, WifiOff } from 'lucide-react';
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
const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product'];
const TICKET_TYPES = ['Complaint', 'Suggestion', 'General Query'];
const TICKET_CATEGORIES = ['HR', 'Payroll', 'Tech/Tools', 'Operations', 'Management', 'Work Culture', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const TICKET_STATUSES = ['Open', 'In Review', 'In Progress', 'Waiting for Employee', 'Resolved', 'Closed'];
const LEAVE_TYPES = ['Personal Leave', 'Sick Leave', 'Exam Leave', 'Unpaid Leave', 'Emergency Leave'];
const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected'];
const ANNOUNCEMENT_PRIORITIES = ['Normal', 'Important', 'Urgent'];
const ANNOUNCEMENT_CATEGORIES = ['General', 'Policy Update', 'Event', 'Maintenance', 'Achievement', 'Reminder'];
const NOTIFICATION_TYPES = ['ticket_update', 'leave_update', 'announcement', 'comment', 'assignment', 'system', 'salary_update'];

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

// ============ COMPONENTS ============

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

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // FORCE FRESH START - Clear all old data and start clean
        // Set to true only when you need to reset all data
        const forceReset = false;
        
        // Data version - bump this to force a reset when schema changes
        const DATA_VERSION = '6';
        let versionResult;
        try {
          versionResult = await storage.get('pocketfund-version');
        } catch (e) {
          versionResult = null;
        }
        
        const needsReset = forceReset || !versionResult?.value || versionResult.value !== DATA_VERSION;
        
        if (needsReset) {
          await storage.set('pocketfund-employees', JSON.stringify(INITIAL_EMPLOYEES));
          await storage.set('pocketfund-tickets', JSON.stringify([]));
          await storage.set('pocketfund-leaves', JSON.stringify([]));
          await storage.set('pocketfund-activities', JSON.stringify([]));
          await storage.set('pocketfund-announcements', JSON.stringify([]));
          await storage.set('pocketfund-notifications', JSON.stringify([]));
          await storage.set('pocketfund-salary', JSON.stringify([]));
          await storage.set('pocketfund-version', DATA_VERSION);
          try { await storage.delete('pocketfund-currentuser'); } catch(e) {}
          
          setEmployees(INITIAL_EMPLOYEES);
          setTickets([]);
          setLeaves([]);
          setActivities([]);
          setAnnouncements([]);
          setNotifications([]);
          setSalaryRecords([]);
          setIsLoading(false);
          return;
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
      const [empR, tktR, lvR, actR, annR, ntfR, salR] = await Promise.all([
        storage.get('pocketfund-employees'),
        storage.get('pocketfund-tickets'),
        storage.get('pocketfund-leaves'),
        storage.get('pocketfund-activities'),
        storage.get('pocketfund-announcements'),
        storage.get('pocketfund-notifications'),
        storage.get('pocketfund-salary'),
      ]);
      if (empR?.value) setEmployees(JSON.parse(empR.value));
      if (tktR?.value) setTickets(JSON.parse(tktR.value));
      if (lvR?.value) setLeaves(JSON.parse(lvR.value));
      if (actR?.value) setActivities(JSON.parse(actR.value));
      if (annR?.value) setAnnouncements(JSON.parse(annR.value));
      if (ntfR?.value) setNotifications(JSON.parse(ntfR.value));
      if (salR?.value) setSalaryRecords(JSON.parse(salR.value));
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
    return notifications.filter(n => !n.read && (!n.forUser || n.forUser === currentUser?.id || n.forUser === 'all')).length;
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
    // Notify admins
    await addNotification({ type: 'ticket_update', title: 'New Ticket', message: `${currentUser.name} created ticket: ${ticketData.title}`, forUser: 'all', relatedId: newTicket.id });
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
    await addNotification({ type: 'leave_update', title: 'New Leave Request', message: `${currentUser.name} requested ${leaveData.type}`, forUser: 'all', relatedId: newLeave.id });
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

    const openTickets = tickets.filter(t => !['Resolved', 'Closed'].includes(t.status)).length;
    const resolvedThisWeek = tickets.filter(t => t.resolvedAt && t.resolvedAt > weekAgo).length;
    const resolvedLastWeek = tickets.filter(t => t.resolvedAt && t.resolvedAt > twoWeeksAgo && t.resolvedAt <= weekAgo).length;
    
    const resolvedTickets = tickets.filter(t => t.resolvedAt);
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
  }, [tickets, leaves]);

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

        <nav className="flex-1 px-3">
          <div className="space-y-1">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: Home },
              { id: 'tickets', name: 'Tickets', icon: MessageSquare },
              { id: 'leaves', name: 'Leave Requests', icon: Calendar },
              { id: 'salary', name: 'Salary Status', icon: Wallet },
              { id: 'announcements', name: 'Announcements', icon: Megaphone },
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
          <div className="flex gap-2">
            <button
              onClick={handleResetData}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors"
            >
              <RefreshCw size={14} />
              Reset
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
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

              {/* Salary Status Card (Employee Dashboard) */}
              {currentUser.role === 'employee' && (() => {
                const currentMonth = getMonthKey();
                const record = getSalaryRecord(currentUser.id, currentMonth);
                const monthLabel = getMonthString();
                const cfg = record ? SALARY_STATUS_CONFIG[record.status] : SALARY_STATUS_CONFIG['Not Processed'];
                const statusText = record ? record.status : 'Not Processed';
                return (
                  <div className="mb-8">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-violet-50 rounded-xl">
                            <Wallet size={20} className="text-violet-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">Salary / Stipend Status</h3>
                            <p className="text-xs text-slate-400">{monthLabel}</p>
                          </div>
                        </div>
                        <button onClick={() => setActiveTab('salary')} className="text-xs text-violet-600 font-medium hover:text-violet-700">
                          View Details →
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                        <span className={`text-xl font-bold ${
                          statusText === 'Processed' ? 'text-emerald-700' :
                          statusText === 'In Progress' ? 'text-blue-700' :
                          statusText === 'Delayed' ? 'text-amber-700' :
                          statusText === 'On Hold' ? 'text-orange-600' :
                          'text-slate-600'
                        }`}>{statusText}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-1">{cfg.label}</p>
                      {record?.note && (
                        <p className="text-sm text-slate-600 mt-2 p-2.5 bg-slate-50 rounded-xl italic">"{record.note}"</p>
                      )}
                      {record?.updatedAt && (
                        <p className="text-xs text-slate-400 mt-2">Updated {formatDateTime(record.updatedAt)}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">Salary amounts are confidential and not shown here.</p>
                    </div>
                  </div>
                );
              })()}

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
                      <strong>Note:</strong> Request leave 24hrs in advance via email/Slack. No phone/WhatsApp approvals.
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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900">Team Members</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {employees.filter(e => e.role === 'employee').length} employees registered
                  </p>
                </div>
              </div>

              {employees.filter(e => e.role === 'employee').length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No team members yet"
                  description="Employees will appear here once they sign up using their Pocket Fund email."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {employees.filter(e => e.role === 'employee').map(employee => (
                    <div key={employee.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                            <span className="font-semibold text-violet-600">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{employee.name}</p>
                            <p className="text-sm text-slate-500">{employee.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                            {employee.dept}
                          </span>
                          <div className="mt-2 text-xs text-slate-400">
                            ID: {employee.id}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Monthly Leave Balance</p>
                        <div className="flex flex-wrap gap-3">
                          <span className="text-xs text-slate-600">
                            Personal: <strong>{employee.leaveBalance?.personal ?? 1}</strong>
                          </span>
                          <span className="text-xs text-slate-600">
                            Sick: <strong>{employee.leaveBalance?.sick ?? 1}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Notification Panel */}
      <SlidePanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
        title="Notifications"
      >
        <NotificationPanel
          notifications={notifications.filter(n => !n.forUser || n.forUser === currentUser?.id || n.forUser === 'all')}
          onMarkRead={markNotificationRead}
          onMarkAllRead={markAllNotificationsRead}
          onClearAll={clearAllNotifications}
          getEmployee={getEmployee}
        />
      </SlidePanel>

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
function ProfileSetupScreen({ currentUser, onComplete, onLogout, toast, setToast }) {
  const [profileData, setProfileData] = useState({
    name: currentUser.name || '',
    dept: currentUser.dept || 'Engineering',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!profileData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!profileData.dept) {
      setError('Please select your department');
      return;
    }
    onComplete({ name: profileData.name.trim(), dept: profileData.dept });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4 font-['DM_Sans',sans-serif]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Pocket Fund!</h1>
          <p className="text-slate-500 mt-1">Let's set up your profile</p>
        </div>

        {/* Profile Setup Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 p-3 bg-violet-50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {currentUser.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-violet-900">Logged in as</p>
                <p className="text-xs text-violet-600">{currentUser.email}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-1">Complete Your Profile</h2>
            <p className="text-slate-500 text-sm mb-5">This is a one-time setup. You can update it later.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={profileData.dept}
                  onChange={(e) => setProfileData({ ...profileData, dept: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
              >
                Get Started →
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={onLogout}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Sign out
              </button>
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

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Provide details about your issue or suggestion..."
          rows={4}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 resize-none"
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
  });
  const [notifPrefs, setNotifPrefs] = useState(
    currentUser.settings?.notifications || { tickets: true, leaves: true, announcements: true, comments: true }
  );
  const [profileSaving, setProfileSaving] = useState(false);

  const handleProfileSave = async () => {
    if (!profileData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    setProfileSaving(true);
    await onUpdateProfile({ name: profileData.name.trim(), dept: profileData.dept });
    await onUpdateSettings({ bio: profileData.bio, notifications: notifPrefs });
    setProfileSaving(false);
  };

  const handleNotifToggle = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    await onUpdateSettings({ notifications: updated });
  };

  const sections = [
    { id: 'profile', name: 'Profile', icon: User },
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Settings Nav */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-semibold`}>
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                  activeSection === sec.id
                    ? 'bg-violet-50 text-violet-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <sec.icon size={18} />
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
              <h3 className="text-lg font-bold text-slate-900">Profile Settings</h3>
              <p className="text-sm text-slate-500 mt-1">Update your personal information</p>
            </div>
            <div className="p-6 space-y-5">
              {/* Avatar Preview */}
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-2xl`}>
                  {profileData.name.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{profileData.name || 'Your Name'}</p>
                  <p className="text-sm text-slate-500">{currentUser.email}</p>
                  <p className="text-xs text-slate-400 mt-1">ID: {currentUser.id} · {currentUser.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={profileData.dept}
                    onChange={(e) => setProfileData({ ...profileData, dept: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="A short bio about yourself..."
                  rows={3}
                  maxLength={200}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{profileData.bio.length}/200 characters</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  {profileSaving ? 'Saving...' : 'Save Changes'}
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

  const activeEmployees = employees.filter(e => e.role !== 'admin' && e.profileComplete);

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
