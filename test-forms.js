const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';

async function testForms() {
  console.log('🧪 Testing Form Functionality...\n');

  // Test 1: Check if subjects API is working
  console.log('1. Testing Subjects API...');
  try {
    const response = await fetch(`${BASE_URL}/api/subjects`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Subjects API working - Found', data.subjects?.length || 0, 'subjects');
    } else {
      console.log('❌ Subjects API failed - Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Subjects API error:', error.message);
  }

  // Test 2: Check if students API is working
  console.log('\n2. Testing Students API...');
  try {
    const response = await fetch(`${BASE_URL}/api/students`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Students API working - Found', data.students?.length || 0, 'students');
    } else {
      console.log('❌ Students API failed - Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Students API error:', error.message);
  }

  // Test 3: Check if teachers API is working
  console.log('\n3. Testing Teachers API...');
  try {
    const response = await fetch(`${BASE_URL}/api/teachers`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Teachers API working - Found', data.teachers?.length || 0, 'teachers');
    } else {
      console.log('❌ Teachers API failed - Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Teachers API error:', error.message);
  }

  // Test 4: Check if parents API is working
  console.log('\n4. Testing Parents API...');
  try {
    const response = await fetch(`${BASE_URL}/api/parents`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Parents API working - Found', data.parents?.length || 0, 'parents');
    } else {
      console.log('❌ Parents API failed - Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Parents API error:', error.message);
  }

  console.log('\n🏁 Form testing completed!');
}

testForms().catch(console.error); 