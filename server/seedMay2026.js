// seedMay2026.js – inserts the May 2026 team records into the DB
// Run with: node server/seedMay2026.js
import { bulkUpsertRecords } from './db.js';
import crypto from 'crypto';

const defaultBirthdayFor = 'Sumit, Lalit & Bhakti';

const mayRecords = [
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Aniket', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Ankit', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Bhakti', status: 'Exempted', contribution: 0 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Gaurav', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Ishwar', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Juhee', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Lalit', status: 'Exempted', contribution: 0 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Mane', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Mohammed', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Nehal', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Pawan', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Prathamesh', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Riddhi', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Rupali', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Rushab', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Samiran', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Sangeeta', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Sayali', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Shivam', status: 'Paid', contribution: 100 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Sumit', status: 'Exempted', contribution: 0 },
  { birthdayMonth: '2026-05', birthdayFor: defaultBirthdayFor, name: 'Sweta', status: 'Paid', contribution: 100 },
];

(async () => {
  try {
    const results = await bulkUpsertRecords(mayRecords);
    console.log('Inserted records:', results.length);
    process.exit(0);
  } catch (err) {
    console.error('Error inserting May records:', err);
    process.exit(1);
  }
})();
