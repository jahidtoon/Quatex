import { requireAdmin, json } from '@/app/api/admin/_utils';
import { getRiskData } from '@/lib/adminMetrics';

export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const data = await getRiskData();
  return json(data);
}
