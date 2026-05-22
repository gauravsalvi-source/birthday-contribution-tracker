// server/models.js – initialise tables for PostgreSQL
import { query } from './postgres.js';

export async function initTables() {
  // records table
  await query(`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      birthdayMonth TEXT NOT NULL,
      birthdayDay INT NOT NULL,
      contribution NUMERIC,
      status TEXT,
      statusRemark TEXT,
      note TEXT
    )
  `);

  // expenses table (optional, linked to records)
  await query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      recordId INT REFERENCES records(id) ON DELETE CASCADE,
      amount NUMERIC,
      description TEXT,
      birthdayMonth TEXT NOT NULL
    )
  `);

  console.log('[DB] Tables ensured');
}

// Helper functions for CRUD – used by the API layer
export async function getAllData() {
  const recordsRes = await query('SELECT * FROM records');
  const expensesRes = await query('SELECT * FROM expenses');
  return { records: recordsRes.rows, expenses: expensesRes.rows };
}

export async function upsertRecord(record) {
  const { name, birthdayMonth, birthdayDay, contribution, status, statusRemark, note } = record;
  const result = await query(
    `INSERT INTO records (name, birthdayMonth, birthdayDay, contribution, status, statusRemark, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       birthdayMonth = EXCLUDED.birthdayMonth,
       birthdayDay = EXCLUDED.birthdayDay,
       contribution = EXCLUDED.contribution,
       status = EXCLUDED.status,
       statusRemark = EXCLUDED.statusRemark,
       note = EXCLUDED.note
     RETURNING *`,
    [name, birthdayMonth, birthdayDay, contribution, status, statusRemark, note]
  );
  return result.rows[0];
}

export async function bulkUpsertRecords(records) {
  const client = await (await import('pg')).Pool.prototype.connect.call({}); // placeholder – will be replaced by proper transaction handling later
  // For simplicity, we just iterate sequentially using upsertRecord
  const results = [];
  for (const rec of records) {
    const saved = await upsertRecord(rec);
    results.push(saved);
  }
  return results;
}

export async function deleteMonthData(month) {
  await query('DELETE FROM records WHERE birthdayMonth = ?', [month]);
  await query('DELETE FROM expenses WHERE birthdayMonth = ?', [month]);
}

export async function resetMonthData(month) {
  await query(`
    UPDATE records
    SET status = 'Pending', contribution = 0, statusRemark = '', note = ''
    WHERE birthdayMonth = ?
  `, [month]);
  await query('DELETE FROM expenses WHERE birthdayMonth = ?', [month]);
}

export async function upsertExpense(expense) {
  const { recordId, amount, description, birthdayMonth } = expense;
  const res = await query(
    `INSERT INTO expenses (recordId, amount, description, birthdayMonth)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (id) DO UPDATE SET
       amount = EXCLUDED.amount,
       description = EXCLUDED.description,
       birthdayMonth = EXCLUDED.birthdayMonth
     RETURNING *`,
    [recordId, amount, description, birthdayMonth]
  );
  return res.rows[0];
}

export async function deleteExpense(id) {
  await query('DELETE FROM expenses WHERE id = ?', [id]);
}
