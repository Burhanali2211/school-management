import prisma from "./prisma";

// Fetch Admin data
export const fetchAdmins = async () => {
  const admins = await prisma.admin.findMany();
  return admins;
};

// Fetch Teacher data
export const fetchTeachers = async () => {
  const teachers = await prisma.teacher.findMany();
  return teachers;
};

// Fetch Student data
export const fetchStudents = async () => {
  const students = await prisma.student.findMany();
  return students;
};

// Fetch Parent data
export const fetchParents = async () => {
  const parents = await prisma.parent.findMany();
  return parents;
};

// Fetch Subject data
export const fetchSubjects = async () => {
  const subjects = await prisma.subject.findMany();
  return subjects;
};

// Fetch Class data
export const fetchClasses = async () => {
  const classes = await prisma.class.findMany();
  return classes;
};

// Fetch Lesson data
export const fetchLessons = async () => {
  const lessons = await prisma.lesson.findMany();
  return lessons;
};

// Fetch Exam data
export const fetchExams = async () => {
  const exams = await prisma.exam.findMany();
  return exams;
};

// Fetch Assignment data
export const fetchAssignments = async () => {
  const assignments = await prisma.assignment.findMany();
  return assignments;
};

// Fetch Result data
export const fetchResults = async () => {
  const results = await prisma.result.findMany();
  return results;
};

// Fetch Attendance data
export const fetchAttendance = async () => {
  const attendance = await prisma.attendance.findMany();
  return attendance;
};

// Fetch Event data
export const fetchEvents = async () => {
  const events = await prisma.event.findMany();
  return events;
};

// Fetch Message data (Note: There's no message model in schema, this is a placeholder)
export const fetchMessages = async () => {
  // Since there's no Message model in the schema, return empty array for now
  // In a real implementation, you would create a Message model and implement proper messaging
  return [];
};

// Fetch Announcement data
export const fetchAnnouncements = async () => {
  const announcements = await prisma.announcement.findMany();
  return announcements;
};
