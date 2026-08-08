import type { DomainSnapshot, IdempotencyRecord } from "@/domain";
import { buildResetReceipt, emptySnapshot } from "./snapshot";
import type { SeedResetReceipt, StorageAdapter } from "./types";

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = unknown>(column?: string): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
  exec(query: string): Promise<unknown>;
}

export class D1SnapshotStorageAdapter implements StorageAdapter {
  constructor(
    private readonly db: D1DatabaseLike,
    private readonly snapshotKey = "default",
  ) {}

  async init(): Promise<void> {
    await this.db.exec(
      "CREATE TABLE IF NOT EXISTS domain_snapshots (snapshot_key TEXT PRIMARY KEY, json TEXT NOT NULL, updated_at TEXT NOT NULL)",
    );
  }

  async readSnapshot(): Promise<DomainSnapshot> {
    await this.init();
    const json = await this.db
      .prepare("SELECT json FROM domain_snapshots WHERE snapshot_key = ?")
      .bind(this.snapshotKey)
      .first<string>("json");
    return json ? (JSON.parse(json) as DomainSnapshot) : emptySnapshot();
  }

  async writeSnapshot(snapshot: DomainSnapshot): Promise<void> {
    await this.init();
    await this.db
      .prepare(
        "INSERT INTO domain_snapshots (snapshot_key, json, updated_at) VALUES (?, ?, ?) ON CONFLICT(snapshot_key) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at",
      )
      .bind(this.snapshotKey, JSON.stringify(snapshot), new Date().toISOString())
      .run();
  }

  async reset(snapshot: DomainSnapshot): Promise<SeedResetReceipt> {
    await this.writeSnapshot(snapshot);
    return buildResetReceipt(snapshot);
  }

  async getIdempotencyRecord<T = unknown>(
    scope: string,
    key: string,
  ): Promise<IdempotencyRecord<T> | undefined> {
    const snapshot = await this.readSnapshot();
    return snapshot.idempotency.find((record) => record.scope === scope && record.key === key) as
      | IdempotencyRecord<T>
      | undefined;
  }

  async putIdempotencyRecord<T = unknown>(record: IdempotencyRecord<T>): Promise<void> {
    const snapshot = await this.readSnapshot();
    snapshot.idempotency = [
      ...snapshot.idempotency.filter(
        (item) => !(item.scope === record.scope && item.key === record.key),
      ),
      record,
    ];
    await this.writeSnapshot(snapshot);
  }
}
