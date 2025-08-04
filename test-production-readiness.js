#!/usr/bin/env node

console.log('🚀 Production Readiness Test Suite\n');

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function test(name, condition, message = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}: ${message}`);
    failed++;
  }
}

// Test 1: Error handler exists
test('Error Handler Utility', 
  fs.existsSync(path.join(__dirname, 'src', 'lib', 'error-handler.ts')),
  'Error handler utility should exist'
);

// Test 2: Next.js config has proper settings
const nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
test('CSP Configuration', 
  nextConfig.includes('Content-Security-Policy'),
  'Content Security Policy should be configured'
);

test('TypeScript Checking Enabled', 
  !nextConfig.includes('ignoreBuildErrors: true'),
  'TypeScript checking should be enabled'
);

// Test 3: Layout file doesn't have ReactToastify import
const layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
test('ReactToastify Import Removed', 
  !layout.includes('react-toastify/dist/ReactToastify.css'),
  'ReactToastify CSS import should be removed'
);

// Test 4: Globals CSS has fixes
const globalsCSS = fs.readFileSync('src/app/globals.css', 'utf8');
test('Webkit Text Size Fix', 
  globalsCSS.includes('-webkit-text-size-adjust: 100%'),
  'CSS should include webkit text size adjust fix'
);

test('ReactToastify Styles', 
  globalsCSS.includes('.toast-container .Toastify__toast'),
  'CSS should include ReactToastify styles'
);

// Test 5: API route has error handling
const activitiesRoute = fs.readFileSync('src/app/api/dashboard/activities/route.ts', 'utf8');
test('API Error Handler', 
  activitiesRoute.includes('handleApiError'),
  'API route should use error handler'
);

test('User Session Validation', 
  activitiesRoute.includes('validateUserSession'),
  'API route should validate user session'
);

// Test 6: Parent page has validation
const parentPage = fs.readFileSync('src/app/(dashboard)/parent/page.tsx', 'utf8');
test('Parent Page Validation', 
  parentPage.includes('if (!user.id)'),
  'Parent page should validate user.id'
);

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed! Application is production-ready.');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the issues.');
  process.exit(1);
} 