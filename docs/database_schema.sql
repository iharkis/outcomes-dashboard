-- PostgreSQL Database Schema for LDA Outcomes Tool
-- Version: 1.0
-- Target: PostgreSQL 14+

-- ================================================
-- EXTENSIONS
-- ================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS
-- ================================================

CREATE TYPE user_role AS ENUM ('reader', 'contributor', 'manager', 'administrator');
CREATE TYPE decision_status AS ENUM ('pending', 'approved', 'implemented', 'reviewed', 'cancelled');
CREATE TYPE trend_indicator AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE action_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE action_status AS ENUM ('pending', 'in_progress', 'completed');

-- ================================================
-- TABLE: users
-- Stores user information from Microsoft Entra ID
-- ================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entra_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'contributor',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ================================================
-- TABLE: projects
-- Stores project information
-- ================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    reference TEXT NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT projects_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT projects_reference_not_empty CHECK (length(trim(reference)) > 0)
);

-- ================================================
-- TABLE: outcomes
-- Stores outcomes for each project with auto-sequencing
-- ================================================
CREATE TABLE outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    heading TEXT NOT NULL,
    description TEXT,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT outcomes_heading_not_empty CHECK (length(trim(heading)) > 0),
    CONSTRAINT outcomes_sequence_positive CHECK (sequence_order > 0),
    CONSTRAINT outcomes_unique_sequence UNIQUE (project_id, sequence_order)
);

-- Computed column function for outcome letter
CREATE OR REPLACE FUNCTION get_outcome_letter(seq INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF seq <= 0 THEN
        RETURN NULL;
    ELSIF seq <= 26 THEN
        RETURN chr(64 + seq); -- A-Z
    ELSE
        -- For sequences > 26, return AA, AB, AC, etc.
        RETURN chr(64 + ((seq - 1) / 26)) || chr(64 + ((seq - 1) % 26) + 1);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================
-- TABLE: touchpoints
-- Stores touchpoints for each project with auto-numbering
-- ================================================
CREATE TABLE touchpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    heading TEXT NOT NULL,
    description TEXT,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT touchpoints_heading_not_empty CHECK (length(trim(heading)) > 0),
    CONSTRAINT touchpoints_sequence_positive CHECK (sequence_order > 0),
    CONSTRAINT touchpoints_unique_sequence UNIQUE (project_id, sequence_order)
);

-- Computed column function for touchpoint number
CREATE OR REPLACE FUNCTION get_touchpoint_number(seq INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN 'TP' || seq::TEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================
-- TABLE: indicators
-- Stores indicators for each project
-- ================================================
CREATE TABLE indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    baseline TEXT,
    final_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT indicators_description_not_empty CHECK (length(trim(description)) > 0)
);

-- ================================================
-- TABLE: indicator_outcomes
-- Junction table: Many-to-many relationship between indicators and outcomes
-- ================================================
CREATE TABLE indicator_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_id UUID NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
    outcome_id UUID NOT NULL REFERENCES outcomes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT indicator_outcomes_unique UNIQUE (indicator_id, outcome_id)
);

-- ================================================
-- TABLE: indicator_touchpoints
-- Junction table: Many-to-many relationship between indicators and touchpoints
-- ================================================
CREATE TABLE indicator_touchpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_id UUID NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
    touchpoint_id UUID NOT NULL REFERENCES touchpoints(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT indicator_touchpoints_unique UNIQUE (indicator_id, touchpoint_id)
);

-- ================================================
-- TABLE: decisions
-- Stores project decisions and their impacts
-- ================================================
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reference_number TEXT,
    decision_date DATE,
    topic TEXT,
    status decision_status,
    decision_description TEXT,
    decision_justification TEXT,
    further_actions TEXT,
    overall_impact TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: decision_outcome_impacts
-- Stores specific impacts of decisions on individual outcomes
-- ================================================
CREATE TABLE decision_outcome_impacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    outcome_id UUID NOT NULL REFERENCES outcomes(id) ON DELETE CASCADE,
    trend trend_indicator NOT NULL,
    impact_description TEXT,

    CONSTRAINT decision_outcome_impacts_unique UNIQUE (decision_id, outcome_id)
);

-- ================================================
-- TABLE: touchpoint_evaluations
-- Stores evaluations for each touchpoint
-- ================================================
CREATE TABLE touchpoint_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    touchpoint_id UUID NOT NULL REFERENCES touchpoints(id) ON DELETE CASCADE,
    decision_making_evaluation TEXT,
    evaluated_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    evaluated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- One evaluation per touchpoint per project
    CONSTRAINT touchpoint_evaluations_unique UNIQUE (project_id, touchpoint_id)
);

-- ================================================
-- TABLE: outcome_progress
-- Stores progress tracking for outcomes within touchpoint evaluations
-- ================================================
CREATE TABLE outcome_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    touchpoint_evaluation_id UUID NOT NULL REFERENCES touchpoint_evaluations(id) ON DELETE CASCADE,
    outcome_id UUID NOT NULL REFERENCES outcomes(id) ON DELETE CASCADE,
    status_description TEXT,
    trend trend_indicator,
    evidence TEXT,

    CONSTRAINT outcome_progress_unique UNIQUE (touchpoint_evaluation_id, outcome_id)
);

-- ================================================
-- TABLE: action_items
-- Stores action items within touchpoint evaluations
-- ================================================
CREATE TABLE action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    touchpoint_evaluation_id UUID NOT NULL REFERENCES touchpoint_evaluations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    priority action_priority NOT NULL DEFAULT 'medium',
    due_date DATE,
    status action_status NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT action_items_description_not_empty CHECK (length(trim(description)) > 0),
    CONSTRAINT action_items_completed_check CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status != 'completed' AND completed_at IS NULL)
    )
);

-- ================================================
-- TABLE: final_reviews
-- Stores final project review information
-- ================================================
CREATE TABLE final_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_reflection TEXT,
    change_analysis TEXT,
    lessons_learnt TEXT,
    standout_stats TEXT,
    reviewed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- One final review per project
    CONSTRAINT final_reviews_unique UNIQUE (project_id)
);

-- ================================================
-- TABLE: final_outcome_evaluations
-- Stores final evaluations for each outcome
-- ================================================
CREATE TABLE final_outcome_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    final_review_id UUID NOT NULL REFERENCES final_reviews(id) ON DELETE CASCADE,
    outcome_id UUID NOT NULL REFERENCES outcomes(id) ON DELETE CASCADE,
    achievement_description TEXT,
    overall_assessment TEXT,

    CONSTRAINT final_outcome_evaluations_unique UNIQUE (final_review_id, outcome_id)
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Users
CREATE INDEX idx_users_entra_id ON users(entra_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Projects
CREATE INDEX idx_projects_reference ON projects(reference);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_is_active ON projects(is_active);

-- Outcomes
CREATE INDEX idx_outcomes_project_id ON outcomes(project_id);
CREATE INDEX idx_outcomes_project_sequence ON outcomes(project_id, sequence_order);
CREATE INDEX idx_outcomes_is_active ON outcomes(is_active);

-- Touchpoints
CREATE INDEX idx_touchpoints_project_id ON touchpoints(project_id);
CREATE INDEX idx_touchpoints_project_sequence ON touchpoints(project_id, sequence_order);
CREATE INDEX idx_touchpoints_is_active ON touchpoints(is_active);

-- Indicators
CREATE INDEX idx_indicators_project_id ON indicators(project_id);
CREATE INDEX idx_indicators_is_active ON indicators(is_active);

-- Indicator Outcomes
CREATE INDEX idx_indicator_outcomes_indicator ON indicator_outcomes(indicator_id);
CREATE INDEX idx_indicator_outcomes_outcome ON indicator_outcomes(outcome_id);

-- Indicator Touchpoints
CREATE INDEX idx_indicator_touchpoints_indicator ON indicator_touchpoints(indicator_id);
CREATE INDEX idx_indicator_touchpoints_touchpoint ON indicator_touchpoints(touchpoint_id);

-- Decisions
CREATE INDEX idx_decisions_project_id ON decisions(project_id);
CREATE INDEX idx_decisions_created_by ON decisions(created_by);
CREATE INDEX idx_decisions_decision_date ON decisions(decision_date DESC);
CREATE INDEX idx_decisions_status ON decisions(status);

-- Decision Outcome Impacts
CREATE INDEX idx_decision_outcome_impacts_decision ON decision_outcome_impacts(decision_id);
CREATE INDEX idx_decision_outcome_impacts_outcome ON decision_outcome_impacts(outcome_id);

-- Touchpoint Evaluations
CREATE INDEX idx_touchpoint_evaluations_project ON touchpoint_evaluations(project_id);
CREATE INDEX idx_touchpoint_evaluations_touchpoint ON touchpoint_evaluations(touchpoint_id);
CREATE INDEX idx_touchpoint_evaluations_evaluated_by ON touchpoint_evaluations(evaluated_by);

-- Outcome Progress
CREATE INDEX idx_outcome_progress_evaluation ON outcome_progress(touchpoint_evaluation_id);
CREATE INDEX idx_outcome_progress_outcome ON outcome_progress(outcome_id);

-- Action Items
CREATE INDEX idx_action_items_evaluation ON action_items(touchpoint_evaluation_id);
CREATE INDEX idx_action_items_status ON action_items(status);
CREATE INDEX idx_action_items_due_date ON action_items(due_date);

-- Final Reviews
CREATE INDEX idx_final_reviews_project ON final_reviews(project_id);
CREATE INDEX idx_final_reviews_reviewed_by ON final_reviews(reviewed_by);

-- Final Outcome Evaluations
CREATE INDEX idx_final_outcome_evaluations_review ON final_outcome_evaluations(final_review_id);
CREATE INDEX idx_final_outcome_evaluations_outcome ON final_outcome_evaluations(outcome_id);

-- ================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ================================================

-- Generic function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_outcomes_updated_at
    BEFORE UPDATE ON outcomes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_touchpoints_updated_at
    BEFORE UPDATE ON touchpoints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_indicators_updated_at
    BEFORE UPDATE ON indicators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_decisions_updated_at
    BEFORE UPDATE ON decisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_touchpoint_evaluations_updated_at
    BEFORE UPDATE ON touchpoint_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_action_items_updated_at
    BEFORE UPDATE ON action_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_final_reviews_updated_at
    BEFORE UPDATE ON final_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Function to get next sequence order for outcomes
CREATE OR REPLACE FUNCTION get_next_outcome_sequence(p_project_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT MAX(sequence_order) + 1
         FROM outcomes
         WHERE project_id = p_project_id AND is_active = TRUE),
        1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get next sequence order for touchpoints
CREATE OR REPLACE FUNCTION get_next_touchpoint_sequence(p_project_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT MAX(sequence_order) + 1
         FROM touchpoints
         WHERE project_id = p_project_id AND is_active = TRUE),
        1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to reorder outcomes after deletion
CREATE OR REPLACE FUNCTION reorder_outcomes(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
    WITH ordered_outcomes AS (
        SELECT id,
               ROW_NUMBER() OVER (ORDER BY sequence_order, created_at) AS new_sequence
        FROM outcomes
        WHERE project_id = p_project_id AND is_active = TRUE
    )
    UPDATE outcomes o
    SET sequence_order = oo.new_sequence,
        updated_at = CURRENT_TIMESTAMP
    FROM ordered_outcomes oo
    WHERE o.id = oo.id;
END;
$$ LANGUAGE plpgsql;

-- Function to reorder touchpoints after deletion
CREATE OR REPLACE FUNCTION reorder_touchpoints(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
    WITH ordered_touchpoints AS (
        SELECT id,
               ROW_NUMBER() OVER (ORDER BY sequence_order, created_at) AS new_sequence
        FROM touchpoints
        WHERE project_id = p_project_id AND is_active = TRUE
    )
    UPDATE touchpoints t
    SET sequence_order = ot.new_sequence,
        updated_at = CURRENT_TIMESTAMP
    FROM ordered_touchpoints ot
    WHERE t.id = ot.id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- VIEWS FOR SIMPLIFIED DATA ACCESS
-- ================================================

-- View: Project summary with counts
CREATE OR REPLACE VIEW vw_project_summary AS
SELECT
    p.id,
    p.name,
    p.reference,
    p.created_by,
    u.display_name AS created_by_name,
    p.created_at,
    p.updated_at,
    p.is_active,
    (SELECT COUNT(*) FROM outcomes WHERE project_id = p.id AND is_active = TRUE) AS outcome_count,
    (SELECT COUNT(*) FROM touchpoints WHERE project_id = p.id AND is_active = TRUE) AS touchpoint_count,
    (SELECT COUNT(*) FROM indicators WHERE project_id = p.id AND is_active = TRUE) AS indicator_count,
    (SELECT COUNT(*) FROM decisions WHERE project_id = p.id) AS decision_count,
    (SELECT COUNT(*) FROM touchpoint_evaluations WHERE project_id = p.id) AS evaluation_count,
    (SELECT COUNT(*) FROM final_reviews WHERE project_id = p.id) AS review_count
FROM projects p
INNER JOIN users u ON p.created_by = u.id
WHERE p.is_active = TRUE;

-- View: Outcomes with computed letter
CREATE OR REPLACE VIEW vw_outcomes AS
SELECT
    o.id,
    o.project_id,
    o.heading,
    o.description,
    o.sequence_order,
    get_outcome_letter(o.sequence_order) AS letter,
    o.created_at,
    o.updated_at,
    o.is_active
FROM outcomes o
WHERE o.is_active = TRUE;

-- View: Touchpoints with computed number
CREATE OR REPLACE VIEW vw_touchpoints AS
SELECT
    t.id,
    t.project_id,
    t.heading,
    t.description,
    t.sequence_order,
    get_touchpoint_number(t.sequence_order) AS number,
    t.created_at,
    t.updated_at,
    t.is_active
FROM touchpoints t
WHERE t.is_active = TRUE;

-- View: Indicators with relationships
CREATE OR REPLACE VIEW vw_indicator_details AS
SELECT
    i.id,
    i.project_id,
    i.description,
    i.baseline,
    i.final_value,
    i.created_at,
    i.updated_at,
    -- Array of outcome letters
    ARRAY(
        SELECT get_outcome_letter(o.sequence_order)
        FROM indicator_outcomes io
        INNER JOIN outcomes o ON io.outcome_id = o.id
        WHERE io.indicator_id = i.id AND o.is_active = TRUE
        ORDER BY o.sequence_order
    ) AS outcome_letters,
    -- Array of outcome IDs
    ARRAY(
        SELECT io.outcome_id
        FROM indicator_outcomes io
        INNER JOIN outcomes o ON io.outcome_id = o.id
        WHERE io.indicator_id = i.id AND o.is_active = TRUE
        ORDER BY o.sequence_order
    ) AS outcome_ids,
    -- Array of touchpoint numbers
    ARRAY(
        SELECT get_touchpoint_number(t.sequence_order)
        FROM indicator_touchpoints it
        INNER JOIN touchpoints t ON it.touchpoint_id = t.id
        WHERE it.indicator_id = i.id AND t.is_active = TRUE
        ORDER BY t.sequence_order
    ) AS touchpoint_numbers,
    -- Array of touchpoint IDs
    ARRAY(
        SELECT it.touchpoint_id
        FROM indicator_touchpoints it
        INNER JOIN touchpoints t ON it.touchpoint_id = t.id
        WHERE it.indicator_id = i.id AND t.is_active = TRUE
        ORDER BY t.sequence_order
    ) AS touchpoint_ids
FROM indicators i
WHERE i.is_active = TRUE;

-- ================================================
-- AUDIT LOGGING (Optional but Recommended)
-- ================================================

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email TEXT,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- ================================================
-- SEED DATA (Optional - for initial setup)
-- ================================================

-- Insert default admin user (will be replaced by actual Entra ID users)
-- This is just for initial setup/testing
INSERT INTO users (id, entra_id, email, display_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'temp-admin',
    'admin@example.com',
    'System Administrator',
    'administrator'
) ON CONFLICT (entra_id) DO NOTHING;

-- ================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================

COMMENT ON TABLE users IS 'User accounts synchronized from Microsoft Entra ID';
COMMENT ON TABLE projects IS 'Project master table';
COMMENT ON TABLE outcomes IS 'Desired project outcomes with auto-sequencing (A, B, C...)';
COMMENT ON TABLE touchpoints IS 'Project touchpoints with auto-numbering (TP1, TP2...)';
COMMENT ON TABLE indicators IS 'Measurable indicators linked to outcomes and touchpoints';
COMMENT ON TABLE indicator_outcomes IS 'Many-to-many: which outcomes each indicator measures';
COMMENT ON TABLE indicator_touchpoints IS 'Many-to-many: at which touchpoints each indicator is measured';
COMMENT ON TABLE decisions IS 'Project decision log';
COMMENT ON TABLE decision_outcome_impacts IS 'Specific impacts of decisions on individual outcomes';
COMMENT ON TABLE touchpoint_evaluations IS 'Evaluations performed at each touchpoint';
COMMENT ON TABLE outcome_progress IS 'Outcome progress tracked within touchpoint evaluations';
COMMENT ON TABLE action_items IS 'Action items identified during evaluations';
COMMENT ON TABLE final_reviews IS 'Final project review and retrospective';
COMMENT ON TABLE final_outcome_evaluations IS 'Final evaluation for each outcome';
COMMENT ON TABLE audit_log IS 'Audit trail of data changes';

-- ================================================
-- GRANTS (Adjust based on your security model)
-- ================================================

-- Example: Create roles for the application
-- CREATE ROLE lda_app_user;
-- GRANT CONNECT ON DATABASE your_database_name TO lda_app_user;
-- GRANT USAGE ON SCHEMA public TO lda_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lda_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lda_app_user;

-- Note: Adjust grants based on your specific security requirements
