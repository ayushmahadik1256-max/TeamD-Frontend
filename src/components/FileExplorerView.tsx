import React, { useState, useRef } from 'react';
import { FileMaster, FileVersion, UserRole } from '../types';
import { api } from '../services/api';
import {
  FileText,
  Search,
  Filter,
  History,
  Shield,
  Zap,
  RotateCcw,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  Plus,
  FolderPlus,
  AlertCircle,
  FileCheck,
  Download,
} from 'lucide-react';

interface FileExplorerViewProps {
  files: FileMaster[];
  userRole: UserRole;
  onInitiateBackup: (file: FileMaster) => void;
  onInitiateRestore: (file: FileMaster, version?: FileVersion) => void;
  onRefresh: () => void;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({
  files = [],
  userRole,
  onInitiateBackup,
  onInitiateRestore,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<FileMaster | null>(null);
  const [newRetention, setNewRetention] = useState<FileMaster['retention_policy']>('1_YEAR');
  const [newStoragePath, setNewStoragePath] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // New File Upload / Registration state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadFileSize, setUploadFileSize] = useState<number>(15728640);
  const [uploadStoragePath, setUploadStoragePath] = useState('');
  const [uploadRetention, setUploadRetention] = useState<FileMaster['retention_policy']>('1_YEAR');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeFiles = Array.isArray(files) ? files : [];

  const departments = [
    'ALL',
    ...Array.from(new Set(safeFiles.map((f) => f?.department || 'General'))),
  ];

  const filteredFiles = safeFiles.filter((f) => {
    if (!f) return false;
    const name = f.file_name || '';
    const id = f.file_id || '';
    const owner = f.owner_name || '';
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase()) ||
      owner.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || (f.department || 'General') === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleSaveRetention = async () => {
    if (!editingFile) return;
    setIsUpdating(true);
    try {
      await api.updateFileRetention(editingFile.file_id, newRetention, newStoragePath);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
      setEditingFile(null);
      onRefresh();
    }
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedUploadFile(file);
      setUploadFileName(file.name);
      setUploadFileSize(file.size || 15728640);
      setUploadStoragePath(`/campus/storage/docs/${file.name}`);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile || !uploadFileName.trim()) {
      setUploadErrorMsg('Please select a file to upload.');
      return;
    }
    setIsUploading(true);
    setUploadErrorMsg('');
    try {
      await api.createFile({
        file_name: uploadFileName.trim(),
        file_blob: selectedUploadFile,
        storage_path: uploadStoragePath || `/campus/storage/docs/${uploadFileName.trim()}`,
        size: uploadFileSize,
        retention_policy: uploadRetention,
      });
      setUploadSuccessMsg(`File "${uploadFileName}" uploaded and stored in the database successfully.`);
      setTimeout(() => {
        setUploadSuccessMsg('');
        setIsUploadModalOpen(false);
        setUploadFileName('');
        setSelectedUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1500);
      onRefresh();
    } catch (err) {
      console.error('File creation failed:', err);
      setUploadErrorMsg(err instanceof Error ? err.message : 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const safeIdx = Math.min(Math.max(i, 0), sizes.length - 1);
    return parseFloat((bytes / Math.pow(k, safeIdx)).toFixed(2)) + ' ' + sizes[safeIdx];
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter & Upload Action Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-600 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by file name, ID, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs text-slate-900 dark:text-white placeholder-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:border-sky-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  Dept: {dept}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-600 dark:text-slate-400 hidden sm:inline">
            {filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'} tracked
          </span>

          {/* Upload / Register File Button */}
          <button
            onClick={() => {
              setUploadFileName('');
              setUploadStoragePath('');
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-900 dark:text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New File</span>
          </button>
        </div>
      </div>

      {/* Files List Container */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden">
        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-600 dark:text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Files Found</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              No files match your search criteria. Upload a new file to store it in the database and start the backup workflow.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-slate-900 dark:text-white text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New File</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredFiles.map((file) => {
              const fileId = file.file_id || 'unknown';
              const isExpanded = expandedFileId === fileId;
              const versions = Array.isArray(file.versions) ? file.versions : [];
              const retentionLabel = (file.retention_policy || '1_YEAR').replace(/_/g, ' ');

              return (
                <div key={fileId} className="p-4 sm:p-5 hover:bg-slate-100 dark:bg-slate-800/30 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* File Info */}
                    <div className="flex items-start space-x-3.5">
                      <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-500/10 border border-sky-500/20 text-sky-400 mt-1">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                            {file.file_name || 'Untitled File'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            v{file.current_version ?? 1}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 dark:bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {retentionLabel}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                          <span>Size: <strong className="text-slate-800 dark:text-slate-200">{formatBytes(file.size)}</strong></span>
                          <span>Owner: <strong className="text-slate-800 dark:text-slate-200">{file.owner_name || 'Campus User'}</strong></span>
                          <span>Dept: <strong className="text-slate-700 dark:text-slate-300">{file.department || 'General'}</strong></span>
                          <span className="font-mono text-slate-500 dark:text-slate-500 truncate max-w-xs">{file.storage_path || '/campus/storage/...'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                      {/* Download / Get File */}
                      <button
                        onClick={async () => {
                          const res = await api.downloadFile(file.file_id, file.file_name);
                          if (!res.success) alert(res.message);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
                        title="Download / Get File"
                      >
                        <Download className="w-3.5 h-3.5 text-sky-400" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => setExpandedFileId(isExpanded ? null : fileId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
                      >
                        <History className="w-3.5 h-3.5 text-sky-400" />
                        <span>{versions.length || 1} Versions</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                      </button>

                      {/* IT Admin Policy Edit */}
                      {userRole === 'IT Admin' && (
                        <button
                          onClick={() => {
                            setEditingFile(file);
                            setNewRetention(file.retention_policy || '1_YEAR');
                            setNewStoragePath(file.storage_path || '');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-amber-500 transition"
                          title="Edit File Metadata (PATCH /internal/v1/files)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Meta</span>
                        </button>
                      )}

                      {/* Backup Trigger */}
                      <button
                        onClick={() => onInitiateBackup(file)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-xs font-semibold text-white shadow-md shadow-sky-600/20 transition"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Backup</span>
                      </button>

                      {/* Restore Trigger */}
                      <button
                        onClick={() => onInitiateRestore(file)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Version History Drawer */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-sky-400" />
                          Authoritative Version Tree (Team C Master)
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-500 font-mono">ID: {fileId}</span>
                      </div>

                      <div className="space-y-2">
                        {versions.map((ver) => {
                          const chunkList = Array.isArray(ver.chunk_refs) ? ver.chunk_refs.join(', ') : 'None';
                          const verDate = ver.created_at ? new Date(ver.created_at).toLocaleString() : 'Recent';
                          return (
                            <div
                              key={ver.version_id || String(ver.version_number)}
                              className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white">Version {ver.version_number ?? 1}</span>
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 dark:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {ver.state || 'COMMITTED'}
                                  </span>
                                  <span className="text-slate-600 dark:text-slate-400 text-[11px]">{verDate}</span>
                                </div>
                                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all">
                                  Checksum: <span className="text-slate-700 dark:text-slate-300">{ver.checksum || 'sha256:...'}</span>
                                </div>
                                {ver.merkle_root && (
                                  <div className="font-mono text-[11px] text-sky-400 break-all">
                                    Merkle Root: {ver.merkle_root}
                                  </div>
                                )}
                                <div className="text-[11px] text-slate-500 dark:text-slate-500">
                                  Chunk References: {chunkList}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                  onClick={async () => {
                                    const ext = file.file_name.includes('.') ? `.${file.file_name.split('.').pop()}` : '';
                                    const base = file.file_name.replace(/\.[^/.]+$/, '');
                                    const dlName = `${base}_v${ver.version_number}${ext}`;
                                    const res = await api.downloadFile(file.file_id, dlName);
                                    if (!res.success) alert(res.message);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-sky-400 transition"
                                  title="Download this version"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>
                                <button
                                  onClick={() => onInitiateRestore(file, ver)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-emerald-400 transition"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restore v{ver.version_number ?? 1}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload / Register File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-400" />
                Upload & Store File in Database
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}
            {uploadErrorMsg && (
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{uploadErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* Local File Picker */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFilePicked}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-slate-600 dark:text-slate-400 mx-auto" />
                <div className="text-slate-700 dark:text-slate-300">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sky-400 hover:underline font-semibold"
                  >
                    Click to browse local files
                  </button>
                  <span className="text-slate-500 dark:text-slate-500"> or drag and drop a file here.</span>
                </div>
                {uploadFileName && (
                  <div className="text-[11px] font-mono text-emerald-400 font-medium">
                    Selected: {uploadFileName} ({formatBytes(uploadFileSize)})
                  </div>
                )}
              </div>

              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                ✓ File will be uploaded, computed with SHA-256 hash, and stored in the database for instant backup and restore.
              </p>

              {/* Storage Path */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Storage Path (Catalog Location)
                </label>
                <input
                  type="text"
                  placeholder="/campus/storage/docs/Campus_Telemetry_2026.parquet"
                  value={uploadStoragePath}
                  onChange={(e) => setUploadStoragePath(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Retention Policy
                  </label>
                  <select
                    value={uploadRetention}
                    onChange={(e) => setUploadRetention(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-emerald-500"
                  >
                    <option value="30_DAYS">30 Days</option>
                    <option value="90_DAYS">90 Days</option>
                    <option value="1_YEAR">1 Year</option>
                    <option value="7_YEARS">7 Years</option>
                    <option value="PERMANENT">Permanent</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedUploadFile}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading & Storing...' : 'Upload & Store File'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Retention Policy Edit Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-500" />
                Edit Metadata & Retention Policy
              </h3>
              <button onClick={() => setEditingFile(null)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Target File</label>
                <div className="font-bold text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg">
                  {editingFile.file_name}
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Storage Catalog Path</label>
                <input
                  type="text"
                  value={newStoragePath}
                  onChange={(e) => setNewStoragePath(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Retention Duration</label>
                <select
                  value={newRetention}
                  onChange={(e) => setNewRetention(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-amber-500"
                >
                  <option value="30_DAYS">30 Days</option>
                  <option value="90_DAYS">90 Days</option>
                  <option value="1_YEAR">1 Year (Default)</option>
                  <option value="7_YEARS">7 Years (Compliance)</option>
                  <option value="PERMANENT">Permanent (Archive)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingFile(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRetention}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-900 dark:text-white font-bold text-xs transition"
              >
                <Check className="w-4 h-4" />
                <span>{isUpdating ? 'Saving...' : 'Apply Metadata'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
