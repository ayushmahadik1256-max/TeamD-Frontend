import React from 'react';
import {
  DashboardMetrics,
  WorkerQueueItem,
  LockState,
  LiveStreamEvent,
  UserRole,
} from '../types';
import {
  Database,
  HardDrive,
  Cpu,
  ShieldCheck,
  Clock,
  Activity,
  Layers,
  Zap,
  Lock,
  ArrowUpRight,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCw,
} from 'lucide-react';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  queue: WorkerQueueItem[];
  locks: LockState[];
  streamEvents: LiveStreamEvent[];
  userRole: UserRole;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  queue,
  locks,
  streamEvents,
  userRole,
  onNavigate,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-72 h-72 rounded-full bg-sky-100 dark:bg-sky-500/10 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Operating System & DBMS Integration Telemetry
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              APNILEAP Backup Control & Restore Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Coordinated Saga across Team D (UI/BFF), Team C (DBMS Metadata Orchestrator), Team A (Job Scheduler), and Team B (Deduplication Engine).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metrics, null, 2));
                const node = document.createElement('a');
                node.setAttribute("href", dataStr);
                node.setAttribute("download", "storage_utilization_report.json");
                document.body.appendChild(node);
                node.click();
                node.remove();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
              title="Download Storage Utilization Report"
            >
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              Export Report
            </button>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              Refresh Telemetry
            </button>
            <button
              onClick={() => onNavigate('backup')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              New Backup Workflow
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Storage Dedup Ratio */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-300 dark:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Dedup Savings Ratio</span>
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-500/10 text-sky-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {(metrics.global_savings_ratio * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">Storage Reduction</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Raw: {metrics.total_raw_storage_gb} GB</span>
            <span className="text-sky-300 font-medium">Deduped: {metrics.total_deduped_storage_gb} GB</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.global_savings_ratio * 100}%` }}
            ></div>
          </div>
        </div>

        {/* RPO / RTO Acceptance KPIs */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-300 dark:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">RPO & RTO SLA</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.rpo_minutes}m</span>
            <span className="text-xs text-emerald-400 font-medium">RPO (Target ≤ 5m)</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>RTO: {metrics.rto_minutes}m (Target ≤ 30m)</span>
            <span className="text-emerald-400 font-medium">SLA Met (100%)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[85%]"></div>
          </div>
        </div>

        {/* Scheduler Performance (Team A) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-300 dark:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Scheduler Decision (Team A)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.avg_decision_latency_ms} ms</span>
            <span className="text-xs text-purple-400 font-medium">p95 Latency</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Target: p95 ≤ 200 ms</span>
            <span className="text-emerald-400 font-medium">PASS</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full w-[34%]"></div>
          </div>
        </div>

        {/* Merkle Integrity Rate (Team B) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-300 dark:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Merkle Tree Integrity</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">100%</span>
            <span className="text-xs text-emerald-400 font-medium">0 Corruptions</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Verified Files: {metrics.total_files_backed_up}</span>
            <button
              onClick={() => onNavigate('integrity')}
              className="text-amber-400 hover:underline font-medium text-[11px]"
            >
              Inspect Proofs &rarr;
            </button>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-full"></div>
          </div>
        </div>
      </div>

      {/* Middle Section: Live Queue (Team A) & Resource Locks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team A Scheduler Queue */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Team A: Job Scheduler & Worker Pool</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">Pluggable policies (FCFS, SJF, Round Robin, Priority Queue)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium">
                Workers: {metrics.workers_utilized} / {metrics.total_workers} Active
              </span>
            </div>
          </div>

          {/* Queue items */}
          <div className="space-y-2.5">
            {queue.map((job) => (
              <div
                key={job.job_id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${job.state === 'RUNNING' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{job.file_name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {job.job_id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex flex-wrap gap-x-3">
                      <span>Priority: <strong className="text-sky-300">{job.priority}</strong></span>
                      <span>Policy: <strong className="text-slate-800 dark:text-slate-200">{job.policy}</strong></span>
                      {job.assigned_worker && (
                        <span>Worker: <strong className="text-indigo-300">{job.assigned_worker}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      job.state === 'RUNNING'
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-100 dark:bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {job.state}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">
                      Est. wait: {job.estimated_wait_sec}s
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Exclusive File Locks Table */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Active Concurrency Leases & Exclusive Locks (Section A3)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">0 Deadlocks Detected</span>
            </div>
            <div className="space-y-2">
              {locks.map((lock) => (
                <div key={lock.lock_id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                      {lock.lock_mode}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{lock.file_name}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    Expires: {new Date(lock.lease_expiry).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time SSE / Outbox Feed */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Live Outbox Stream</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">SSE / WebSocket (/api/v1/ui/stream)</p>
              </div>
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1 flex-1">
            {streamEvents.map((evt) => (
              <div
                key={evt.event_id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1 hover:border-slate-300 dark:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sky-400">{evt.type}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-medium">{evt.message}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono pt-1">
                  <span>{evt.entity}</span>
                  <span className="truncate max-w-[120px] text-slate-500 dark:text-slate-500" title={evt.correlation_id}>
                    corr: {evt.correlation_id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
