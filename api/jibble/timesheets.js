import { jibbleFetch } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  try {
    const { startDate, endDate, period, personIds } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required (YYYY-MM-DD)' });
    }

    const body = {
      date: startDate,
      endDate: endDate,
      period: period || 'Daily',
    };
    if (personIds) {
      body.personIds = Array.isArray(personIds) ? personIds : [personIds];
    }

    const data = await jibbleFetch('/TimesheetsSummary', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    res.status(200).json(data);
  } catch (err) {
    console.error('Timesheets error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
