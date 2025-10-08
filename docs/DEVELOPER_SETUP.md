# LDA Outcomes Tool - Developer Setup Guide

This guide will help you set up a local development environment for the LDA Outcomes Tool.

## Prerequisites

### Required Software

1. **Git** - Version control
   - Download: https://git-scm.com/downloads
   - Verify: `git --version`

2. **.NET 8.0 SDK** - Backend development
   - Download: https://dotnet.microsoft.com/download/dotnet/8.0
   - Verify: `dotnet --version` (should be 8.0.x)

3. **Node.js 18+ LTS** - Frontend development
   - Download: https://nodejs.org/
   - Verify: `node --version` (should be 18.x or higher)
   - Verify: `npm --version`

4. **PostgreSQL 14+** - Database
   - Download: https://www.postgresql.org/download/
   - Verify: `psql --version`

5. **Code Editor**
   - Recommended: [Visual Studio Code](https://code.visualstudio.com/)
   - Alternative: [Visual Studio 2022](https://visualstudio.microsoft.com/) (for .NET)

### Recommended Tools

- **pgAdmin** - PostgreSQL GUI: https://www.pgadmin.org/
- **Postman** - API testing: https://www.postman.com/
- **Git GUI Client** - GitKraken, SourceTree, or GitHub Desktop

### VS Code Extensions (Recommended)

```
- C# (ms-dotnettools.csharp)
- Vue Language Features (Vue.volar)
- PostgreSQL (ckolkman.vscode-postgres)
- REST Client (humao.rest-client)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- GitLens (eamodio.gitlens)
```

---

## Step 1: Clone Repository

```bash
# Clone the repository (replace with actual URL)
git clone https://github.com/your-org/lda-outcomes-tool.git

# Navigate to project directory
cd lda-outcomes-tool
```

---

## Step 2: Database Setup

### 2.1 Create Database

**Option A: Using psql command line**

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# In psql console:
```

```sql
-- Create database
CREATE DATABASE lda_outcomes_db_dev
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8';

-- Create user
CREATE USER lda_dev_user WITH PASSWORD 'DevPassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE lda_outcomes_db_dev TO lda_dev_user;

-- Connect to database
\c lda_outcomes_db_dev

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO lda_dev_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lda_dev_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lda_dev_user;

-- Exit
\q
```

**Option B: Using pgAdmin**

1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `lda_outcomes_db_dev`
4. Owner: `postgres`
5. Click "Save"

### 2.2 Run Database Schema

```bash
# Navigate to docs folder
cd docs

# Run schema script
psql -U lda_dev_user -h localhost -d lda_outcomes_db_dev -f database_schema.sql

# Verify tables were created
psql -U lda_dev_user -h localhost -d lda_outcomes_db_dev -c "\dt"
```

### 2.3 Seed Development Data (Optional)

Create `docs/seed_dev_data.sql`:

```sql
-- Insert test user
INSERT INTO users (entra_id, email, display_name, role)
VALUES
    ('dev-user-1', 'dev@example.com', 'Dev User', 'administrator'),
    ('dev-user-2', 'contributor@example.com', 'Test Contributor', 'contributor')
ON CONFLICT (entra_id) DO NOTHING;

-- Insert test project
INSERT INTO projects (id, name, reference, created_by)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'Test Project',
    'TEST-001',
    (SELECT id FROM users WHERE email = 'dev@example.com')
);

-- Insert test outcomes
INSERT INTO outcomes (project_id, heading, sequence_order)
VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'Improve customer satisfaction', 1),
    ('123e4567-e89b-12d3-a456-426614174000', 'Reduce response time', 2);

-- Insert test touchpoints
INSERT INTO touchpoints (project_id, heading, description, sequence_order)
VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'Customer Portal Launch', 'Initial portal release', 1),
    ('123e4567-e89b-12d3-a456-426614174000', 'Training Program', 'Staff training sessions', 2);

-- Insert test indicator
INSERT INTO indicators (project_id, description, baseline)
VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'Customer satisfaction score (1-10)', '6.5');
```

Run seed data:
```bash
psql -U lda_dev_user -h localhost -d lda_outcomes_db_dev -f seed_dev_data.sql
```

---

## Step 3: Backend Setup (ASP.NET Core)

### 3.1 Create Project Structure

```bash
# Create solution folder
mkdir LdaOutcomesTool.API
cd LdaOutcomesTool.API

# Create new web API project
dotnet new webapi -n LdaOutcomesTool.API

# Create solution file
dotnet new sln -n LdaOutcomesTool

# Add project to solution
dotnet sln add LdaOutcomesTool.API/LdaOutcomesTool.API.csproj
```

### 3.2 Install Required Packages

```bash
cd LdaOutcomesTool.API

# Entity Framework Core with PostgreSQL
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design

# Authentication
dotnet add package Microsoft.Identity.Web
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

# Utilities
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package FluentValidation.AspNetCore
dotnet add package Serilog.AspNetCore
dotnet add package Swashbuckle.AspNetCore

# CSV Export
dotnet add package CsvHelper

# PDF Generation
dotnet add package QuestPDF
```

### 3.3 Configure appsettings.Development.json

Create `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=lda_outcomes_db_dev;Username=lda_dev_user;Password=DevPassword123!"
  },
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "YOUR_DEV_TENANT_ID",
    "ClientId": "YOUR_DEV_CLIENT_ID",
    "ClientSecret": "YOUR_DEV_CLIENT_SECRET",
    "CallbackPath": "/signin-oidc"
  },
  "JwtSettings": {
    "Secret": "your-development-secret-key-at-least-32-characters-long",
    "Issuer": "https://localhost:5001",
    "Audience": "https://localhost:5001",
    "ExpirationHours": 8
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000"
    ]
  }
}
```

### 3.4 Create DbContext

Create `Data/LdaDbContext.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using LdaOutcomesTool.API.Models;

namespace LdaOutcomesTool.API.Data;

public class LdaDbContext : DbContext
{
    public LdaDbContext(DbContextOptions<LdaDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Outcome> Outcomes { get; set; }
    public DbSet<Touchpoint> Touchpoints { get; set; }
    public DbSet<Indicator> Indicators { get; set; }
    // ... add other DbSets

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure entities
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LdaDbContext).Assembly);
    }
}
```

### 3.5 Configure Program.cs

Update `Program.cs`:

```csharp
using Microsoft.EntityFrameworkCore;
using LdaOutcomesTool.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<LdaDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>())
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### 3.6 Run Backend

```bash
# Restore packages
dotnet restore

# Build
dotnet build

# Run
dotnet run

# Should see:
# Now listening on: https://localhost:5001
# Now listening on: http://localhost:5000
```

Test API:
```bash
curl http://localhost:5000/swagger
```

---

## Step 4: Frontend Setup (Vue.js)

### 4.1 Create Vue Project

```bash
# Navigate to project root
cd ..

# Create Vue project with Vite
npm create vite@latest lda-outcomes-tool-ui -- --template vue

# Navigate to frontend folder
cd lda-outcomes-tool-ui

# Install dependencies
npm install
```

### 4.2 Install Additional Packages

```bash
# Vue Router
npm install vue-router@4

# State Management
npm install pinia

# HTTP Client
npm install axios

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Authentication
npm install @azure/msal-browser

# Icons (optional)
npm install @heroicons/vue

# Date handling
npm install date-fns
```

### 4.3 Configure Tailwind CSS

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `src/assets/main.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4.4 Create Environment Files

Create `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_ENTRA_CLIENT_ID=YOUR_DEV_CLIENT_ID
VITE_ENTRA_TENANT_ID=YOUR_DEV_TENANT_ID
VITE_ENTRA_REDIRECT_URI=http://localhost:5173/auth/callback
```

Create `.env.production`:

```env
VITE_API_BASE_URL=https://your-domain.com/api/v1
VITE_ENTRA_CLIENT_ID=YOUR_PROD_CLIENT_ID
VITE_ENTRA_TENANT_ID=YOUR_PROD_TENANT_ID
VITE_ENTRA_REDIRECT_URI=https://your-domain.com/auth/callback
```

### 4.5 Project Structure

Create the following folder structure:

```
src/
├── assets/
│   └── main.css
├── components/
│   ├── common/
│   ├── forms/
│   └── layout/
├── views/
├── stores/
├── services/
├── router/
├── composables/
├── utils/
├── App.vue
└── main.js
```

### 4.6 Configure Vue Router

Create `src/router/index.js`:

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/projects'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('../views/ProjectsView.vue'),
    meta: { requiresAuth: true }
  },
  // ... add more routes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

### 4.7 Configure Pinia Store

Create `src/stores/auth.js`:

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))

  const login = async (credentials) => {
    // Implement login logic
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  return { user, token, login, logout, isAuthenticated }
})
```

### 4.8 Configure API Service

Create `src/services/api.js`:

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### 4.9 Update main.js

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

### 4.10 Run Frontend

```bash
# Development server
npm run dev

# Should see:
# VITE v5.x.x ready in xxx ms
# ➜ Local: http://localhost:5173/
```

Open browser to http://localhost:5173/

---

## Step 5: Development Workflow

### Backend Development

```bash
# Run with hot reload (using dotnet watch)
cd LdaOutcomesTool.API
dotnet watch run

# Run tests
dotnet test

# Apply database migrations (when using EF migrations)
dotnet ef migrations add InitialCreate
dotnet ef database update

# Check code formatting
dotnet format
```

### Frontend Development

```bash
cd lda-outcomes-tool-ui

# Development server with hot reload
npm run dev

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Tasks

```bash
# Connect to dev database
psql -U lda_dev_user -d lda_outcomes_db_dev

# Backup database
pg_dump -U lda_dev_user -h localhost -F c -f dev_backup.dump lda_outcomes_db_dev

# Restore database
pg_restore -U lda_dev_user -d lda_outcomes_db_dev dev_backup.dump

# Reset database (drop and recreate)
psql -U postgres -c "DROP DATABASE IF EXISTS lda_outcomes_db_dev"
psql -U postgres -c "CREATE DATABASE lda_outcomes_db_dev OWNER lda_dev_user"
psql -U lda_dev_user -d lda_outcomes_db_dev -f docs/database_schema.sql
```

---

## Step 6: Microsoft Entra ID Setup (Development)

### 6.1 Register Development Application

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to **Microsoft Entra ID** → **App registrations**
3. Click **New registration**
   - Name: `LDA Outcomes Tool - Development`
   - Supported account types: Single tenant
   - Redirect URI: `http://localhost:5173/auth/callback`
4. Click **Register**

### 6.2 Configure Authentication

After registration:
- Add redirect URIs:
  - `http://localhost:5173/auth/callback`
  - `http://localhost:3000/auth/callback`
  - `http://localhost:5001/signin-oidc`
- Enable **ID tokens**

### 6.3 Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `Dev Environment`
4. Expires: 6 months
5. Copy the secret value
6. Update `.env.development` with the secret

### 6.4 Configure API Permissions

1. Go to **API permissions**
2. Add permissions:
   - Microsoft Graph → Delegated:
     - `User.Read`
     - `openid`
     - `profile`
     - `email`
3. Grant admin consent

---

## Step 7: Testing

### Test Backend API

Create `test.http` file (use with REST Client extension):

```http
### Get Projects
GET http://localhost:5000/api/v1/projects
Authorization: Bearer YOUR_TOKEN

### Create Project
POST http://localhost:5000/api/v1/projects
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Test Project",
  "reference": "TEST-002"
}

### Get Outcomes
GET http://localhost:5000/api/v1/projects/123e4567-e89b-12d3-a456-426614174000/outcomes
Authorization: Bearer YOUR_TOKEN
```

### Test Frontend

1. Open http://localhost:5173
2. Login with Entra ID
3. Create a test project
4. Add outcomes, touchpoints, indicators
5. Test all CRUD operations

---

## Common Issues and Solutions

### Database Connection Fails

```bash
# Check PostgreSQL is running
# Windows:
Get-Service postgresql*

# Linux/Mac:
sudo systemctl status postgresql

# Check connection
psql -U postgres -c "SELECT version();"
```

### Backend Port Already in Use

```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000

# Linux/Mac:
lsof -i :5000

# Kill process or change port in launchSettings.json
```

### Frontend Port Already in Use

```bash
# Change port in vite.config.js:
export default defineConfig({
  server: {
    port: 3001
  }
})
```

### CORS Errors

Ensure backend `appsettings.Development.json` includes your frontend URL in `Cors:AllowedOrigins`

### Entra ID Authentication Fails

1. Verify redirect URIs match exactly
2. Check client ID and tenant ID
3. Ensure client secret is correct and not expired
4. Check browser console for specific error

---

## Git Workflow

### Initial Setup

```bash
# Create .gitignore
cat > .gitignore << EOF
# .NET
bin/
obj/
*.user
*.suo
*.cache

# Node
node_modules/
dist/
.env.local

# IDE
.vs/
.vscode/
*.swp

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# OS
.DS_Store
Thumbs.db
EOF

# Initial commit
git add .
git commit -m "Initial commit"
git push origin main
```

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/add-outcomes-page

# Make changes and commit frequently
git add .
git commit -m "Add outcomes page component"

# Push to remote
git push origin feature/add-outcomes-page

# Create pull request on GitHub/GitLab
```

---

## Next Steps

1. **Review Documentation**:
   - [Requirements Document](REQUIREMENTS.md)
   - [Architecture Documentation](ARCHITECTURE.md)
   - [API Specification](API_SPECIFICATION.md)

2. **Set Up Development Environment**:
   - Follow all steps in this guide
   - Verify all services are running

3. **Start Development**:
   - Pick a task from backlog
   - Create feature branch
   - Implement feature
   - Write tests
   - Submit pull request

4. **Join Team**:
   - Attend team standup
   - Review coding standards
   - Set up CI/CD pipeline access

---

## Resources

- [ASP.NET Core Docs](https://docs.microsoft.com/en-us/aspnet/core/)
- [Vue.js Guide](https://vuejs.org/guide/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Microsoft Entra ID Docs](https://learn.microsoft.com/en-us/entra/)

---

**Happy Coding!**
