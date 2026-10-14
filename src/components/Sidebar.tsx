import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Zap,
  RotateCcw,
  ShieldCheck,
  FileCheck2,
  Database
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { id: '', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'files', label: 'File Explorer', icon: FolderTree },
    { id: 'backup', label: 'Backup Hub', icon: Zap },
    { id: 'restore', label: 'Restore Center', icon: RotateCcw },
    { id: 'integrity', label: 'Merkle Integrity', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Trail', icon: FileCheck2 },
  ];

  return (
    <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen overflow-y-auto">
      <div className="p-5 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-500 font-bold">D</div>
        <div>
          <h1 className="font-bold text-slate-900 dark:text-white tracking-tight">Team D Console</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">APNILEAP Backup</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) => `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
        <Database className="w-4 h-4 mx-auto mb-1 opacity-50" />
        <p>Connected to Team C Master Catalog</p>
      </div>
    </div>
  );
};
