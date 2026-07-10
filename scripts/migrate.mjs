/**
 * Apply SQL migrations to Supabase via the Management API.
 *
 * Needs only a personal access token (no DB password): it POSTs each migration
 * file to `/v1/projects/{ref}/database/query`.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/migrate.mjs
 *   node scripts/migrate.mjs sbp_xxx           # token as first arg
 *
 * Project ref is derived from NEXT_PUBLIC_SUPABASE_URL in .env.local.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Load .env.local (minimal parser).
function env(key) {
  if (process.env[key]) return process.env[key];
  try {
    const file = readFileSync(resolve(root, ".env.local"), "utf8");
    const m = file.match(new RegExp(`^${key}=(.*)$`, "m"));
    return m ? m[1].trim() : undefined;
  } catch {
    return undefined;
  }
}

const token = process.argv[2] || process.env.SUPABASE_ACCESS_TOKEN;
const url = env("NEXT_PUBLIC_SUPABASE_URL");
if (!token) {
  console.error("Missing token. Pass it as an arg or set SUPABASE_ACCESS_TOKEN.");
  process.exit(1);
}
const ref = url?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
if (!ref) {
  console.error("Could not derive project ref from NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

async function runSql(query) {
  // Retry transient gateway errors (Cloudflare 5xx) a few times.
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (res.ok) return res.json();
    const body = await res.text();
    if (res.status >= 502 && res.status <= 504 && attempt < 4) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      continue;
    }
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
}

/**
 * Split SQL into statements, respecting `$$`-dollar-quoted function bodies so
 * semicolons inside `create function … $$ … $$;` don't split incorrectly.
 */
function splitStatements(sql) {
  const stmts = [];
  let buf = "";
  let inDollar = false;
  const lines = sql.split("\n");
  for (const line of lines) {
    if (line.trim().startsWith("--")) continue; // strip full-line comments
    const dollars = (line.match(/\$\$/g) || []).length;
    if (dollars % 2 === 1) inDollar = !inDollar;
    buf += line + "\n";
    if (!inDollar && line.trimEnd().endsWith(";")) {
      const s = buf.trim();
      if (s) stmts.push(s);
      buf = "";
    }
  }
  if (buf.trim()) stmts.push(buf.trim());
  return stmts;
}

const dir = resolve(root, "supabase/migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
console.log(`Project ${ref} — applying ${files.length} migration(s)…`);
for (const f of files) {
  const stmts = splitStatements(readFileSync(resolve(dir, f), "utf8"));
  process.stdout.write(`  • ${f}: ${stmts.length} statements `);
  const BATCH = 6;
  for (let i = 0; i < stmts.length; i += BATCH) {
    await runSql(stmts.slice(i, i + BATCH).join("\n"));
    process.stdout.write(".");
  }
  console.log(" done");
}
console.log("Migrations applied.");
