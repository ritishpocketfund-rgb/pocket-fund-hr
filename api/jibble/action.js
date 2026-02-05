import { jibbleFetch } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { personId, type, activityId, projectId } = req.body;
    // type: 'In' | 'Out' | 'Break'
    if (!personId) return res.status(400).json({ error: 'personId is required' });
    if (!type || !['In', 'Out', 'Break'].includes(type)) {
      return res.status(400).json({ error: "type must be 'In', 'Out', or 'Break'" });
    }

    const body = {
      personId,
      type,
      clientType: 'Web',
      platform: {
        clientVersion: 'PocketFund/1.0',
        os: 'Web',
        deviceModel: 'Browser',
        deviceName: 'PocketFund Dashboard',
      },
    };
    if (activityId) body.activityId = activityId;
    if (projectId) body.projectId = projectId;

    const data = await jibbleFetch('/TimeEntries', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Time entry action error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
