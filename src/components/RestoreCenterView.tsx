import React, { useState } from 'react';
import {
  FileMaster,
  BackupRequest,
  RestoreRequest,
  FileVersion,
} from '../types';
import { api } from '../services/api';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FolderInput,
  FolderCheck,
  Clock,
  ArrowRight,
  Database,
  FileCheck,
  Download,
} from 'lucide-react';

interface RestoreCenterViewProps {
  files: FileMaster[];
  backups: BackupRequest[];
  restores: RestoreRequest[];
  initialFileId?: string;
  initialBackupId?: string;
  onRefresh: () => void;
}

export const RestoreCenterView: React.FC<RestoreCenterViewProps> = ({
  files,
  backups,
  restores,
  initialFileId,
  initialBackupId,
  onRefresh,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(
    initialFileId || (files[0]?.file_id ?? '')
  );
  const selectedFile = files.find((f) => f.file_id === selectedFileId) || files[0];
  const activeFileId = selectedFileId || selectedFile?.file_id || '';

  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    selectedFile?.versions?.[0]?.version_id || ''
  );
  const activeVersionId = selectedVersionId || selectedFile?.versions?.[0]?.version_id || '';
  const defaultName = selectedFile?.file_name ? selectedFile.file_name.replace(/\.[^/.]+$/, '') : 'dataset';
  const defaultExt = selectedFile?.file_name?.includes('.') ? `.${selectedFile.file_name.split('.').pop()}` : '.parquet';

  const [targetPath, setTargetPath] = useState<string>(
    `/campus/recovery/sandboxes/${defaultName}_restored${defaultExt}`
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const [preCheckPassed, setPreCheckPassed] = useState<boolean | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<RestoreRequest | null>(null);
  const [actionError, setActionError] = useState('');
  const [downloadMsg, setDownloadMsg] = useState('');

  const handleFileChange = (newFileId: string) => {
    setSelectedFileId(newFileId);
    const file = files.find((f) => f.file_id === newFileId);
    if (file) {
      setSelectedVersionId(file.versions?.[0]?.version_id || '');
      const baseName = file.file_name ? file.file_name.replace(/\.[^/.]+$/, '') : 'dataset';
      const ext = file.file_name?.includes('.') ? `.${file.file_name.split('.').pop()}` : '.parquet';
      setTargetPath(`/campus/recovery/sandboxes/${baseName}_restored${ext}`);
      setPreCheckPassed(null);
      setRestoreSuccess(null);
      setDownloadMsg('');
    }
  };

  const handleVerifyBeforeRestore = async () => {
    if (!activeFileId) return;
    const res = await api.verifyIntegrityPreview(activeFileId, false);
    setPreCheckPassed(res.status === 'VALID');
  };

  const handleExecuteRestore = async () => {
    if (!activeFileId) return;
    setIsRestoring(true);
    setActionError('');
    setRestoreSuccess(null);
    setDownloadMsg('');

    try {
      const relatedBackup = backups.find(
        (b) => b.file_id === activeFileId && b.state !== 'FAILED' && b.state !== 'CANCELLED'
      );
      const backupIdToUse = initialBackupId || relatedBackup?.backup_id || 'backup-default';

      const result = await api.createRestore({
        backup_id: backupIdToUse,
        file_id: activeFileId,
        version_id: activeVersionId,
        target_path: targetPath,
      });
      setRestoreSuccess(result);
      onRefresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Restore request failed.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDownloadRestored = async (fileId: string, fileName?: string) => {
    const ext = fileName?.includes('.') ? `.${fileName.split('.').pop()}` : '';
    const base = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'restored_dataset';
    const dlName = `${base}_restored${ext}`;
    const res = await api.downloadFile(fileId, dlName);
    if (res.success) {
      setDownloadMsg(`✓ Downloaded ${dlName}`);
      setTimeout(() => setDownloadMsg(''), 3000);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Initiation Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Restore File from Backup Version</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Guaranteed ACID atomic restore (Blueprint Section C3 / POST /api/v1/restores) with instant download
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              File to Restore
            </label>
            <select
              value={activeFileId}
              onChange={(e) => handleFileChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:border-sky-500"
            >
              {files.map((f) => (
                <option key={f.file_id} value={f.file_id}>
                  {f.file_name} (Current: v{f.current_version})
                </option>
              ))}
            </select>
          </div>

          {/* Version Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Target Version Point-in-Time
            </label>
            <select
              value={activeVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:border-sky-500"
            >
              {selectedFile?.versions?.map((ver) => (
                <option key={ver.version_id} value={ver.version_id}>
                  Version {ver.version_number} &mdash; {new Date(ver.created_at).toLocaleDateString()} ({ver.retention_policy})
                </option>
              ))}
            </select>
          </div>

          {/* Target Restore Path */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Isolation Sandbox Destination Target Path
            </label>
            <div className="relative">
              <FolderInput className="w-4 h-4 text-slate-500 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white focus:border-sky-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-500">
              Target location for isolated sandbox recovery verified by Team C DBMS transaction manager.
            </p>
          </div>
        </div>

        {/* Pre-flight Merkle Integrity Check */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">Pre-Flight Merkle Proof Check</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Verify chunk hashes with Team B before mounting</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {preCheckPassed === true && (
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Proofs Validated
              </span>
            )}
            {preCheckPassed === false && (
              <span className="text-xs px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Hash Mismatch
              </span>
            )}
            <button
              onClick={handleVerifyBeforeRestore}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
            >
              Run Proof Check
            </button>
          </div>
        </div>

        {/* Restore Action */}
        {actionError && (
          <p role="alert" className="rounded-lg border border-rose-800 bg-rose-950/50 p-3 text-sm text-rose-200">
            {actionError}
          </p>
        )}
        {downloadMsg && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10 p-3 text-xs text-emerald-400 font-medium">
            {downloadMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Atomic commit: if any lease or chunk write fails, compensation releases the lock immediately.
          </div>

          <button
            onClick={handleExecuteRestore}
            disabled={isRestoring || !selectedFileId}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRestoring ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Restoring & Reconstructing Chunks...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Execute Atomic Restore</span>
              </>
            )}
          </button>
        </div>

        {/* Restore result card with Direct Download Button (Requirement #5) */}
        {restoreSuccess && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
              ['FAILED', 'COMPENSATED'].includes(restoreSuccess.state)
                ? 'bg-rose-100 dark:bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  {['FAILED', 'COMPENSATED'].includes(restoreSuccess.state) ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  Restore Status: {restoreSuccess.state}
                </div>
                <div className="mt-1">
                  Restore ID: <code className="font-mono text-slate-900 dark:text-white">{restoreSuccess.restore_id}</code>
                </div>
                <div>Target Destination: <code className="font-mono text-slate-700 dark:text-slate-300">{restoreSuccess.target_path}</code></div>
                {restoreSuccess.allocation_id && (
                  <div>
                    Allocation Lease: <code className="font-mono text-emerald-400">{restoreSuccess.allocation_id}</code>
                  </div>
                )}
              </div>

              {!['FAILED', 'COMPENSATED'].includes(restoreSuccess.state) && (
                <button
                  onClick={() => handleDownloadRestored(restoreSuccess.file_id, selectedFile?.file_name)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition whitespace-nowrap self-start sm:self-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Restored File</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Past Restores List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Restoration Activity Log</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Verified point-in-time recoveries across storage nodes with direct artifact retrieval
            </p>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400">{restores.length} Records</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {restores.map((r) => (
            <div
              key={r.restore_id}
              className="p-4 hover:bg-slate-100 dark:bg-slate-800/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{r.file_name || 'Dataset'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {r.state}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">{r.restore_id}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Target: {r.target_path}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => handleDownloadRestored(r.file_id, r.file_name)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-100 dark:bg-sky-500/10 hover:bg-sky-200 dark:hover:bg-sky-500/20 text-sky-500 dark:text-sky-400 font-medium text-xs transition"
                  title="Download restored file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <div className="text-slate-600 dark:text-slate-400 text-right text-[11px]">
                  <div>{new Date(r.created_at).toLocaleString()}</div>
                  <div className="font-mono text-slate-500 dark:text-slate-500 text-[10px]">
                    Lease: {r.allocation_id || 'lease-restore-01'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
