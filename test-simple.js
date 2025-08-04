const fetch = require('node-fetch');

async function testStudentsAPI() {
  console.log('Testing Students API directly...');
  
  try {
    const response = await fetch('http://localhost:3002/api/students');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ Students API working - Found', data.students?.length || 0, 'students');
    } else {
      console.log('❌ Students API failed');
    }
  } catch (error) {
    console.log('❌ Students API error:', error.message);
  }
}

testStudentsAPI(); 