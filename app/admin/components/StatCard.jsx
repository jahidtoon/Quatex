export default function StatCard({ label, value, hint }) {
  return (
    <div className="bg-[#151a2e] border border-[#262b40] rounded-xl p-5">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-2">{hint}</div>}
    </div>
  );
}
