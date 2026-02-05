let cachedToken = null;
let tokenExpiresAt = 0;

export async function getJibbleToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const clientId = process.env.JIBBLE_CLIENT_ID;
  const clientSecret = process.env.JIBBLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('JIBBLE_CLIENT_ID and JIBBLE_CLIENT_SECRET must be set');
  }

  const res = await fetch('https://identity.prod.jibble.io/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Jibble auth failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

export async function jibbleFetch(path, options = {}) {
  const token = await getJibbleToken();
  const baseUrl = 'https://workspace.prod.jibble.io/v1';
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Jibble API ${res.status}: ${errText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
