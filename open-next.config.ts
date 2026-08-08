import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// The local file adapter remains the verified demo persistence layer. Keep the
// edge cache deliberately in-memory until a dedicated R2 binding is provisioned.
export default defineCloudflareConfig({
  incrementalCache: "dummy",
});
