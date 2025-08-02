import {
  subjectSchema,
  classSchema,
  teacherSchema,
  studentSchema,
  examSchema,
  parentSchema,
  lessonSchema,
  assignmentSchema,
  resultSchema,
  eventSchema,
  announcementSchema,
  attendanceSchema,
} from '../formValidationSchemas'

describe('Form Validation Schemas', () => {
  describe('subjectSchema', () => {
    it('should validate valid subject data', () => {
      const validData = {
        name: 'Mathematics',
        teachers: ['teacher-1', 'teacher-2'],
      }
      
      const result = subjectSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty subject name', () => {
      const invalidData = {
        name: '',
        teachers: [],
      }
      
      const result = subjectSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Subject name is required!')
      }
    })

    it('should handle optional id', () => {
      const dataWithId = {
        id: 1,
        name: 'Mathematics',
        teachers: ['teacher-1'],
      }
      
      const result = subjectSchema.safeParse(dataWithId)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(1)
      }
    })
  })

  describe('classSchema', () => {
    it('should validate valid class data', () => {
      const validData = {
        name: 'Class 1A',
        capacity: 30,
        gradeId: 1,
        supervisorId: 'teacher-1',
      }
      
      const result = classSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid capacity', () => {
      const invalidData = {
        name: 'Class 1A',
        capacity: 0,
        gradeId: 1,
      }
      
      const result = classSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should coerce string numbers to numbers', () => {
      const dataWithStringNumbers = {
        name: 'Class 1A',
        capacity: '30',
        gradeId: '1',
      }
      
      const result = classSchema.safeParse(dataWithStringNumbers)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.capacity).toBe('number')
        expect(typeof result.data.gradeId).toBe('number')
      }
    })
  })

  describe('teacherSchema', () => {
    const validTeacherData = {
      username: 'teacher1',
      password: 'password123',
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@school.com',
      phone: '1234567890',
      address: '123 Main St',
      bloodType: 'A+',
      birthday: new Date('1985-05-15'),
      sex: 'MALE' as const,
      subjects: ['subject-1', 'subject-2'],
    }

    it('should validate valid teacher data', () => {
      const result = teacherSchema.safeParse(validTeacherData)
      expect(result.success).toBe(true)
    })

    it('should reject short username', () => {
      const invalidData = { ...validTeacherData, username: 'ab' }
      const result = teacherSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject long username', () => {
      const invalidData = { ...validTeacherData, username: 'a'.repeat(21) }
      const result = teacherSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
      const invalidData = { ...validTeacherData, password: '1234567' }
      const result = teacherSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept empty password for updates', () => {
      const dataWithEmptyPassword = { ...validTeacherData, password: '' }
      const result = teacherSchema.safeParse(dataWithEmptyPassword)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = { ...validTeacherData, email: 'invalid-email' }
      const result = teacherSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept empty email', () => {
      const dataWithEmptyEmail = { ...validTeacherData, email: '' }
      const result = teacherSchema.safeParse(dataWithEmptyEmail)
      expect(result.success).toBe(true)
    })

    it('should reject invalid sex', () => {
      const invalidData = { ...validTeacherData, sex: 'OTHER' as any }
      const result = teacherSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should coerce date strings to Date objects', () => {
      const dataWithStringDate = { ...validTeacherData, birthday: '1985-05-15' }
      const result = teacherSchema.safeParse(dataWithStringDate)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.birthday).toBeInstanceOf(Date)
      }
    })
  })

  describe('studentSchema', () => {
    const validStudentData = {
      username: 'student1',
      password: 'password123',
      name: 'Jane',
      surname: 'Smith',
      email: 'jane.smith@school.com',
      phone: '0987654321',
      address: '456 Oak Ave',
      bloodType: 'B+',
      birthday: new Date('2008-03-20'),
      sex: 'FEMALE' as const,
      gradeId: 1,
      classId: 1,
      parentId: 'parent-1',
    }

    it('should validate valid student data', () => {
      const result = studentSchema.safeParse(validStudentData)
      expect(result.success).toBe(true)
    })

    it('should require gradeId', () => {
      const invalidData = { ...validStudentData, gradeId: 0 }
      const result = studentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require classId', () => {
      const invalidData = { ...validStudentData, classId: 0 }
      const result = studentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require parentId', () => {
      const invalidData = { ...validStudentData, parentId: '' }
      const result = studentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('examSchema', () => {
    const validExamData = {
      title: 'Math Midterm',
      startTime: new Date('2024-02-01T09:00:00'),
      endTime: new Date('2024-02-01T11:00:00'),
      lessonId: 1,
    }

    it('should validate valid exam data', () => {
      const result = examSchema.safeParse(validExamData)
      expect(result.success).toBe(true)
    })

    it('should reject empty title', () => {
      const invalidData = { ...validExamData, title: '' }
      const result = examSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should coerce string dates to Date objects', () => {
      const dataWithStringDates = {
        ...validExamData,
        startTime: '2024-02-01T09:00:00',
        endTime: '2024-02-01T11:00:00',
      }
      const result = examSchema.safeParse(dataWithStringDates)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.startTime).toBeInstanceOf(Date)
        expect(result.data.endTime).toBeInstanceOf(Date)
      }
    })
  })

  describe('attendanceSchema', () => {
    const validAttendanceData = {
      date: new Date('2024-01-15'),
      present: true,
      studentId: 'student-1',
      lessonId: 1,
    }

    it('should validate valid attendance data', () => {
      const result = attendanceSchema.safeParse(validAttendanceData)
      expect(result.success).toBe(true)
    })

    it('should handle boolean present field', () => {
      const presentData = { ...validAttendanceData, present: true }
      const absentData = { ...validAttendanceData, present: false }
      
      expect(attendanceSchema.safeParse(presentData).success).toBe(true)
      expect(attendanceSchema.safeParse(absentData).success).toBe(true)
    })

    it('should require studentId', () => {
      const invalidData = { ...validAttendanceData, studentId: '' }
      const result = attendanceSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require lessonId', () => {
      const invalidData = { ...validAttendanceData, lessonId: 0 }
      const result = attendanceSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('resultSchema', () => {
    it('should validate exam result', () => {
      const validData = {
        score: 85,
        studentId: 'student-1',
        examId: 1,
      }
      
      const result = resultSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate assignment result', () => {
      const validData = {
        score: 92,
        studentId: 'student-1',
        assignmentId: 1,
      }
      
      const result = resultSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject negative scores', () => {
      const invalidData = {
        score: -5,
        studentId: 'student-1',
        examId: 1,
      }
      
      const result = resultSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should coerce string scores to numbers', () => {
      const dataWithStringScore = {
        score: '85',
        studentId: 'student-1',
        examId: 1,
      }
      
      const result = resultSchema.safeParse(dataWithStringScore)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data.score).toBe('number')
      }
    })
  })
})