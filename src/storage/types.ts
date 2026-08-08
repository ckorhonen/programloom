import type { DomainSnapshot, IdempotencyRecord } from "@/domain";

export interface SeedResetReceipt {
  eventId: string;
  fingerprint: string;
  counts: Record<string, number>;
}

export interface StorageAdapter {
  readSnapshot(): Promise<DomainSnapshot>;
  writeSnapshot(snapshot: DomainSnapshot): Promise<void>;
  reset(snapshot: DomainSnapshot): Promise<SeedResetReceipt>;
  getIdempotencyRecord<T = unknown>(
    scope: string,
    key: string,
  ): Promise<IdempotencyRecord<T> | undefined>;
  putIdempotencyRecord<T = unknown>(record: IdempotencyRecord<T>): Promise<void>;
}

export interface StoredFileObject {
  key: string;
  bytes: Uint8Array;
  contentType: string;
  contentHash: string;
}

export interface ObjectStore {
  put(object: StoredFileObject): Promise<void>;
  get(key: string): Promise<StoredFileObject | undefined>;
  delete(key: string): Promise<void>;
}
