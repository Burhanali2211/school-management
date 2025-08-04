const https = require('https');
const http = require('http');

// Test the login API
async function testLogin() {
  console.log('🧪 Testing Login API...\n');

  const data = JSON.stringify({
    username: 'admin1',
    password: 'admin123',
    userType: 'ADMIN'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('\nResponse Body:');
      console.log(responseData);
      
      try {
        const parsed = JSON.parse(responseData);
        console.log('\nParsed Response:');
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request Error:', error);
  });

  req.write(data);
  req.end();
}

testLogin(); 