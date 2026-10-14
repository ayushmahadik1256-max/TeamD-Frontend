import React, { useEffect, useState } from 'react';
import { EndpointConfig, UserSession } from '../types';
import { Settings, Moon, Sun, LogOut, User, Radio } from 'lucide-react';

interface HeaderProps {
  currentUser: UserSession;
  onSignOut: () => void;
  onOpenSettings: () => void;
  config: EndpointConfig;
  lastUpdated: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSignOut,
  onOpenSettings,
  config,
  lastUpdated,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Live status */}
        <div className="hidden md:flex items-center space-x-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-600 dark:text-slate-400">Stream: <strong className="text-emerald-600 dark:text-emerald-400">ACTIVE</strong></span>
            <span className="text-slate-400 dark:text-slate-600 ml-1">({lastUpdated})</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-mono">
            <Radio className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Backend:</span>
            {config.teamCUrl ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">LIVE</span>
            ) : (
              <span className="font-bold text-amber-500">OFFLINE</span>
            )}
          </div>
        </div>

        {/* Right: User info + actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <User className="w-3.5 h-3.5 text-sky-500" />
            <div className="text-xs">
              <p className="font-semibold text-slate-900 dark:text-white leading-none">{currentUser.name}</p>
              <p className="text-slate-500 dark:text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
            </div>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              {currentUser.role}
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Configure Team C / A / B API Endpoints"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Sign out */}
          <button
            onClick={onSignOut}
            title="Sign out"
            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
