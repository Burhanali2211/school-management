const fs = require('fs');
const path = require('path');

// List of files that need to be fixed
const pagesToFix = [
  'src/app/(dashboard)/list/attendance/page.tsx',
  'src/app/(dashboard)/list/announcements/page.tsx', 
  'src/app/(dashboard)/list/assignments/page.tsx',
  'src/app/(dashboard)/list/classes/page.tsx',
  'src/app/(dashboard)/list/events/page.tsx',
  'src/app/(dashboard)/list/exams/page.tsx',
  'src/app/(dashboard)/list/lessons/page.tsx',
  'src/app/(dashboard)/list/parents/page.tsx',
  'src/app/(dashboard)/list/results/page.tsx',
  'src/app/(dashboard)/list/students/page.tsx',
  'src/app/(dashboard)/list/subjects/page.tsx',
  'src/app/(dashboard)/list/students/[id]/page.tsx',
  'src/app/(dashboard)/list/teachers/[id]/page.tsx',
  'src/app/(dashboard)/student/page.tsx',
  'src/app/(dashboard)/teacher/page.tsx',
  'src/app/(dashboard)/parent/page.tsx',
  'src/app/(dashboard)/profile/page.tsx',
  'src/app/(dashboard)/settings/page.tsx',
];

const apiRoutesToFix = [
  'src/app/api/attendance/route.ts',
  'src/app/api/finance/route.ts'
];

function fixPageFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if no clerk imports
    if (!content.includes('@clerk/nextjs')) {
      console.log(`Already fixed: ${filePath}`);
      return;
    }

    // Replace clerk imports
    content = content.replace(
      /import\s+{\s*auth\s*}\s+from\s+["']@clerk\/nextjs\/server["'];?/g,
      'import { getAuthUser } from "@/lib/auth-utils";\nimport { UserType } from "@prisma/client";'
    );

    // Replace auth usage patterns
    content = content.replace(
      /const\s+{\s*sessionClaims\s*}\s*=\s*auth\(\);?\s*\n\s*const\s+role\s*=\s*\(sessionClaims\?\.\w+\s+as\s+{\s*\w+\?\:\s*\w+\s*}\)\?\.\w+;?/g,
      'const user = await getAuthUser();\n  const isAdmin = user?.userType === UserType.ADMIN;'
    );

    // Replace role usage
    content = content.replace(/role\s*===\s*["']admin["']/g, 'isAdmin');
    content = content.replace(/role\s*!==\s*["']admin["']/g, '!isAdmin');

    // Save the fixed content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function fixApiFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if no clerk imports
    if (!content.includes('@clerk/nextjs')) {
      console.log(`Already fixed: ${filePath}`);
      return;
    }

    // Replace clerk imports with custom auth
    content = content.replace(
      /import\s+{\s*auth\s*}\s+from\s+["']@clerk\/nextjs\/server["'];?/g,
      'import { requireAuth } from "@/lib/auth-utils";'
    );

    // Replace auth() calls
    content = content.replace(
      /const\s+{\s*userId\s*}\s*=\s*auth\(\);?/g,
      'const user = await requireAuth();'
    );

    content = content.replace(/userId/g, 'user.id');

    // Save the fixed content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed API: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing API ${filePath}:`, error.message);
  }
}

// Fix all page files
console.log('Fixing page files...');
pagesToFix.forEach(fixPageFile);

// Fix all API files
console.log('\nFixing API files...');
apiRoutesToFix.forEach(fixApiFile);

console.log('\nAll fixes completed!');
