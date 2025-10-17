export const dynamic = 'force-dynamic';
export const revalidate = false;

import ClientAnalyticsPage from './ClientPage';

export default function AnalyticsPage() {
  // Server component wrapper mainly for Next.js route config
  return <ClientAnalyticsPage />;
}
