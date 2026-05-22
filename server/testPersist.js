import { upsertRecord, getAllData, initDb } from './db.js';

(async () => {
  await initDb();
  const rec = {
    birthdayMonth: '2026-05',
    birthdayFor: 'Test User',
    name: 'TestName',
    status: 'Paid',
    contribution: 123,
    birthDate: '',
    statusRemark: '',
    note: ''
  };
  const saved = await upsertRecord(rec);
  console.log('Inserted:', saved);
  const all = await getAllData();
  console.log('All records count:', all.records.length);
})();
