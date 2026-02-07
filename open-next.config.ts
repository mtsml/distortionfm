import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({
  // Use built-in local/Workers cache for ISR; no R2 binding required.
});
