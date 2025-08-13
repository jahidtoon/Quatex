export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f1320] text-white flex">
      <aside className="w-64 bg-[#151a2e] border-r border-[#262b40] p-4">
        <div className="text-xl font-bold mb-6">Admin Panel</div>
        {/* Sidebar injected via component for reuse */}
        <nav>
          <a className="block py-2 px-3 rounded hover:bg-[#1d2440]" href="/admin">Dashboard</a>
          <a className="block py-2 px-3 rounded hover:bg-[#1d2440]" href="/admin/currency-pairs">Currency Pairs</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
