const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3002';

async function testLogin() {
  console.log('Testing admin login...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login successful');
      
      // Extract session token from set-cookie header
      const cookies = response.headers.get('set-cookie');
      let sessionToken = null;
      
      if (cookies) {
        const tokenMatch = cookies.match(/session-token=([^;]+)/);
        if (tokenMatch) {
          sessionToken = tokenMatch[1];
        }
      }
      
      return sessionToken;
    } else {
      console.log('❌ Admin login failed:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

async function testStudentsAPI(sessionToken) {
  console.log('\nTesting Students API...');
  
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `session-token=${sessionToken}`,
  };

  try {
    // Test GET /api/students
    console.log('Testing GET /api/students...');
    const getResponse = await fetch(`${BASE_URL}/api/students`, {
      method: 'GET',
      headers,
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET students successful');
      console.log(`Found ${data.students?.length || 0} students`);
    } else {
      console.log('❌ GET students failed:', getResponse.status, getResponse.statusText);
    }

    // Test POST /api/students (Create student)
    console.log('Testing POST /api/students...');
    const newStudent = {
      username: 'teststudent' + Date.now(),
      name: 'Test',
      surname: 'Student',
      email: 'test@example.com',
      address: '123 Test Street',
      bloodType: 'O+',
      sex: 'MALE',
      parentId: 'testparent',
      classId: 1,
      gradeId: 1,
      birthday: '2005-01-01',
    };

    const postResponse = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newStudent),
    });

    let createdStudentId = null;
    if (postResponse.ok) {
      const data = await postResponse.json();
      createdStudentId = data.id;
      console.log('✅ POST student successful');
      console.log('Created student ID:', createdStudentId);
    } else {
      const errorData = await postResponse.json();
      console.log('❌ POST student failed:', postResponse.status, errorData);
    }

    // Test GET /api/students/[id] (Get specific student)
    if (createdStudentId) {
      console.log('Testing GET /api/students/[id]...');
      const getOneResponse = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
        method: 'GET',
        headers,
      });

      if (getOneResponse.ok) {
        const data = await getOneResponse.json();
        console.log('✅ GET student by ID successful');
        console.log('Student name:', data.name, data.surname);
      } else {
        console.log('❌ GET student by ID failed:', getOneResponse.status);
      }

      // Test PUT /api/students/[id] (Update student)
      console.log('Testing PUT /api/students/[id]...');
      const updateData = {
        name: 'Updated Test',
        surname: 'Updated Student',
      };

      const putResponse = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (putResponse.ok) {
        const data = await putResponse.json();
        console.log('✅ PUT student successful');
        console.log('Updated student name:', data.name, data.surname);
      } else {
        const errorData = await putResponse.json();
        console.log('❌ PUT student failed:', putResponse.status, errorData);
      }

      // Test DELETE /api/students/[id] (Delete student)
      console.log('Testing DELETE /api/students/[id]...');
      const deleteResponse = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
        method: 'DELETE',
        headers,
      });

      if (deleteResponse.ok) {
        const data = await deleteResponse.json();
        console.log('✅ DELETE student successful');
        console.log('Delete message:', data.message);
      } else {
        const errorData = await deleteResponse.json();
        console.log('❌ DELETE student failed:', deleteResponse.status, errorData);
      }
    }

  } catch (error) {
    console.log('❌ Students API test error:', error.message);
  }
}

async function testFullCRUD() {
  console.log('🚀 Starting CRUD Operations Test\n');
  
  // Test login first
  const sessionToken = await testLogin();
  
  if (!sessionToken) {
    console.log('❌ Cannot proceed without session token');
    return;
  }
  
  // Test Students API
  await testStudentsAPI(sessionToken);
  
  console.log('\n🏁 CRUD test completed!');
}

// Run the test
testFullCRUD().catch(console.error);
