"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AffiliateDashboardPage() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem('affiliateToken');
		if (!token) { router.push('/affiliate/auth'); return; }
		(async () => {
			try {
				const res = await fetch('/api/affiliate/dashboard?type=stats', { headers: { Authorization: `Bearer ${token}` } });
				const json = await res.json();
				setData(json);
			} finally { setLoading(false); }
		})();
	}, [router]);

	if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold mb-2">Affiliate Dashboard</h1>
			<p className="text-sm text-gray-500 mb-6">Welcome, {data?.affiliate?.name || data?.affiliate?.email}</p>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="rounded-lg border p-4">
					<div className="text-sm text-gray-500">Total Referrals</div>
					<div className="text-2xl font-bold">{data?.stats?.totalReferrals || 0}</div>
				</div>
				<div className="rounded-lg border p-4">
					<div className="text-sm text-gray-500">Active Referrals</div>
					<div className="text-2xl font-bold">{data?.stats?.activeReferrals || 0}</div>
				</div>
				<div className="rounded-lg border p-4">
					<div className="text-sm text-gray-500">Total Earnings</div>
					<div className="text-2xl font-bold">${(data?.stats?.totalEarnings || 0).toLocaleString()}</div>
				</div>
			</div>
		</div>
	);
}
