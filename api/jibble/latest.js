import { jibbleFetch } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    // LatestTimeEntries returns the most recent entry per person for a given date
    const data = await jibbleFetch(`/LatestTimeEntries?date=${targetDate}`);
    res.status(200).json(data);
  } catch (err) {
    console.error('Latest time entries error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
