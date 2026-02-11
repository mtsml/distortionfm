import { getCloudflareContext } from "@opennextjs/cloudflare";

type BindValue = string | number | null;

interface D1Result<T> {
  success: boolean;
  results: T[];
}

interface D1PreparedStatement {
  bind: (...values: BindValue[]) => D1PreparedStatement;
  all: <T>() => Promise<D1Result<T>>;
  run: () => Promise<{ success: boolean }>;
}

interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
}

interface CloudflareEnv {
  DB: D1Database;
}

const sleep = async (ms: number): Promise<void> =>
  await new Promise(resolve => setTimeout(resolve, ms));

const isRetryableD1Error = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("SQLITE_BUSY") ||
    message.includes("database is locked") ||
    message.includes("Failed to parse body as JSON")
  );
};

const withD1Retry = async <T>(operation: () => Promise<T>): Promise<T> => {
  const maxAttempts = 8;
  let delayMs = 50;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryableD1Error(error) || attempt === maxAttempts) {
        throw error;
      }
      await sleep(delayMs);
      delayMs *= 2;
    }
  }

  throw new Error("Unreachable retry state");
};

const getDbOrThrowError = async (): Promise<D1Database> => {
  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as CloudflareEnv;
  if (!cfEnv.DB) {
    throw new Error("Cloudflare D1 binding 'DB' is not configured.");
  }
  return cfEnv.DB;
};

export const d1All = async <T>(
  query: string,
  values: BindValue[] = []
): Promise<T[]> => {
  const db = await getDbOrThrowError();
  const result = await withD1Retry(async () =>
    await db.prepare(query).bind(...values).all<T>()
  );
  if (!result.success) {
    throw new Error(`D1 query failed: ${query}`);
  }
  return result.results;
};

export const d1Run = async (
  query: string,
  values: BindValue[] = []
): Promise<void> => {
  const db = await getDbOrThrowError();
  const result = await withD1Retry(async () =>
    await db.prepare(query).bind(...values).run()
  );
  if (!result.success) {
    throw new Error(`D1 statement failed: ${query}`);
  }
};
