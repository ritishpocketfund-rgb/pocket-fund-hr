// migrate-v2.cjs
// Step 1: Fetch all data from Supabase and save as JSON files
// Step 2: Use convex import to load them

const fs = require('fs');

const SUPABASE_URL = 'https://ixgfncftxofmjalzvptl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__Q5h1NWTsidLrfMSIrQf5A_Vy6swb5Q';

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

async function exportAll() {
  console.log('=== Exporting data from Supabase ===\n');

  const tables = [
    { name: 'employees', convexTable: 'employees', params: 'select=*&order=id' },
    { name: 'tickets', convexTable: 'tickets', params: 'select=*&order=createdAt.desc' },
    { name: 'ticket_comments', convexTable: 'ticket_comments', params: 'select=*&order=at.asc' },
    { name: 'leaves', convexTable: 'leaves', params: 'select=*&order=createdAt.desc' },
    { name: 'activities', convexTable: 'activities', params: 'select=*&order=at.desc&limit=200' },
    { name: 'announcements', convexTable: 'announcements', params: 'select=*&order=createdAt.desc' },
    { name: 'notifications', convexTable: 'notifications', params: 'select=*&order=at.desc&limit=100' },
    { name: 'salary_records', convexTable: 'salary_records', params: 'select=*' },
    { name: 'suggestions', convexTable: 'suggestions', params: 'select=*&order=createdAt.desc' },
    { name: 'referrals', convexTable: 'referrals', params: 'select=*&order=createdAt.desc' },
    { name: 'holiday_selections', convexTable: 'holiday_selections', params: 'select=*&order=selectedAt.desc' },
  ];

  // Create temp dir
  if (!fs.existsSync('_migration_data')) fs.mkdirSync('_migration_data');

  for (const t of tables) {
    try {
      const data = await supabaseFetch(t.name, t.params);
      console.log(`${t.name}: ${data.length} records`);
      
      // For salary_records, add uniqueKey field required by Convex schema
      if (t.name === 'salary_records') {
        for (const r of data) {
          r.uniqueKey = `${r.userId}-${r.month}`;
        }
      }

      // Remove any null values (Convex doesn't like null for optional fields)
      const cleaned = data.map(row => {
        const clean = {};
        for (const [k, v] of Object.entries(row)) {
          if (v !== null && v !== undefined) {
            clean[k] = v;
          }
        }
        return clean;
      });

      // Save as JSONL (one JSON object per line) for convex import
      const jsonlLines = cleaned.map(r => JSON.stringify(r));
      fs.writeFileSync(`_migration_data/${t.convexTable}.jsonl`, jsonlLines.join('\n'));
    } catch (e) {
      console.error(`${t.name}: FAILED - ${e.message}`);
    }
  }

  console.log('\n=== Export complete! ===');
  console.log('\nNow run these commands to import into Convex:\n');

  for (const t of tables) {
    const file = `_migration_data/${t.convexTable}.jsonl`;
    if (fs.existsSync(file)) {
      const lines = fs.readFileSync(file, 'utf8').trim().split('\n').length;
      if (lines > 0) {
        console.log(`npx convex import --table ${t.convexTable} _migration_data/${t.convexTable}.jsonl --replace`);
      }
    }
  }
}

exportAll().catch(console.error);
