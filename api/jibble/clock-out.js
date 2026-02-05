import { jibbleFetch } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { personId } = req.body;
    if (!personId) return res.status(400).json({ error: 'personId is required' });

    const body = {
      personId,
      type: 'Out',
      clientType: 'web',
      platform: {
        clientVersion: 'PocketFund/1.0',
        os: 'Web',
        deviceModel: 'Browser',
        deviceName: 'PocketFund Dashboard',
      },
    };

    const data = await jibbleFetch('/TimeEntries', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Clock out error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
