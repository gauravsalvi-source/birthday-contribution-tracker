import sqlite3 from 'sqlite3';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPostgres = !!process.env.DATABASE_URL;

let pgPool = null;
let sqliteDb = null;

if (isPostgres) {
  console.log('Connecting to PostgreSQL database...');
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for hosted Postgres databases like Neon/Supabase/Render
    },
  });
} else {
  console.log('Connecting to SQLite local database...');
  const dbDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'birthday.db');
  sqliteDb = new sqlite3.Database(dbPath);
}

// Helper to translate SQLite '?' placeholders to Postgres '$1', '$2', ... placeholders
function translateSql(sql) {
  if (!isPostgres) return sql;
  let index = 1;
  let translated = sql;
  while (translated.includes('?')) {
    translated = translated.replace('?', `$${index}`);
    index++;
  }
  return translated;
}

// Helper wrappers for Promise-based queries
const dbRun = async (sql, params = []) => {
  const querySql = translateSql(sql);
  if (isPostgres) {
    await pgPool.query(querySql, params);
    return { changes: 1 };
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }
};

const dbAll = async (sql, params = []) => {
  const querySql = translateSql(sql);
  if (isPostgres) {
    const res = await pgPool.query(querySql, params);
    return res.rows;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

const dbGet = async (sql, params = []) => {
  const querySql = translateSql(sql);
  if (isPostgres) {
    const res = await pgPool.query(querySql, params);
    return res.rows[0] || null;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

// Initialize Database Schema and Seed Data
export const initDb = async () => {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      birthdayMonth TEXT NOT NULL,
      birthdayFor TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      contribution REAL NOT NULL,
      birthDate TEXT,
      statusRemark TEXT,
      note TEXT
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      birthdayMonth TEXT NOT NULL,
      birthdayFor TEXT NOT NULL,
      item TEXT NOT NULL,
      amount REAL NOT NULL
    )
  `);

  // Seed default records if empty
  const recordCount = await dbGet('SELECT COUNT(*) as count FROM records');
  if (recordCount && Number(recordCount.count) === 0) {
    const defaultBirthdayMonth = '2026-05';
    const defaultBirthdayFor = 'Sumit, Lalit & Bhakti';

    const defaultRecords = [
      { id: '1', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Gaurav', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '2', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Pawan', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '3', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Nehal', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '4', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sangeeta', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '5', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Bhakti', status: 'Exempted', contribution: 0, birthDate: '', statusRemark: 'Birthday Employee', note: '' },
      { id: '6', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Riddhi', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '7', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Mohammed', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '8', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Mane', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '9', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Aniket', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '10', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Ishwar', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '11', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Samiran', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '12', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sumit', status: 'Exempted', contribution: 0, birthDate: '', statusRemark: 'Birthday Employee', note: '' },
      { id: '13', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Lalit', status: 'Exempted', contribution: 0, birthDate: '', statusRemark: 'Birthday Employee', note: '' },
      { id: '14', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Juhee', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '15', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Rupali', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '16', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Rushab', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '17', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Ankit', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '18', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sayali', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '19', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Prathamesh', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '20', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Sweta', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' },
      { id: '21', birthdayMonth: defaultBirthdayMonth, birthdayFor: defaultBirthdayFor, name: 'Shivam', status: 'Paid', contribution: 100, birthDate: '', statusRemark: '', note: '' }
    ];

    for (const record of defaultRecords) {
      await dbRun(
        `INSERT INTO records (id, birthdayMonth, birthdayFor, name, status, contribution, birthDate, statusRemark, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.birthdayMonth,
          record.birthdayFor,
          record.name,
          record.status,
          record.contribution,
          record.birthDate || '',
          record.statusRemark || '',
          record.note || ''
        ]
      );
    }
    console.log('Seeded default contributor records successfully.');
  }

  // Seed default expenses if empty
  const expenseCount = await dbGet('SELECT COUNT(*) as count FROM expenses');
  if (expenseCount && Number(expenseCount.count) === 0) {
    const defaultBirthdayMonth = '2026-05';
    const defaultBirthdayFor = 'Sumit, Lalit & Bhakti';
    await dbRun(
      `INSERT INTO expenses (id, birthdayMonth, birthdayFor, item, amount)
       VALUES (?, ?, ?, ?, ?)`,
      ['e1', defaultBirthdayMonth, defaultBirthdayFor, 'Cake & Sevpuri', 1301]
    );
    console.log('Seeded default expenses successfully.');
  }
};

// Data Access Methods
export const getAllData = async () => {
  const records = await dbAll('SELECT * FROM records');
  const expenses = await dbAll('SELECT * FROM expenses');
  return { records, expenses };
};

export const upsertRecord = async (record) => {
  const id = record.id || crypto.randomUUID();
  await dbRun(
    `INSERT INTO records (id, birthdayMonth, birthdayFor, name, status, contribution, birthDate, statusRemark, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       birthdayMonth = excluded.birthdayMonth,
       birthdayFor = excluded.birthdayFor,
       name = excluded.name,
       status = excluded.status,
       contribution = excluded.contribution,
       birthDate = excluded.birthDate,
       statusRemark = excluded.statusRemark,
       note = excluded.note`,
    [
      id,
      record.birthdayMonth,
      record.birthdayFor,
      record.name,
      record.status,
      record.contribution,
      record.birthDate || '',
      record.statusRemark || '',
      record.note || ''
    ]
  );
  return { ...record, id };
};

export const bulkUpsertRecords = async (recordsList) => {
  const results = [];
  
  if (isPostgres) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const query = `
        INSERT INTO records (id, birthdayMonth, birthdayFor, name, status, contribution, birthDate, statusRemark, note)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT(id) DO UPDATE SET
          birthdayMonth = EXCLUDED.birthdayMonth,
          birthdayFor = EXCLUDED.birthdayFor,
          name = EXCLUDED.name,
          status = EXCLUDED.status,
          contribution = EXCLUDED.contribution,
          birthDate = EXCLUDED.birthDate,
          statusRemark = EXCLUDED.statusRemark,
          note = EXCLUDED.note
      `;
      for (const r of recordsList) {
        const id = r.id || crypto.randomUUID();
        const params = [
          id,
          r.birthdayMonth,
          r.birthdayFor,
          r.name,
          r.status,
          r.contribution,
          r.birthDate || '',
          r.statusRemark || '',
          r.note || ''
        ];
        await client.query(query, params);
        results.push({ ...r, id });
      }
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else {
    // SQLite version
    await dbRun('BEGIN TRANSACTION');
    try {
      const query = `
        INSERT INTO records (id, birthdayMonth, birthdayFor, name, status, contribution, birthDate, statusRemark, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          birthdayMonth = excluded.birthdayMonth,
          birthdayFor = excluded.birthdayFor,
          name = excluded.name,
          status = excluded.status,
          contribution = excluded.contribution,
          birthDate = excluded.birthDate,
          statusRemark = excluded.statusRemark,
          note = excluded.note
      `;
      for (const r of recordsList) {
        const id = r.id || crypto.randomUUID();
        const params = [
          id,
          r.birthdayMonth,
          r.birthdayFor,
          r.name,
          r.status,
          r.contribution,
          r.birthDate || '',
          r.statusRemark || '',
          r.note || ''
        ];
        await dbRun(query, params);
        results.push({ ...r, id });
      }
      await dbRun('COMMIT');
      return results;
    } catch (error) {
      await dbRun('ROLLBACK');
      throw error;
    }
  }
};

export const deleteMonthData = async (month) => {
  await dbRun('DELETE FROM records WHERE birthdayMonth = ?', [month]);
  await dbRun('DELETE FROM expenses WHERE birthdayMonth = ?', [month]);
};

export const resetMonthData = async (month) => {
  await dbRun(
    `UPDATE records 
     SET status = 'Pending', contribution = 0, statusRemark = '', note = '' 
     WHERE birthdayMonth = ?`,
    [month]
  );
  await dbRun('DELETE FROM expenses WHERE birthdayMonth = ?', [month]);
};

export const upsertExpense = async (expense) => {
  const id = expense.id || crypto.randomUUID();
  await dbRun(
    `INSERT INTO expenses (id, birthdayMonth, birthdayFor, item, amount)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       birthdayMonth = excluded.birthdayMonth,
       birthdayFor = excluded.birthdayFor,
       item = excluded.item,
       amount = excluded.amount`,
    [
      id,
      expense.birthdayMonth,
      expense.birthdayFor,
      expense.item,
      expense.amount
    ]
  );
  return { ...expense, id };
};

export const deleteExpense = async (id) => {
  await dbRun('DELETE FROM expenses WHERE id = ?', [id]);
};
