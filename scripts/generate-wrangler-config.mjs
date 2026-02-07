import { writeFile } from "node:fs/promises";

const required = ["D1_DATABASE_NAME", "D1_DATABASE_ID"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const workerName = process.env.WORKER_NAME || "distortionfm";
const d1DatabaseName = process.env.D1_DATABASE_NAME;
const d1DatabaseId = process.env.D1_DATABASE_ID;
const compatibilityDate = process.env.CF_COMPATIBILITY_DATE || "2026-02-07";
const outputPath = ".wrangler.deploy.toml";

const content = `name = "${workerName}"
main = ".open-next/worker.js"
compatibility_date = "${compatibilityDate}"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[[d1_databases]]
binding = "DB"
database_name = "${d1DatabaseName}"
database_id = "${d1DatabaseId}"
migrations_dir = "migrations"
`;

await writeFile(outputPath, content, "utf8");
console.log(`Generated ${outputPath}`);
