const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Change 1: Replace import block from supabase to convex
const oldImport = /import \{[\s\S]*?\} from '\.\/lib\/supabase';/;
const newImport = `import {
  fetchEmployees as dbFetchEmployees,
  upsertEmployee, deleteEmployee as dbDeleteEmployee,
  fetchTickets as dbFetchTickets,
  createTicket as dbCreateTicket, updateTicket as dbUpdateTicket, addTicketComment as dbAddTicketComment,
  fetchLeaves as dbFetchLeaves,
  createLeave as dbCreateLeave, updateLeave as dbUpdateLeave,
  fetchActivities as dbFetchActivities, createActivity as dbCreateActivity,
  fetchAnnouncements as dbFetchAnnouncements,
  createAnnouncement as dbCreateAnnouncement, updateAnnouncement as dbUpdateAnnouncement, deleteAnnouncement as dbDeleteAnnouncement,
  fetchNotifications as dbFetchNotifications,
  createNotification as dbCreateNotification, updateNotification as dbUpdateNotification, bulkUpdateNotifications, clearAllNotifications,
  fetchSalaryRecords as dbFetchSalaryRecords, upsertSalaryRecord,
  fetchSuggestions as dbFetchSuggestions,
  createSuggestion as dbCreateSuggestion, updateSuggestion as dbUpdateSuggestion, deleteSuggestion as dbDeleteSuggestion,
  fetchReferrals as dbFetchReferrals,
  createReferral as dbCreateReferral, updateReferral as dbUpdateReferral, deleteReferral as dbDeleteReferral,
  fetchHolidaySelections as dbFetchHolidaySelections, replaceHolidaySelections,
  getCurrentUser, setCurrentUser as dbSetCurrentUser, clearCurrentUser,
  resetAllData,
} from './lib/convex';`;

if (oldImport.test(code)) {
  code = code.replace(oldImport, newImport);
  console.log('Change 1: Import block replaced successfully.');
} else {
  console.log('Change 1: WARNING - Could not find supabase import block. It may have already been changed.');
}

// Change 2: Replace handleResetData function
const oldReset = /const handleResetData = async \(\) => \{[\s\S]*?showToast\('Data reset \(employees preserved\)'.*?\);\s*\}\s*\};/;
const newReset = `const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone. Note: employee records are preserved.')) {
      await resetAllData();
      setTickets([]);
      setLeaves([]);
      setActivities([]);
      setAnnouncements([]);
      setNotifications([]);
      setSalaryRecords([]);
      setSuggestions([]);
      setReferrals([]);
      setHolidaySelections([]);
      const freshEmps = await dbFetchEmployees();
      setEmployees(freshEmps);
      setCurrentUser(null);
      clearCurrentUser();
      showToast('Data reset (employees preserved)', 'info');
    }
  };`;

if (oldReset.test(code)) {
  code = code.replace(oldReset, newReset);
  console.log('Change 2: handleResetData replaced successfully.');
} else {
  console.log('Change 2: WARNING - Could not find handleResetData. It may have already been changed.');
}

fs.writeFileSync('src/App.jsx', code);
console.log('All done! App.jsx has been patched.');
