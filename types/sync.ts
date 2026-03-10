import type { Reminder } from "./reminder";

export type SyncAction = "create" | "update" | "delete";

export interface QueueOperation {
  id: string;
  action: SyncAction;
  reminderId: string;
  payload?: Partial<Reminder>;
  createdAt: string;
}

export interface SyncStatus {
  online: boolean;
  syncing: boolean;
  lastSyncedAt: string | null;
  pendingCount: number;
}

