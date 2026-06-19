import EmbeddedPostgres from "embedded-postgres";
import { spawn } from "child_process";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const databaseDir = path.join(root, "prisma", "pg-data");
const dbName = "riseup_academy";
const user = "postgres";
const password = "postgres";

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function pickPort() {
  for (const port of [5432, 5433, 5434]) {
    if (await isPortFree(port)) return port;
  }
  throw new Error("No free PostgreSQL port found (tried 5432–5434)");
}

function databaseUrl(port) {
  return `postgresql://${user}:${password}@127.0.0.1:${port}/${dbName}?schema=public`;
}

function updateEnvFile(port) {
  const envPath = path.join(root, ".env");
  const url = databaseUrl(port);
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  if (/^DATABASE_URL=.*$/m.test(content)) {
    content = content.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${url}"`);
  } else {
    content = `# PostgreSQL (local embedded instance)\nDATABASE_URL="${url}"\n${content}`;
  }

  if (!/^AUTH_URL=.*$/m.test(content)) {
    content += content.endsWith("\n") ? "" : "\n";
    content += `AUTH_URL="http://localhost:3000"\n`;
  }

  fs.writeFileSync(envPath, content);
  console.log(`Updated .env DATABASE_URL → ${url}`);
  return url;
}

function runCommand(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, ...env },
      stdio: "inherit",
      shell: true,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function createPostgres(port, { ensureDatabase = true } = {}) {
  const pg = new EmbeddedPostgres({
    databaseDir,
    user,
    password,
    port,
    persistent: true,
  });

  const hasCluster = fs.existsSync(path.join(databaseDir, "PG_VERSION"));
  if (!hasCluster) {
    await pg.initialise();
  }

  await pg.start();

  if (ensureDatabase) {
    try {
      await pg.createDatabase(dbName);
      console.log(`Created database "${dbName}"`);
    } catch {
      console.log(`Database "${dbName}" already exists`);
    }
  }

  return pg;
}

async function setup() {
  const port = await pickPort();
  console.log(`Starting embedded PostgreSQL on port ${port}...`);
  const pg = await createPostgres(port);
  const url = updateEnvFile(port);

  try {
    console.log("Running prisma generate...");
    await runCommand("npx", ["prisma", "generate"], { DATABASE_URL: url });

    console.log("Running prisma db push...");
    await runCommand("npx", ["prisma", "db", "push"], { DATABASE_URL: url });

    console.log("Seeding database...");
    await runCommand("npx", ["tsx", "prisma/seed.ts"], { DATABASE_URL: url });

    const sqlitePath = path.join(root, "prisma", "dev.db");
    const sqliteJournal = path.join(root, "prisma", "dev.db-journal");
    for (const file of [sqlitePath, sqliteJournal]) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`Removed old SQLite file: ${path.basename(file)}`);
      }
    }

    console.log("\nPostgreSQL migration complete.");
    console.log(`Connection: ${url}`);
    console.log(`Data directory: ${databaseDir}`);
    console.log("Start Postgres before dev with: npm run db:postgres:start");
  } finally {
    await pg.stop();
    console.log("Embedded PostgreSQL stopped (data persisted on disk).");
  }
}

async function start() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) {
    console.error("No .env file. Run: npm run setup");
    process.exit(1);
  }

  const match = fs.readFileSync(envPath, "utf8").match(/DATABASE_URL="([^"]+)"/);
  const portMatch = match?.[1]?.match(/:(\d+)\//);
  const port = portMatch ? Number(portMatch[1]) : await pickPort();

  console.log(`Starting embedded PostgreSQL on port ${port}...`);
  const pg = await createPostgres(port);
  updateEnvFile(port);

  const shutdown = async () => {
    console.log("\nStopping PostgreSQL...");
    await pg.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log("PostgreSQL is running. Press Ctrl+C to stop.");
  await new Promise(() => {});
}

const command = process.argv[2] || "setup";

if (command === "setup") {
  setup().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else if (command === "start") {
  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.error("Usage: node scripts/postgres-dev.mjs [setup|start]");
  process.exit(1);
}
