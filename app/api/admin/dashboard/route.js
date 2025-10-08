import { requireAdmin, json } from '@/app/api/admin/_utils';
import { getDashboardMetrics } from '@/lib/adminMetrics';

export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const data = await getDashboardMetrics();
  return json(data);
}
