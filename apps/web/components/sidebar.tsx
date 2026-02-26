'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  ['Dashboard', '/dashboard'],
  ['Employees', '/employees'],
  ['Sites', '/sites'],
  ['Clocking', '/clocking'],
  ['Payroll', '/payroll'],
  ['Invoices', '/accounting/invoices'],
  ['Expenses', '/accounting/expenses'],
  ['Ledger', '/accounting/ledger'],
  ['Reports', '/reports'],
  ['Settings', '/settings']
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full md:w-60 border-r border-slate-200 bg-white">
      <div className="p-4 font-bold text-xl">Shiftly OS</div>
      <nav className="space-y-1 px-2 pb-4">
        {nav.map(([label, href]) => (
          <Link key={href} href={href} className={`block rounded-lg px-3 py-2 text-sm ${pathname.startsWith(href) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100'}`}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
