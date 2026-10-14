export type UserRole = 'Employee' | 'IT Admin' | 'Auditor' | string;

export interface UserSession {
  session_id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  expires_at: string;
}

export interface EndpointConfig {
  teamCUrl: string;
  teamAUrl: string;
  teamBUrl: string;
  authToken: string;
  useLiveBackend: boolean;
}

export type BackupState = 
  | 'REQUESTED' 
  | 'QUEUED' 
  | 'CHUNKING' 
  | 'DEDUPLICATING' 
  | 'UPLOADING' 
  | 'COMMITTED' 
  | 'VERIFIED' 
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED'
  | 'PARTIAL'
  | 'RETRYING'
  | 'CANCELLED'
  | 'COMPENSATION_REQUIRED';

export type BackupPolicy = 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
export type SchedulingPolicy = 'FCFS' | 'SJF' | 'RR' | 'PRIORITY';

export interface BackupRequest {
  backup_id: string;
  user_id: string;
  owner_email?: string;     // used for user-scoped filtering
  file_ids: string[];
  file_id?: string;
  file_name?: string;
  backup_policy: BackupPolicy;
  backup_type?: BackupPolicy;
  priority: number;
  source_path?: string;
  idempotency_key: string;
  correlation_id: string;
  state: BackupState;
  allocation_id?: string;
  job_id?: string;
  dedup_result_id?: string;
  failure_reason?: string;
  merkle_root?: string;
  size_bytes?: number;
  savings_ratio?: number;
  created_at: string;
  completed_at?: string;
}

export interface RestoreRequest {
  restore_id: string;
  backup_id: string;
  file_id: string;
  user_id?: string;
  owner_email?: string;     // used for user-scoped filtering
  file_name?: string;
  version_id?: string;
  target_path: string;
  idempotency_key?: string;
  correlation_id?: string;
  state: 'INITIATED' | 'LEASED' | 'RECONSTRUCTING' | 'VERIFYING' | 'RESTORED' | 'FAILED' | 'COMPENSATED' | 'REQUESTED' | 'COMMITTED';
  allocation_id?: string;
  failure_reason?: string;
  created_at: string;
  completed_at?: string;
}

export interface FileChunk {
  chunk_id: string;
  file_id: string;
  backup_id?: string;
  hash: string;
  size: number;
  order: number;
  is_duplicate?: boolean;
}

export interface FileVersion {
  version_id: string;
  file_id: string;
  version_number: number;
  size: number;
  checksum: string;
  merkle_root?: string;
  chunk_refs: string[];
  state: string;
  retention_policy: string;
  created_at: string;
  created_by?: string;
}

export interface FileMaster {
  file_id: string;
  file_name: string;
  storage_path: string;
  owner_id: string;
  owner_email?: string;     // used for user-scoped filtering
  owner_name?: string;
  department?: string;
  current_version: number;
  size: number;
  retention_policy: '30_DAYS' | '90_DAYS' | '1_YEAR' | '7_YEARS' | 'PERMANENT';
  created_at: string;
  updated_at: string;
  versions?: FileVersion[];
}

export interface DedupResult {
  result_id: string;
  file_id: string;
  unique_chunks: number;
  duplicate_chunks: number;
  savings_ratio: number;
  delta_size: number;
  merkle_root: string;
  algorithm?: string;
  lookup_time_us?: number;
  index_version?: string;
}

export interface WorkerQueueItem {
  job_id: string;
  backup_id: string;
  file_id: string;
  file_name: string;
  priority: number;
  state: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'WAITING_LOCK';
  submitted_at: string;
  policy: SchedulingPolicy;
  queue_position: number;
  estimated_wait_sec: number;
  assigned_worker?: string;
}

export interface LockState {
  lock_id: string;
  file_id: string;
  file_name: string;
  holder_backup_id: string;
  lock_mode: 'EXCLUSIVE' | 'SHARED';
  granted_at: string;
  lease_expiry: string;
  wait_for_count: number;
}

export interface AuditLog {
  audit_id: string;
  actor: string;
  action: string;
  target_id: string;
  correlation_id: string;
  before_value?: string;
  after_value?: string;
  timestamp: string;
  source_service: 'Team D' | 'Team C' | 'Team A' | 'Team B';
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface DashboardMetrics {
  total_files_backed_up: number;
  total_raw_storage_gb: number;
  total_deduped_storage_gb: number;
  global_savings_ratio: number;
  active_jobs_count: number;
  queue_depth: number;
  workers_utilized: number;
  total_workers: number;
  merkle_verification_rate: number;
  rpo_minutes: number;
  rto_minutes: number;
  avg_decision_latency_ms: number;
  avg_dedup_latency_ms: number;
}

export interface LiveStreamEvent {
  event_id: string;
  correlation_id: string;
  type: 'STATE_CHANGE' | 'LOCK_ACQUIRED' | 'LOCK_RELEASED' | 'DEDUP_COMPLETED' | 'ACID_COMMITTED' | 'VERIFICATION_PASSED' | 'ALERT';
  entity: string;
  message: string;
  timestamp: string;
  data?: any;
}
