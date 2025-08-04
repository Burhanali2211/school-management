/**
 * Comprehensive End-to-End Test Suite for Teacher Management System
 * Tests all CRUD operations, authentication, validation, and interactive elements
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:3002/api';
const TEST_CONFIG = {
  adminCredentials: {
    username: 'admin',
    password: 'admin123'
  },
  teacherCredentials: {
    username: 'teacher1',
    password: 'teacher1123'
  }
};

// Test data
const testTeacher = {
  username: `testteacher_${Date.now()}`,
  name: 'Test',
  surname: 'Teacher',
  email: `test.teacher.${Date.now()}@example.com`,
  phone: '+1234567890',
  address: '123 Test Street, Test City, TC 12345',
  bloodType: 'A+',
  sex: 'MALE',
  birthday: '1990-01-01',
  subjectIds: [],
  classIds: []
};

const updateTeacherData = {
  name: 'Updated Test',
  surname: 'Teacher Updated',
  email: `updated.teacher.${Date.now()}@example.com`,
  phone: '+0987654321',
  address: '456 Updated Avenue, Updated City, UC 54321',
  bloodType: 'B+',
  sex: 'FEMALE'
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// HTTP client with cookie support
let sessionCookies = '';

const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  validateStatus: () => true // Don't throw on non-2xx status codes
});

// Add cookie support
httpClient.interceptors.request.use(config => {
  if (sessionCookies) {
    config.headers.Cookie = sessionCookies;
  }
  return config;
});

httpClient.interceptors.response.use(response => {
  if (response.headers['set-cookie']) {
    sessionCookies = response.headers['set-cookie'].join('; ');
  }
  return response;
});

// Test utilities
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    console.log(`✅ PASS: ${message}`);
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    console.log(`❌ FAIL: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  const condition = actual === expected;
  if (!condition) {
    const errorMsg = `${message} (expected: ${expected}, actual: ${actual})`;
    testResults.errors.push(errorMsg);
  }
  assert(condition, message);
}

function assertResponseStatus(response, expectedStatus, operation) {
  assertEqual(response.status, expectedStatus, `${operation} should return status ${expectedStatus}`);
}

function assertValidationError(response, operation) {
  assert(response.status === 400, `${operation} should return validation error (400)`);
  assert(response.data.error, `${operation} should return error message`);
}

function assertAuthError(response, operation) {
  assert(response.status === 403 || response.status === 401, `${operation} should return auth error`);
}

// Test functions
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  // Test admin login
  const adminLogin = await httpClient.post('/auth/login', TEST_CONFIG.adminCredentials);
  assertResponseStatus(adminLogin, 200, 'Admin login');
  
  if (adminLogin.status === 200) {
    assert(adminLogin.data.user, 'Admin login should return user data');
    assert(adminLogin.data.user.userType === 'ADMIN', 'Admin login should return admin user type');
  }
}

async function testTeacherCRUD() {
  console.log('\n👨‍🏫 Testing Teacher CRUD Operations...');
  
  let createdTeacherId = null;
  
  // Test CREATE
  console.log('\n📝 Testing Teacher Creation...');
  const createResponse = await httpClient.post('/teachers', testTeacher);
  assertResponseStatus(createResponse, 201, 'Create teacher');
  
  if (createResponse.status === 201) {
    createdTeacherId = createResponse.data.id;
    assert(createResponse.data.username === testTeacher.username, 'Created teacher should have correct username');
    assert(createResponse.data.name === testTeacher.name, 'Created teacher should have correct name');
    assert(createResponse.data.email === testTeacher.email, 'Created teacher should have correct email');
  }
  
  // Test duplicate username
  const duplicateResponse = await httpClient.post('/teachers', testTeacher);
  assertResponseStatus(duplicateResponse, 400, 'Create teacher with duplicate username');
  
  // Test validation errors
  const invalidTeacher = { ...testTeacher, email: 'invalid-email' };
  delete invalidTeacher.name; // Remove required field
  const validationResponse = await httpClient.post('/teachers', invalidTeacher);
  assertValidationError(validationResponse, 'Create teacher with invalid data');
  
  // Test READ (Get all teachers)
  console.log('\n📖 Testing Teacher Retrieval...');
  const getAllResponse = await httpClient.get('/teachers');
  assertResponseStatus(getAllResponse, 200, 'Get all teachers');
  
  if (getAllResponse.status === 200) {
    assert(Array.isArray(getAllResponse.data.teachers), 'Get all teachers should return array');
    assert(getAllResponse.data.pagination, 'Get all teachers should return pagination info');
    
    // Test search
    const searchResponse = await httpClient.get(`/teachers?search=${testTeacher.name}`);
    assertResponseStatus(searchResponse, 200, 'Search teachers');
    
    // Test pagination
    const paginationResponse = await httpClient.get('/teachers?page=1&limit=5');
    assertResponseStatus(paginationResponse, 200, 'Get teachers with pagination');
  }
  
  // Test READ (Get single teacher)
  if (createdTeacherId) {
    const getOneResponse = await httpClient.get(`/teachers/${createdTeacherId}`);
    assertResponseStatus(getOneResponse, 200, 'Get single teacher');
    
    if (getOneResponse.status === 200) {
      assert(getOneResponse.data.id === createdTeacherId, 'Single teacher should have correct ID');
      assert(getOneResponse.data.statistics, 'Single teacher should include statistics');
    }
  }
  
  // Test UPDATE
  console.log('\n✏️ Testing Teacher Update...');
  if (createdTeacherId) {
    const updateResponse = await httpClient.put(`/teachers/${createdTeacherId}`, updateTeacherData);
    assertResponseStatus(updateResponse, 200, 'Update teacher');
    
    if (updateResponse.status === 200) {
      assert(updateResponse.data.name === updateTeacherData.name, 'Updated teacher should have new name');
      assert(updateResponse.data.email === updateTeacherData.email, 'Updated teacher should have new email');
    }
    
    // Test update with duplicate email
    const anotherTeacher = {
      ...testTeacher,
      username: `another_${Date.now()}`,
      email: `another.${Date.now()}@example.com`
    };
    const anotherCreateResponse = await httpClient.post('/teachers', anotherTeacher);
    
    if (anotherCreateResponse.status === 201) {
      const duplicateEmailUpdate = await httpClient.put(
        `/teachers/${createdTeacherId}`, 
        { email: anotherTeacher.email }
      );
      assertResponseStatus(duplicateEmailUpdate, 400, 'Update teacher with duplicate email');
    }
  }
  
  // Test DELETE validation (with dependencies)
  console.log('\n🗑️ Testing Teacher Deletion...');
  if (createdTeacherId) {
    const deleteResponse = await httpClient.delete(`/teachers/${createdTeacherId}`);
    // Should succeed since our test teacher has no dependencies
    assertResponseStatus(deleteResponse, 200, 'Delete teacher');
    
    // Verify teacher is deleted
    const getDeletedResponse = await httpClient.get(`/teachers/${createdTeacherId}`);
    assertResponseStatus(getDeletedResponse, 404, 'Get deleted teacher');
  }
}

async function testBatchOperations() {
  console.log('\n📦 Testing Batch Operations...');
  
  // Test batch create
  const batchTeachers = [
    {
      ...testTeacher,
      username: `batch1_${Date.now()}`,
      email: `batch1.${Date.now()}@example.com`
    },
    {
      ...testTeacher,
      username: `batch2_${Date.now()}`,
      email: `batch2.${Date.now()}@example.com`
    },
    {
      ...testTeacher,
      username: `batch3_${Date.now()}`,
      email: `batch3.${Date.now()}@example.com`
    }
  ];
  
  const batchCreateResponse = await httpClient.post('/teachers', batchTeachers);
  assertResponseStatus(batchCreateResponse, 200, 'Batch create teachers');
  
  if (batchCreateResponse.status === 200) {
    assert(batchCreateResponse.data.results.created.length === 3, 'Batch create should create 3 teachers');
    assert(batchCreateResponse.data.results.errors.length === 0, 'Batch create should have no errors');
    
    // Test batch delete
    const createdIds = batchCreateResponse.data.results.created.map(t => t.id);
    const batchDeleteResponse = await httpClient.delete(`/teachers?ids=${createdIds.join(',')}`);
    assertResponseStatus(batchDeleteResponse, 200, 'Batch delete teachers');
    
    if (batchDeleteResponse.status === 200) {
      assert(batchDeleteResponse.data.results.deleted.length === 3, 'Batch delete should delete 3 teachers');
    }
  }
}

async function testStatistics() {
  console.log('\n📊 Testing Statistics API...');
  
  const statsResponse = await httpClient.get('/teachers/stats');
  assertResponseStatus(statsResponse, 200, 'Get teacher statistics');
  
  if (statsResponse.status === 200) {
    const stats = statsResponse.data;
    assert(stats.overview, 'Statistics should include overview');
    assert(stats.demographics, 'Statistics should include demographics');
    assert(stats.distribution, 'Statistics should include distribution');
    assert(stats.topPerformers, 'Statistics should include top performers');
    assert(stats.recent, 'Statistics should include recent data');
    assert(stats.trends, 'Statistics should include trends');
    
    // Test different periods
    const weeklyStats = await httpClient.get('/teachers/stats?period=week');
    assertResponseStatus(weeklyStats, 200, 'Get weekly statistics');
    
    const yearlyStats = await httpClient.get('/teachers/stats?period=year');
    assertResponseStatus(yearlyStats, 200, 'Get yearly statistics');
  }
}

async function testAuthorization() {
  console.log('\n🔒 Testing Authorization...');
  
  // Test without authentication
  sessionCookies = ''; // Clear session
  const unauthorizedResponse = await httpClient.post('/teachers', testTeacher);
  assertAuthError(unauthorizedResponse, 'Create teacher without auth');
  
  // Test with teacher credentials (should not be able to create)
  const teacherLogin = await httpClient.post('/auth/login', TEST_CONFIG.teacherCredentials);
  if (teacherLogin.status === 200) {
    const teacherCreateResponse = await httpClient.post('/teachers', testTeacher);
    assertAuthError(teacherCreateResponse, 'Teacher create teacher (should fail)');
    
    // Teachers should be able to read
    const teacherReadResponse = await httpClient.get('/teachers');
    assertResponseStatus(teacherReadResponse, 200, 'Teacher read teachers');
  }
  
  // Re-authenticate as admin for remaining tests
  await httpClient.post('/auth/login', TEST_CONFIG.adminCredentials);
}

async function testValidation() {
  console.log('\n✅ Testing Data Validation...');
  
  // Test missing required fields
  const missingFieldsTests = [
    { field: 'username', data: { ...testTeacher }, delete: 'username' },
    { field: 'name', data: { ...testTeacher }, delete: 'name' },
    { field: 'surname', data: { ...testTeacher }, delete: 'surname' },
    { field: 'address', data: { ...testTeacher }, delete: 'address' },
    { field: 'bloodType', data: { ...testTeacher }, delete: 'bloodType' },
    { field: 'sex', data: { ...testTeacher }, delete: 'sex' },
    { field: 'birthday', data: { ...testTeacher }, delete: 'birthday' }
  ];
  
  for (const test of missingFieldsTests) {
    const testData = { ...test.data };
    delete testData[test.delete];
    testData.username = `test_${Date.now()}_${Math.random()}`;
    
    const response = await httpClient.post('/teachers', testData);
    assertValidationError(response, `Create teacher without ${test.field}`);
  }
  
  // Test invalid email formats
  const invalidEmails = ['invalid', 'invalid@', '@invalid.com', 'invalid.com'];
  for (const email of invalidEmails) {
    const testData = {
      ...testTeacher,
      username: `test_${Date.now()}_${Math.random()}`,
      email
    };
    
    const response = await httpClient.post('/teachers', testData);
    assertValidationError(response, `Create teacher with invalid email: ${email}`);
  }
  
  // Test invalid enum values
  const invalidSexData = {
    ...testTeacher,
    username: `test_${Date.now()}_${Math.random()}`,
    sex: 'INVALID'
  };
  
  const invalidSexResponse = await httpClient.post('/teachers', invalidSexData);
  assertValidationError(invalidSexResponse, 'Create teacher with invalid sex value');
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  // Test non-existent teacher
  const nonExistentResponse = await httpClient.get('/teachers/non-existent-id');
  assertResponseStatus(nonExistentResponse, 404, 'Get non-existent teacher');
  
  // Test update non-existent teacher
  const updateNonExistentResponse = await httpClient.put('/teachers/non-existent-id', updateTeacherData);
  assertResponseStatus(updateNonExistentResponse, 404, 'Update non-existent teacher');
  
  // Test delete non-existent teacher
  const deleteNonExistentResponse = await httpClient.delete('/teachers/non-existent-id');
  assertResponseStatus(deleteNonExistentResponse, 404, 'Delete non-existent teacher');
  
  // Test malformed requests
  const malformedResponse = await httpClient.post('/teachers', 'invalid json');
  assert(malformedResponse.status >= 400, 'Malformed request should return error');
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  // Test large dataset queries
  const start = Date.now();
  const largeQueryResponse = await httpClient.get('/teachers?limit=100');
  const duration = Date.now() - start;
  
  assertResponseStatus(largeQueryResponse, 200, 'Large dataset query');
  assert(duration < 5000, `Large query should complete in reasonable time (${duration}ms)`);
  
  // Test pagination performance
  const paginationStart = Date.now();
  const paginationResponse = await httpClient.get('/teachers?page=1&limit=50');
  const paginationDuration = Date.now() - paginationStart;
  
  assertResponseStatus(paginationResponse, 200, 'Pagination query');
  assert(paginationDuration < 3000, `Pagination should be fast (${paginationDuration}ms)`);
}

async function generateTestReport() {
  console.log('\n📋 Generating Test Report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.passed + testResults.failed,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2) + '%'
    },
    errors: testResults.errors,
    recommendations: []
  };
  
  // Add recommendations based on failures
  if (testResults.failed > 0) {
    report.recommendations.push('Review failed tests and fix implementation issues');
  }
  
  if (testResults.errors.some(e => e.includes('auth'))) {
    report.recommendations.push('Check authentication and authorization implementation');
  }
  
  if (testResults.errors.some(e => e.includes('validation'))) {
    report.recommendations.push('Improve data validation and error handling');
  }
  
  // Save report to file
  const reportPath = `test-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Test Report saved to: ${reportPath}`);
  console.log(`\n🎯 Test Summary:`);
  console.log(`   Total: ${report.summary.total}`);
  console.log(`   Passed: ${report.summary.passed}`);
  console.log(`   Failed: ${report.summary.failed}`);
  console.log(`   Pass Rate: ${report.summary.passRate}`);
  
  if (testResults.failed > 0) {
    console.log(`\n❌ Failed Tests:`);
    testResults.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  return report;
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Teacher Management System E2E Tests...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  try {
    // Run all test suites
    await testAuthentication();
    await testTeacherCRUD();
    await testBatchOperations();
    await testStatistics();
    await testAuthorization();
    await testValidation();
    await testErrorHandling();
    await testPerformance();
    
    // Generate final report
    const report = await generateTestReport();
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n💥 Test suite failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testResults
};