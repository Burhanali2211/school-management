#!/usr/bin/env node

const fetch = require('node-fetch');

async function testLogin() {
  console.log('🧪 Testing login functionality...\n');

  const testCredentials = [
    { username: 'admin1', password: 'admin123', userType: 'ADMIN' },
    { username: 'teacher1', password: 'teacher1123', userType: 'TEACHER' },
    { username: 'student1', password: 'student1123', userType: 'STUDENT' },
    { username: 'parent1', password: 'parent1123', userType: 'PARENT' },
  ];

  for (const creds of testCredentials) {
    try {
      console.log(`🔐 Testing ${creds.userType} login (${creds.username})...`);
      
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creds),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${creds.userType} login successful!`);
        console.log(`   User: ${data.user.name || data.user.username}`);
        console.log(`   Type: ${data.user.userType}`);
      } else {
        console.log(`❌ ${creds.userType} login failed: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ ${creds.userType} login error: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎉 Login test completed!');
  console.log('\n📝 To access the application:');
  console.log('   1. Open: http://localhost:3001');
  console.log('   2. Use any of the credentials above');
  console.log('   3. Enjoy your fully functional School Management System!');
}

testLogin().catch(console.error);