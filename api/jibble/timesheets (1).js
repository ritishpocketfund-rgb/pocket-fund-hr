import { getJibbleToken } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const { startDate, endDate, personIds, period } = params || {};
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required (YYYY-MM-DD)' });
    }

    const token = await getJibbleToken();

    // Jibble timesheets live on time-attendance domain, NOT workspace domain
    const baseUrl = 'https://time-attendance.prod.jibble.io/v1';

    const body = {
      date: startDate,
      endDate: endDate,
      period: period || 'Daily',
    };
    if (personIds) {
      body.personIds = typeof personIds === 'string' ? personIds.split(',') : personIds;
    }

    const response = await fetch(`${baseUrl}/TimesheetsSummary`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Jibble timesheets ${response.status}: ${errText}`);
      return res.status(response.status).json({ error: `Jibble API ${response.status}: ${errText}` });
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    res.status(200).json(data);
  } catch (err) {
    console.error('Timesheets error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
