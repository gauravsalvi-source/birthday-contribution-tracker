import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * Convert a SQL query that uses `?` placeholders into PostgreSQL `$1,$2,…` syntax.
 * Returns an object with the transformed text and the original params array.
 */
function toPg(sql, params) {
  let idx = 0;
  const text = sql.replace(/\?/g, () => `$${++idx}`);
  return { text, params };
}

export async function query(sql, params = []) {
  const { text, params: pgParams } = toPg(sql, params);
  try {
    const result = await pool.query(text, pgParams);
    return result;
  } catch (err) {
    console.error('[DB‑ERR] Query failed:', err);
    throw err;
  }
}

export async function closePool() {
  await pool.end();
}
