import { db } from "../db/client";
import type { QueueOperation, SyncAction } from "../../types/sync";
import { createId } from "../../utils/id";

export const enqueueOperation = async (
  action: SyncAction,
  reminderId: string,
  payload?: Record<string, unknown>,
): Promise<QueueOperation> => {
  const operation: QueueOperation = {
    id: createId(),
    action,
    reminderId,
    payload,
    createdAt: new Date().toISOString(),
  };
  await db.queue.put(operation);
  return operation;
};

export const getPendingQueue = async (): Promise<QueueOperation[]> => {
  return db.queue.orderBy("createdAt").toArray();
};

export const removeQueueItems = async (ids: string[]): Promise<void> => {
  await db.queue.bulkDelete(ids);
};

export const clearQueue = async (): Promise<void> => {
  await db.queue.clear();
};
