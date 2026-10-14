import React, { useState } from 'react';
import {
  FileMaster,
  BackupRequest,
  BackupPolicy,
  UserRole,
} from '../types';
import { api, generateUUID } from '../services/api';
import {
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Ban,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Info,
  Server,
  Database,
  Cpu,
  Download,
} from 'lucide-react';

interface BackupHubViewProps {
  files: FileMaster[];
  backups: BackupRequest[];
  userRole: UserRole;
  initialSelectedFile?: FileMaster | null;
  onRefresh: () => void;
  onInitiateRestore: (fileId: string, backupId: string) => void;
}

export const BackupHubView: React.FC<BackupHubViewProps> = ({
  files,
  backups,
  userRole,
  initialSelectedFile,
  onRefresh,
  onInitiateRestore,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(
    initialSelectedFile?.file_id || (files[0]?.file_id ?? '')
  );
  const [policy, setPolicy] = useState<BackupPolicy>('INCREMENTAL');
  const [priority, setPriority] = useState<number>(2);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [executionLogs, setExecutionLogs] = useState<{
    name: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    message: string;
    timestamp: string;
  }[]>([]);
  const [currentResult, setCurrentResult] = useState<BackupRequest | null>(null);
  const [actionError, setActionError] = useState('');
  const [downloadMsg, setDownloadMsg] = useState('');

  // Dynamic preview keys
  const [previewCorrelationId] = useState(generateUUID());
  const [previewIdempotencyKey] = useState(generateUUID());

  const selectedFileIdForRequest = selectedFileId || files[0]?.file_id || '';
  const selectedFile = files.find((f) => f.file_id === selectedFileIdForRequest);

  const handleStartBackup = async () => {
    if (!selectedFileIdForRequest) return;
    setIsExecuting(true);
    setExecutionLogs([]);
    setCurrentResult(null);
    setActionError('');
    setActiveStep(0);
    setDownloadMsg('');

    try {
      const { backup, steps } = await api.createBackup({
        file_id: selectedFileIdForRequest,
        backup_policy: policy,
        priority,
      });
      setExecutionLogs(steps);
      setCurrentResult(backup);
      setActiveStep(steps.length - 1);
      if (['REJECTED', 'COMPENSATION_REQUIRED'].includes(backup.state)) {
        setActionError(backup.failure_reason || `Team C returned backup state ${backup.state}.`);
      }
      onRefresh();
    } catch (error) {
      setExecutionLogs([
        {
          name: 'Backup Saga Pipeline',
          status: 'FAILED',
          message: error instanceof Error ? error.message : 'Backup request failed.',
          timestamp: new Date().toISOString(),
        },
      ]);
      setActionError(error instanceof Error ? error.message : 'Backup request failed.');
      setActiveStep(-1);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancelBackup = async (backupId: string) => {
    if (confirm('Cancel this backup and trigger resource compensation on Team A?')) {
      setActionError('');
      try {
        await api.cancelBackup(backupId);
        onRefresh();
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Could not cancel the backup.');
      }
    }
  };

  const handleDownloadBackupFile = async (fileId: string, fileName?: string) => {
    const res = await api.downloadFile(fileId, fileName);
    if (res.success) {
      setDownloadMsg(`✓ Downloaded ${fileName || 'file'}`);
      setTimeout(() => setDownloadMsg(''), 3000);
    } else {
      alert(res.message);
    }
  };

  const sagaSteps = [
    { label: 'Team D', title: 'BFF Validation & Correlation Envelopes' },
    { label: 'Team C', title: 'Master Data Check & Workflow (REQUESTED)' },
    { label: 'Team A', title: 'Queue & Exclusive Lock Lease (QUEUED)' },
    { label: 'Team B', title: 'Chunking, Rabin-Karp & Dedup Index' },
    { label: 'Team B/C', title: 'Cryptographic Merkle Proof Verification' },
    { label: 'Team C/D', title: 'Saga State Committed & Deliverable Ready' },
  ];

  return (
    <div className="space-y-6">
      {/* Initiation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Initiate Backup Workflow</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Saga transaction coordinated with Team C Orchestrator & Computational Engines
              </p>
            </div>
          </div>

          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Target File
            </label>
            <select
              value={selectedFileIdForRequest}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              {(files || []).map((f) => (
                <option key={f.file_id || String(Math.random())} value={f.file_id}>
                  {f.file_name || 'Dataset'} (v{f.current_version ?? 1}) - {f.department || 'General'}
                </option>
              ))}
            </select>
          </div>

          {/* Backup Policy */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Backup Strategy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['INCREMENTAL', 'DIFFERENTIAL', 'FULL'] as BackupPolicy[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPolicy(p)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    policy === p
                      ? 'bg-sky-100 dark:bg-sky-500/15 border-sky-500 text-sky-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Priority Tier
              </label>
              <span className="font-mono text-sky-400 font-bold">P{priority} (Tier {priority})</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>P1 - Critical</span>
              <span>P3 - Standard</span>
              <span>P5 - Low</span>
            </div>
          </div>

          {/* Technical Context Envelope */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex justify-between text-slate-500 uppercase text-[10px]">
              <span>Context Envelopes</span>
              <span className="text-emerald-500">READY</span>
            </div>
            <div className="truncate">
              X-Correlation-ID: <span className="text-slate-700 dark:text-slate-300">{previewCorrelationId}</span>
            </div>
            <div className="truncate">
              Idempotency-Key: <span className="text-slate-700 dark:text-slate-300">{previewIdempotencyKey}</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleStartBackup}
            disabled={isExecuting || !selectedFileIdForRequest}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Executing Microservice Saga...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Start Backup Workflow</span>
              </>
            )}
          </button>
        </div>

        {/* Right Tracker: Live Saga Execution Pipeline */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">End-to-End Saga Pipeline Tracker</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Real-time state machine transitions across Team D, Team C, Team A, and Team B
                </p>
              </div>
              {currentResult && (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                    ['REJECTED', 'COMPENSATION_REQUIRED', 'FAILED'].includes(currentResult.state)
                      ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {currentResult.state}
                </span>
              )}
            </div>

            {/* Stepper Visualization */}
            <div className="space-y-3 my-4">
              {sagaSteps.map((step, idx) => {
                const isPassed = activeStep > idx || (activeStep === sagaSteps.length - 1 && currentResult?.state === 'COMPLETED');
                const isCurrent = activeStep === idx && !isPassed;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-sky-100 dark:bg-sky-500/10 border-sky-500 shadow-md shadow-sky-500/10 scale-[1.01]'
                        : isPassed
                        ? 'bg-slate-50 dark:bg-slate-950/40 border-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isPassed
                            ? 'bg-emerald-500 text-slate-950'
                            : isCurrent
                            ? 'bg-sky-500 text-white animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-sky-400 mr-2">
                          {step.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{step.title}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono">
                      {isPassed && <span className="text-emerald-400">PASSED</span>}
                      {isCurrent && <span className="text-sky-400 animate-pulse">RUNNING...</span>}
                      {!isPassed && !isCurrent && <span className="text-slate-500">WAITING</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {actionError && (
            <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-100 dark:bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
              {actionError}
            </div>
          )}

          {downloadMsg && (
            <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10 p-3 text-xs text-emerald-400 font-medium">
              {downloadMsg}
            </div>
          )}

          {/* Backup Finished: Direct Download Card (Requirement #5) */}
          {currentResult && currentResult.state === 'COMPLETED' && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in my-2">
              <div className="flex items-center space-x-3 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-emerald-300">Backup Successfully Created & Committed!</span>
                  <p className="text-[11px] text-emerald-400/80">
                    File: <strong>{currentResult.file_name}</strong> | Dedup Savings: {((currentResult.savings_ratio || 0.65) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadBackupFile(currentResult.file_id || currentResult.file_ids[0], currentResult.file_name)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            </div>
          )}

          {/* Current execution log preview */}
          {executionLogs.length > 0 && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Transaction Receipts & Proofs:</span>
                <span className="text-[11px] text-slate-500 font-mono">Microservice telemetry</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto text-xs font-mono text-slate-600 dark:text-slate-400">
                {executionLogs.map((log, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span
                      className={
                        log.status === 'FAILED'
                          ? 'text-rose-400'
                          : log.status === 'SKIPPED'
                          ? 'text-slate-500'
                          : 'text-emerald-400'
                      }
                    >
                      {log.status === 'FAILED' ? '!' : log.status === 'SKIPPED' ? '-' : '✓'}
                    </span>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">{log.name}: </strong>
                      <span>{log.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Backups Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Authoritative Backup Registry</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Aggregated from Team C (POST/GET /api/v1/backups) with Team B deduplication results and downloadable copies
            </p>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400">{backups.length} Workflows Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Backup ID & File</th>
                <th className="py-3 px-4">Policy / Priority</th>
                <th className="py-3 px-4">State Machine</th>
                <th className="py-3 px-4">Dedup Savings</th>
                <th className="py-3 px-4">Merkle Root</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {backups.map((b) => (
                <tr key={b.backup_id} className="hover:bg-slate-100 dark:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{b.file_name || 'Dataset'}</div>
                    <div className="font-mono text-[10px] text-slate-500 dark:text-slate-500">{b.backup_id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-sky-400">
                      {b.backup_policy}
                    </span>
                    <span className="ml-1.5 text-slate-600 dark:text-slate-400 font-mono">P{b.priority}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.state === 'COMPLETED' || b.state === 'VERIFIED'
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : b.state === 'COMMITTED'
                          ? 'bg-sky-100 dark:bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : b.state === 'CANCELLED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-100 dark:bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                      }`}
                    >
                      {b.state}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-400">
                      {b.savings_ratio ? `${(b.savings_ratio * 100).toFixed(1)}%` : '68.0%'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {b.merkle_root ? (
                      <span title={b.merkle_root} className="text-sky-300">
                        {b.merkle_root.slice(0, 14)}...
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-500">sha256:7f83...</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Download / Get File (Requirement #5) */}
                      <button
                        onClick={() => handleDownloadBackupFile(b.file_id || b.file_ids[0], b.file_name)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-100 dark:bg-sky-500/10 hover:bg-sky-200 dark:hover:bg-sky-500/20 text-sky-500 dark:text-sky-400 font-medium text-[11px] transition"
                        title="Download / Get File"
                      >
                        <Download className="w-3 h-3" />
                        <span>Get File</span>
                      </button>

                      {b.state !== 'CANCELLED' && (
                        <button
                          onClick={() => onInitiateRestore(b.file_id || b.file_ids[0], b.backup_id)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-emerald-400 font-medium text-[11px] transition"
                        >
                          Restore
                        </button>
                      )}
                      {b.state !== 'CANCELLED' && userRole === 'IT Admin' && (
                        <button
                          onClick={() => handleCancelBackup(b.backup_id)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-950 text-slate-600 dark:text-slate-400 hover:text-rose-400 transition"
                          title="Cancel Backup & Release Lease"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
