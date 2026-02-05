import { jibbleFetch } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { personId, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let path = `/LatestTimeEntries?date=${targetDate}`;
    if (personId) {
      path += `&$filter=personId eq '${personId}'`;
    }

    const data = await jibbleFetch(path);
    res.status(200).json(data);
  } catch (err) {
    console.error('Time entries error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
