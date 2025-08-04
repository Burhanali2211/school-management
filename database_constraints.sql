-- Database Constraints and Indexes for School Management System
-- Run this after the initial schema setup

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_teacher_username" ON "Teacher"("username");
CREATE INDEX IF NOT EXISTS "idx_teacher_email" ON "Teacher"("email");
CREATE INDEX IF NOT EXISTS "idx_teacher_created_at" ON "Teacher"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_student_class_id" ON "Student"("classId");
CREATE INDEX IF NOT EXISTS "idx_student_parent_id" ON "Student"("parentId");
CREATE INDEX IF NOT EXISTS "idx_lesson_teacher_id" ON "Lesson"("teacherId");
CREATE INDEX IF NOT EXISTS "idx_lesson_class_id" ON "Lesson"("classId");
CREATE INDEX IF NOT EXISTS "idx_lesson_subject_id" ON "Lesson"("subjectId");
CREATE INDEX IF NOT EXISTS "idx_session_user_id" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "Session"("token");
CREATE INDEX IF NOT EXISTS "idx_audit_log_user_id" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_audit_log_entity" ON "AuditLog"("entity");
CREATE INDEX IF NOT EXISTS "idx_message_sender" ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "idx_message_recipient_user" ON "MessageRecipient"("userId");

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS "idx_teacher_subjects" ON "_SubjectToTeacher"("A", "B");
CREATE INDEX IF NOT EXISTS "idx_teacher_classes" ON "_ClassToTeacher"("A", "B");
CREATE INDEX IF NOT EXISTS "idx_attendance_student_date" ON "Attendance"("studentId", "date");
CREATE INDEX IF NOT EXISTS "idx_result_student_exam" ON "Result"("studentId", "examId");
CREATE INDEX IF NOT EXISTS "idx_lesson_day_time" ON "Lesson"("day", "startTime");

-- Add constraints for data integrity
ALTER TABLE "Teacher" ADD CONSTRAINT "chk_teacher_email_format" 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE "Teacher" ADD CONSTRAINT "chk_teacher_phone_format" 
CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');

ALTER TABLE "Student" ADD CONSTRAINT "chk_student_email_format" 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE "Student" ADD CONSTRAINT "chk_student_phone_format" 
CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');

ALTER TABLE "Parent" ADD CONSTRAINT "chk_parent_email_format" 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE "Parent" ADD CONSTRAINT "chk_parent_phone_format" 
CHECK (phone ~* '^\+?[1-9]\d{1,14}$');

-- Add check constraints for reasonable values
ALTER TABLE "Class" ADD CONSTRAINT "chk_class_capacity" 
CHECK (capacity > 0 AND capacity <= 100);

ALTER TABLE "Section" ADD CONSTRAINT "chk_section_capacity" 
CHECK (capacity > 0 AND capacity <= 50);

ALTER TABLE "Grade" ADD CONSTRAINT "chk_grade_level" 
CHECK (level >= 1 AND level <= 12);

ALTER TABLE "Result" ADD CONSTRAINT "chk_result_score" 
CHECK (score >= 0 AND score <= 100);

ALTER TABLE "Fee" ADD CONSTRAINT "chk_fee_amount" 
CHECK (amount >= 0);

ALTER TABLE "Invoice" ADD CONSTRAINT "chk_invoice_amount" 
CHECK (amount >= 0);

ALTER TABLE "Payment" ADD CONSTRAINT "chk_payment_amount" 
CHECK (amount >= 0);

-- Add constraints for time-based data
ALTER TABLE "Lesson" ADD CONSTRAINT "chk_lesson_time" 
CHECK ("endTime" > "startTime");

ALTER TABLE "Exam" ADD CONSTRAINT "chk_exam_time" 
CHECK ("endTime" > "startTime");

ALTER TABLE "Assignment" ADD CONSTRAINT "chk_assignment_date" 
CHECK ("dueDate" >= "startDate");

ALTER TABLE "Session" ADD CONSTRAINT "chk_session_expiry" 
CHECK ("expiresAt" > "createdAt");

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id TEXT;
    current_user_type "UserType";
BEGIN
    -- Get current user from session context (you'll need to set this in your app)
    current_user_id := current_setting('app.current_user_id', true);
    current_user_type := current_setting('app.current_user_type', true)::"UserType";
    
    IF current_user_id IS NOT NULL AND current_user_type IS NOT NULL THEN
        IF TG_OP = 'DELETE' THEN
            INSERT INTO "AuditLog" (
                "id", "userId", "userType", "action", "entity", "entityId", 
                "changes", "createdAt"
            )
            VALUES (
                gen_random_uuid()::text,
                current_user_id,
                current_user_type,
                'DELETE',
                TG_TABLE_NAME,
                CASE 
                    WHEN TG_TABLE_NAME = 'Teacher' THEN OLD.id
                    WHEN TG_TABLE_NAME = 'Student' THEN OLD.id
                    WHEN TG_TABLE_NAME = 'Parent' THEN OLD.id
                    ELSE NULL
                END,
                row_to_json(OLD),
                NOW()
            );
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO "AuditLog" (
                "id", "userId", "userType", "action", "entity", "entityId", 
                "changes", "createdAt"
            )
            VALUES (
                gen_random_uuid()::text,
                current_user_id,
                current_user_type,
                'UPDATE',
                TG_TABLE_NAME,
                CASE 
                    WHEN TG_TABLE_NAME = 'Teacher' THEN NEW.id
                    WHEN TG_TABLE_NAME = 'Student' THEN NEW.id
                    WHEN TG_TABLE_NAME = 'Parent' THEN NEW.id
                    ELSE NULL
                END,
                json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)),
                NOW()
            );
            RETURN NEW;
        ELSIF TG_OP = 'INSERT' THEN
            INSERT INTO "AuditLog" (
                "id", "userId", "userType", "action", "entity", "entityId", 
                "changes", "createdAt"
            )
            VALUES (
                gen_random_uuid()::text,
                current_user_id,
                current_user_type,
                'INSERT',
                TG_TABLE_NAME,
                CASE 
                    WHEN TG_TABLE_NAME = 'Teacher' THEN NEW.id
                    WHEN TG_TABLE_NAME = 'Student' THEN NEW.id
                    WHEN TG_TABLE_NAME = 'Parent' THEN NEW.id
                    ELSE NULL
                END,
                row_to_json(NEW),
                NOW()
            );
            RETURN NEW;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for key tables
DROP TRIGGER IF EXISTS teacher_audit_trigger ON "Teacher";
CREATE TRIGGER teacher_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Teacher"
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS student_audit_trigger ON "Student";
CREATE TRIGGER student_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Student"
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS parent_audit_trigger ON "Parent";
CREATE TRIGGER parent_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Parent"
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create function to validate lesson scheduling conflicts
CREATE OR REPLACE FUNCTION check_lesson_conflicts()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for teacher scheduling conflicts
    IF EXISTS (
        SELECT 1 FROM "Lesson" 
        WHERE "teacherId" = NEW."teacherId" 
        AND "day" = NEW."day"
        AND id != COALESCE(NEW.id, 0)
        AND (
            (NEW."startTime" >= "startTime" AND NEW."startTime" < "endTime") OR
            (NEW."endTime" > "startTime" AND NEW."endTime" <= "endTime") OR
            (NEW."startTime" <= "startTime" AND NEW."endTime" >= "endTime")
        )
    ) THEN
        RAISE EXCEPTION 'Teacher has a scheduling conflict on % from % to %', 
            NEW."day", NEW."startTime", NEW."endTime";
    END IF;
    
    -- Check for class scheduling conflicts
    IF EXISTS (
        SELECT 1 FROM "Lesson" 
        WHERE "classId" = NEW."classId" 
        AND "day" = NEW."day"
        AND id != COALESCE(NEW.id, 0)
        AND (
            (NEW."startTime" >= "startTime" AND NEW."startTime" < "endTime") OR
            (NEW."endTime" > "startTime" AND NEW."endTime" <= "endTime") OR
            (NEW."startTime" <= "startTime" AND NEW."endTime" >= "endTime")
        )
    ) THEN
        RAISE EXCEPTION 'Class has a scheduling conflict on % from % to %', 
            NEW."day", NEW."startTime", NEW."endTime";
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lesson conflicts
DROP TRIGGER IF EXISTS lesson_conflict_trigger ON "Lesson";
CREATE TRIGGER lesson_conflict_trigger
    BEFORE INSERT OR UPDATE ON "Lesson"
    FOR EACH ROW EXECUTE FUNCTION check_lesson_conflicts();

-- Create function to update session last active time
CREATE OR REPLACE FUNCTION update_session_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW."lastActive" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last active time
DROP TRIGGER IF EXISTS session_update_trigger ON "Session";
CREATE TRIGGER session_update_trigger
    BEFORE UPDATE ON "Session"
    FOR EACH ROW EXECUTE FUNCTION update_session_last_active();

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM "Session" WHERE "expiresAt" < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to validate class capacity
CREATE OR REPLACE FUNCTION check_class_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    max_capacity INTEGER;
BEGIN
    -- Get current student count and class capacity
    SELECT COUNT(*), c.capacity 
    INTO current_count, max_capacity
    FROM "Student" s
    JOIN "Class" c ON c.id = NEW."classId"
    WHERE s."classId" = NEW."classId"
    GROUP BY c.capacity;
    
    IF current_count >= max_capacity THEN
        RAISE EXCEPTION 'Class is at maximum capacity (%))', max_capacity;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for class capacity check
DROP TRIGGER IF EXISTS class_capacity_trigger ON "Student";
CREATE TRIGGER class_capacity_trigger
    BEFORE INSERT OR UPDATE OF "classId" ON "Student"
    FOR EACH ROW EXECUTE FUNCTION check_class_capacity();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- Create views for common queries
CREATE OR REPLACE VIEW teacher_summary AS
SELECT 
    t.id,
    t.username,
    t.name,
    t.surname,
    t.email,
    t.phone,
    t.address,
    t.bloodType,
    t.sex,
    t.birthday,
    t."createdAt",
    COUNT(DISTINCT s.id) as subject_count,
    COUNT(DISTINCT c.id) as class_count,
    COUNT(DISTINCT l.id) as lesson_count,
    COALESCE(SUM(cl.capacity), 0) as total_student_capacity,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, t."createdAt")) as experience_years
FROM "Teacher" t
LEFT JOIN "_SubjectToTeacher" st ON t.id = st."B"
LEFT JOIN "Subject" s ON st."A" = s.id
LEFT JOIN "_ClassToTeacher" ct ON t.id = ct."B"
LEFT JOIN "Class" c ON ct."A" = c.id
LEFT JOIN "Class" cl ON cl."supervisorId" = t.id
LEFT JOIN "Lesson" l ON t.id = l."teacherId"
GROUP BY t.id, t.username, t.name, t.surname, t.email, t.phone, 
         t.address, t.bloodType, t.sex, t.birthday, t."createdAt";

-- Create view for student summary
CREATE OR REPLACE VIEW student_summary AS
SELECT 
    s.id,
    s.username,
    s.name,
    s.surname,
    s.email,
    s.phone,
    s.address,
    s.bloodType,
    s.sex,
    s.birthday,
    s."createdAt",
    c.name as class_name,
    g.level as grade_level,
    p.name as parent_name,
    COUNT(DISTINCT a.id) as attendance_count,
    COUNT(DISTINCT r.id) as result_count
FROM "Student" s
LEFT JOIN "Class" c ON s."classId" = c.id
LEFT JOIN "Grade" g ON s."gradeId" = g.id
LEFT JOIN "Parent" p ON s."parentId" = p.id
LEFT JOIN "Attendance" a ON s.id = a."studentId"
LEFT JOIN "Result" r ON s.id = r."studentId"
GROUP BY s.id, s.username, s.name, s.surname, s.email, s.phone, 
         s.address, s.bloodType, s.sex, s.birthday, s."createdAt",
         c.name, g.level, p.name;

-- Comments for documentation
COMMENT ON TABLE "Teacher" IS 'Teachers in the school management system';
COMMENT ON TABLE "Student" IS 'Students enrolled in the school';
COMMENT ON TABLE "Parent" IS 'Parent/Guardian information';
COMMENT ON TABLE "Class" IS 'Class/Section information';
COMMENT ON TABLE "Subject" IS 'Academic subjects';
COMMENT ON TABLE "Lesson" IS 'Scheduled lessons/periods';
COMMENT ON TABLE "Exam" IS 'Examination records';
COMMENT ON TABLE "Assignment" IS 'Assignment records';
COMMENT ON TABLE "Result" IS 'Student results for exams and assignments';
COMMENT ON TABLE "Attendance" IS 'Daily attendance records';
COMMENT ON TABLE "Session" IS 'User session management';
COMMENT ON TABLE "AuditLog" IS 'Audit trail for all system changes';
COMMENT ON TABLE "Message" IS 'Internal messaging system';

-- Create database maintenance procedures
CREATE OR REPLACE FUNCTION maintenance_cleanup()
RETURNS void AS $$
BEGIN
    -- Clean up expired sessions
    DELETE FROM "Session" WHERE "expiresAt" < NOW();
    
    -- Clean up old audit logs (older than 1 year)
    DELETE FROM "AuditLog" WHERE "createdAt" < NOW() - INTERVAL '1 year';
    
    -- Update table statistics
    ANALYZE;
    
    RAISE NOTICE 'Database maintenance completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Create a role for the application
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'school_app') THEN
        CREATE ROLE school_app WITH LOGIN PASSWORD 'secure_password_here';
    END IF;
END
$$;

-- Grant permissions to the application role
GRANT CONNECT ON DATABASE school_management TO school_app;
GRANT USAGE ON SCHEMA public TO school_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO school_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO school_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO school_app;

COMMIT;