// server/api.js – defines Express routes for the birthday contribution tracker
import express from 'express';
import {
  getAllData,
  upsertRecord,
  bulkUpsertRecords,
  deleteMonthData,
  resetMonthData,
  upsertExpense,
  deleteExpense
} from './models.js';

const router = express.Router();

// GET /api/data – return all records and expenses
router.get('/data', async (req, res) => {
  try {
    const data = await getAllData();
    res.json(data);
  } catch (err) {
    console.error('GET /api/data error:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// POST /api/records – create or update a single record
router.post('/records', async (req, res) => {
  try {
    const saved = await upsertRecord(req.body);
    res.json(saved);
  } catch (err) {
    console.error('POST /api/records error:', err);
    res.status(500).json({ error: 'Failed to save record' });
  }
});

// POST /api/records/bulk – bulk upsert (optional, not used by UI)
router.post('/records/bulk', async (req, res) => {
  try {
    const results = await bulkUpsertRecords(req.body);
    res.json(results);
  } catch (err) {
    console.error('POST /api/records/bulk error:', err);
    res.status(500).json({ error: 'Bulk upsert failed' });
  }
});

// DELETE /api/records/month/:month – delete all data for a month
router.delete('/records/month/:month', async (req, res) => {
  try {
    await deleteMonthData(req.params.month);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE month error:', err);
    res.status(500).json({ error: 'Failed to delete month data' });
  }
});

// POST /api/records/reset/:month – reset month (clear contributions & expenses)
router.post('/records/reset/:month', async (req, res) => {
  try {
    await resetMonthData(req.params.month);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST reset month error:', err);
    res.status(500).json({ error: 'Failed to reset month' });
  }
});

// POST /api/expenses – create or update an expense
router.post('/expenses', async (req, res) => {
  try {
    const saved = await upsertExpense(req.body);
    res.json(saved);
  } catch (err) {
    console.error('POST /api/expenses error:', err);
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

// DELETE /api/expenses/:id – delete an expense record
router.delete('/expenses/:id', async (req, res) => {
  try {
    await deleteExpense(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/expenses error:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
