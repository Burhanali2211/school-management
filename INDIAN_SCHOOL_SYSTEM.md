# Indian School Management System

## Overview

This school management system has been customized for Indian schools with a simplified grade system that follows the standard Indian education structure from Nursery to Class 12.

## Grade System

### Indian Grade Structure

The system now uses the following grade levels:

1. **Nursery** (3-4 years) - Foundation stage with play-based learning
2. **LKG** (4-5 years) - Lower Kindergarten for basic skills development
3. **UKG** (5-6 years) - Upper Kindergarten for school readiness
4. **Class 1** (6-7 years) - Primary education begins
5. **Class 2** (7-8 years) - Building reading and math skills
6. **Class 3** (8-9 years) - Developing critical thinking
7. **Class 4** (9-10 years) - Expanding knowledge base
8. **Class 5** (10-11 years) - Upper primary completion
9. **Class 6** (11-12 years) - Middle school begins
10. **Class 7** (12-13 years) - Subject specialization starts
11. **Class 8** (13-14 years) - Preparing for board exams
12. **Class 9** (14-15 years) - Secondary education
13. **Class 10** (15-16 years) - Board examination year
14. **Class 11** (16-17 years) - Higher secondary (Science/Commerce/Arts)
15. **Class 12** (17-18 years) - Final board examination year

### Class Sections

Each grade can have multiple sections:
- **Lower grades (Nursery to UKG)**: Sections A and B
- **Higher grades (Class 1 to 12)**: Sections A, B, and C

## Key Features for Indian Schools

### 1. Simplified Navigation
- Clear grade names instead of complex numbers
- Intuitive class naming (e.g., "Class 5 - Section A")
- Easy-to-understand interface for teachers

### 2. Teacher-Friendly Interface
- Quick access to class management
- Simple student enrollment process
- Easy attendance tracking
- Straightforward grade management

### 3. Parent Communication
- Clear grade and class information
- Easy progress tracking
- Simple messaging system

### 4. Administrative Tools
- Comprehensive student management
- Class capacity management
- Teacher assignment system
- Financial tracking

## Database Changes

### Grade Table Updates
- Added `name` field for human-readable grade names
- Maintained `level` field for sorting and internal logic
- Updated seed data with Indian grade structure

### Class Structure
- Classes are now named as "Grade Name - Section Letter"
- Automatic capacity management based on grade level
- Flexible section management

## User Guide

### For Teachers
1. **Adding Students**: Select the appropriate grade and class section
2. **Managing Classes**: Use the simplified grade names for easy identification
3. **Attendance**: Track attendance by class and section
4. **Assignments**: Create assignments for specific classes

### For Administrators
1. **Grade Management**: All 15 grades are pre-configured
2. **Class Creation**: Automatically creates sections for each grade
3. **Student Enrollment**: Simple process with clear grade selection
4. **Reports**: Generate reports by grade, class, or section

### For Parents
1. **Child Progress**: View progress by grade and class
2. **Communication**: Easy access to teacher messages
3. **Attendance**: Monitor attendance records
4. **Events**: Stay updated with school activities

## Technical Implementation

### API Endpoints
- `/api/grades` - Fetch all grades with names
- `/api/classes` - Fetch classes with grade information
- `/api/students` - Student management with grade filtering

### Database Schema
```sql
-- Grade table with Indian school structure
CREATE TABLE "Grade" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,  -- e.g., "Class 5", "Nursery"
  "level" INTEGER UNIQUE NOT NULL,  -- For sorting (0-14)
  "schoolId" INTEGER
);

-- Class table with section management
CREATE TABLE "Class" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,  -- e.g., "Class 5 - Section A"
  "capacity" INTEGER NOT NULL,
  "gradeId" INTEGER REFERENCES "Grade"("id"),
  "supervisorId" TEXT REFERENCES "Teacher"("id")
);
```

## Migration Guide

### From Previous System
1. Run the database migration: `npx prisma migrate dev`
2. Update the seed data: `npx prisma db seed`
3. The system will automatically convert existing grades to the new structure

### New Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the database: `npx prisma migrate dev`
4. Seed the database: `npx prisma db seed`
5. Start the application: `npm run dev`

## Benefits for Indian Schools

1. **Familiar Structure**: Uses standard Indian grade names
2. **Easy Adoption**: Teachers can start using immediately
3. **Scalable**: Supports multiple sections per grade
4. **Comprehensive**: Covers the entire K-12 spectrum
5. **User-Friendly**: Intuitive interface for all users

## Support

For technical support or questions about the Indian school system implementation, please refer to the main documentation or contact the development team.

---

*This system is designed to make school management simple and efficient for Indian educational institutions.* 