# LDA Outcomes Tool - Requirements Document

## 1. Executive Summary

The LDA Outcomes Tool is a web-based project management system designed to help organizations plan, track, and evaluate project outcomes through a structured four-phase approach: Plan, Create, Evaluate, and Review. The system enables teams to define project outcomes, establish measurement indicators, track touchpoints, log decisions, and conduct comprehensive project evaluations.

## 2. Project Overview

### 2.1 Purpose
Enable organizations to systematically track project outcomes, measure progress through defined indicators, and maintain comprehensive decision logs throughout the project lifecycle.

### 2.2 Target Users
- Project Managers
- Engagement Officers (EOs)
- Team Members
- Project Stakeholders

### 2.3 Current State
- Client-side prototype using HTML/CSS/JavaScript
- localStorage-based data persistence
- Single-user, browser-based application

### 2.4 Desired State
- Multi-user web application
- Centralized database
- Hosted on company infrastructure
- Enterprise authentication integration

## 3. Functional Requirements

### 3.1 Project Management

#### 3.1.1 Project CRUD Operations
- Create new projects with name and reference number
- View list of all projects with pagination (10/25/50/100 per page)
- Search projects by name or reference number
- Sort projects by name, reference, or creation date
- Edit project details
- Soft delete projects (maintain data integrity)

#### 3.1.2 Project Display
- Show project summary cards with:
  - Project name
  - Project reference number
  - Creation date
  - Count of outcomes
  - Count of touchpoints
  - Count of indicators
  - Quick action buttons (View, Edit, Delete)

### 3.2 Phase 1: Plan

#### 3.2.1 Outcomes Management
- Add individual outcomes with headings
- Bulk add outcomes (one per line via textarea)
- Auto-assign letters to outcomes (A, B, C, etc.)
- Maintain sequence order
- Edit outcome headings
- Delete outcomes with automatic re-sequencing
- Display outcomes list with letter identifiers

#### 3.2.2 Touchpoints Management
- Add individual touchpoints with heading and description
- Bulk add touchpoints (format: "Heading | Description")
- Auto-assign touchpoint numbers (TP1, TP2, TP3, etc.)
- Maintain sequence order
- Edit touchpoint details
- Delete touchpoints with automatic re-numbering
- Display touchpoints list with identifiers

#### 3.2.3 Indicators Management
- Add individual indicators with description and baseline value
- Bulk add indicators (format: "Description | Baseline")
- Edit indicator details
- Delete indicators
- Display indicators list with baseline values

#### 3.2.4 Relationships Mapping
- Define many-to-many relationships between:
  - Indicators → Outcomes (which outcomes each indicator measures)
  - Indicators → Touchpoints (where each indicator is measured)
- Two mapping modes:
  - **By Indicator**: Select outcomes and touchpoints for each indicator
  - **Matrix View**: Visual grid showing all relationships
- Save and update relationships
- Display relationship summaries

### 3.3 Phase 2: Create

#### 3.3.1 Decision Log
- Record project decisions with:
  - Reference number
  - Date
  - Topic
  - Status (Pending, Approved, Implemented, Reviewed, Cancelled)
  - Project decision description
  - Decision justification
  - Further actions
  - Overall impact on outcomes
  - Specific impact per outcome with trend indicators (↑ Positive, → Neutral, ↓ Negative)
- Display decisions in tabular format
- Edit existing decisions
- Delete decisions
- Export decision log to CSV

#### 3.3.2 Decision Impact Tracking
- Select trend indicator for each outcome affected by decision
- Free-text field to describe impact details
- Link decisions to specific outcomes

### 3.4 Phase 3: Evaluate

#### 3.4.1 Touchpoint Evaluations
- Select touchpoint for evaluation
- Record how outcomes informed decision-making for that touchpoint
- Track progress for each outcome at that touchpoint:
  - Current status/description
  - Trend (↑ Positive, → Neutral, ↓ Negative)
  - Supporting evidence/comments
- Add action items with:
  - Description
  - Priority (Low, Medium, High)
  - Due date
  - Status (Pending, In Progress, Completed)
- Mark action items as complete
- Delete action items
- Save complete evaluation

#### 3.4.2 Evaluation Views
- **Evaluate by Touchpoint**: Select and evaluate one touchpoint at a time
- **View All Answers**: Consolidated view of all touchpoint evaluations
- Export evaluations to CSV
- Export all project data (comprehensive export)

### 3.5 Phase 4: Review

#### 3.5.1 Final Project Review
- Project reflection questions:
  - How outcomes informed the whole project
  - Easy wins and hurdles
  - What would be done differently
- Final evaluation for each outcome:
  - Achievement description
  - Overall assessment
- Final measurements for each indicator:
  - Baseline value (read-only)
  - Final value
  - Variance/change
- Retrospective analysis:
  - **Change**: Evaluate and analyze findings
  - **Lessons Learnt**: Key takeaways, communication plans, case study potential
  - **Standout Success Stats**: Notable statistics and metrics
- Save final review

#### 3.5.2 Final Report
- Generate comprehensive final report with all project data
- View report in-app
- Download report as PDF
- Include:
  - Project overview
  - All outcomes with final evaluations
  - All indicators with baseline and final measurements
  - Decision log summary
  - Evaluation summaries
  - Retrospective analysis

### 3.6 User Interface Navigation

#### 3.6.1 Project Selection View
- Landing page showing all projects
- Search and filter capabilities
- Create new project button
- Project cards/table view

#### 3.6.2 Project Workspace
- Left sidebar navigation with four main sections:
  1. Plan (with sub-items: Outcomes, Touchpoints, Indicators, Relationships)
  2. Create
  3. Evaluate
  4. Review
- Breadcrumb or header showing current project
- Back to projects button

#### 3.6.3 Responsive Design
- Support desktop and tablet views
- Mobile-friendly layouts
- Accessible UI components

### 3.7 Data Export Capabilities
- Export decision log to CSV
- Export evaluations to CSV
- Export all project data (comprehensive)
- Generate PDF final report

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time < 2 seconds
- Support up to 100 concurrent users
- Database queries optimized with appropriate indexes
- Pagination for large datasets

### 4.2 Scalability
- Support multiple projects per user
- Support up to 1,000 projects in system
- Efficient handling of many-to-many relationships

### 4.3 Reliability
- 99.5% uptime during business hours
- Data backup and recovery procedures
- Transaction integrity for database operations

### 4.4 Security
- Enterprise authentication via Microsoft 365 Entra ID
- Role-based access control (RBAC):
  - **Reader**: View-only access
  - **Contributor**: Create and edit own projects
  - **Manager**: Edit any project
  - **Administrator**: Full system access including user management
- HTTPS encryption for all communications
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure session management

### 4.5 Usability
- Intuitive interface requiring minimal training
- Consistent design patterns throughout
- Clear error messages and validation feedback
- Inline help text and tooltips
- Empty states with actionable guidance

### 4.6 Maintainability
- Clean, documented code
- Separation of concerns (frontend/backend)
- Database migrations for schema changes
- Logging and monitoring capabilities

### 4.7 Compatibility
- Support modern browsers:
  - Chrome (latest 2 versions)
  - Edge (latest 2 versions)
  - Firefox (latest 2 versions)
  - Safari (latest 2 versions)
- Minimum screen resolution: 1280x720

## 5. Technical Architecture

### 5.1 Deployment Model
- **Type**: Multi-user web application
- **Hosting**: Company infrastructure (on-premises or private cloud)
- **Architecture**: Client-server model

### 5.2 Technology Stack

#### 5.2.1 Database
- **Primary**: PostgreSQL 14+
- **Rationale**:
  - Open source and enterprise-grade
  - Excellent JSON support for flexible data structures
  - Strong ACID compliance
  - Good performance with proper indexing
  - Wide community support

#### 5.2.2 Backend (Recommended Options)

**Option A: ASP.NET Core 8.0+ (Recommended)**
- **Pros**:
  - Native Microsoft Entra ID integration (Microsoft.Identity.Web)
  - Enterprise-friendly and well-supported in corporate environments
  - Excellent performance
  - Strong typing with C#
  - Built-in dependency injection and middleware
  - Entity Framework Core for PostgreSQL
- **Cons**:
  - Requires .NET runtime on server
  - Team may need C# knowledge

**Option B: Node.js/Express**
- **Pros**:
  - JavaScript throughout stack (if frontend uses modern JS framework)
  - Large ecosystem (npm packages)
  - Quick development
  - Good PostgreSQL libraries (node-postgres, Sequelize, TypeORM)
- **Cons**:
  - Entra ID integration requires additional libraries (@azure/msal-node)
  - Async error handling complexity
  - Less type safety (unless using TypeScript)

**Recommendation**: ASP.NET Core 8.0 for this project due to seamless Entra ID integration and enterprise deployment considerations.

#### 5.2.3 Frontend

**Recommended**: Modern framework with component-based architecture

**Option A: Vue.js 3 + Vite**
- **Pros**:
  - Gentle learning curve
  - Excellent documentation
  - Component-based architecture
  - Reactive state management (Pinia)
  - Easy to migrate from vanilla JS prototype
- **Cons**:
  - Smaller ecosystem than React

**Option B: React + Vite**
- **Pros**:
  - Large ecosystem
  - Widely adopted
  - Strong typing with TypeScript
  - Many UI component libraries
- **Cons**:
  - Steeper learning curve
  - More boilerplate code

**Option C: Svelte/SvelteKit**
- **Pros**:
  - Simplest syntax, closest to vanilla JS
  - Excellent performance (compiles to vanilla JS)
  - Built-in state management
  - Small bundle sizes
- **Cons**:
  - Smaller ecosystem
  - Less enterprise adoption

**Recommendation**: Vue.js 3 for balance of simplicity and capability, or React if team has existing React experience.

#### 5.2.4 CSS Framework
- **Recommended**: Tailwind CSS or Bootstrap 5
- **Rationale**: Pre-built components, consistent styling, responsive utilities

#### 5.2.5 Authentication
- **Microsoft Entra ID** (formerly Azure AD)
- Implementation approach:
  - ASP.NET Core: Microsoft.Identity.Web
  - Node.js: @azure/msal-node (backend) + @azure/msal-browser (frontend)
- OAuth 2.0 / OpenID Connect protocols
- Single Sign-On (SSO) capability

### 5.3 Database Schema

#### 5.3.1 Core Tables
1. **users**
   - id (uuid, primary key)
   - entra_id (text, unique) - Microsoft Entra ID object ID
   - email (text, unique)
   - display_name (text)
   - role (enum: reader, contributor, manager, administrator)
   - created_at (timestamp)
   - updated_at (timestamp)
   - last_login (timestamp)
   - is_active (boolean)

2. **projects**
   - id (uuid, primary key)
   - name (text, not null)
   - reference (text, unique, not null)
   - created_by (uuid, foreign key → users.id)
   - created_at (timestamp)
   - updated_at (timestamp)
   - is_active (boolean)

3. **outcomes**
   - id (uuid, primary key)
   - project_id (uuid, foreign key → projects.id, cascade delete)
   - heading (text, not null)
   - description (text)
   - sequence_order (integer, not null)
   - letter (text, computed: A, B, C, etc.)
   - created_at (timestamp)
   - updated_at (timestamp)
   - is_active (boolean)
   - UNIQUE constraint on (project_id, sequence_order)

4. **touchpoints**
   - id (uuid, primary key)
   - project_id (uuid, foreign key → projects.id, cascade delete)
   - heading (text, not null)
   - description (text)
   - sequence_order (integer, not null)
   - number (text, computed: TP1, TP2, etc.)
   - created_at (timestamp)
   - updated_at (timestamp)
   - is_active (boolean)
   - UNIQUE constraint on (project_id, sequence_order)

5. **indicators**
   - id (uuid, primary key)
   - project_id (uuid, foreign key → projects.id, cascade delete)
   - description (text, not null)
   - baseline (text)
   - final_value (text)
   - created_at (timestamp)
   - updated_at (timestamp)
   - is_active (boolean)

6. **indicator_outcomes** (junction table)
   - id (uuid, primary key)
   - indicator_id (uuid, foreign key → indicators.id, cascade delete)
   - outcome_id (uuid, foreign key → outcomes.id, cascade delete)
   - created_at (timestamp)
   - UNIQUE constraint on (indicator_id, outcome_id)

7. **indicator_touchpoints** (junction table)
   - id (uuid, primary key)
   - indicator_id (uuid, foreign key → indicators.id, cascade delete)
   - touchpoint_id (uuid, foreign key → touchpoints.id, cascade delete)
   - created_at (timestamp)
   - UNIQUE constraint on (indicator_id, touchpoint_id)

8. **decisions**
   - id (uuid, primary key)
   - project_id (uuid, foreign key → projects.id, cascade delete)
   - reference_number (text)
   - decision_date (date)
   - topic (text)
   - status (enum: pending, approved, implemented, reviewed, cancelled)
   - decision_description (text)
   - decision_justification (text)
   - further_actions (text)
   - overall_impact (text)
   - created_by (uuid, foreign key → users.id)
   - created_at (timestamp)
   - updated_at (timestamp)

9. **decision_outcome_impacts** (decision impact on specific outcomes)
   - id (uuid, primary key)
   - decision_id (uuid, foreign key → decisions.id, cascade delete)
   - outcome_id (uuid, foreign key → outcomes.id, cascade delete)
   - trend (enum: positive, neutral, negative)
   - impact_description (text)

10. **touchpoint_evaluations**
    - id (uuid, primary key)
    - project_id (uuid, foreign key → projects.id, cascade delete)
    - touchpoint_id (uuid, foreign key → touchpoints.id, cascade delete)
    - decision_making_evaluation (text) - how outcomes informed decisions
    - evaluated_by (uuid, foreign key → users.id)
    - evaluated_at (timestamp)
    - created_at (timestamp)
    - updated_at (timestamp)

11. **outcome_progress** (progress per outcome per touchpoint)
    - id (uuid, primary key)
    - touchpoint_evaluation_id (uuid, foreign key → touchpoint_evaluations.id, cascade delete)
    - outcome_id (uuid, foreign key → outcomes.id)
    - status_description (text)
    - trend (enum: positive, neutral, negative)
    - evidence (text)

12. **action_items**
    - id (uuid, primary key)
    - touchpoint_evaluation_id (uuid, foreign key → touchpoint_evaluations.id, cascade delete)
    - description (text, not null)
    - priority (enum: low, medium, high)
    - due_date (date)
    - status (enum: pending, in_progress, completed)
    - completed_at (timestamp)
    - created_at (timestamp)
    - updated_at (timestamp)

13. **final_reviews**
    - id (uuid, primary key)
    - project_id (uuid, foreign key → projects.id, cascade delete)
    - project_reflection (text)
    - change_analysis (text)
    - lessons_learnt (text)
    - standout_stats (text)
    - reviewed_by (uuid, foreign key → users.id)
    - reviewed_at (timestamp)
    - created_at (timestamp)
    - updated_at (timestamp)

14. **final_outcome_evaluations**
    - id (uuid, primary key)
    - final_review_id (uuid, foreign key → final_reviews.id, cascade delete)
    - outcome_id (uuid, foreign key → outcomes.id)
    - achievement_description (text)
    - overall_assessment (text)

#### 5.3.2 Indexes
- Primary keys on all tables (automatic)
- Foreign key indexes
- projects.reference (unique)
- projects.created_by
- outcomes.project_id, sequence_order
- touchpoints.project_id, sequence_order
- indicators.project_id
- indicator_outcomes: (indicator_id, outcome_id)
- indicator_touchpoints: (indicator_id, touchpoint_id)
- decisions.project_id
- users.entra_id (unique)
- users.email (unique)

### 5.4 API Design

#### 5.4.1 RESTful API Principles
- Use standard HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Resource-based URLs
- JSON request/response format
- Proper HTTP status codes
- Versioned endpoints (/api/v1/)

#### 5.4.2 Key Endpoints

**Authentication**
- POST /api/v1/auth/login - Initiate Entra ID login
- POST /api/v1/auth/logout - End session
- GET /api/v1/auth/me - Get current user info

**Projects**
- GET /api/v1/projects - List projects (with pagination, search, sort)
- POST /api/v1/projects - Create project
- GET /api/v1/projects/:id - Get project details
- PUT /api/v1/projects/:id - Update project
- DELETE /api/v1/projects/:id - Soft delete project
- GET /api/v1/projects/:id/summary - Get project with counts

**Outcomes**
- GET /api/v1/projects/:projectId/outcomes - List outcomes
- POST /api/v1/projects/:projectId/outcomes - Create outcome
- POST /api/v1/projects/:projectId/outcomes/bulk - Bulk create outcomes
- PUT /api/v1/outcomes/:id - Update outcome
- DELETE /api/v1/outcomes/:id - Delete outcome (triggers re-sequencing)

**Touchpoints**
- GET /api/v1/projects/:projectId/touchpoints - List touchpoints
- POST /api/v1/projects/:projectId/touchpoints - Create touchpoint
- POST /api/v1/projects/:projectId/touchpoints/bulk - Bulk create
- PUT /api/v1/touchpoints/:id - Update touchpoint
- DELETE /api/v1/touchpoints/:id - Delete touchpoint (triggers re-numbering)

**Indicators**
- GET /api/v1/projects/:projectId/indicators - List indicators
- POST /api/v1/projects/:projectId/indicators - Create indicator
- POST /api/v1/projects/:projectId/indicators/bulk - Bulk create
- PUT /api/v1/indicators/:id - Update indicator
- DELETE /api/v1/indicators/:id - Delete indicator

**Relationships**
- GET /api/v1/indicators/:id/relationships - Get indicator relationships
- PUT /api/v1/indicators/:id/relationships - Update relationships
- GET /api/v1/projects/:projectId/relationships/matrix - Get matrix view data

**Decisions**
- GET /api/v1/projects/:projectId/decisions - List decisions
- POST /api/v1/projects/:projectId/decisions - Create decision
- PUT /api/v1/decisions/:id - Update decision
- DELETE /api/v1/decisions/:id - Delete decision
- GET /api/v1/projects/:projectId/decisions/export - Export to CSV

**Evaluations**
- GET /api/v1/projects/:projectId/evaluations - List all evaluations
- GET /api/v1/touchpoints/:touchpointId/evaluation - Get touchpoint evaluation
- POST /api/v1/touchpoints/:touchpointId/evaluation - Create/update evaluation
- POST /api/v1/evaluations/:id/actions - Add action item
- PUT /api/v1/actions/:id - Update action item
- DELETE /api/v1/actions/:id - Delete action item
- GET /api/v1/projects/:projectId/evaluations/export - Export to CSV

**Final Review**
- GET /api/v1/projects/:projectId/review - Get final review
- POST /api/v1/projects/:projectId/review - Create/update final review
- GET /api/v1/projects/:projectId/review/report - Generate PDF report

**Users (Admin only)**
- GET /api/v1/users - List users
- PUT /api/v1/users/:id/role - Update user role

#### 5.4.3 Request/Response Format

**Example Request (Create Outcome)**
```json
POST /api/v1/projects/123e4567-e89b-12d3-a456-426614174000/outcomes
{
  "heading": "Improve customer satisfaction"
}
```

**Example Response**
```json
{
  "success": true,
  "data": {
    "id": "987fcdeb-51a2-43d7-9876-543210fedcba",
    "projectId": "123e4567-e89b-12d3-a456-426614174000",
    "heading": "Improve customer satisfaction",
    "description": null,
    "sequenceOrder": 1,
    "letter": "A",
    "createdAt": "2024-10-08T12:00:00Z",
    "updatedAt": "2024-10-08T12:00:00Z"
  }
}
```

**Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Heading is required",
    "details": {
      "field": "heading"
    }
  }
}
```

### 5.5 Infrastructure Requirements

#### 5.5.1 Server Requirements
- **Web Server**:
  - ASP.NET Core: IIS or Kestrel behind reverse proxy (nginx/Apache)
  - Node.js: PM2 process manager behind nginx
- **CPU**: 2-4 cores minimum
- **RAM**: 4-8 GB minimum
- **Storage**: 50 GB minimum (database + logs + backups)

#### 5.5.2 Database Server
- PostgreSQL 14+ server
- Dedicated or shared depending on scale
- Regular automated backups
- Point-in-time recovery capability

#### 5.5.3 Network
- HTTPS/TLS 1.2+ required
- Internal network access or VPN
- Firewall configuration for necessary ports

#### 5.5.4 Dependencies
- Microsoft Entra ID tenant configuration
- App registration in Entra ID with:
  - Redirect URIs configured
  - API permissions: User.Read (minimum)
  - Client credentials for backend

## 6. Data Migration

### 6.1 Migration from Prototype
- Export existing localStorage data from prototype
- Transform to match new database schema
- Import via API or direct database import
- Validation and reconciliation

### 6.2 Migration Strategy
- Develop migration scripts
- Test on staging environment
- Backup existing data
- Execute migration with rollback plan
- Verify data integrity

## 7. Security Requirements

### 7.1 Authentication & Authorization
- Microsoft Entra ID integration (OAuth 2.0 / OpenID Connect)
- JWT tokens for API authentication
- Role-based access control (RBAC)
- Session timeout after 8 hours of inactivity

### 7.2 Data Protection
- HTTPS for all communications
- Encryption at rest for database
- Parameterized queries to prevent SQL injection
- Input validation and sanitization
- Content Security Policy (CSP) headers
- CSRF tokens for state-changing operations

### 7.3 Audit Logging
- Log user authentication events
- Log data modification operations
- Include: user ID, timestamp, action, resource
- Retain logs for minimum 90 days

### 7.4 Compliance
- GDPR considerations for user data
- Data retention policies
- Right to be forgotten implementation

## 8. Testing Requirements

### 8.1 Unit Testing
- Backend: xUnit (C#) or Jest (Node.js)
- Frontend: Vitest or Jest
- Target: >80% code coverage

### 8.2 Integration Testing
- API endpoint testing
- Database integration testing
- Authentication flow testing

### 8.3 End-to-End Testing
- Playwright or Cypress
- Critical user journeys:
  - Create project and add outcomes/touchpoints/indicators
  - Define relationships
  - Log decision
  - Complete touchpoint evaluation
  - Generate final review

### 8.4 User Acceptance Testing (UAT)
- Test with actual users
- Validate workflows match business needs
- Collect feedback for refinements

### 8.5 Performance Testing
- Load testing with expected concurrent users
- Database query performance
- Page load time validation

## 9. Deployment & DevOps

### 9.1 Environments
- **Development**: Local developer machines
- **Staging**: Pre-production testing environment
- **Production**: Live system on company infrastructure

### 9.2 CI/CD Pipeline (Optional but Recommended)
- Automated builds on code commit
- Automated test execution
- Deployment to staging on merge to main
- Manual approval for production deployment

### 9.3 Monitoring & Logging
- Application performance monitoring (APM)
- Error tracking and alerting
- Database performance monitoring
- User activity analytics

### 9.4 Backup & Recovery
- Daily automated database backups
- Backup retention: 30 days
- Regular restore testing (quarterly)
- Disaster recovery plan documented

## 10. Training & Documentation

### 10.1 User Documentation
- User guide covering all features
- Quick start guide
- FAQ section
- Video tutorials for key workflows

### 10.2 Administrator Documentation
- Installation guide
- Configuration guide
- User management procedures
- Backup and recovery procedures
- Troubleshooting guide

### 10.3 Developer Documentation
- API documentation (Swagger/OpenAPI)
- Database schema documentation
- Code architecture overview
- Contribution guidelines

### 10.4 Training Plan
- Admin training session (2 hours)
- End-user training session (1 hour)
- Training materials and videos
- Support channel establishment

## 11. Success Criteria

### 11.1 Functional Success
- All features from prototype working in multi-user environment
- Successful Entra ID authentication
- Data persisting correctly in PostgreSQL
- All CRUD operations functioning
- Export capabilities working

### 11.2 Performance Success
- Page load < 2 seconds
- Support 100 concurrent users without degradation
- Database queries < 500ms (99th percentile)

### 11.3 User Success
- 90% user satisfaction score
- <5 critical bugs in first month
- Users can complete tasks without support

### 11.4 Security Success
- Pass security audit
- No authentication bypass vulnerabilities
- No SQL injection vulnerabilities
- HTTPS enforced

## 12. Project Timeline (Estimated)

### Phase 1: Setup & Foundation (2-3 weeks)
- Environment setup
- Database schema implementation
- Backend API scaffolding
- Entra ID integration
- Basic authentication flow

### Phase 2: Core Features - Plan Phase (2-3 weeks)
- Projects CRUD
- Outcomes management
- Touchpoints management
- Indicators management
- Relationships mapping

### Phase 3: Create & Evaluate (2-3 weeks)
- Decision log
- Touchpoint evaluations
- Action items
- Export functionality

### Phase 4: Review & Polish (1-2 weeks)
- Final review feature
- PDF generation
- UI/UX refinements
- Testing

### Phase 5: Testing & Deployment (1-2 weeks)
- Comprehensive testing
- Bug fixes
- User acceptance testing
- Production deployment
- Training

**Total Estimated Timeline: 8-13 weeks**

## 13. Risks & Mitigation

### 13.1 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Entra ID integration complexity | High | Medium | Early POC, Microsoft documentation, consider consulting |
| Database performance issues | Medium | Low | Proper indexing, query optimization, load testing |
| Browser compatibility | Low | Medium | Cross-browser testing, use standard web technologies |

### 13.2 Project Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope creep | High | High | Clear requirements, change control process |
| Resource availability | Medium | Medium | Flexible timeline, prioritization |
| User adoption | High | Medium | Training, intuitive UI, user involvement in testing |

### 13.3 Security Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Unauthorized access | High | Low | Proper authentication, authorization, audit logging |
| Data breach | High | Low | Encryption, security testing, regular audits |
| Session hijacking | Medium | Low | Secure session management, HTTPS, short token expiry |

## 14. Budget Considerations

### 14.1 Development Costs
- Developer time (internal or contracted)
- Designer time for UI/UX
- QA/Testing resources

### 14.2 Infrastructure Costs
- Server hosting (if not existing infrastructure)
- Microsoft Entra ID licenses (typically included with M365)
- PostgreSQL hosting/licensing (free, but infrastructure costs)

### 14.3 Ongoing Costs
- Maintenance and support
- Server hosting and maintenance
- Backup storage
- Monitoring tools (optional)

## 15. Recommendations

### 15.1 Recommended Technology Stack
1. **Backend**: ASP.NET Core 8.0
2. **Frontend**: Vue.js 3 + Vite
3. **Database**: PostgreSQL 14+
4. **CSS**: Tailwind CSS
5. **Authentication**: Microsoft Entra ID via Microsoft.Identity.Web
6. **PDF Generation**: QuestPDF (C#) or Puppeteer (if Node.js)
7. **ORM**: Entity Framework Core with Npgsql
8. **API Documentation**: Swagger/OpenAPI

### 15.2 Development Approach
- Start with minimal viable product (MVP) covering Plan phase
- Iterative development with user feedback
- Continuous testing throughout development
- Early Entra ID integration testing

### 15.3 Key Considerations
- **Simplicity**: Prioritize simple, maintainable solutions over complex architectures
- **User Experience**: Maintain the intuitive flow from the prototype
- **Data Integrity**: Ensure proper foreign key constraints and transaction handling
- **Performance**: Index database appropriately, implement pagination everywhere
- **Security**: Security by default, not as an afterthought

## 16. Appendices

### Appendix A: Glossary
- **Entra ID**: Microsoft's cloud-based identity and access management service (formerly Azure AD)
- **Outcome**: A desired result or impact the project aims to achieve
- **Touchpoint**: A point of interaction or measurement during the project
- **Indicator**: A measurable metric used to track progress toward outcomes
- **LDA**: Local Development Agency (assumed)
- **EO**: Engagement Officer

### Appendix B: References
- Current prototype files: index.html, app.js, styles.css
- SQL Server schema (to be adapted for PostgreSQL): SQL_SERVER_SCHEMA.sql
- Microsoft Entra ID documentation: https://learn.microsoft.com/en-us/entra/
- PostgreSQL documentation: https://www.postgresql.org/docs/

### Appendix C: Infrastructure Decisions

**Confirmed Requirements:**
1. **Infrastructure**: Windows Server 2019/2022
2. **Tenancy**: Single tenant (single organization)
3. **Localization**: English only, no internationalization required
4. **Accessibility**: No specific WCAG compliance requirements

**Open Questions:**
1. Existing CI/CD tools preference?
2. Existing monitoring/logging infrastructure to integrate with?
3. Mobile app requirement (future consideration)?

---

**Document Version**: 1.0
**Last Updated**: 2024-10-08
**Next Review**: Upon stakeholder feedback
