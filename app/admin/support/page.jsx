import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';

export default function AdminSupportPage() {
  return (
    <div>
      <AdminPageHeader title="Support" subtitle="Handle support tickets and messages." />
      <Card title="Support Inbox">
        <p className="text-gray-300">Coming soon.</p>
      </Card>
    </div>
  );
}
