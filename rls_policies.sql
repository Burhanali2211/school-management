-- Row Level Security (RLS) Policies for School Management System
-- Note: This is for PostgreSQL with RLS support (like Supabase)
-- Run after the main schema is created

-- Enable RLS on all tables
ALTER TABLE "Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Teacher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Parent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "School" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Grade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Section" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Exam" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Result" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Fee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserPreferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MessageRecipient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MessageThread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MessageAttachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MessageDraft" ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user context
CREATE OR REPLACE FUNCTION get_current_user_context()
RETURNS TABLE(user_id TEXT, user_type "UserType")
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        current_setting('app.current_user_id', true) as user_id,
        current_setting('app.current_user_type', true)::"UserType" as user_type;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_context RECORD;
BEGIN
    SELECT * INTO user_context FROM get_current_user_context();
    RETURN user_context.user_type = 'ADMIN';
END;
$$;

-- Function to check if user is teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_context RECORD;
BEGIN
    SELECT * INTO user_context FROM get_current_user_context();
    RETURN user_context.user_type = 'TEACHER';
END;
$$;

-- Function to check if user is student
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_context RECORD;
BEGIN
    SELECT * INTO user_context FROM get_current_user_context();
    RETURN user_context.user_type = 'STUDENT';
END;
$$;

-- Function to check if user is parent
CREATE OR REPLACE FUNCTION is_parent()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_context RECORD;
BEGIN
    SELECT * INTO user_context FROM get_current_user_context();
    RETURN user_context.user_type = 'PARENT';
END;
$$;

-- Function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_context RECORD;
BEGIN
    SELECT * INTO user_context FROM get_current_user_context();
    RETURN user_context.user_id;
END;
$$;

-- ADMIN TABLE POLICIES
-- Admins can see all admins
CREATE POLICY "admin_select_policy" ON "Admin" FOR SELECT USING (is_admin());
CREATE POLICY "admin_insert_policy" ON "Admin" FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_update_policy" ON "Admin" FOR UPDATE USING (is_admin());
CREATE POLICY "admin_delete_policy" ON "Admin" FOR DELETE USING (is_admin());

-- TEACHER TABLE POLICIES
-- Admins can see all teachers, teachers can see themselves and colleagues
CREATE POLICY "teacher_select_policy" ON "Teacher" FOR SELECT USING (
    is_admin() OR is_teacher()
);

-- Only admins can insert teachers
CREATE POLICY "teacher_insert_policy" ON "Teacher" FOR INSERT WITH CHECK (is_admin());

-- Admins can update any teacher, teachers can update themselves
CREATE POLICY "teacher_update_policy" ON "Teacher" FOR UPDATE USING (
    is_admin() OR (is_teacher() AND id = get_current_user_id())
);

-- Only admins can delete teachers
CREATE POLICY "teacher_delete_policy" ON "Teacher" FOR DELETE USING (is_admin());

-- STUDENT TABLE POLICIES
-- Admins and teachers can see all students, students can see themselves, parents can see their children
CREATE POLICY "student_select_policy" ON "Student" FOR SELECT USING (
    is_admin() OR 
    is_teacher() OR 
    (is_student() AND id = get_current_user_id()) OR
    (is_parent() AND "parentId" = get_current_user_id())
);

-- Only admins can insert students
CREATE POLICY "student_insert_policy" ON "Student" FOR INSERT WITH CHECK (is_admin());

-- Admins can update any student, students can update limited fields
CREATE POLICY "student_update_policy" ON "Student" FOR UPDATE USING (
    is_admin() OR 
    (is_student() AND id = get_current_user_id()) OR
    (is_parent() AND "parentId" = get_current_user_id())
);

-- Only admins can delete students
CREATE POLICY "student_delete_policy" ON "Student" FOR DELETE USING (is_admin());

-- PARENT TABLE POLICIES
-- Admins and teachers can see all parents, parents can see themselves
CREATE POLICY "parent_select_policy" ON "Parent" FOR SELECT USING (
    is_admin() OR 
    is_teacher() OR 
    (is_parent() AND id = get_current_user_id())
);

-- Only admins can insert parents
CREATE POLICY "parent_insert_policy" ON "Parent" FOR INSERT WITH CHECK (is_admin());

-- Admins can update any parent, parents can update themselves
CREATE POLICY "parent_update_policy" ON "Parent" FOR UPDATE USING (
    is_admin() OR (is_parent() AND id = get_current_user_id())
);

-- Only admins can delete parents
CREATE POLICY "parent_delete_policy" ON "Parent" FOR DELETE USING (is_admin());

-- SCHOOL TABLE POLICIES
-- Everyone can see schools
CREATE POLICY "school_select_policy" ON "School" FOR SELECT USING (true);

-- Only admins can modify schools
CREATE POLICY "school_insert_policy" ON "School" FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "school_update_policy" ON "School" FOR UPDATE USING (is_admin());
CREATE POLICY "school_delete_policy" ON "School" FOR DELETE USING (is_admin());

-- GRADE TABLE POLICIES
-- Everyone can see grades
CREATE POLICY "grade_select_policy" ON "Grade" FOR SELECT USING (true);

-- Only admins can modify grades
CREATE POLICY "grade_insert_policy" ON "Grade" FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "grade_update_policy" ON "Grade" FOR UPDATE USING (is_admin());
CREATE POLICY "grade_delete_policy" ON "Grade" FOR DELETE USING (is_admin());

-- CLASS TABLE POLICIES
-- Everyone can see classes
CREATE POLICY "class_select_policy" ON "Class" FOR SELECT USING (true);

-- Only admins can modify classes
CREATE POLICY "class_insert_policy" ON "Class" FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "class_update_policy" ON "Class" FOR UPDATE USING (is_admin());
CREATE POLICY "class_delete_policy" ON "Class" FOR DELETE USING (is_admin());

-- SECTION TABLE POLICIES
-- Everyone can see sections
CREATE POLICY "section_select_policy" ON "Section" FOR SELECT USING (true);

-- Only admins can modify sections
CREATE POLICY "section_insert_policy" ON "Section" FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "section_update_policy" ON "Section" FOR UPDATE USING (is_admin());
CREATE POLICY "section_delete_policy" ON "Section" FOR DELETE USING (is_admin());

-- SUBJECT TABLE POLICIES
-- Everyone can see subjects
CREATE POLICY "subject_select_policy" ON "Subject" FOR SELECT USING (true);

-- Only admins can modify subjects
CREATE POLICY "subject_insert_policy" ON "Subject" FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "subject_update_policy" ON "Subject" FOR UPDATE USING (is_admin());
CREATE POLICY "subject_delete_policy" ON "Subject" FOR DELETE USING (is_admin());

-- LESSON TABLE POLICIES
-- Teachers can see their lessons, students can see their class lessons, admins see all
CREATE POLICY "lesson_select_policy" ON "Lesson" FOR SELECT USING (
    is_admin() OR
    (is_teacher() AND "teacherId" = get_current_user_id()) OR
    (is_student() AND "classId" IN (SELECT "classId" FROM "Student" WHERE id = get_current_user_id())) OR
    (is_parent() AND "classId" IN (SELECT "classId" FROM "Student" WHERE "parentId" = get_current_user_id()))
);

-- Admins and teachers can create lessons
CREATE POLICY "lesson_insert_policy" ON "Lesson" FOR INSERT WITH CHECK (
    is_admin() OR is_teacher()
);

-- Teachers can update their lessons, admins can update any
CREATE POLICY "lesson_update_policy" ON "Lesson" FOR UPDATE USING (
    is_admin() OR (is_teacher() AND "teacherId" = get_current_user_id())
);

-- Admins and teachers can delete lessons they created
CREATE POLICY "lesson_delete_policy" ON "Lesson" FOR DELETE USING (
    is_admin() OR (is_teacher() AND "teacherId" = get_current_user_id())
);

-- EXAM TABLE POLICIES
-- Same logic as lessons
CREATE POLICY "exam_select_policy" ON "Exam" FOR SELECT USING (
    is_admin() OR
    (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id())) OR
    (is_student() AND "lessonId" IN (
        SELECT l.id FROM "Lesson" l 
        JOIN "Student" s ON l."classId" = s."classId" 
        WHERE s.id = get_current_user_id()
    )) OR
    (is_parent() AND "lessonId" IN (
        SELECT l.id FROM "Lesson" l 
        JOIN "Student" s ON l."classId" = s."classId" 
        WHERE s."parentId" = get_current_user_id()
    ))
);

CREATE POLICY "exam_insert_policy" ON "Exam" FOR INSERT WITH CHECK (
    is_admin() OR (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id()))
);

CREATE POLICY "exam_update_policy" ON "Exam" FOR UPDATE USING (
    is_admin() OR (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id()))
);

CREATE POLICY "exam_delete_policy" ON "Exam" FOR DELETE USING (
    is_admin() OR (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id()))
);

-- ASSIGNMENT TABLE POLICIES
-- Same logic as exams
CREATE POLICY "assignment_select_policy" ON "Assignment" FOR SELECT USING (
    is_admin() OR
    (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id())) OR
    (is_student() AND "lessonId" IN (
        SELECT l.id FROM "Lesson" l 
        JOIN "Student" s ON l."classId" = s."classId" 
        WHERE s.id = get_current_user_id()
    )) OR
    (is_parent() AND "lessonId" IN (
        SELECT l.id FROM "Lesson" l 
        JOIN "Student" s ON l."classId" = s."classId" 
        WHERE s."parentId" = get_current_user_id()
    ))
);

CREATE POLICY "assignment_insert_policy" ON "Assignment" FOR INSERT WITH CHECK (
    is_admin() OR (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id()))
);

CREATE POLICY "assignment_update_policy" ON "Assignment" FOR UPDATE USING (
    is_admin() OR (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id()))
);

CREATE POLICY "assignment_delete_policy" ON "Assignment" FOR DELETE USING (
    is_admin() OR (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id()))
);

-- RESULT TABLE POLICIES
-- Teachers can see results for their lessons, students see their own, parents see their children's
CREATE POLICY "result_select_policy" ON "Result" FOR SELECT USING (
    is_admin() OR
    (is_teacher() AND (
        "examId" IN (SELECT e.id FROM "Exam" e JOIN "Lesson" l ON e."lessonId" = l.id WHERE l."teacherId" = get_current_user_id()) OR
        "assignmentId" IN (SELECT a.id FROM "Assignment" a JOIN "Lesson" l ON a."lessonId" = l.id WHERE l."teacherId" = get_current_user_id())
    )) OR
    (is_student() AND "studentId" = get_current_user_id()) OR
    (is_parent() AND "studentId" IN (SELECT id FROM "Student" WHERE "parentId" = get_current_user_id()))
);

CREATE POLICY "result_insert_policy" ON "Result" FOR INSERT WITH CHECK (
    is_admin() OR (is_teacher() AND (
        "examId" IN (SELECT e.id FROM "Exam" e JOIN "Lesson" l ON e."lessonId" = l.id WHERE l."teacherId" = get_current_user_id()) OR
        "assignmentId" IN (SELECT a.id FROM "Assignment" a JOIN "Lesson" l ON a."lessonId" = l.id WHERE l."teacherId" = get_current_user_id())
    ))
);

CREATE POLICY "result_update_policy" ON "Result" FOR UPDATE USING (
    is_admin() OR (is_teacher() AND (
        "examId" IN (SELECT e.id FROM "Exam" e JOIN "Lesson" l ON e."lessonId" = l.id WHERE l."teacherId" = get_current_user_id()) OR
        "assignmentId" IN (SELECT a.id FROM "Assignment" a JOIN "Lesson" l ON a."lessonId" = l.id WHERE l."teacherId" = get_current_user_id())
    ))
);

CREATE POLICY "result_delete_policy" ON "Result" FOR DELETE USING (
    is_admin() OR (is_teacher() AND (
        "examId" IN (SELECT e.id FROM "Exam" e JOIN "Lesson" l ON e."lessonId" = l.id WHERE l."teacherId" = get_current_user_id()) OR
        "assignmentId" IN (SELECT a.id FROM "Assignment" a JOIN "Lesson" l ON a."lessonId" = l.id WHERE l."teacherId" = get_current_user_id())
    ))
);

-- ATTENDANCE TABLE POLICIES
-- Similar to results
CREATE POLICY "attendance_select_policy" ON "Attendance" FOR SELECT USING (
    is_admin() OR
    (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id())) OR
    (is_student() AND "studentId" = get_current_user_id()) OR
    (is_parent() AND "studentId" IN (SELECT id FROM "Student" WHERE "parentId" = get_current_user_id()))
);

CREATE POLICY "attendance_insert_policy" ON "Attendance" FOR INSERT WITH CHECK (
    is_admin() OR (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id()))
);

CREATE POLICY "attendance_update_policy" ON "Attendance" FOR UPDATE USING (
    is_admin() OR (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id()))
);

CREATE POLICY "attendance_delete_policy" ON "Attendance" FOR DELETE USING (
    is_admin() OR (is_teacher() AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "teacherId" = get_current_user_id()))
);

-- SESSION TABLE POLICIES
-- Users can only see their own sessions
CREATE POLICY "session_select_policy" ON "Session" FOR SELECT USING (
    "userId" = get_current_user_id()
);

CREATE POLICY "session_insert_policy" ON "Session" FOR INSERT WITH CHECK (
    "userId" = get_current_user_id()
);

CREATE POLICY "session_update_policy" ON "Session" FOR UPDATE USING (
    "userId" = get_current_user_id()
);

CREATE POLICY "session_delete_policy" ON "Session" FOR DELETE USING (
    "userId" = get_current_user_id()
);

-- AUDIT LOG POLICIES
-- Only admins can see audit logs
CREATE POLICY "audit_log_select_policy" ON "AuditLog" FOR SELECT USING (is_admin());
CREATE POLICY "audit_log_insert_policy" ON "AuditLog" FOR INSERT WITH CHECK (true); -- System can always insert
-- No update/delete for audit logs for integrity

-- USER PREFERENCES POLICIES
-- Users can see and modify their own preferences
CREATE POLICY "user_preferences_select_policy" ON "UserPreferences" FOR SELECT USING (
    "userId" = get_current_user_id()
);

CREATE POLICY "user_preferences_insert_policy" ON "UserPreferences" FOR INSERT WITH CHECK (
    "userId" = get_current_user_id()
);

CREATE POLICY "user_preferences_update_policy" ON "UserPreferences" FOR UPDATE USING (
    "userId" = get_current_user_id()
);

CREATE POLICY "user_preferences_delete_policy" ON "UserPreferences" FOR DELETE USING (
    "userId" = get_current_user_id()
);

-- MESSAGE POLICIES
-- Users can see messages they sent or received
CREATE POLICY "message_select_policy" ON "Message" FOR SELECT USING (
    "senderId" = get_current_user_id() OR
    id IN (SELECT "messageId" FROM "MessageRecipient" WHERE "userId" = get_current_user_id())
);

CREATE POLICY "message_insert_policy" ON "Message" FOR INSERT WITH CHECK (
    "senderId" = get_current_user_id()
);

CREATE POLICY "message_update_policy" ON "Message" FOR UPDATE USING (
    "senderId" = get_current_user_id()
);

CREATE POLICY "message_delete_policy" ON "Message" FOR DELETE USING (
    "senderId" = get_current_user_id()
);

-- MESSAGE RECIPIENT POLICIES
CREATE POLICY "message_recipient_select_policy" ON "MessageRecipient" FOR SELECT USING (
    "userId" = get_current_user_id() OR
    "messageId" IN (SELECT id FROM "Message" WHERE "senderId" = get_current_user_id())
);

CREATE POLICY "message_recipient_insert_policy" ON "MessageRecipient" FOR INSERT WITH CHECK (
    "messageId" IN (SELECT id FROM "Message" WHERE "senderId" = get_current_user_id())
);

CREATE POLICY "message_recipient_update_policy" ON "MessageRecipient" FOR UPDATE USING (
    "userId" = get_current_user_id()
);

CREATE POLICY "message_recipient_delete_policy" ON "MessageRecipient" FOR DELETE USING (
    "userId" = get_current_user_id() OR
    "messageId" IN (SELECT id FROM "Message" WHERE "senderId" = get_current_user_id())
);

-- FEE POLICIES
-- Admins see all, students see their own, parents see their children's
CREATE POLICY "fee_select_policy" ON "Fee" FOR SELECT USING (
    is_admin() OR
    (is_student() AND "studentId" = get_current_user_id()) OR
    (is_parent() AND "studentId" IN (SELECT id FROM "Student" WHERE "parentId" = get_current_user_id()))
);

CREATE POLICY "fee_insert_policy" ON "Fee" FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "fee_update_policy" ON "Fee" FOR UPDATE USING (is_admin());
CREATE POLICY "fee_delete_policy" ON "Fee" FOR DELETE USING (is_admin());

-- INVOICE POLICIES
-- Same as fees
CREATE POLICY "invoice_select_policy" ON "Invoice" FOR SELECT USING (
    is_admin() OR
    "feeId" IN (
        SELECT f.id FROM "Fee" f 
        WHERE (is_student() AND f."studentId" = get_current_user_id()) OR
              (is_parent() AND f."studentId" IN (SELECT id FROM "Student" WHERE "parentId" = get_current_user_id()))
    )
);

CREATE POLICY "invoice_insert_policy" ON "Invoice" FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "invoice_update_policy" ON "Invoice" FOR UPDATE USING (is_admin());
CREATE POLICY "invoice_delete_policy" ON "Invoice" FOR DELETE USING (is_admin());

-- PAYMENT POLICIES
-- Same as invoices
CREATE POLICY "payment_select_policy" ON "Payment" FOR SELECT USING (
    is_admin() OR
    "invoiceId" IN (
        SELECT i.id FROM "Invoice" i 
        JOIN "Fee" f ON i."feeId" = f.id
        WHERE (is_student() AND f."studentId" = get_current_user_id()) OR
              (is_parent() AND f."studentId" IN (SELECT id FROM "Student" WHERE "parentId" = get_current_user_id()))
    )
);

CREATE POLICY "payment_insert_policy" ON "Payment" FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "payment_update_policy" ON "Payment" FOR UPDATE USING (is_admin());
CREATE POLICY "payment_delete_policy" ON "Payment" FOR DELETE USING (is_admin());

-- EVENT POLICIES
-- Everyone can see events
CREATE POLICY "event_select_policy" ON "Event" FOR SELECT USING (true);

-- Only admins can modify events
CREATE POLICY "event_insert_policy" ON "Event" FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "event_update_policy" ON "Event" FOR UPDATE USING (is_admin());
CREATE POLICY "event_delete_policy" ON "Event" FOR DELETE USING (is_admin());

-- ANNOUNCEMENT POLICIES
-- Everyone can see announcements
CREATE POLICY "announcement_select_policy" ON "Announcement" FOR SELECT USING (true);

-- Only admins and teachers can create announcements
CREATE POLICY "announcement_insert_policy" ON "Announcement" FOR INSERT WITH CHECK (
    is_admin() OR is_teacher()
);

CREATE POLICY "announcement_update_policy" ON "Announcement" FOR UPDATE USING (
    is_admin() OR is_teacher()
);

CREATE POLICY "announcement_delete_policy" ON "Announcement" FOR DELETE USING (
    is_admin() OR is_teacher()
);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_current_user_context() TO PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin() TO PUBLIC;
GRANT EXECUTE ON FUNCTION is_teacher() TO PUBLIC;
GRANT EXECUTE ON FUNCTION is_student() TO PUBLIC;
GRANT EXECUTE ON FUNCTION is_parent() TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_current_user_id() TO PUBLIC;

COMMIT;