import { jibbleFetch } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const data = await jibbleFetch('/People');
    const people = (data.value || data || []).map(p => ({
      id: p.id,
      name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
      email: p.email,
      status: p.status,
    }));
    res.status(200).json({ people });
  } catch (err) {
    console.error('Jibble people error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
