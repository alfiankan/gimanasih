// Cloudflare Worker Backend for Gimanasih / bitbrain
// Handles stateless JWT session management and D1 database interactions

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  picture: string;
  exp?: number;
}

// Helpers for Base64URL encoding/decoding
function base64UrlEncode(str: string): string {
  const binary = new TextEncoder().encode(str);
  const base64 = btoa(String.fromCharCode(...binary));
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// HMAC SHA-256 JWT sign/verify using Web Crypto
async function signJWT(payload: UserSession, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days expiry
  }));

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(dataToSign)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${dataToSign}.${encodedSignature}`;
}

async function verifyJWT(token: string, secret: string): Promise<UserSession | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const dataToVerify = `${header}.${payload}`;
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBinary = atob(signature.replace(/-/g, '+').replace(/_/g, '/'));
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(dataToVerify)
    );

    if (!isValid) return null;

    const parsedPayload = JSON.parse(base64UrlDecode(payload)) as UserSession;
    if (parsedPayload.exp && Date.now() / 1000 > parsedPayload.exp) {
      return null; // Expired
    }

    return parsedPayload;
  } catch {
    return null;
  }
}

// CORS Headers Helper
function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(request);

    // CORS preflight options
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Auth Middleware
    const authHeader = request.headers.get('Authorization') || '';
    let userSession: UserSession | null = null;
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      userSession = await verifyJWT(token, env.JWT_SECRET);
    }

    try {
      // 1. Google OAuth Authentication Endpoint
      if (url.pathname === '/api/auth/google' && request.method === 'POST') {
        const body = (await request.json()) as { credential?: string };
        const { credential } = body;

        if (!credential) {
          return new Response(JSON.stringify({ error: 'Missing credential payload' }), { status: 400, headers: corsHeaders });
        }

        // Validate token with Google API tokeninfo endpoint
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!googleRes.ok) {
          return new Response(JSON.stringify({ error: 'Invalid Google token' }), { status: 401, headers: corsHeaders });
        }

        const payload = (await googleRes.json()) as {
          aud: string;
          sub: string;
          email: string;
          name: string;
          picture: string;
        };

        // Safety check: verify audience matches Google Client ID
        if (payload.aud !== env.GOOGLE_CLIENT_ID) {
          return new Response(JSON.stringify({ error: 'Audience mismatch' }), { status: 403, headers: corsHeaders });
        }

        const userId = payload.sub; // Google Unique ID
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;

        // Upsert user into D1 Database
        await env.DB.prepare(`
          INSERT INTO users (id, email, name, picture, updated_at)
          VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            picture = EXCLUDED.picture,
            updated_at = CURRENT_TIMESTAMP
        `).bind(userId, email, name, picture).run();

        // Create default user progress if it doesn't exist
        await env.DB.prepare(`
          INSERT OR IGNORE INTO user_progress (user_id, xp, unlocked_badges, completed_lessons)
          VALUES (?1, 0, '[]', '[]')
        `).bind(userId).run();

        // Issue stateless JWT token
        const tokenPayload = { userId, email, name, picture };
        const sessionToken = await signJWT(tokenPayload, env.JWT_SECRET);

        return new Response(JSON.stringify({
          token: sessionToken,
          user: tokenPayload
        }), { status: 200, headers: corsHeaders });
      }

      // -- ALL endpoints below require user authentication --
      if (!userSession) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      }

      // 2. GET user progress endpoint
      if (url.pathname === '/api/progress' && request.method === 'GET') {
        interface ProgressRow {
          xp: number;
          unlocked_badges: string | null;
          completed_lessons: string | null;
        }
        const progress = await env.DB.prepare(`
          SELECT xp, unlocked_badges, completed_lessons 
          FROM user_progress 
          WHERE user_id = ?1
        `).bind(userSession.userId).first<ProgressRow>();

        if (!progress) {
          return new Response(JSON.stringify({
            xp: 0,
            unlockedBadges: [],
            completedLessons: []
          }), { status: 200, headers: corsHeaders });
        }

        return new Response(JSON.stringify({
          xp: progress.xp,
          unlockedBadges: JSON.parse(progress.unlocked_badges || '[]'),
          completedLessons: JSON.parse(progress.completed_lessons || '[]')
        }), { status: 200, headers: corsHeaders });
      }

      // 3. POST user progress save/update endpoint
      if (url.pathname === '/api/progress' && request.method === 'POST') {
        const body = (await request.json()) as {
          xp?: number;
          unlockedBadges?: string[];
          completedLessons?: string[];
        };
        const { xp, unlockedBadges, completedLessons } = body;

        if (xp === undefined || !Array.isArray(unlockedBadges) || !Array.isArray(completedLessons)) {
          return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400, headers: corsHeaders });
        }

        // Save progress into D1
        await env.DB.prepare(`
          INSERT INTO user_progress (user_id, xp, unlocked_badges, completed_lessons, updated_at)
          VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)
          ON CONFLICT(user_id) DO UPDATE SET
            xp = EXCLUDED.xp,
            unlocked_badges = EXCLUDED.unlocked_badges,
            completed_lessons = EXCLUDED.completed_lessons,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          userSession.userId, 
          xp, 
          JSON.stringify(unlockedBadges), 
          JSON.stringify(completedLessons)
        ).run();

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
      }

      // 404 handler
      return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: corsHeaders });
    }
  }
};
