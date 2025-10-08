import { requireAdmin, json } from '@/app/api/admin/_utils';
import { getTransactionsData } from '@/lib/adminMetrics';

export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '20');
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('q') || '';

  const data = await getTransactionsData('deposit', { page, pageSize, status, search });
  return json(data);
}
