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
  const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    mvp: {
      mainModule: '/duckdb/duckdb-mvp.wasm',
      mainWorker: '/duckdb/duckdb-browser-mvp.worker.js',
    },
    eh: {
      mainModule: '/duckdb/duckdb-eh.wasm',
      mainWorker: '/duckdb/duckdb-browser-eh.worker.js',
    },
  };

  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  const abs = (path: string) => new URL(path, location.href).href;
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${abs(bundle.mainWorker!)}");`], {
      type: 'text/javascript',
    }),
  );
  const worker = new Worker(workerUrl);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);

  await db.instantiate(abs(bundle.mainModule), bundle.pthreadWorker ? abs(bundle.pthreadWorker) : undefined);
  URL.revokeObjectURL(workerUrl);

  await db.open({
    path: abs('/data.db'),
    accessMode: duckdb.DuckDBAccessMode.READ_ONLY,
  });

  return db.connect();
}
