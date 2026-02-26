// migrate-data.js
// Run from pocket-fund-hr folder: node migrate-data.js

const SUPABASE_URL = 'https://ixgfncftxofmjalzvptl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__Q5h1NWTsidLrfMSIrQf5A_Vy6swb5Q';

// Read Convex URL from .env.local
const fs = require('fs');
const envLocal = fs.readFileSync('.env.local', 'utf8');
const convexUrlMatch = envLocal.match(/VITE_CONVEX_URL=(.+)/);
if (!convexUrlMatch) {
  console.error('Could not find VITE_CONVEX_URL in .env.local');
  process.exit(1);
}
const CONVEX_URL = convexUrlMatch[1].trim();
console.log('Convex URL:', CONVEX_URL);

// Supabase REST API helper
async function supabaseFetch(table, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase fetch ${table} failed: ${res.status} ${err}`);
  }
  return res.json();
}

// Convex mutation helper
async function convexMutation(functionPath, args) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: functionPath, args }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Convex mutation ${functionPath} failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function migrate() {
  console.log('\n=== Starting Supabase → Convex Data Migration ===\n');

  // 1. Employees
  try {
    console.log('Fetching employees...');
    const employees = await supabaseFetch('employees', 'select=*&order=id');
    console.log(`  Found ${employees.length} employees`);
    for (const emp of employees) {
      await convexMutation('employees:upsert', { employee: emp });
    }
    console.log('  ✓ Employees migrated');
  } catch (e) {
    console.error('  ✗ Employees failed:', e.message);
  }

  // 2. Tickets
  try {
    console.log('Fetching tickets...');
    const tickets = await supabaseFetch('tickets', 'select=*&order=createdAt.desc');
    console.log(`  Found ${tickets.length} tickets`);
    for (const t of tickets) {
      const { comments, internalNotes, ...row } = t;
      await convexMutation('tickets:create', { ticket: row });
    }
    console.log('  ✓ Tickets migrated');
  } catch (e) {
    console.error('  ✗ Tickets failed:', e.message);
  }

  // 3. Ticket Comments
  try {
    console.log('Fetching ticket comments...');
    const comments = await supabaseFetch('ticket_comments', 'select=*&order=at.asc');
    console.log(`  Found ${comments.length} comments`);
    for (const c of comments) {
      await convexMutation('tickets:addComment', {
        ticketId: c.ticketId,
        by: c.by,
        text: c.text,
        isInternal: c.isInternal,
        at: c.at,
      });
    }
    console.log('  ✓ Ticket comments migrated');
  } catch (e) {
    console.error('  ✗ Ticket comments failed:', e.message);
  }

  // 4. Leaves
  try {
    console.log('Fetching leaves...');
    const leaves = await supabaseFetch('leaves', 'select=*&order=createdAt.desc');
    console.log(`  Found ${leaves.length} leaves`);
    for (const l of leaves) {
      await convexMutation('leaves:create', { leave: l });
    }
    console.log('  ✓ Leaves migrated');
  } catch (e) {
    console.error('  ✗ Leaves failed:', e.message);
  }

  // 5. Activities
  try {
    console.log('Fetching activities...');
    const activities = await supabaseFetch('activities', 'select=*&order=at.desc&limit=200');
    console.log(`  Found ${activities.length} activities`);
    for (const a of activities) {
      await convexMutation('activities:create', { activity: a });
    }
    console.log('  ✓ Activities migrated');
  } catch (e) {
    console.error('  ✗ Activities failed:', e.message);
  }

  // 6. Announcements
  try {
    console.log('Fetching announcements...');
    const announcements = await supabaseFetch('announcements', 'select=*&order=createdAt.desc');
    console.log(`  Found ${announcements.length} announcements`);
    for (const a of announcements) {
      await convexMutation('announcements:create', { announcement: a });
    }
    console.log('  ✓ Announcements migrated');
  } catch (e) {
    console.error('  ✗ Announcements failed:', e.message);
  }

  // 7. Notifications
  try {
    console.log('Fetching notifications...');
    const notifications = await supabaseFetch('notifications', 'select=*&order=at.desc&limit=100');
    console.log(`  Found ${notifications.length} notifications`);
    for (const n of notifications) {
      await convexMutation('notifications:create', { notification: n });
    }
    console.log('  ✓ Notifications migrated');
  } catch (e) {
    console.error('  ✗ Notifications failed:', e.message);
  }

  // 8. Salary Records
  try {
    console.log('Fetching salary records...');
    const salaryRecords = await supabaseFetch('salary_records', 'select=*');
    console.log(`  Found ${salaryRecords.length} salary records`);
    for (const r of salaryRecords) {
      await convexMutation('salaryRecords:upsert', { record: r });
    }
    console.log('  ✓ Salary records migrated');
  } catch (e) {
    console.error('  ✗ Salary records failed:', e.message);
  }

  // 9. Suggestions
  try {
    console.log('Fetching suggestions...');
    const suggestions = await supabaseFetch('suggestions', 'select=*&order=createdAt.desc');
    console.log(`  Found ${suggestions.length} suggestions`);
    for (const s of suggestions) {
      await convexMutation('suggestions:create', { suggestion: s });
    }
    console.log('  ✓ Suggestions migrated');
  } catch (e) {
    console.error('  ✗ Suggestions failed:', e.message);
  }

  // 10. Referrals
  try {
    console.log('Fetching referrals...');
    const referrals = await supabaseFetch('referrals', 'select=*&order=createdAt.desc');
    console.log(`  Found ${referrals.length} referrals`);
    for (const r of referrals) {
      await convexMutation('referrals:create', { referral: r });
    }
    console.log('  ✓ Referrals migrated');
  } catch (e) {
    console.error('  ✗ Referrals failed:', e.message);
  }

  // 11. Holiday Selections
  try {
    console.log('Fetching holiday selections...');
    const selections = await supabaseFetch('holiday_selections', 'select=*&order=selectedAt.desc');
    console.log(`  Found ${selections.length} holiday selections`);
    for (const s of selections) {
      await convexMutation('holidaySelections:create', { selection: s });
    }
    console.log('  ✓ Holiday selections migrated');
  } catch (e) {
    console.error('  ✗ Holiday selections failed:', e.message);
  }

  console.log('\n=== Migration Complete! ===');
  console.log('Check your Convex dashboard to verify the data.');
}

migrate().catch(console.error);
