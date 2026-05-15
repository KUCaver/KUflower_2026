import { createClient } from '@supabase/supabase-js';

const resultKeys = new Set(['succulent', 'cactus', 'hoya', 'fishbone']);
const editableFields = new Set([
  'result_key',
  'answers',
  'scores',
  'card_payload',
  'user_nickname',
  'plant_name',
  'is_purchased',
  'purchased_at',
]);

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

function getAdminToken(req) {
  return req.headers['x-admin-token'] ?? req.headers['X-Admin-Token'];
}

function normalizeAdminToken(value) {
  const token = String(value ?? '').trim();
  if (token === 'znfznfEl' || token === 'znfznfel') return '쿨쿨띠';
  return token;
}

function requireEnv(req, res) {
  const expectedToken = process.env.ADMIN_API_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!expectedToken || !supabaseUrl || !serviceRoleKey) {
    sendJson(res, 500, {
      error: 'Admin API env is not configured. Set ADMIN_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.',
    });
    return null;
  }

  if (normalizeAdminToken(getAdminToken(req)) !== normalizeAdminToken(expectedToken)) {
    sendJson(res, 401, { error: 'Invalid admin token.' });
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function cleanText(value, maxLength) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new Error('Text fields must be strings.');
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) throw new Error(`Text field is too long. Max ${maxLength} chars.`);
  return trimmed;
}

function normalizePatch(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('patch must be an object.');
  }

  const patch = {};
  for (const [key, value] of Object.entries(input)) {
    if (!editableFields.has(key)) continue;

    if (key === 'result_key') {
      if (!resultKeys.has(value)) throw new Error('Invalid result_key.');
      patch.result_key = value;
      continue;
    }

    if (key === 'answers') {
      if (!Array.isArray(value)) throw new Error('answers must be an array.');
      patch.answers = value;
      continue;
    }

    if (key === 'scores') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('scores must be an object.');
      }
      patch.scores = value;
      continue;
    }

    if (key === 'card_payload') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('card_payload must be an object.');
      }
      patch.card_payload = value;
      continue;
    }

    if (key === 'user_nickname') {
      patch.user_nickname = cleanText(value, 30);
      continue;
    }

    if (key === 'plant_name') {
      patch.plant_name = cleanText(value, 30);
      continue;
    }

    if (key === 'is_purchased') {
      if (typeof value !== 'boolean') throw new Error('is_purchased must be boolean.');
      patch.is_purchased = value;
      patch.purchased_at = value ? new Date().toISOString() : null;
      continue;
    }

    if (key === 'purchased_at') {
      patch.purchased_at = value || null;
    }
  }

  if (Object.keys(patch).length === 0) throw new Error('No editable fields provided.');
  return patch;
}

async function listResults(req, res, supabase) {
  const limit = Math.min(Number(req.query.limit ?? 80) || 80, 200);
  const resultKey = req.query.result_key;
  const isPurchased = req.query.is_purchased;
  const q = typeof req.query.q === 'string' ? req.query.q.trim().replace(/[(),]/g, '') : '';

  let query = supabase
    .from('coolbti_results')
    .select(
      'id, public_slug, result_key, answers, scores, card_payload, user_nickname, plant_name, is_purchased, purchased_at, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (resultKey && resultKeys.has(resultKey)) {
    query = query.eq('result_key', resultKey);
  }

  if (isPurchased === 'true') query = query.eq('is_purchased', true);
  if (isPurchased === 'false') query = query.eq('is_purchased', false);

  if (q) {
    query = query.or(`public_slug.ilike.%${q}%,user_nickname.ilike.%${q}%,plant_name.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return sendJson(res, 500, { error: error.message });
  return sendJson(res, 200, { results: data ?? [] });
}

async function updateResult(req, res, supabase) {
  const { id, patch } = req.body ?? {};
  if (!id) return sendJson(res, 400, { error: 'id is required.' });

  let normalized;
  try {
    normalized = normalizePatch(patch);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const { data, error } = await supabase
    .from('coolbti_results')
    .update(normalized)
    .eq('id', id)
    .select(
      'id, public_slug, result_key, answers, scores, card_payload, user_nickname, plant_name, is_purchased, purchased_at, created_at',
    )
    .single();

  if (error) return sendJson(res, 500, { error: error.message });
  return sendJson(res, 200, { result: data });
}

async function deleteResult(req, res, supabase) {
  const { id } = req.body ?? {};
  if (!id) return sendJson(res, 400, { error: 'id is required.' });

  const { error } = await supabase.from('coolbti_results').delete().eq('id', id);
  if (error) return sendJson(res, 500, { error: error.message });
  return sendJson(res, 200, { deleted: true, id });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });

  const supabase = requireEnv(req, res);
  if (!supabase) return;

  if (req.method === 'GET') return listResults(req, res, supabase);
  if (req.method === 'PATCH') return updateResult(req, res, supabase);
  if (req.method === 'DELETE') return deleteResult(req, res, supabase);

  res.setHeader('Allow', 'GET, PATCH, DELETE, OPTIONS');
  return sendJson(res, 405, { error: 'Method not allowed.' });
}
