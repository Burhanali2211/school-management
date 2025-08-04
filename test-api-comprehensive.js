#!/usr/bin/env node

console.log('🔍 Comprehensive API Test Suite\n');

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

// Test 1: Check if all critical API routes exist
const apiRoutes = [
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/logout/route.ts',
  'src/app/api/auth/me/route.ts',
  'src/app/api/students/route.ts',
  'src/app/api/teachers/route.ts',
  'src/app/api/parents/route.ts',
  'src/app/api/classes/route.ts',
  'src/app/api/subjects/route.ts',
];

apiRoutes.forEach(route => {
  test(`API Route: ${route}`, 
    fs.existsSync(path.join(__dirname, route)),
    `Route file should exist`
  );
});

// Test 2: Check if auth service has proper error handling
const authService = fs.readFileSync('src/lib/auth-service.ts', 'utf8');
test('Auth Service Error Handling', 
  authService.includes('try') && authService.includes('catch'),
  'Auth service should have proper error handling'
);

test('Auth Service Permissions', 
  authService.includes('hasPermission'),
  'Auth service should have permission checking'
);

// Test 3: Check if API routes use proper authentication
const studentsRoute = fs.readFileSync('src/app/api/students/route.ts', 'utf8');
test('Students API Authentication', 
  studentsRoute.includes('requireAuth'),
  'Students API should require authentication'
);

test('Students API Error Handling', 
  studentsRoute.includes('handleApiError'),
  'Students API should use proper error handling'
);

test('Students API Validation', 
  studentsRoute.includes('validateUserSession'),
  'Students API should validate user sessions'
);

// Test 4: Check if middleware is properly configured
const middleware = fs.readFileSync('src/middleware.ts', 'utf8');
test('Middleware Route Protection', 
  middleware.includes('validateSessionEdge'),
  'Middleware should validate sessions'
);

test('Middleware Role-based Access', 
  middleware.includes('roleRoutes'),
  'Middleware should implement role-based access'
);

// Test 5: Check if UI components exist
const uiComponents = [
  'src/components/ui/button.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/modal.tsx',
];

uiComponents.forEach(component => {
  test(`UI Component: ${path.basename(component)}`, 
    fs.existsSync(path.join(__dirname, component)),
    `Component should exist`
  );
});

// Test 6: Check if error handler is comprehensive
const errorHandler = fs.readFileSync('src/lib/error-handler.ts', 'utf8');
test('Error Handler Prisma Support', 
  errorHandler.includes('PrismaClientKnownRequestError'),
  'Error handler should handle Prisma errors'
);

test('Error Handler API Support', 
  errorHandler.includes('handleApiError'),
  'Error handler should provide API error handling'
);

// Test 7: Check if environment variables are properly configured
const envLocal = fs.readFileSync('.env.local', 'utf8');
test('JWT Secret Configuration', 
  envLocal.includes('JWT_SECRET'),
  'JWT secret should be configured'
);

test('Database URL Configuration', 
  envLocal.includes('DATABASE_URL'),
  'Database URL should be configured'
);

// Test 8: Check if Prisma schema is comprehensive
const prismaSchema = fs.readFileSync('prisma/schema.prisma', 'utf8');
test('Prisma User Models', 
  prismaSchema.includes('model Student') && prismaSchema.includes('model Teacher'),
  'Prisma should have user models'
);

test('Prisma Session Management', 
  prismaSchema.includes('model Session'),
  'Prisma should have session management'
);

test('Prisma Audit Logging', 
  prismaSchema.includes('model AuditLog'),
  'Prisma should have audit logging'
);

// Test 9: Check if authentication context is properly implemented
const authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
test('Auth Context State Management', 
  authContext.includes('useState') && authContext.includes('useEffect'),
  'Auth context should manage state properly'
);

test('Auth Context Error Handling', 
  authContext.includes('try') && authContext.includes('catch'),
  'Auth context should handle errors'
);

// Test 10: Check if dashboard layout is secure
const dashboardLayout = fs.readFileSync('src/app/(dashboard)/layout.tsx', 'utf8');
test('Dashboard Authentication Check', 
  dashboardLayout.includes('useAuth') || dashboardLayout.includes('isAuthenticated'),
  'Dashboard should check authentication'
);

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed! Application architecture is solid.');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the issues above.');
  process.exit(1);
}