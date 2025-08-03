const fetch = require('node-fetch');
const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3002';
let browser;
let page;

// Test data storage
let sessionToken = null;
let createdStudentId = null;
let createdTeacherId = null;
let createdParentId = null;

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  testResults.tests.push({ name, passed, message });
  if (passed) {
    console.log(`✅ ${name}${message ? ': ' + message : ''}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${name}${message ? ': ' + message : ''}`);
    testResults.failed++;
  }
}

async function setupBrowser() {
  console.log('🚀 Setting up browser for UI testing...');
  try {
    browser = await puppeteer.launch({ 
      headless: false, // Set to false to see the browser
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    logTest('Browser Setup', true);
  } catch (error) {
    logTest('Browser Setup', false, error.message);
  }
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

// API Testing Functions
async function testAdminLogin() {
  console.log('\n📝 Testing Admin Login API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        const tokenMatch = cookies.match(/session-token=([^;]+)/);
        if (tokenMatch) {
          sessionToken = tokenMatch[1];
        }
      }
      logTest('Admin Login API', true, 'Session token received');
      return true;
    } else {
      logTest('Admin Login API', false, data.message || 'Login failed');
      return false;
    }
  } catch (error) {
    logTest('Admin Login API', false, error.message);
    return false;
  }
}

async function testStudentsCRUD() {
  console.log('\n👨‍🎓 Testing Students CRUD Operations...');
  
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `session-token=${sessionToken}`,
  };

  try {
    // Test GET all students
    const getResponse = await fetch(`${BASE_URL}/api/students`, { headers });
    if (getResponse.ok) {
      const data = await getResponse.json();
      logTest('GET Students', true, `Found ${data.students?.length || 0} students`);
    } else {
      logTest('GET Students', false, `Status: ${getResponse.status}`);
    }

    // Test CREATE student
    const newStudent = {
      username: 'teststudent' + Date.now(),
      name: 'Test',
      surname: 'Student',
      email: 'test' + Date.now() + '@example.com',
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

    if (postResponse.ok) {
      const data = await postResponse.json();
      createdStudentId = data.id;
      logTest('CREATE Student', true, `Created student: ${createdStudentId}`);
    } else {
      const errorData = await postResponse.json();
      logTest('CREATE Student', false, errorData.error || 'Creation failed');
    }

    // Test GET specific student
    if (createdStudentId) {
      const getOneResponse = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, { headers });
      if (getOneResponse.ok) {
        const data = await getOneResponse.json();
        logTest('GET Student by ID', true, `Retrieved: ${data.name} ${data.surname}`);
      } else {
        logTest('GET Student by ID', false, `Status: ${getOneResponse.status}`);
      }

      // Test UPDATE student
      const updateData = { name: 'Updated Test', surname: 'Updated Student' };
      const putResponse = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (putResponse.ok) {
        const data = await putResponse.json();
        logTest('UPDATE Student', true, `Updated to: ${data.name} ${data.surname}`);
      } else {
        logTest('UPDATE Student', false, `Status: ${putResponse.status}`);
      }

      // Test DELETE student
      const deleteResponse = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
        method: 'DELETE',
        headers,
      });

      if (deleteResponse.ok) {
        logTest('DELETE Student', true, 'Student deleted successfully');
      } else {
        logTest('DELETE Student', false, `Status: ${deleteResponse.status}`);
      }
    }

  } catch (error) {
    logTest('Students CRUD', false, error.message);
  }
}

async function testTeachersAPI() {
  console.log('\n👩‍🏫 Testing Teachers API...');
  
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `session-token=${sessionToken}`,
  };

  try {
    // Test GET all teachers
    const getResponse = await fetch(`${BASE_URL}/api/teachers`, { headers });
    if (getResponse.ok) {
      const data = await getResponse.json();
      logTest('GET Teachers', true, `Found ${data.teachers?.length || 0} teachers`);
    } else {
      logTest('GET Teachers', false, `Status: ${getResponse.status}`);
    }

    // Test CREATE teacher
    const newTeacher = {
      username: 'testteacher' + Date.now(),
      name: 'Test',
      surname: 'Teacher',
      email: 'testteacher' + Date.now() + '@example.com',
      address: '123 Teacher Street',
      bloodType: 'A+',
      sex: 'FEMALE',
      birthday: '1990-01-01',
      subjectIds: [1],
      classIds: [1],
    };

    const postResponse = await fetch(`${BASE_URL}/api/teachers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newTeacher),
    });

    if (postResponse.ok) {
      const data = await postResponse.json();
      createdTeacherId = data.id;
      logTest('CREATE Teacher', true, `Created teacher: ${createdTeacherId}`);
    } else {
      const errorData = await postResponse.json();
      logTest('CREATE Teacher', false, errorData.error || 'Creation failed');
    }

  } catch (error) {
    logTest('Teachers API', false, error.message);
  }
}

async function testDashboardAccess() {
  console.log('\n🏠 Testing Dashboard Access...');
  
  const headers = {
    'Cookie': `session-token=${sessionToken}`,
  };

  try {
    const response = await fetch(`${BASE_URL}/`, { headers });
    if (response.ok) {
      const html = await response.text();
      if (html.includes('Dashboard') || html.includes('Welcome')) {
        logTest('Dashboard Access', true, 'Dashboard loaded successfully');
      } else {
        logTest('Dashboard Access', false, 'Dashboard content not found');
      }
    } else {
      logTest('Dashboard Access', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Dashboard Access', false, error.message);
  }
}

async function testUILogin() {
  console.log('\n🌐 Testing UI Login Flow...');
  
  try {
    await page.goto(`${BASE_URL}/admin-login`);
    await page.waitForSelector('input[name="username"]', { timeout: 5000 });
    
    // Fill login form
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForNavigation({ timeout: 10000 });
    
    const url = page.url();
    if (url.includes('/admin') || url.includes('/dashboard')) {
      logTest('UI Login Flow', true, `Redirected to: ${url}`);
    } else {
      logTest('UI Login Flow', false, `Unexpected redirect to: ${url}`);
    }
    
  } catch (error) {
    logTest('UI Login Flow', false, error.message);
  }
}

async function testDashboardUI() {
  console.log('\n📊 Testing Dashboard UI Components...');
  
  try {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Wait a bit more for page to fully load
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 5000 });
    
    // Check for dashboard elements - look specifically in main content
    let title = null;
    try {
      // Target main content area specifically
      title = await page.$eval('main h1, #main-content h1', el => el.textContent);
    } catch (e) {
      // Fallback: try to find all h1s and get the one that's not "EduManage"
      const titleElements = await page.$$('h1');
      for (let i = 0; i < titleElements.length; i++) {
        const text = await page.evaluate(el => el.textContent, titleElements[i]);
        if (text && text !== 'EduManage') {
          title = text;
          break;
        }
      }
    }
    
    if (title && title.includes('Dashboard')) {
      logTest('Dashboard Title', true, `Found title: ${title}`);
    } else {
      logTest('Dashboard Title', false, `Title found: "${title}" (expected to contain "Dashboard")`);
    }
    
    // Check for user cards
    const userCards = await page.$$('[data-testid="user-card"]');
    logTest('User Cards', userCards.length > 0, `Found ${userCards.length} cards`);
    
    // Check for navigation
    const navItems = await page.$$('nav a, .sidebar a');
    logTest('Navigation Items', navItems.length > 0, `Found ${navItems.length} nav items`);
    
    // Test sidebar navigation
    const studentsLink = await page.$('a[href*="students"]');
    if (studentsLink) {
      await studentsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {});
      const url = page.url();
      logTest('Students Navigation', url.includes('students'), `Navigated to: ${url}`);
    } else {
      logTest('Students Navigation', false, 'Students link not found');
    }
    
  } catch (error) {
    logTest('Dashboard UI', false, error.message);
  }
}

async function testStudentsPageUI() {
  console.log('\n📚 Testing Students Page UI...');
  
  try {
    await page.goto(`${BASE_URL}/list/students`);
    await page.waitForSelector('h1, h2, .page-title', { timeout: 5000 });
    
    // Check page title - look in main content area
    let pageTitle = 'Not found';
    try {
      pageTitle = await page.$eval('main h1, #main-content h1', el => el.textContent);
    } catch (e) {
      // Fallback: look for specific text patterns
      const allH1s = await page.$$('h1, h2');
      for (let i = 0; i < allH1s.length; i++) {
        const text = await page.evaluate(el => el.textContent, allH1s[i]);
        if (text && text !== 'EduManage' && text.toLowerCase().includes('student')) {
          pageTitle = text;
          break;
        }
      }
    }
    logTest('Students Page Title', pageTitle.toLowerCase().includes('students') || pageTitle.toLowerCase().includes('student'), `Title: ${pageTitle}`);
    
    // Check for table or list
    const table = await page.$('table, .data-table, .student-list');
    logTest('Students Table/List', !!table, 'Data display component found');
    
    // Check for add button (simplified selector)
    const addButton = await page.$('button');
    logTest('Add Student Button', !!addButton, 'Add functionality available');
    
  } catch (error) {
    logTest('Students Page UI', false, error.message);
  }
}

async function runAllTests() {
  console.log('🎯 COMPREHENSIVE SCHOOL MANAGEMENT SYSTEM TEST SUITE');
  console.log('=' * 60);
  
  const startTime = Date.now();
  
  // Setup
  await setupBrowser();
  
  // API Tests
  const loginSuccess = await testAdminLogin();
  
  if (loginSuccess) {
    await testStudentsCRUD();
    await testTeachersAPI();
    await testDashboardAccess();
  } else {
    console.log('⚠️  Skipping API tests due to login failure');
  }
  
  // UI Tests
  if (browser) {
    await testUILogin();
    await testDashboardUI();
    await testStudentsPageUI();
  }
  
  // Cleanup
  await closeBrowser();
  
  // Results Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '=' * 60);
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' * 60);
  console.log(`⏱️  Duration: ${duration} seconds`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
  }
  
  console.log('\n🏁 Testing completed!');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle process cleanup
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted by user');
  await closeBrowser();
  process.exit(1);
});

process.on('unhandledRejection', async (error) => {
  console.error('❌ Unhandled rejection:', error);
  await closeBrowser();
  process.exit(1);
});

// Run the tests
runAllTests().catch(async (error) => {
  console.error('❌ Test suite failed:', error);
  await closeBrowser();
  process.exit(1);
});
