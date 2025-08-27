import { requireAdmin, json } from '../_utils';

export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;
  return json({ ok: true, secret: 'admin-only-data' });
}
