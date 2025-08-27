export default function Card({ title, children, footer, className = '' }) {
  return (
    <div className={`bg-[#151a2e] border border-[#262b40] rounded-xl ${className}`}>
      {title && <div className="px-4 py-3 border-b border-[#262b40] text-gray-300 font-semibold">{title}</div>}
      <div className="p-4">{children}</div>
      {footer && <div className="px-4 py-3 border-t border-[#262b40]">{footer}</div>}
    </div>
  );
}
