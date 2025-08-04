const fetch = require('node-fetch');

async function testPrisma() {
  console.log('Testing Prisma connection...');
  
  try {
    const response = await fetch('http://localhost:3002/api/test');
    console.log('Response status:', response.status);
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ Prisma connection working:', data);
    } else {
      console.log('❌ Prisma connection failed');
    }
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testPrisma(); 