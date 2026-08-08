import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import type { DomainSnapshot, IdempotencyRecord } from "@/domain";
import { buildResetReceipt, emptySnapshot } from "./snapshot";
import type { SeedResetReceipt, StorageAdapter } from "./types";

export class FileBackedStorageAdapter implements StorageAdapter {
  constructor(private readonly filePath: string) {}

  async readSnapshot(): Promise<DomainSnapshot> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as DomainSnapshot;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return emptySnapshot();
      }
      throw error;
    }
  }

  async writeSnapshot(snapshot: DomainSnapshot): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    await rename(tempPath, this.filePath);
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
