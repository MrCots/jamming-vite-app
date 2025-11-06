// ...existing code...
const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'your_fallback_id';
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/callback`;
let accessToken = null;
let tokenExpiresTimeout = null;

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hash);
}
function base64UrlEncode(buffer) {
  let str = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function generateCodeVerifier(length = 128) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const cryptoObj = window.crypto || window.msCrypto;
  const random = new Uint32Array(length);
  cryptoObj.getRandomValues(random);
  for (let i = 0; i < length; i++) {
    result += chars[random[i] % chars.length];
  }
  return result;
}
async function generateCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

const Spotify = {
  async getAccessToken() {
    console.log('Spotify.getAccessToken start', { accessToken, redirectUri, clientId });
    if (accessToken) return accessToken;

    // Debug info
    console.log('Current URL:', window.location.href);

    // If Spotify returned a code (Authorization Code + PKCE)
    const query = new URLSearchParams(window.location.search);
    const code = query.get('code');
    const authError = query.get('error');

    if (authError) {
      console.error('Spotify auth error:', authError);
      return null;
    }

    if (code) {
      // Exchange code for token using stored code_verifier
      const codeVerifier = localStorage.getItem('spotify_code_verifier');
      if (!codeVerifier) {
        console.error('Missing code_verifier in localStorage for PKCE exchange.');
        return null;
      }

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
      });

      try {
        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        });

        if (!tokenRes.ok) {
          const err = await tokenRes.json().catch(() => ({}));
          console.error('Token exchange failed', tokenRes.status, err);
          return null;
        }

        const tokenJson = await tokenRes.json();
        accessToken = tokenJson.access_token;
        const expiresIn = tokenJson.expires_in || 3600;
        console.log('Received access token (PKCE):', accessToken ? accessToken.slice(0, 8) + '…' : null, 'expiresIn', expiresIn);
        if (tokenExpiresTimeout) clearTimeout(tokenExpiresTimeout);
        tokenExpiresTimeout = window.setTimeout(() => { accessToken = null; }, expiresIn * 1000);
        // Clean URL
        window.history.replaceState(null, '', window.location.pathname);
        return accessToken;
      } catch (e) {
        console.error('Token exchange error', e);
        return null;
      }
    }

    // No code/token yet -> start PKCE auth
    if (!clientId || clientId === 'your_fallback_id') {
      console.error('Missing Spotify clientId. Set VITE_SPOTIFY_CLIENT_ID in .env and restart.');
      return null;
    }

    // Generate verifier + challenge and save verifier
    const verifier = generateCodeVerifier();
    localStorage.setItem('spotify_code_verifier', verifier);
    const challenge = await generateCodeChallenge(verifier);

    const authUrl =
      `https://accounts.spotify.com/authorize` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&scope=${encodeURIComponent('playlist-modify-public')}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${encodeURIComponent(challenge)}` +
      `&show_dialog=true`;

    console.log('Redirecting to Spotify authorize (PKCE):', authUrl);
    window.location = authUrl;
    return null;
  },

  async search(term) {
    const token = await Spotify.getAccessToken();
    if (!token) {
      console.log('No access token — abort search until authorized.');
      return Promise.resolve([]);
    }
    const res = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      console.error('Spotify search error', res.status);
      return [];
    }
    const json = await res.json();
    if (!json.tracks) return [];
    return json.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || '',
      album: track.album?.name || '',
      uri: track.uri
    }));
  },

  // savePlaylist as before — ensure it calls getAccessToken() which now handles PKCE
  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return;
    const token = await Spotify.getAccessToken();
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    let userId;
    const meRes = await fetch('https://api.spotify.com/v1/me', { headers });
    if (!meRes.ok) { console.error('Failed to get user id'); return; }
    const me = await meRes.json();
    userId = me.id;
    const createRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      headers, method: 'POST', body: JSON.stringify({ name })
    });
    const playlistJson = await createRes.json();
    const playlistId = playlistJson.id;
    return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers, method: 'POST', body: JSON.stringify({ uris: trackUris })
    });
  }
};

export default Spotify;
// ...existing code...