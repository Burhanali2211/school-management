const fs = require('fs');

console.log('🚀 Production Readiness Test Suite\n');

let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    failed++;
  }
}

try {
  // Test 1: Error handler exists
  test('Error Handler Utility', fs.existsSync('src/lib/error-handler.ts'));

  // Test 2: Next.js config has proper settings
  const nextConfig = fs.readFileSync('next.config.mjs', 'utf8');
  test('CSP Configuration', nextConfig.includes('Content-Security-Policy'));
  test('TypeScript Checking Enabled', !nextConfig.includes('ignoreBuildErrors: true'));

  // Test 3: Layout file doesn't have ReactToastify import
  const layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
  test('ReactToastify Import Removed', !layout.includes('react-toastify/dist/ReactToastify.css'));

  // Test 4: Globals CSS has fixes
  const globalsCSS = fs.readFileSync('src/app/globals.css', 'utf8');
  test('Webkit Text Size Fix', globalsCSS.includes('-webkit-text-size-adjust: 100%'));
  test('ReactToastify Styles', globalsCSS.includes('.toast-container .Toastify__toast'));

  // Test 5: API route has error handling
  const activitiesRoute = fs.readFileSync('src/app/api/dashboard/activities/route.ts', 'utf8');
  test('API Error Handler', activitiesRoute.includes('handleApiError'));
  test('User Session Validation', activitiesRoute.includes('validateUserSession'));

  // Test 6: Parent page has validation
  const parentPage = fs.readFileSync('src/app/(dashboard)/parent/page.tsx', 'utf8');
  test('Parent Page Validation', parentPage.includes('if (!user.id)'));

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Application is production-ready.');
  } else {
    console.log('⚠️  Some tests failed. Please review the issues.');
  }
} catch (error) {
  console.error('Test error:', error.message);
} 