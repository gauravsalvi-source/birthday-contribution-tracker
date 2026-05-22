const http = require('http');

const data = JSON.stringify({
  name: "Test User",
  birthdayMonth: "January",
  birthdayDay: 1,
  contribution: 100,
  status: "Pending",
  statusRemark: "",
  note: ""
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/records',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end();
