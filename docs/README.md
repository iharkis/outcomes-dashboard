# LDA Outcomes Tool - Documentation Index

## Overview

The LDA Outcomes Tool is a comprehensive web-based project management system designed to help organizations systematically plan, track, and evaluate project outcomes through a structured four-phase approach.

**Key Features:**
- Define and track project outcomes, touchpoints, and indicators
- Establish relationships between indicators, outcomes, and touchpoints
- Log project decisions and their impact on outcomes
- Conduct evaluations at touchpoints
- Generate final project reviews and reports
- Microsoft Entra ID single sign-on
- Role-based access control

---

## Documentation Structure

### 1. [Requirements Document](REQUIREMENTS.md)
**Purpose**: Comprehensive functional and non-functional requirements

**Contains:**
- Complete feature specifications for all four phases (Plan, Create, Evaluate, Review)
- User interface requirements
- Non-functional requirements (performance, security, scalability)
- Technology stack recommendations
- Database schema overview
- API design principles
- Testing requirements
- Success criteria

**Read this if:** You need to understand what the system does, who it's for, and what the business requirements are.

---

### 2. [Architecture Documentation](ARCHITECTURE.md)
**Purpose**: Visual system architecture and component diagrams

**Contains:**
- System architecture diagram
- Database ERD (Entity Relationship Diagram)
- Component architecture (frontend & backend)
- Authentication flow diagrams
- Deployment architecture
- API architecture
- Data flow diagrams
- Security architecture
- Performance optimization strategies

**Read this if:** You need to understand how the system is structured, how components interact, or need to make architectural decisions.

---

### 3. [Database Schema](database_schema.sql)
**Purpose**: Complete PostgreSQL database schema

**Contains:**
- Table definitions for all entities
- Indexes for performance optimization
- Foreign key relationships
- Triggers for automatic timestamp updates
- Helper functions (sequencing, reordering)
- Views for simplified data access
- Audit logging table
- Comments and documentation

**Read this if:** You're setting up the database, need to understand data relationships, or are writing queries.

---

### 4. [API Specification](API_SPECIFICATION.md)
**Purpose**: Complete REST API documentation

**Contains:**
- All API endpoints with request/response examples
- Authentication endpoints
- Projects, Outcomes, Touchpoints, Indicators CRUD operations
- Relationships management
- Decisions logging
- Evaluations and Reviews
- Error response formats
- Pagination and rate limiting
- API versioning strategy

**Read this if:** You're developing the frontend, integrating with the API, or need to understand endpoint specifications.

---

### 5. [Deployment Guide](DEPLOYMENT_GUIDE.md)
**Purpose**: Step-by-step Windows Server deployment instructions

**Contains:**
- Prerequisites and server requirements
- Environment setup (IIS, .NET, PostgreSQL)
- Database setup and configuration
- Backend deployment steps
- Frontend deployment steps
- IIS configuration
- Microsoft Entra ID configuration
- Post-deployment verification
- Troubleshooting guide
- Production checklist

**Read this if:** You're deploying the application to Windows Server or troubleshooting deployment issues.

---

## Quick Reference

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Vue.js 3 + Vite + Tailwind CSS |
| **Backend** | ASP.NET Core 8.0 |
| **Database** | PostgreSQL 14+ |
| **ORM** | Entity Framework Core |
| **Authentication** | Microsoft Entra ID (OAuth 2.0) |
| **Web Server** | IIS 10+ (Windows Server) |
| **Runtime** | .NET 8.0 Runtime |

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/login` | POST | Initiate Entra ID login |
| `/api/v1/projects` | GET | List all projects |
| `/api/v1/projects` | POST | Create new project |
| `/api/v1/projects/:id/outcomes` | GET/POST | Manage outcomes |
| `/api/v1/projects/:id/touchpoints` | GET/POST | Manage touchpoints |
| `/api/v1/projects/:id/indicators` | GET/POST | Manage indicators |
| `/api/v1/projects/:id/decisions` | GET/POST | Decision log |
| `/api/v1/touchpoints/:id/evaluation` | POST | Save evaluation |
| `/api/v1/projects/:id/review` | GET/POST | Final review |

### Database Tables

**Core Domain:**
- `users` - User accounts from Entra ID
- `projects` - Project master table
- `outcomes` - Project outcomes (A, B, C...)
- `touchpoints` - Project touchpoints (TP1, TP2...)
- `indicators` - Measurement indicators

**Relationships:**
- `indicator_outcomes` - Which outcomes each indicator measures
- `indicator_touchpoints` - Where each indicator is measured

**Decision Management:**
- `decisions` - Project decision log
- `decision_outcome_impacts` - Impact of decisions on outcomes

**Evaluation:**
- `touchpoint_evaluations` - Evaluations at touchpoints
- `outcome_progress` - Outcome progress within evaluations
- `action_items` - Action items from evaluations

**Review:**
- `final_reviews` - Final project review
- `final_outcome_evaluations` - Final outcome assessments

### User Roles

| Role | Permissions |
|------|-------------|
| **Reader** | View-only access to all projects |
| **Contributor** | Create and edit own projects |
| **Manager** | Edit any project |
| **Administrator** | Full system access including user management |

### Application Workflow

```
1. PLAN PHASE
   ├── Define Outcomes (A, B, C...)
   ├── Define Touchpoints (TP1, TP2...)
   ├── Define Indicators
   └── Map Relationships (Indicators → Outcomes/Touchpoints)

2. CREATE PHASE
   └── Log Decisions with outcome impacts

3. EVALUATE PHASE
   ├── Select Touchpoint
   ├── Evaluate how outcomes informed decisions
   ├── Track outcome progress
   └── Create action items

4. REVIEW PHASE
   ├── Project reflection
   ├── Final outcome evaluations
   ├── Final indicator measurements
   ├── Retrospective analysis
   └── Generate PDF report
```

---

## Getting Started

### For Developers

1. **Read**: [Requirements Document](REQUIREMENTS.md) - Understand what you're building
2. **Review**: [Architecture Documentation](ARCHITECTURE.md) - Understand system structure
3. **Study**: [Database Schema](database_schema.sql) - Understand data model
4. **Reference**: [API Specification](API_SPECIFICATION.md) - Implement/consume APIs

### For DevOps/Infrastructure

1. **Read**: [Requirements Document](REQUIREMENTS.md) - Section 5.5 (Infrastructure Requirements)
2. **Follow**: [Deployment Guide](DEPLOYMENT_GUIDE.md) - Complete deployment walkthrough
3. **Review**: [Architecture Documentation](ARCHITECTURE.md) - Section 5 (Deployment Architecture)

### For Project Managers

1. **Read**: [Requirements Document](REQUIREMENTS.md) - Complete overview
2. **Review**: Section 12 (Project Timeline) and Section 13 (Risks & Mitigation)

### For Administrators

1. **Setup**: Follow [Deployment Guide](DEPLOYMENT_GUIDE.md)
2. **Configure**: Microsoft Entra ID section in Deployment Guide
3. **Manage**: User roles via Entra ID Enterprise Applications

---

## Development Workflow

### Backend Development

```bash
# Navigate to API project
cd LdaOutcomesTool.API

# Restore packages
dotnet restore

# Run database migrations
dotnet ef database update

# Run application
dotnet run

# Run tests
dotnet test

# Build for production
dotnet publish -c Release -o ./publish
```

### Frontend Development

```bash
# Navigate to frontend project
cd lda-outcomes-tool-ui

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Development

```bash
# Connect to PostgreSQL
psql -U lda_app_user -h localhost -d lda_outcomes_db

# Run schema
\i database_schema.sql

# View tables
\dt

# View specific table
\d users

# Run query
SELECT * FROM vw_project_summary;
```

---

## Configuration Files

### Backend Configuration

**appsettings.json** - Application configuration
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;..."
  },
  "AzureAd": {
    "TenantId": "your-tenant-id",
    "ClientId": "your-client-id",
    "ClientSecret": "use-environment-variable"
  },
  "JwtSettings": {
    "Secret": "use-environment-variable",
    "ExpirationHours": 8
  }
}
```

### Frontend Configuration

**.env.production** - Environment variables
```env
VITE_API_BASE_URL=https://your-domain.com/api/v1
VITE_ENTRA_CLIENT_ID=your-client-id
VITE_ENTRA_TENANT_ID=your-tenant-id
VITE_ENTRA_REDIRECT_URI=https://your-domain.com/auth/callback
```

### IIS Configuration

**web.config** - IIS/ASP.NET Core configuration
- See [Deployment Guide](DEPLOYMENT_GUIDE.md) Section 6.3

---

## Common Tasks

### Add a New User

1. User logs in via Entra ID (automatically creates user record)
2. Admin assigns role in Entra ID Enterprise Applications
3. Or update database directly:
   ```sql
   UPDATE users SET role = 'manager' WHERE email = 'user@example.com';
   ```

### Backup Database

```powershell
# Windows PowerShell
pg_dump -U lda_app_user -h localhost -F c -f backup.dump lda_outcomes_db
```

```bash
# Linux
pg_dump -U lda_app_user -h localhost -F c -f backup.dump lda_outcomes_db
```

### Restore Database

```powershell
# Windows PowerShell
pg_restore -U lda_app_user -h localhost -d lda_outcomes_db backup.dump
```

### View Application Logs

**Windows:**
```powershell
Get-Content C:\inetpub\LdaOutcomesTool\logs\app-*.log -Tail 50
```

**Linux:**
```bash
tail -f /var/log/lda-outcomes-tool/app.log
```

### Restart Application

**Windows (IIS):**
```powershell
Restart-WebAppPool -Name "LdaOutcomesToolPool"
```

**Linux (systemd):**
```bash
sudo systemctl restart lda-outcomes-tool
```

---

## Troubleshooting

### Can't Connect to Database
1. Verify PostgreSQL is running: `systemctl status postgresql` (Linux) or check Windows Services
2. Test connection: `psql -U lda_app_user -h localhost -d lda_outcomes_db`
3. Check connection string in environment variables
4. Verify firewall allows port 5432

### Authentication Not Working
1. Verify Entra ID configuration matches appsettings.json
2. Check redirect URIs are exactly correct (including trailing slashes)
3. Verify client secret hasn't expired
4. Check browser console for specific error messages
5. Ensure outbound HTTPS to login.microsoftonline.com is allowed

### 502 Bad Gateway
1. Check if .NET Runtime is installed: `dotnet --info`
2. Verify app pool is running: `Get-WebAppPoolState -Name "LdaOutcomesToolPool"`
3. Check stdout logs: `Get-Content C:\inetpub\LdaOutcomesTool\api\logs\stdout_*.log`
4. Test app directly: `dotnet LdaOutcomesTool.API.dll`

### Frontend Not Loading
1. Verify files exist: `ls -la C:\inetpub\LdaOutcomesTool\wwwroot`
2. Check IIS is serving static files
3. Verify URL Rewrite module is installed
4. Check browser console for errors
5. Verify API URL in frontend environment variables

For more troubleshooting guidance, see [Deployment Guide](DEPLOYMENT_GUIDE.md) Section 9.

---

## Support

### For Issues
- Review [Troubleshooting Section](DEPLOYMENT_GUIDE.md#9-troubleshooting) in Deployment Guide
- Check application logs
- Check database logs
- Review Windows Event Viewer (Application log)

### For Development Questions
- Review [Architecture Documentation](ARCHITECTURE.md)
- Review [API Specification](API_SPECIFICATION.md)
- Check database schema comments

### For Deployment Questions
- Follow [Deployment Guide](DEPLOYMENT_GUIDE.md) step-by-step
- Verify all prerequisites are met
- Check environment variables are set correctly

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor application logs for errors
- Check database backup success

**Weekly:**
- Review system performance metrics
- Check disk space usage
- Review user activity

**Monthly:**
- Review and rotate logs
- Update SSL certificates (if expiring)
- Apply security patches
- Review user access and roles

**Quarterly:**
- Test backup restoration
- Review and update documentation
- Performance tuning review
- Security audit

---

## Additional Resources

### Official Documentation
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Vue.js Documentation](https://vuejs.org/guide/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/entra/)
- [IIS Documentation](https://docs.microsoft.com/en-us/iis/)

### Tools
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL administration
- [Postman](https://www.postman.com/) - API testing
- [VS Code](https://code.visualstudio.com/) - Code editor
- [Visual Studio](https://visualstudio.microsoft.com/) - .NET IDE

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-10-08 | Initial documentation created |

---

## Contact Information

**Project Repository**: [Add your repository URL here]
**Issue Tracker**: [Add your issue tracker URL here]
**Support Email**: [Add support email here]

---

## License

[Add license information here]
