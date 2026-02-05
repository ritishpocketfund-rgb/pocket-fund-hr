import { jibbleFetch } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { startDate, endDate, personIds, period } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required (YYYY-MM-DD)' });
    }

    let path = `/TimesheetsSummary?period=${period || 'Day'}&startDate=${startDate}&endDate=${endDate}`;
    if (personIds) {
      personIds.split(',').forEach(id => { path += `&personIds=${id}`; });
    }

    const data = await jibbleFetch(path);
    res.status(200).json(data);
  } catch (err) {
    console.error('Timesheets error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
