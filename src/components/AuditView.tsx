import React, { useState } from 'react';
import { AuditLog, UserRole } from '../types';
import {
  FileCheck2,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Database,
} from 'lucide-react';

interface AuditViewProps {
  logs: AuditLog[];
  userRole: UserRole;
  onRefresh: () => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ logs, userRole, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.correlation_id.toLowerCase().includes(search.toLowerCase()) ||
      log.target_id.toLowerCase().includes(search.toLowerCase());
    const matchesService = serviceFilter === 'ALL' || log.source_service === serviceFilter;
    return matchesSearch && matchesService;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apnileap_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Audit ID', 'Actor', 'Action', 'Target ID', 'Correlation ID', 'Source Service', 'Status', 'Timestamp'];
    const rows = logs.map((l) => [
      l.audit_id,
      `"${l.actor}"`,
      l.action,
      l.target_id,
      l.correlation_id,
      l.source_service,
      l.status,
      l.timestamp,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `apnileap_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview Cards (Blueprint Section 6 & D4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Immutable Audit Coverage
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">100% Traceability</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Every create/update/cancel carries actor, timestamp & correlation ID.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Transactional Concurrency
            </span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">0 Lost Updates</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            ACID transaction isolation enforced by Team C DBMS Engine.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Disaster Recovery Gates
            </span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">RPO ≤ 5m | RTO ≤ 30m</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Verified acceptance target for academic cohort accreditation.
          </p>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-600 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor, or correlation ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 text-xs text-slate-900 dark:text-white placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Services</option>
              <option value="Team D">Team D (BFF / UI)</option>
              <option value="Team C">Team C (Metadata/DBMS)</option>
              <option value="Team A">Team A (Scheduler)</option>
              <option value="Team B">Team B (Dedup/Integrity)</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Action & Service</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Correlation ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.audit_id} className="hover:bg-slate-100 dark:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 dark:bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {log.source_service}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">{log.audit_id}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">{log.actor}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{log.target_id}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-sky-400">
                    <span title={log.correlation_id}>
                      {log.correlation_id.slice(0, 12)}...
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white text-[11px] font-medium transition"
                    >
                      View Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-sky-400" />
                Audit Record: {selectedLog.audit_id}
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white text-base">
                &times;
              </button>
            </div>

            <div className="space-y-2">
              <div><strong>Action:</strong> <span className="text-slate-900 dark:text-white">{selectedLog.action}</span></div>
              <div><strong>Actor:</strong> <span className="text-slate-800 dark:text-slate-200">{selectedLog.actor}</span></div>
              <div><strong>Service:</strong> <span className="text-sky-300">{selectedLog.source_service}</span></div>
              <div className="break-all"><strong>Correlation ID:</strong> <span className="font-mono text-sky-400">{selectedLog.correlation_id}</span></div>
              <div><strong>Timestamp:</strong> <span className="text-slate-700 dark:text-slate-300">{selectedLog.timestamp}</span></div>

              {selectedLog.before_value && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-rose-400">Before State:</div>
                  <div className="font-mono text-slate-700 dark:text-slate-300">{selectedLog.before_value}</div>
                </div>
              )}

              {selectedLog.after_value && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">After State:</div>
                  <div className="font-mono text-slate-700 dark:text-slate-300">{selectedLog.after_value}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
