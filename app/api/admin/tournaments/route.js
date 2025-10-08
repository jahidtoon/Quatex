import { requireAdmin, json } from '@/app/api/admin/_utils';
import { getTournamentsData } from '@/lib/adminMetrics';

export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const data = await getTournamentsData();
  return json({ items: data });
}
