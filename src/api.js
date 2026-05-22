/* src/api.js – simple wrapper around the Express API
   Uses a base URL so the code works both in development (with Vite proxy) and in production (same origin).
   The front‑end already uses relative URLs (e.g., '/api/data'), but having a central module makes it easier to maintain.
*/

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchData() {
  const res = await fetch(`${API_BASE}/api/data`);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

export async function createRecord(record) {
  const res = await fetch(`${API_BASE}/api/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error('Failed to create record');
  return res.json();
}

export async function bulkCreateRecords(records) {
  const res = await fetch(`${API_BASE}/api/records/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(records),
  });
  if (!res.ok) throw new Error('Failed to bulk create records');
  return res.json();
}

export async function resetMonth(month) {
  const res = await fetch(`${API_BASE}/api/records/reset/${month}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset month');
  return res.json();
}

export async function deleteMonth(month) {
  const res = await fetch(`${API_BASE}/api/records/month/${month}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete month');
  return res.json();
}

export async function createExpense(expense) {
  const res = await fetch(`${API_BASE}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete expense');
  return res.json();
}
