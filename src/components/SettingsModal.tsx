import React, { useState } from 'react';
import { EndpointConfig } from '../types';
import { api } from '../services/api';
import { X, CheckCircle, AlertTriangle, RefreshCw, Server, Shield, Database } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const currentConfig = api.getConfig();
  const [config, setConfig] = useState<EndpointConfig>(currentConfig);
  const [testing, setTesting] = useState(false);
  const [pingResults, setPingResults] = useState<{
    teamC?: { success: boolean; latency: number; message: string };
    teamA?: { success: boolean; latency: number; message: string };
    teamB?: { success: boolean; latency: number; message: string };
  }>({});

  if (!isOpen) return null;

  const handleSave = () => {
    api.updateConfig(config);
    onConfigSaved();
    onClose();
  };

  const handleTestConnections = async () => {
    setTesting(true);
    const results: any = {};
    if (config.teamCUrl) {
      results.teamC = await api.pingEndpoint(config.teamCUrl);
    }
    if (config.teamAUrl) {
      results.teamA = await api.pingEndpoint(config.teamAUrl);
    }
    if (config.teamBUrl) {
      results.teamB = await api.pingEndpoint(config.teamBUrl);
    }
    setPingResults(results);
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cross-Team Integration Settings</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Configure live deployed endpoints for Team C, Team A, and Team B (Render / Ngrok)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Mode Switcher */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Live Microservices Mode</span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    config.useLiveBackend
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {config.useLiveBackend ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                When enabled, actual HTTP requests are dispatched to Team C (DB), Team A (Scheduler), and Team B (Dedup/Merkle).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.useLiveBackend}
                onChange={(e) => setConfig({ ...config, useLiveBackend: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* Team C Config (Primary Orchestrator & DBMS) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-sky-400" />
                Team C Render URL (Authoritative DB & Metadata)
                <span className="text-amber-400 text-[10px] font-normal lowercase">(Primary Backend)</span>
              </label>
              {pingResults.teamC && (
                <span
                  className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                    pingResults.teamC.success
                      ? 'text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10'
                      : 'text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {pingResults.teamC.success ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {pingResults.teamC.message}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="https://team-c-service.onrender.com"
              value={config.teamCUrl}
              onChange={(e) => setConfig({ ...config, teamCUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-500"
            />
            <p className="text-[11px] text-slate-500">
              Exposes: POST /api/v1/users, GET/POST /api/v1/files, POST /api/v1/backups, POST /api/v1/restores, GET /api/v1/audit
            </p>
          </div>

          {/* Team A Config */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                Team A Render URL (Job Scheduler & Exclusive Locks)
              </label>
              {pingResults.teamA && (
                <span
                  className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                    pingResults.teamA.success
                      ? 'text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10'
                      : 'text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {pingResults.teamA.success ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {pingResults.teamA.message}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="https://team-a-scheduler.onrender.com"
              value={config.teamAUrl}
              onChange={(e) => setConfig({ ...config, teamAUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-500"
            />
            <p className="text-[11px] text-slate-500">
              Exposes: POST /api/v1/backup/jobs, GET /api/v1/workers/{'{workerId}'}/queue, GET /api/v1/metrics/backup
            </p>
          </div>

          {/* Team B Config */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Team B Render URL (Deduplication & Merkle Tree Integrity)
              </label>
              {pingResults.teamB && (
                <span
                  className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                    pingResults.teamB.success
                      ? 'text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10'
                      : 'text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {pingResults.teamB.success ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {pingResults.teamB.message}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="https://team-b-dedup.onrender.com"
              value={config.teamBUrl}
              onChange={(e) => setConfig({ ...config, teamBUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-500"
            />
            <p className="text-[11px] text-slate-500">
              Exposes: POST /api/v1/dedup/compute, POST /api/v1/integrity/verify, GET /api/v1/chunks/index
            </p>
          </div>

          {/* Institutional Bearer Token */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Authorization Bearer Token (Optional)
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={config.authToken}
              onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm font-mono text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-500">Sent in request headers: Authorization: Bearer &lt;token&gt;</p>
          </div>

          {/* Test Action */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleTestConnections}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-900 dark:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin text-sky-400' : ''}`} />
              Test All Endpoints
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/80">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Render instances may take ~30s on cold start.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
