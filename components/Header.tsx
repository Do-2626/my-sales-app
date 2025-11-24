'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSync } from '@/hooks/useSync';
import { FiHome, FiDollarSign, FiBox, FiSettings, FiRefreshCw } from 'react-icons/fi';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/dashboard/sales', label: 'Sales', icon: FiDollarSign },
  { href: '/dashboard/products', label: 'Products', icon: FiBox },
  { href: '/dashboard/settings', label: 'Settings', icon: FiSettings },
];

export default function Header() {
  const pathname = usePathname();
  const { isSyncing, lastSync, triggerSync, error } = useSync();

  const NavLink = ({ href, label, icon: Icon }: typeof navLinks[0]) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <header className="bg-slate-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold">Sales App</h1>
        <nav className="flex items-center gap-2">
          {navLinks.map(link => <NavLink key={link.href} {...link} />)}
        </nav>
      </div>
      <div className="flex items-center gap-4">
         <div className="text-xs text-slate-400">
          {lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}`: 'Not synced yet'}
          {error && <p className='text-red-400'>Sync Error!</p>}
         </div>
        <button
          onClick={triggerSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-500 rounded-md transition-colors"
        >
          <FiRefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
    </header>
  );
}