import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: false,
  buckets: {
    "jugan-request-attachments": { access: "private" },
  },
  preview: {
    realtime: { allowedOrigins: ["http://localhost:3102"] },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
