import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  FileMaster,
  BackupRequest,
  RestoreRequest,
  DashboardMetrics,
  WorkerQueueItem,
  LockState,
  LiveStreamEvent,
  AuditLog,
  UserSession,
} from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { FileExplorerView } from './components/FileExplorerView';
import { BackupHubView } from './components/BackupHubView';
import { RestoreCenterView } from './components/RestoreCenterView';
import { IntegrityView } from './components/IntegrityView';
import { AuditView } from './components/AuditView';
import { SettingsModal } from './components/SettingsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Database, Loader2, AlertTriangle, Settings, CheckCircle, WifiOff, Zap, Server } from 'lucide-react';

// ─── Login & Auto-Registration Screen ─────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (session: UserSession) => void }) {
  const [email, setEmail] = useState(localStorage.getItem('apnileap_teamd_last_email') || 'ayush@gmail.com');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(true);
  const [teamCUrl, setTeamCUrl] = useState(api.getConfig().teamCUrl || '');
  const [teamAUrl, setTeamAUrl] = useState(api.getConfig().teamAUrl || '');
  const [teamBUrl, setTeamBUrl] = useState(api.getConfig().teamBUrl || '');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [theme] = useState(() => (localStorage.getItem('theme') === 'light' ? 'light' : 'dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleTestConnection = async () => {
    if (!teamCUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter Team C URL first' });
      return;
    }
    setTestResult(null);
    const res = await api.pingEndpoint(teamCUrl.trim());
    setTestResult({ success: res.success, message: res.message });
  };

  const handleSaveEndpoints = () => {
    api.updateConfig({
      teamCUrl: teamCUrl.trim(),
      teamAUrl: teamAUrl.trim(),
      teamBUrl: teamBUrl.trim(),
      useLiveBackend: true,
    });
    setTestResult({ success: true, message: 'Endpoints saved!' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your institutional email address.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Save URLs if modified
      api.updateConfig({
        teamCUrl: teamCUrl.trim(),
        teamAUrl: teamAUrl.trim(),
        teamBUrl: teamBUrl.trim(),
        useLiveBackend: true,
      });

      // Register or lookup user in Team C DB (Requirement #2 & #3)
      const session = await api.resolveTeamCUser(email.trim(), displayName.trim() || undefined);
      localStorage.setItem('apnileap_teamd_last_email', email.trim().toLowerCase());
      onLogin(session);
    } catch (err: any) {
      setError(err.message || 'Registration/Login failed. Check your Team C Render URL or continue offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueOffline = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const session = api.startGuestSession(email.trim());
      onLogin(session);
    } catch (err: any) {
      setError(err.message || 'Offline access failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5"
      >
        {/* Header Logo */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">APNILEAP · Team D</p>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Backup & Restore System</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Microservices Config"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">User Registration & Access</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Automatically registers your user into Team C Database (<code>POST /api/v1/users</code>) or loads your existing dashboard.
          </p>
        </div>

        {/* Backend Configuration Box */}
        {showConfig && (
          <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/30 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                Render Microservices Endpoints
              </label>
              {testResult && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
                    testResult.success
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950'
                      : 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950'
                  }`}
                >
                  {testResult.success ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {testResult.message}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Team C Render URL (Primary DBMS & Orchestrator):</span>
              <input
                type="text"
                value={teamCUrl}
                onChange={(e) => {
                  setTeamCUrl(e.target.value);
                  setTestResult(null);
                }}
                placeholder="https://team-c.onrender.com"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-600 dark:text-slate-400">Team A (Scheduler):</span>
                <input
                  type="text"
                  value={teamAUrl}
                  onChange={(e) => setTeamAUrl(e.target.value)}
                  placeholder="https://team-a.onrender.com"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-600 dark:text-slate-400">Team B (Dedup):</span>
                <input
                  type="text"
                  value={teamBUrl}
                  onChange={(e) => setTeamBUrl(e.target.value)}
                  placeholder="https://team-b.onrender.com"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
              >
                Ping Team C
              </button>
              <button
                type="button"
                onClick={handleSaveEndpoints}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition"
              >
                Save URLs
              </button>
            </div>
          </div>
        )}

        {/* User Registration Form */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Institutional Email
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="ayush@gmail.com"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ayush"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
            />
          </div>
        </div>

        {error && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                  If your Render backend is waking up, please wait ~30 seconds and retry, or use offline mode.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleContinueOffline}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              <WifiOff className="w-3.5 h-3.5" /> Continue in Local/Offline Mode
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-60 px-4 py-3 font-bold text-sm text-white transition shadow-lg shadow-sky-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Connecting & Registering with Team C…
              </>
            ) : (
              'Enter Dashboard (Connect & Register)'
            )}
          </button>

          <button
            type="button"
            onClick={handleContinueOffline}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 font-medium text-xs text-slate-800 dark:text-slate-200 transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Instant Access / Demo Mode</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main App Layout (Authenticated) ─────────────────────────────────────────
function AppLayout({ session, onSignOut }: { session: UserSession; onSignOut: () => void }) {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState(api.getConfig());
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataError, setDataError] = useState('');

  // Cross-page navigation state
  const [targetBackupFile, setTargetBackupFile] = useState<FileMaster | undefined>();
  const [targetRestoreFileId, setTargetRestoreFileId] = useState<string>();
  const [targetRestoreBackupId, setTargetRestoreBackupId] = useState<string>();

  // Core Data States
  const [files, setFiles] = useState<FileMaster[]>([]);
  const [backups, setBackups] = useState<BackupRequest[]>([]);
  const [restores, setRestores] = useState<RestoreRequest[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_files_backed_up: 0,
    total_raw_storage_gb: 0,
    total_deduped_storage_gb: 0,
    global_savings_ratio: 0.68,
    active_jobs_count: 0,
    queue_depth: 0,
    workers_utilized: 1,
    total_workers: 4,
    merkle_verification_rate: 1.0,
    rpo_minutes: 5,
    rto_minutes: 15,
    avg_decision_latency_ms: 38,
    avg_dedup_latency_ms: 95,
  });
  const [queue, setQueue] = useState<WorkerQueueItem[]>([]);
  const [locks, setLocks] = useState<LockState[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [streamEvents, setStreamEvents] = useState<LiveStreamEvent[]>([]);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [fData, bData, rData, mData, qData, lData, aData] = await Promise.all([
        api.getFiles(),
        api.getBackups(),
        api.getRestores(),
        api.getMetrics(),
        api.getQueue(),
        api.getLocks(),
        api.getAuditLogs(),
      ]);
      setFiles(fData.data || []);
      setBackups(bData || []);
      setRestores(rData || []);
      setMetrics(mData);
      setQueue(qData || []);
      setLocks(lData || []);
      setAuditLogs(aData || []);
      setStreamEvents(api.getStreamEvents() || []);
      setLastUpdated(new Date().toLocaleTimeString());
      setDataError('');
    } catch (err) {
      console.error('Failed to load data:', err);
      setDataError(err instanceof Error ? err.message : 'Could not refresh data.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleInitiateBackupFromFile = (file: FileMaster) => {
    setTargetBackupFile(file);
    navigate('/backup');
  };

  const handleInitiateRestoreFromFile = (file: FileMaster) => {
    setTargetRestoreFileId(file.file_id);
    navigate('/restore');
  };

  const handleInitiateRestoreFromBackup = (fileId: string, backupId: string) => {
    setTargetRestoreFileId(fileId);
    setTargetRestoreBackupId(backupId);
    navigate('/restore');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          currentUser={session}
          onSignOut={onSignOut}
          onOpenSettings={() => setIsSettingsOpen(true)}
          config={config}
          lastUpdated={lastUpdated}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {dataError && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              <span>⚠ {dataError}</span>
              <button onClick={loadData} className="font-semibold underline ml-4">
                Retry
              </button>
            </div>
          )}
          <Routes>
            <Route
              path="/"
              element={
                <DashboardView
                  metrics={metrics}
                  queue={queue}
                  locks={locks}
                  streamEvents={streamEvents}
                  userRole={session.role}
                  onNavigate={(tab) => navigate(`/${tab === 'dashboard' ? '' : tab}`)}
                  onRefresh={loadData}
                  isRefreshing={isRefreshing}
                />
              }
            />
            <Route
              path="/files"
              element={
                <FileExplorerView
                  files={files}
                  userRole={session.role}
                  onInitiateBackup={handleInitiateBackupFromFile}
                  onInitiateRestore={handleInitiateRestoreFromFile}
                  onRefresh={loadData}
                />
              }
            />
            <Route
              path="/backup"
              element={
                <BackupHubView
                  files={files}
                  backups={backups}
                  userRole={session.role}
                  initialSelectedFile={targetBackupFile}
                  onRefresh={loadData}
                  onInitiateRestore={handleInitiateRestoreFromBackup}
                />
              }
            />
            <Route
              path="/restore"
              element={
                <RestoreCenterView
                  files={files}
                  backups={backups}
                  restores={restores}
                  initialFileId={targetRestoreFileId}
                  initialBackupId={targetRestoreBackupId}
                  onRefresh={loadData}
                />
              }
            />
            <Route path="/integrity" element={<IntegrityView files={files} />} />
            <Route path="/audit" element={<AuditView logs={auditLogs} userRole={session.role} onRefresh={loadData} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={() => {
          setConfig(api.getConfig());
          loadData();
        }}
      />
    </div>
  );
}

// ─── Root: Handles Session Boot & Auto-Registration ───────────────────────────
function AppRoot() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [booting, setBooting] = useState(true);

  // On first load, restore existing session or auto-register if configured
  useEffect(() => {
    async function boot() {
      try {
        const saved = await api.restoreSession();
        if (saved) {
          setSession(saved);
        } else {
          // If Team C URL is configured, auto-register default/remembered user
          const cfg = api.getConfig();
          const lastEmail = localStorage.getItem('apnileap_teamd_last_email');
          if (cfg.teamCUrl && cfg.useLiveBackend && lastEmail) {
            try {
              const autoSession = await api.resolveTeamCUser(lastEmail);
              setSession(autoSession);
            } catch (err) {
              console.warn('Initial auto-registration skipped:', err);
            }
          }
        }
      } catch (err) {
        console.warn('Boot error:', err);
      } finally {
        setBooting(false);
      }
    }
    boot();
  }, []);

  const handleSignOut = async () => {
    await api.endSession().catch(() => {});
    setSession(null);
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Connecting to APNILEAP Smart Backup Engine…</p>
      </div>
    );
  }

  if (!session) return <LoginScreen onLogin={setSession} />;

  return (
    <BrowserRouter>
      <AppLayout session={session} onSignOut={handleSignOut} />
    </BrowserRouter>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AppRoot />
    </ErrorBoundary>
  );
}

export default App;
