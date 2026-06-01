const http = require('http');

const data = JSON.stringify({
  name: "test",
  slug: "test-slug",
  address: "test address",
  categoryId: "non-existent"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/culinary',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('RESPONSE:', res.statusCode, body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
