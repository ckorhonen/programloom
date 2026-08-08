import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import type { ObjectStore, StoredFileObject } from "./types";

export class LocalObjectStore implements ObjectStore {
  constructor(private readonly rootDir: string) {}

  async put(object: StoredFileObject): Promise<void> {
    const path = this.pathFor(object.key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, object.bytes);
    const metaPath = `${path}.json`;
    await writeFile(
      metaPath,
      `${JSON.stringify({ key: object.key, contentType: object.contentType, contentHash: object.contentHash }, null, 2)}\n`,
      "utf8",
    );
  }

  async get(key: string): Promise<StoredFileObject | undefined> {
    const path = this.pathFor(key);
    try {
      const [bytes, metadata] = await Promise.all([
        readFile(path),
        readFile(`${path}.json`, "utf8"),
      ]);
      const parsed = JSON.parse(metadata) as Pick<StoredFileObject, "contentType" | "contentHash">;
      return {
        key,
        bytes: new Uint8Array(bytes),
        contentType: parsed.contentType,
        contentHash: parsed.contentHash,
      };
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") return undefined;
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const path = this.pathFor(key);
    await Promise.all([rm(path, { force: true }), rm(`${path}.json`, { force: true })]);
  }

  private pathFor(key: string): string {
    if (!key || key.includes("\0") || isAbsolute(key)) {
      throw new Error("Invalid object key");
    }
    const root = resolve(this.rootDir);
    const path = resolve(root, key);
    const relativePath = relative(root, path);
    if (relativePath === "" || relativePath.startsWith("..") || isAbsolute(relativePath)) {
      throw new Error("Object key escapes store root");
    }
    return path;
  }
}

export function hashBytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}
