import { execSync } from "node:child_process";

function run(command, env = process.env) {
  execSync(command, { stdio: "inherit", env, shell: true });
}

function resolveDatabaseUrls() {
  const pooled =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL;

  const direct =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DIRECT_URL ??
    pooled;

  return { pooled, direct };
}

const { pooled, direct } = resolveDatabaseUrls();
const env = { ...process.env };

if (pooled) {
  env.DATABASE_URL = pooled;
}

run("npx prisma generate", env);

if (direct) {
  console.log("Applying Prisma schema to database...");
  run("npx prisma db push --skip-generate", {
    ...env,
    DATABASE_URL: direct,
  });
} else if (process.env.VERCEL) {
  console.warn(
    "\n⚠️  No DATABASE_URL / POSTGRES_* env vars found on Vercel.\n" +
      "   Connect Postgres (Vercel Storage or Neon) in Project Settings → Environment Variables, then redeploy.\n"
  );
}

run("npx next build", env);
