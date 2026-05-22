// server/server.js – fresh backend entry point
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './api.js';
import { initTables } from './models.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Register API routes BEFORE static assets
app.use('/api', apiRouter);

// Serve frontend assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// DB info endpoint (still useful)
app.get('/api/dbinfo', (req, res) => {
  const isPostgres = !!process.env.DATABASE_URL;
  console.log('🗄️ Database mode:', isPostgres ? 'PostgreSQL' : 'SQLite');
  console.log('📦 DATABASE_URL:', process.env.DATABASE_URL || 'none');
  res.json({ isPostgres, databaseUrl: process.env.DATABASE_URL || null });
});

// Catch‑all route for SPA
app.get('*', (req, res) => {
  const indexFile = path.join(distPath, 'index.html');
  console.log('📄 Serving fallback index.html for', req.path);
  res.sendFile(indexFile);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialise DB and start server
initTables()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialise DB:', err);
    process.exit(1);
  });
