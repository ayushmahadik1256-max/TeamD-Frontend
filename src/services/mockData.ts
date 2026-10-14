import { FileMaster, BackupRequest, RestoreRequest, WorkerQueueItem, LockState, AuditLog, DashboardMetrics, LiveStreamEvent, UserSession } from '../types';

export const INITIAL_USERS: UserSession[] = [
  {
    session_id: 'sess-emp-101',
    user_id: 'usr-308bd155',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@rit.ac.in',
    role: 'Employee',
    permissions: ['files.read', 'backups.create', 'restores.create', 'backups.read'],
    expires_at: '2026-10-02T12:00:00Z',
  },
  {
    session_id: 'sess-adm-202',
    user_id: 'usr-admin-01',
    name: 'Alex Morgan',
    email: 'alex.morgan@admin.rit.ac.in',
    role: 'IT Admin',
    permissions: ['*'],
    expires_at: '2026-10-02T12:00:00Z',
  },
  {
    session_id: 'sess-aud-303',
    user_id: 'usr-auditor-99',
    name: 'Elena Rostova',
    email: 'elena.rostova@compliance.edu',
    role: 'Auditor',
    permissions: ['audit.read', 'reports.read', 'integrity.read', 'files.read'],
    expires_at: '2026-10-02T12:00:00Z',
  },
];

export const INITIAL_FILES: FileMaster[] = [
  {
    file_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    file_name: 'DBMS_Research_Lab_Dataset_2026.parquet',
    storage_path: '/campus/storage/docs/DBMS_Research_Lab_Dataset_2026.parquet',
    owner_id: 'usr-308bd155',
    owner_name: 'Dr. Priya Sharma',
    department: 'Computer Science & Eng',
    current_version: 3,
    size: 48234496, // ~46MB
    retention_policy: '1_YEAR',
    created_at: '2026-09-15T09:12:00Z',
    updated_at: '2026-10-01T14:30:00Z',
    versions: [
      {
        version_id: 'ver-dbms-v3',
        file_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        version_number: 3,
        size: 48234496,
        checksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        merkle_root: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        chunk_refs: ['chk-001', 'chk-002', 'chk-003', 'chk-004', 'chk-005'],
        state: 'COMMITTED',
        retention_policy: '1_YEAR',
        created_at: '2026-10-01T14:30:00Z',
        created_by: 'Dr. Priya Sharma'
      },
      {
        version_id: 'ver-dbms-v2',
        file_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        version_number: 2,
        size: 44120000,
        checksum: 'sha256:1234b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9088',
        merkle_root: 'a9f0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b111',
        chunk_refs: ['chk-001', 'chk-002', 'chk-003', 'chk-009'],
        state: 'COMMITTED',
        retention_policy: '1_YEAR',
        created_at: '2026-09-24T11:20:00Z',
        created_by: 'Dr. Priya Sharma'
      },
      {
        version_id: 'ver-dbms-v1',
        file_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        version_number: 1,
        size: 40000000,
        checksum: 'sha256:abcdb1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9777',
        merkle_root: '9990c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b222',
        chunk_refs: ['chk-001', 'chk-002'],
        state: 'COMMITTED',
        retention_policy: '1_YEAR',
        created_at: '2026-09-15T09:12:00Z',
        created_by: 'Dr. Priya Sharma'
      }
    ]
  },
  {
    file_id: 'a12bc34d-98fe-4110-b999-123456789abc',
    file_name: 'SmartCampus_Sensors_Telemetry_Oct.csv',
    storage_path: '/campus/storage/iot/SmartCampus_Sensors_Telemetry_Oct.csv',
    owner_id: 'usr-admin-01',
    owner_name: 'Alex Morgan',
    department: 'IoT Systems Lab',
    current_version: 1,
    size: 15728640, // 15MB
    retention_policy: '90_DAYS',
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z',
    versions: [
      {
        version_id: 'ver-iot-v1',
        file_id: 'a12bc34d-98fe-4110-b999-123456789abc',
        version_number: 1,
        size: 15728640,
        checksum: 'sha256:d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
        merkle_root: 'c5d1b34569fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852ba44',
        chunk_refs: ['chk-010', 'chk-011', 'chk-012'],
        state: 'COMMITTED',
        retention_policy: '90_DAYS',
        created_at: '2026-10-01T08:00:00Z',
        created_by: 'Alex Morgan'
      }
    ]
  },
  {
    file_id: 'e89ff12a-33bb-49cc-8877-554433221100',
    file_name: 'Institutional_Financial_Audit_Q3.xlsx',
    storage_path: '/campus/storage/finance/Institutional_Financial_Audit_Q3.xlsx',
    owner_id: 'usr-auditor-99',
    owner_name: 'Elena Rostova',
    department: 'Finance & Compliance',
    current_version: 2,
    size: 8388608, // 8MB
    retention_policy: '7_YEARS',
    created_at: '2026-09-28T10:15:00Z',
    updated_at: '2026-09-30T17:45:00Z',
    versions: [
      {
        version_id: 'ver-fin-v2',
        file_id: 'e89ff12a-33bb-49cc-8877-554433221100',
        version_number: 2,
        size: 8388608,
        checksum: 'sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        merkle_root: 'bb12c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852bcc3',
        chunk_refs: ['chk-020', 'chk-021'],
        state: 'COMMITTED',
        retention_policy: '7_YEARS',
        created_at: '2026-09-30T17:45:00Z',
        created_by: 'Elena Rostova'
      }
    ]
  }
];

export const INITIAL_BACKUPS: BackupRequest[] = [
  {
    backup_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    user_id: 'usr-308bd155',
    file_ids: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
    file_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    file_name: 'DBMS_Research_Lab_Dataset_2026.parquet',
    backup_policy: 'INCREMENTAL',
    backup_type: 'INCREMENTAL',
    priority: 1,
    source_path: '/campus/storage/docs/DBMS_Research_Lab_Dataset_2026.parquet',
    idempotency_key: 'idem-4819-bf91-a18290ceb12a',
    correlation_id: 'corr-8921-teamd-initial-01',
    state: 'COMPLETED',
    allocation_id: 'lease-wkr-02-a89',
    job_id: '550e8400-e29b-41d4-a716-446655440000',
    dedup_result_id: 'dedup-res-9011',
    merkle_root: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    size_bytes: 48234496,
    savings_ratio: 0.684, // 68.4% savings
    created_at: '2026-10-01T14:28:10Z',
    completed_at: '2026-10-01T14:30:15Z',
  },
  {
    backup_id: 'bk-2234-90aa-8812',
    user_id: 'usr-admin-01',
    file_ids: ['a12bc34d-98fe-4110-b999-123456789abc'],
    file_id: 'a12bc34d-98fe-4110-b999-123456789abc',
    file_name: 'SmartCampus_Sensors_Telemetry_Oct.csv',
    backup_policy: 'FULL',
    backup_type: 'FULL',
    priority: 2,
    source_path: '/campus/storage/iot/SmartCampus_Sensors_Telemetry_Oct.csv',
    idempotency_key: 'idem-7721-ac88-990011223344',
    correlation_id: 'corr-3310-teamd-initial-02',
    state: 'COMMITTED',
    allocation_id: 'lease-wkr-01-f12',
    job_id: 'job-9821-4190-b112',
    dedup_result_id: 'dedup-res-8812',
    merkle_root: 'c5d1b34569fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852ba44',
    size_bytes: 15728640,
    savings_ratio: 0.521,
    created_at: '2026-10-01T15:45:00Z',
    completed_at: '2026-10-01T15:46:12Z',
  }
];

export const INITIAL_RESTORES: RestoreRequest[] = [
  {
    restore_id: 'rst-9921-ca44-1188',
    backup_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    file_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    file_name: 'DBMS_Research_Lab_Dataset_2026.parquet',
    version_id: 'ver-dbms-v2',
    target_path: '/campus/recovery/sandboxes/DBMS_Research_Lab_Dataset_v2_restored.parquet',
    idempotency_key: 'idem-rst-1100-2233',
    correlation_id: 'corr-rst-8822-trace',
    state: 'RESTORED',
    allocation_id: 'lease-wkr-03-rst',
    created_at: '2026-10-01T18:10:00Z',
    completed_at: '2026-10-01T18:11:45Z',
  }
];

export const INITIAL_QUEUED_JOBS: WorkerQueueItem[] = [
  {
    job_id: 'job-q-4412',
    backup_id: 'bk-new-pending-01',
    file_id: 'e89ff12a-33bb-49cc-8877-554433221100',
    file_name: 'Institutional_Financial_Audit_Q3.xlsx',
    priority: 1,
    state: 'QUEUED',
    submitted_at: '2026-10-01T21:05:00Z',
    policy: 'PRIORITY',
    queue_position: 1,
    estimated_wait_sec: 4,
  },
  {
    job_id: 'job-q-4413',
    backup_id: 'bk-new-pending-02',
    file_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    file_name: 'DBMS_Research_Lab_Dataset_2026.parquet',
    priority: 3,
    state: 'RUNNING',
    submitted_at: '2026-10-01T21:04:15Z',
    policy: 'PRIORITY',
    queue_position: 0,
    estimated_wait_sec: 0,
    assigned_worker: 'worker-node-alpha (Thread 2)',
  }
];

export const INITIAL_LOCKS: LockState[] = [
  {
    lock_id: 'lck-9901-b3',
    file_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    file_name: 'DBMS_Research_Lab_Dataset_2026.parquet',
    holder_backup_id: 'bk-new-pending-02',
    lock_mode: 'EXCLUSIVE',
    granted_at: '2026-10-01T21:04:16Z',
    lease_expiry: '2026-10-01T21:06:16Z',
    wait_for_count: 0
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    audit_id: 'aud-88901',
    actor: 'Dr. Priya Sharma (usr-308bd155)',
    action: 'BACKUP_INITIATED',
    target_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    correlation_id: 'corr-8921-teamd-initial-01',
    before_value: 'STATE: NONE',
    after_value: 'STATE: REQUESTED',
    timestamp: '2026-10-01T14:28:10Z',
    source_service: 'Team D',
    status: 'SUCCESS'
  },
  {
    audit_id: 'aud-88902',
    actor: 'Team A Scheduler Engine',
    action: 'EXCLUSIVE_LOCK_ACQUIRED',
    target_id: 'file:f47ac10b',
    correlation_id: 'corr-8921-teamd-initial-01',
    before_value: 'LOCK: FREE',
    after_value: 'LOCK: EXCLUSIVE (Lease: lease-wkr-02-a89)',
    timestamp: '2026-10-01T14:28:12Z',
    source_service: 'Team A',
    status: 'SUCCESS'
  },
  {
    audit_id: 'aud-88903',
    actor: 'Team B Dedup Engine',
    action: 'DEDUP_COMPUTED',
    target_id: 'dedup-res-9011',
    correlation_id: 'corr-8921-teamd-initial-01',
    before_value: 'Chunks: 5 raw',
    after_value: 'Unique: 2, Duplicate: 3, Savings: 68.4%',
    timestamp: '2026-10-01T14:28:45Z',
    source_service: 'Team B',
    status: 'SUCCESS'
  },
  {
    audit_id: 'aud-88904',
    actor: 'Team C Metadata Manager',
    action: 'ACID_TRANSACTION_COMMITTED',
    target_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    correlation_id: 'corr-8921-teamd-initial-01',
    before_value: 'STATE: CHUNKING',
    after_value: 'STATE: COMMITTED (Outbox Event emitted)',
    timestamp: '2026-10-01T14:29:10Z',
    source_service: 'Team C',
    status: 'SUCCESS'
  },
  {
    audit_id: 'aud-88905',
    actor: 'Team A Scheduler Engine',
    action: 'EXCLUSIVE_LOCK_RELEASED',
    target_id: 'lease-wkr-02-a89',
    correlation_id: 'corr-8921-teamd-initial-01',
    before_value: 'LEASE: HELD',
    after_value: 'LEASE: RELEASED',
    timestamp: '2026-10-01T14:29:12Z',
    source_service: 'Team A',
    status: 'SUCCESS'
  },
  {
    audit_id: 'aud-88906',
    actor: 'Team D Merkle Verifier',
    action: 'MERKLE_TREE_VERIFIED',
    target_id: 'root:e3b0c442',
    correlation_id: 'corr-8921-teamd-initial-01',
    before_value: 'VERIFICATION: PENDING',
    after_value: 'VERIFICATION: PASSED (Latency: 42ms)',
    timestamp: '2026-10-01T14:30:15Z',
    source_service: 'Team D',
    status: 'SUCCESS'
  }
];

export const INITIAL_METRICS: DashboardMetrics = {
  total_files_backed_up: 142,
  total_raw_storage_gb: 1240.5,
  total_deduped_storage_gb: 410.8,
  global_savings_ratio: 0.669, // 66.9% saved
  active_jobs_count: 2,
  queue_depth: 1,
  workers_utilized: 2,
  total_workers: 4,
  merkle_verification_rate: 100.0,
  rpo_minutes: 3.2, // RPO <= 5 min target met!
  rto_minutes: 14.5, // RTO <= 30 min target met!
  avg_decision_latency_ms: 68, // p95 <= 200ms target met!
  avg_dedup_latency_ms: 74, // p95 <= 100ms per 10MB met!
};

export const INITIAL_STREAM_EVENTS: LiveStreamEvent[] = [
  {
    event_id: 'evt-101',
    correlation_id: 'corr-8921-teamd-initial-01',
    type: 'STATE_CHANGE',
    entity: 'Backup: 7c9e6679',
    message: 'State updated to COMPLETED. Merkle verification confirmed.',
    timestamp: '2026-10-01T14:30:15Z'
  },
  {
    event_id: 'evt-102',
    correlation_id: 'corr-3310-teamd-initial-02',
    type: 'ACID_COMMITTED',
    entity: 'Backup: bk-2234-90aa-8812',
    message: 'ACID commit succeeded. 3 chunks linked, audit outbox written.',
    timestamp: '2026-10-01T15:46:12Z'
  },
  {
    event_id: 'evt-103',
    correlation_id: 'corr-q-live-01',
    type: 'LOCK_ACQUIRED',
    entity: 'File: DBMS_Research_Lab_Dataset_2026.parquet',
    message: 'Exclusive lock allocated to job-q-4413 by Team A scheduler.',
    timestamp: '2026-10-01T21:04:16Z'
  }
];
