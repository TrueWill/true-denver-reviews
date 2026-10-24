import * as duckdb from '@duckdb/duckdb-wasm';

export type AsyncDuckDBConnection = duckdb.AsyncDuckDBConnection;

let initPromise: Promise<duckdb.AsyncDuckDBConnection> | null = null;

export function getConnection(): Promise<duckdb.AsyncDuckDBConnection> {
  if (!initPromise) {
    initPromise = initDuckDB();
  }
  return initPromise;
}

async function initDuckDB(): Promise<duckdb.AsyncDuckDBConnection> {
  const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
  const abs = (path: string) => new URL(path, location.href).href;
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${abs(bundle.mainWorker!)}");`], {
      type: 'text/javascript',
    }),
  );
  const worker = new Worker(workerUrl);

  try {
    const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
    const db = new duckdb.AsyncDuckDB(logger, worker);

    await db.instantiate(
      abs(bundle.mainModule),
      bundle.pthreadWorker ? abs(bundle.pthreadWorker) : undefined,
    );

    await db.open({
      path: abs(`${import.meta.env.BASE_URL}data.db`),
      accessMode: duckdb.DuckDBAccessMode.READ_ONLY,
    });

    return await db.connect();
  } catch (err) {
    worker.terminate();
    throw err;
  } finally {
    URL.revokeObjectURL(workerUrl);
  }
}
