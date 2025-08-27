import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';

export default function AdminSystemPage() {
  return (
    <div>
      <AdminPageHeader title="System" subtitle="System status, logs, and configuration." />
      <Card title="System">
        <p className="text-gray-300">Coming soon.</p>
      </Card>
    </div>
  );
}
