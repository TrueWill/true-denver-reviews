import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  instantiate: vi.fn(),
  open: vi.fn(),
  connect: vi.fn(),
  terminate: vi.fn(),
}));

vi.mock('@duckdb/duckdb-wasm', () => ({
  getJsDelivrBundles: () => ({}),
  selectBundle: async () => ({
    mainModule: 'https://cdn.example/duckdb-eh.wasm',
    mainWorker: 'https://cdn.example/duckdb-browser-eh.worker.js',
    pthreadWorker: null,
  }),
  ConsoleLogger: class {},
  LogLevel: { WARNING: 2 },
  DuckDBAccessMode: { READ_ONLY: 1 },
  AsyncDuckDB: class {
    instantiate = mocks.instantiate;
    open = mocks.open;
    connect = mocks.connect;
  },
}));

class FakeWorker {
  terminate = mocks.terminate;
}

const fakeConn = { query: vi.fn() };

async function loadClient() {
  vi.resetModules();
  return import('../client');
}

beforeEach(() => {
  vi.stubGlobal('Worker', FakeWorker);
  URL.createObjectURL = vi.fn(() => 'blob:duckdb-worker');
  URL.revokeObjectURL = vi.fn();
  mocks.instantiate.mockReset().mockResolvedValue(undefined);
  mocks.open.mockReset().mockResolvedValue(undefined);
  mocks.connect.mockReset().mockResolvedValue(fakeConn);
  mocks.terminate.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getConnection', () => {
  it('opens data.db read-only under the base URL and returns the connection', async () => {
    const { getConnection } = await loadClient();

    await expect(getConnection()).resolves.toBe(fakeConn);

    expect(mocks.open).toHaveBeenCalledWith({
      path: new URL('/data.db', location.href).href,
      accessMode: 1,
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:duckdb-worker');
    expect(mocks.terminate).not.toHaveBeenCalled();
  });

  it('initializes only once across calls', async () => {
    const { getConnection } = await loadClient();

    const [first, second] = await Promise.all([
      getConnection(),
      getConnection(),
    ]);

    expect(first).toBe(second);
    expect(mocks.instantiate).toHaveBeenCalledTimes(1);
  });

  it('terminates the worker and revokes the blob URL when init fails', async () => {
    const failure = new Error('instantiate failed');
    mocks.instantiate.mockRejectedValue(failure);
    const { getConnection } = await loadClient();

    await expect(getConnection()).rejects.toBe(failure);

    expect(mocks.terminate).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:duckdb-worker');
    expect(mocks.open).not.toHaveBeenCalled();
  });

  it('terminates the worker when opening the database fails', async () => {
    mocks.open.mockRejectedValue(new Error('data.db not found'));
    const { getConnection } = await loadClient();

    await expect(getConnection()).rejects.toThrow('data.db not found');

    expect(mocks.terminate).toHaveBeenCalledTimes(1);
  });
});
