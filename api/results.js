import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const resultKeys = new Set(['succulent', 'cactus', 'hoya', 'fishbone']);
const resultColumns =
  'id, public_slug, client_token, result_key, answers, scores, card_payload, user_nickname, plant_name, user_intro, is_purchased, purchased_at, created_at';

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

function getSupabaseAdmin(res) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    sendJson(res, 503, {
      error: 'Result API env is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    });
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

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function normalizeAnswers(value) {
  if (!Array.isArray(value)) throw new Error('answers must be an array.');
  if (value.length !== 7) throw new Error('answers must contain exactly 7 items.');
  value.forEach((answer) => {
    if (!resultKeys.has(answer)) throw new Error('answers contains an invalid result key.');
  });
  return value;
}

function normalizeScores(value) {
  assertObject(value, 'scores');
  const scores = {};
  for (const key of resultKeys) {
    const score = Number(value[key] ?? 0);
    if (!Number.isInteger(score) || score < 0 || score > 7) {
      throw new Error('scores contains an invalid score.');
    }
    scores[key] = score;
  }
  return scores;
}

function normalizeCardPayload(value) {
  if (value === undefined || value === null) return {};
  assertObject(value, 'card_payload');
  return value;
}

function normalizeCreatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('request body must be an object.');
  }
  if (!resultKeys.has(body.result_key)) throw new Error('Invalid result_key.');

  return {
    result_key: body.result_key,
    answers: normalizeAnswers(body.answers),
    scores: normalizeScores(body.scores),
    card_payload: normalizeCardPayload(body.card_payload),
    user_nickname: cleanText(body.user_nickname, 30),
    plant_name: cleanText(body.plant_name, 30),
    user_intro: cleanText(body.user_intro, 80),
    client_token: randomBytes(16).toString('hex'),
  };
}

function normalizePatch(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('patch must be an object.');
  }

  const patch = {};

  if ('user_nickname' in input) patch.user_nickname = cleanText(input.user_nickname, 30);
  if ('plant_name' in input) patch.plant_name = cleanText(input.plant_name, 30);
  if ('user_intro' in input) patch.user_intro = cleanText(input.user_intro, 80);
  if ('card_payload' in input) patch.card_payload = normalizeCardPayload(input.card_payload);

  if (Object.keys(patch).length === 0) throw new Error('No editable public fields provided.');
  return patch;
}

async function createResult(req, res, supabase) {
  let payload;
  try {
    payload = normalizeCreatePayload(req.body);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const { data, error } = await supabase
    .from('coolbti_results')
    .insert(payload)
    .select(resultColumns)
    .single();

  if (error) return sendJson(res, 500, { error: error.message });
  return sendJson(res, 201, { result: data });
}

async function updateResult(req, res, supabase) {
  const { id, client_token: clientToken, patch } = req.body ?? {};
  if (!id || !clientToken) {
    return sendJson(res, 400, { error: 'id and client_token are required.' });
  }

  let normalized;
  try {
    normalized = normalizePatch(patch);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  if (normalized.card_payload) {
    const { data: current, error: selectError } = await supabase
      .from('coolbti_results')
      .select('card_payload')
      .eq('id', id)
      .eq('client_token', clientToken)
      .maybeSingle();

    if (selectError) return sendJson(res, 500, { error: selectError.message });
    if (!current) return sendJson(res, 404, { error: 'Result row was not found.' });

    normalized.card_payload = {
      ...(current.card_payload ?? {}),
      ...normalized.card_payload,
    };
  }

  const { data, error } = await supabase
    .from('coolbti_results')
    .update(normalized)
    .eq('id', id)
    .eq('client_token', clientToken)
    .select(resultColumns)
    .maybeSingle();

  if (error) return sendJson(res, 500, { error: error.message });
  if (!data) return sendJson(res, 404, { error: 'Result row was not found.' });
  return sendJson(res, 200, { result: data });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return sendJson(res, 200, { ok: true });

  const supabase = getSupabaseAdmin(res);
  if (!supabase) return;

  if (req.method === 'POST') return createResult(req, res, supabase);
  if (req.method === 'PATCH') return updateResult(req, res, supabase);

  res.setHeader('Allow', 'POST, PATCH, OPTIONS');
  return sendJson(res, 405, { error: 'Method not allowed.' });
}
