-- Attendance Concurrency and Security Constraints

-- 1. Partial Unique Index to prevent multiple active sessions for one user
-- This ensures a user cannot "Check-in" if they already have an open log (checkOut IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_staff_log 
ON staff_logs (userId) 
WHERE (checkOut IS NULL);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_staff_logs_tenant_id ON staff_logs (tenantId);
CREATE INDEX IF NOT EXISTS idx_staff_logs_check_in ON staff_logs (checkIn DESC);

-- 3. Row Level Security (RLS) - Basic Tenant Isolation
ALTER TABLE staff_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see logs belonging to their tenant
-- Note: This requires the application to set the 'app.current_tenant_id' config
-- For this demo, we'll keep it simple: 
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_policy' AND tablename = 'staff_logs') THEN
        CREATE POLICY tenant_isolation_policy ON staff_logs
        USING (tenantId = current_setting('app.current_tenant_id', true));
    END IF;
END $$;
