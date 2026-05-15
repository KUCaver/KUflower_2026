import type { ResultKey } from '../data/coolbti';
import { supabase } from './supabase';

export type SavedResultRecord = {
  id: string;
  public_slug: string;
  client_token: string;
  source: 'api';
};

export type ResultRecordPayload = {
  result_key: ResultKey;
  answers: ResultKey[];
  scores: Record<ResultKey, number>;
  card_payload: Record<string, unknown>;
  user_nickname?: string | null;
  plant_name?: string | null;
  user_intro?: string | null;
};

type ApiResultPayload = {
  result?: {
    id?: string;
    public_slug?: string;
    client_token?: string;
  };
  error?: string;
};

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected response from result API (${response.status}).`);
  }
  return (await response.json()) as ApiResultPayload;
}

export async function createResultRecord(payload: ResultRecordPayload) {
  try {
    const response = await fetch('/api/results', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await readJsonResponse(response);

    if (!response.ok) throw new Error(body.error ?? `Result API failed (${response.status}).`);
    if (body.result?.id && body.result.public_slug && body.result.client_token) {
      return {
        id: body.result.id,
        public_slug: body.result.public_slug,
        client_token: body.result.client_token,
        source: 'api' as const,
      };
    }
    throw new Error('Result API returned an incomplete result row.');
  } catch (error) {
    console.warn('[coolbti] result API save skipped; falling back to anon insert', error);
  }

  if (!supabase) return null;

  const { error } = await supabase.from('coolbti_results').insert(payload);
  if (error) {
    console.warn('[coolbti] anon result save failed', error.message);
  }

  return null;
}

export async function updateResultStudentInfo(
  savedResult: SavedResultRecord | null,
  patch: {
    user_nickname: string | null;
    plant_name: string | null;
    user_intro: string | null;
    card_payload: Record<string, unknown>;
  },
) {
  if (!savedResult) return null;

  const response = await fetch('/api/results', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: savedResult.id,
      client_token: savedResult.client_token,
      patch,
    }),
  });
  const body = await readJsonResponse(response);

  if (!response.ok) throw new Error(body.error ?? `Result API update failed (${response.status}).`);
  return body.result ?? null;
}
