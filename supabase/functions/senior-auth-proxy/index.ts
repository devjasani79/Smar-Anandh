// senior-auth-proxy
// Validates {phone, pin} via SERVICE_ROLE and mints a short-lived
// Supabase-compatible JWT carrying a `senior_id` claim. Frontend
// then calls supabase.auth.setSession() so PostgREST sees the
// claim and JWT-scoped RLS (002_jwt_senior_rls.sql) applies.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { SignJWT } from 'npm:jose@5';
import { z } from 'npm:zod@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const Body = z.object({
  phone: z.string().min(7),
  pin: z.string().regex(/^\d{4}$/),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!parsed.success) {
    return json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }
  const { phone, pin } = parsed.data;

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const JWT_SECRET = Deno.env.get('SUPABASE_JWT_SECRET');
  if (!JWT_SECRET) {
    return json({ error: 'Server misconfigured: SUPABASE_JWT_SECRET missing' }, 500);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const normalized = phone.replace(/\s+/g, '').replace(/^\+?91/, '');

  const { data, error } = await admin.rpc('validate_family_pin_with_phone', {
    guardian_phone: normalized,
    input_pin: pin,
  });

  if (error) {
    console.error('validate_family_pin_with_phone error:', error);
    return json({ error: 'Validation failed' }, 500);
  }
  if (!data || data.length === 0) {
    return json({ error: 'Invalid phone or PIN' }, 401);
  }

  const row = data[0];
  const seniorId: string = row.senior_id;
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60; // 1 hour

  const key = new TextEncoder().encode(JWT_SECRET);
  const access_token = await new SignJWT({
    role: 'authenticated',
    aud: 'authenticated',
    sub: seniorId,
    senior_id: seniorId,
    guardian_id: row.guardian_id,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(key);

  return json({
    access_token,
    refresh_token: access_token, // no refresh; client re-auths on expiry
    expires_in: 3600,
    senior: {
      id: seniorId,
      name: row.senior_name,
      preferred_name: row.preferred_name,
      photo_url: row.photo_url,
      language: row.senior_language,
      guardian_id: row.guardian_id,
    },
  });
});