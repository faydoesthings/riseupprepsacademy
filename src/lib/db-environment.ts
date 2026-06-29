export function isProductionDeploy(): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host !== "localhost" && !host.startsWith("127.");
  }

  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

export function getDbUnavailableCopy(): { title: string; text: string } {
  if (isProductionDeploy()) {
    return {
      title: "Database not connected",
      text: "Live stats could not load. In the Vercel dashboard, connect a PostgreSQL database (Storage → Postgres or Neon) and ensure DATABASE_URL or POSTGRES_PRISMA_URL is set for Production, then redeploy. If the database is new, run a one-time seed against production.",
    };
  }

  return {
    title: "Database offline",
    text: "Live stats could not load. Start Postgres with npm run db:postgres:start, then run npm run db:seed if needed.",
  };
}

export function getDbErrorCopy(): string {
  if (isProductionDeploy()) {
    return "The production database is not reachable. Check DATABASE_URL / POSTGRES_* in Vercel environment variables, redeploy, and try again.";
  }

  return "The database is not reachable. Start Postgres with npm run db:postgres:start, then refresh.";
}
