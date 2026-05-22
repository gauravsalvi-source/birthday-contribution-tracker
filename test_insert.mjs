import fetch from 'node-fetch';

const payload = {
  name: "Test User",
  birthdayMonth: "January",
  birthdayDay: 1,
  contribution: 100,
  status: "Pending",
  statusRemark: "",
  note: ""
};

try {
  const response = await fetch('http://localhost:5000/api/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', body);
} catch (err) {
  console.error('Error:', err);
}
