import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  initDb, 
  getAllData, 
  upsertRecord, 
  bulkUpsertRecords, 
  deleteMonthData, 
  resetMonthData, 
  upsertExpense, 
  deleteExpense 
} from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support larger payloads for CSV import

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// GET /api/data
app.get('/api/data', async (req, res) => {
  try {
    const data = await getAllData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

// POST /api/records
app.post('/api/records', async (req, res) => {
  try {
    const record = req.body;
    const result = await upsertRecord(record);
    res.json(result);
  } catch (error) {
    console.error('Error saving record:', error);
    res.status(500).json({ error: 'Failed to save record' });
  }
});

// POST /api/records/bulk
app.post('/api/records/bulk', async (req, res) => {
  try {
    const records = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid payload, expected array' });
    }
    const results = await bulkUpsertRecords(records);
    res.json(results);
  } catch (error) {
    console.error('Error bulk saving records:', error);
    res.status(500).json({ error: 'Failed to bulk save records' });
  }
});

// POST /api/records/reset/:month
app.post('/api/records/reset/:month', async (req, res) => {
  try {
    const { month } = req.params;
    await resetMonthData(month);
    res.json({ success: true, message: `Reset contributions and deleted expenses for month: ${month}` });
  } catch (error) {
    console.error('Error resetting month:', error);
    res.status(500).json({ error: 'Failed to reset month data' });
  }
});

// DELETE /api/records/month/:month
app.delete('/api/records/month/:month', async (req, res) => {
  try {
    const { month } = req.params;
    await deleteMonthData(month);
    res.json({ success: true, message: `Deleted records and expenses for month: ${month}` });
  } catch (error) {
    console.error('Error deleting month:', error);
    res.status(500).json({ error: 'Failed to delete month' });
  }
});

// POST /api/expenses
app.post('/api/expenses', async (req, res) => {
  try {
    const expense = req.body;
    const result = await upsertExpense(expense);
    res.json(result);
  } catch (error) {
    console.error('Error saving expense:', error);
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

// DELETE /api/expenses/:id
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteExpense(id);
    res.json({ success: true, message: `Deleted expense: ${id}` });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

// Serve static assets from Vite's build directory if they exist
app.use(express.static(distPath));

// Fallback all other client requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialize database and start the server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
