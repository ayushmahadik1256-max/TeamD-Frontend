import React, { useState } from 'react';
import { FileMaster } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCw,
  Cpu,
  GitBranch,
  Layers,
  CheckCircle,
  XCircle,
  FileCode,
} from 'lucide-react';

interface IntegrityViewProps {
  files: FileMaster[];
}

export const IntegrityView: React.FC<IntegrityViewProps> = ({ files }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.file_id || '');
  const [simulateCorruption, setSimulateCorruption] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{
    merkle_root: string;
    verified_chunks: number;
    corrupted_chunks: number;
    latency_ms: number;
    status: 'VALID' | 'TAMPERED';
    chunks: { id: string; hash: string; status: 'VALID' | 'CORRUPTED' }[];
  } | null>(null);

  const selectedFile = files.find((f) => f.file_id === selectedFileId);

  const handleRunVerification = async () => {
    if (!selectedFileId) return;
    setIsVerifying(true);
    const res = await api.verifyIntegrityPreview(selectedFileId, simulateCorruption);
    setResult(res);
    setIsVerifying(false);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Merkle Tree Integrity & Tamper Verifier</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                DSA cryptographic proofs with Team B Deduplication Engine (POST /api/v1/integrity/verify)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <input
                type="checkbox"
                checked={simulateCorruption}
                onChange={(e) => setSimulateCorruption(e.target.checked)}
                className="rounded accent-rose-500"
              />
              <span className={`font-semibold ${simulateCorruption ? 'text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                Simulate Tampered Chunk
              </span>
            </label>

            <button
              onClick={handleRunVerification}
              disabled={isVerifying}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-900 dark:text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition disabled:opacity-50"
            >
              {isVerifying ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Compute Merkle Proof</span>
            </button>
          </div>
        </div>

        {/* File Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target File:</span>
          <select
            value={selectedFileId}
            onChange={(e) => {
              setSelectedFileId(e.target.value);
              setResult(null);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-purple-500"
          >
            {files.map((f) => (
              <option key={f.file_id} value={f.file_id}>
                {f.file_name} ({f.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Verification Result Banner */}
      {result && (
        <div
          className={`p-5 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
            result.status === 'VALID'
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {result.status === 'VALID' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              )}
              <span className="font-extrabold text-sm tracking-wide">
                {result.status === 'VALID'
                  ? 'CRYPTOGRAPHIC INTEGRITY VERIFIED (0 Tampering Detected)'
                  : 'TAMPER ALERT: CORRUPTED DATA CHUNK DETECTED'}
              </span>
            </div>
            <span className="font-mono text-xs">Latency: {result.latency_ms} ms</span>
          </div>

          <div className="font-mono text-[11px] break-all pt-1">
            <strong>Merkle Root Hash:</strong> {result.merkle_root}
          </div>

          <div className="text-[11px] text-slate-700 dark:text-slate-300">
            Verified chunks: {result.verified_chunks} &bull; Corrupted chunks: {result.corrupted_chunks}
          </div>
        </div>
      )}

      {/* Merkle Tree Visualizer */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-400" />
              Merkle Tree Graph Architecture
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Binary cryptographic tree derived from chunk hashes (AVL / Red-Black indexed)
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500">Algorithm: SHA-256 + Rabin-Karp</span>
        </div>

        {/* Tree Diagrams */}
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Root Node */}
          <div className="flex flex-col items-center">
            <div
              className={`px-5 py-3 rounded-2xl border text-center shadow-lg transition-all ${
                result?.status === 'TAMPERED'
                  ? 'bg-rose-950/50 border-rose-500 text-rose-300 shadow-rose-500/10'
                  : 'bg-purple-950/40 border-purple-500/60 text-purple-300 shadow-purple-500/10'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider font-bold">
                Merkle Root (Top Hash)
              </div>
              <div className="font-mono text-xs font-semibold mt-0.5 max-w-sm truncate">
                {result?.merkle_root || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </div>
            </div>
            <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-700"></div>
          </div>

          {/* Intermediate Level */}
          <div className="w-full max-w-xl flex items-center justify-around relative">
            <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-px"></div>
            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-center text-xs font-mono">
              <div className="text-[9px] text-slate-600 dark:text-slate-400 uppercase">Branch Left H(A+B)</div>
              <span>7f83b165...4b1fa</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-center text-xs font-mono">
              <div className="text-[9px] text-slate-600 dark:text-slate-400 uppercase">Branch Right H(C+D)</div>
              <span>2dc18148...20012</span>
            </div>
          </div>

          {/* Leaf Nodes (Chunks) */}
          <div className="w-full">
            <div className="text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
              Leaf Data Chunks (Fixed / Content-Defined Chunks)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {(result?.chunks || [
                { id: 'chunk-part-1', hash: 'sha256:7f83b165...9069', status: 'VALID' },
                { id: 'chunk-part-2', hash: 'sha256:d4735e3a...ab35', status: 'VALID' },
                { id: 'chunk-part-3', hash: 'sha256:9f86d081...0a08', status: 'VALID' },
                { id: 'chunk-part-4', hash: 'sha256:a9f0c442...b111', status: 'VALID' },
                { id: 'chunk-part-5', hash: 'sha256:c5d1b345...ba44', status: 'VALID' },
                { id: 'chunk-part-6', hash: 'sha256:bb12c442...bcc3', status: 'VALID' },
              ]).map((chk, i) => (
                <div
                  key={chk.id}
                  className={`p-3 rounded-xl border text-center text-xs font-mono space-y-1 transition ${
                    chk.status === 'CORRUPTED'
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-600 dark:text-slate-400">Chunk #{i + 1}</span>
                    {chk.status === 'CORRUPTED' ? (
                      <span className="text-rose-400 font-bold">TAMPERED</span>
                    ) : (
                      <span className="text-emerald-400">&#10003;</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500 truncate" title={chk.hash}>
                    {chk.hash.slice(0, 14)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
