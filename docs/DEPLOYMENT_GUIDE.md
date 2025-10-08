# LDA Outcomes Tool - Deployment Guide (Windows Server)

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Database Setup](#3-database-setup)
4. [Backend Deployment](#4-backend-deployment)
5. [Frontend Deployment](#5-frontend-deployment)
6. [IIS Configuration](#6-iis-configuration)
7. [Entra ID Configuration](#7-entra-id-configuration)
8. [Post-Deployment](#8-post-deployment)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

### 1.1 Server Requirements

**Windows Server:**
- Windows Server 2019 or 2022
- Minimum: 4 CPU cores, 8 GB RAM, 50 GB storage
- Recommended: 8 CPU cores, 16 GB RAM, 100 GB storage
- PowerShell 5.1 or higher

**Database Server:**
- PostgreSQL 14+ (can be same server or separate)
- Minimum: 2 CPU cores, 4 GB RAM, 50 GB storage

### 1.2 Software Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| Windows Server | 2019/2022 | Operating System |
| IIS | 10+ | Web Server |
| .NET Runtime | 8.0 | Application Runtime |
| ASP.NET Core Hosting Bundle | 8.0 | IIS Integration |
| PostgreSQL | 14+ | Database |
| Node.js | 18+ LTS | Build Tools (dev machine only) |

### 1.3 Network Requirements

- HTTPS certificate (SSL/TLS)
- Firewall rules configured for:
  - Port 443 (HTTPS)
  - Port 5432 (PostgreSQL - if separate server)
- DNS entry for application URL
- Outbound HTTPS access to Microsoft Entra ID (login.microsoftonline.com)

### 1.4 Access Requirements

- Windows Server Administrator access
- PostgreSQL superuser or database owner privileges
- Microsoft Entra ID Global Administrator or Application Administrator role
- SSL certificate with private key

---

## 2. Environment Setup

### 2.1 Install IIS

```powershell
# Run as Administrator
Install-WindowsFeature -name Web-Server -IncludeManagementTools
Install-WindowsFeature -name Web-WebSockets
Install-WindowsFeature -name Web-Asp-Net45
```

### 2.2 Install .NET 8.0 Runtime and Hosting Bundle

1. Download ASP.NET Core Hosting Bundle:
   ```
   https://dotnet.microsoft.com/download/dotnet/8.0
   ```

2. Install the Hosting Bundle:
   ```powershell
   # Run the installer
   dotnet-hosting-8.0.x-win.exe /install /quiet /norestart

   # Restart IIS
   net stop was /y
   net start w3svc
   ```

3. Verify installation:
   ```powershell
   dotnet --info
   ```

### 2.3 Install PostgreSQL

**Option A: Windows Installer**

1. Download PostgreSQL 14+ for Windows:
   ```
   https://www.postgresql.org/download/windows/
   ```

2. Run the installer and note:
   - Installation directory: `C:\Program Files\PostgreSQL\14`
   - Data directory: `C:\Program Files\PostgreSQL\14\data`
   - Port: `5432` (default)
   - Superuser password (remember this!)

3. Add PostgreSQL to PATH:
   ```powershell
   $env:Path += ";C:\Program Files\PostgreSQL\14\bin"
   [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::Machine)
   ```

**Option B: Docker (if available)**

```powershell
docker run --name lda-postgres `
  -e POSTGRES_PASSWORD=YourSecurePassword `
  -e POSTGRES_DB=lda_outcomes_db `
  -p 5432:5432 `
  -v C:\PostgreSQL\data:/var/lib/postgresql/data `
  -d postgres:14
```

### 2.4 Create Application Directory Structure

```powershell
# Create directories
New-Item -ItemType Directory -Path "C:\inetpub\LdaOutcomesTool\api" -Force
New-Item -ItemType Directory -Path "C:\inetpub\LdaOutcomesTool\wwwroot" -Force
New-Item -ItemType Directory -Path "C:\inetpub\LdaOutcomesTool\logs" -Force

# Set permissions (replace DOMAIN\AppPoolUser with your app pool identity)
icacls "C:\inetpub\LdaOutcomesTool" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

---

## 3. Database Setup

### 3.1 Create Database

```powershell
# Connect to PostgreSQL
psql -U postgres -h localhost

# In psql console:
```

```sql
-- Create database
CREATE DATABASE lda_outcomes_db
    WITH
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TEMPLATE = template0;

-- Create application user
CREATE USER lda_app_user WITH PASSWORD 'YourSecurePassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE lda_outcomes_db TO lda_app_user;

-- Connect to the database
\c lda_outcomes_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO lda_app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lda_app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lda_app_user;

-- Exit psql
\q
```

### 3.2 Run Database Schema

```powershell
# Navigate to project directory
cd C:\path\to\lda_outcomes_tool\docs

# Run schema script
psql -U lda_app_user -h localhost -d lda_outcomes_db -f database_schema.sql
```

### 3.3 Verify Database Setup

```powershell
psql -U lda_app_user -h localhost -d lda_outcomes_db

# In psql:
```

```sql
-- Check tables
\dt

-- Check views
\dv

-- Check functions
\df

-- Test a query
SELECT * FROM users;

\q
```

### 3.4 Configure Connection String

Create a secure connection string:

```
Host=localhost;Port=5432;Database=lda_outcomes_db;Username=lda_app_user;Password=YourSecurePassword123!;SSL Mode=Prefer;Trust Server Certificate=true
```

**Store securely in:**
- appsettings.json (for development)
- Environment variables (for production)
- Azure Key Vault (enterprise option)
- Windows Certificate Store (enterprise option)

---

## 4. Backend Deployment

### 4.1 Build Application

On development machine:

```powershell
# Navigate to API project
cd C:\path\to\LdaOutcomesTool.API

# Restore packages
dotnet restore

# Build in Release mode
dotnet build -c Release

# Publish
dotnet publish -c Release -o C:\publish\LdaOutcomesTool
```

### 4.2 Configure appsettings.json

Edit `appsettings.Production.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    },
    "File": {
      "Path": "C:\\inetpub\\LdaOutcomesTool\\logs\\app-{Date}.log",
      "RollingInterval": "Day",
      "RetainedFileCountLimit": 30
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=lda_outcomes_db;Username=lda_app_user;Password=USE_ENV_VARIABLE"
  },
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "YOUR_TENANT_ID",
    "ClientId": "YOUR_CLIENT_ID",
    "ClientSecret": "USE_ENV_VARIABLE",
    "CallbackPath": "/signin-oidc",
    "SignedOutCallbackPath": "/signout-callback-oidc"
  },
  "JwtSettings": {
    "Secret": "USE_ENV_VARIABLE",
    "Issuer": "https://your-domain.com",
    "Audience": "https://your-domain.com",
    "ExpirationHours": 8
  },
  "Cors": {
    "AllowedOrigins": ["https://your-domain.com"]
  }
}
```

### 4.3 Set Environment Variables

**Option A: System Environment Variables**

```powershell
[Environment]::SetEnvironmentVariable(
    "ConnectionStrings__DefaultConnection",
    "Host=localhost;Port=5432;Database=lda_outcomes_db;Username=lda_app_user;Password=YourSecurePassword123!",
    [EnvironmentVariableTarget]::Machine
)

[Environment]::SetEnvironmentVariable(
    "AzureAd__ClientSecret",
    "YOUR_CLIENT_SECRET_FROM_ENTRA_ID",
    [EnvironmentVariableTarget]::Machine
)

[Environment]::SetEnvironmentVariable(
    "JwtSettings__Secret",
    "YOUR_STRONG_JWT_SECRET_AT_LEAST_32_CHARS",
    [EnvironmentVariableTarget]::Machine
)

[Environment]::SetEnvironmentVariable(
    "ASPNETCORE_ENVIRONMENT",
    "Production",
    [EnvironmentVariableTarget]::Machine
)
```

**Option B: IIS Application Pool Environment Variables** (Preferred)

Set via IIS Manager or:

```powershell
# Install IIS Administration module
Import-Module WebAdministration

# Set environment variables for app pool
$appPoolName = "LdaOutcomesToolPool"
$envVars = @(
    @{name="ConnectionStrings__DefaultConnection"; value="Host=localhost;..."},
    @{name="AzureAd__ClientSecret"; value="YOUR_SECRET"},
    @{name="JwtSettings__Secret"; value="YOUR_JWT_SECRET"}
)

foreach ($var in $envVars) {
    Set-WebConfigurationProperty -pspath "IIS:\AppPools\$appPoolName" `
        -name "environmentVariables" `
        -value @{name=$var.name;value=$var.value}
}
```

### 4.4 Copy Files to Server

```powershell
# Copy published files
Copy-Item -Path "C:\publish\LdaOutcomesTool\*" `
    -Destination "C:\inetpub\LdaOutcomesTool\api" `
    -Recurse -Force

# Verify files
Get-ChildItem -Path "C:\inetpub\LdaOutcomesTool\api"
```

### 4.5 Test Backend

```powershell
# Navigate to deployment folder
cd C:\inetpub\LdaOutcomesTool\api

# Test run (troubleshooting only)
dotnet LdaOutcomesTool.API.dll

# Should see:
# "Now listening on: http://localhost:5000"
# Press Ctrl+C to stop
```

---

## 5. Frontend Deployment

### 5.1 Build Frontend

On development machine:

```powershell
# Navigate to frontend project
cd C:\path\to\lda-outcomes-tool-ui

# Install dependencies
npm install

# Build for production
npm run build

# Output will be in 'dist' folder
```

### 5.2 Configure Environment

Edit `.env.production`:

```env
VITE_API_BASE_URL=https://your-domain.com/api/v1
VITE_ENTRA_CLIENT_ID=YOUR_CLIENT_ID
VITE_ENTRA_TENANT_ID=YOUR_TENANT_ID
VITE_ENTRA_REDIRECT_URI=https://your-domain.com/auth/callback
```

### 5.3 Copy Files to Server

```powershell
# Copy built files
Copy-Item -Path "C:\path\to\lda-outcomes-tool-ui\dist\*" `
    -Destination "C:\inetpub\LdaOutcomesTool\wwwroot" `
    -Recurse -Force

# Verify
Get-ChildItem -Path "C:\inetpub\LdaOutcomesTool\wwwroot"
```

---

## 6. IIS Configuration

### 6.1 Create Application Pool

```powershell
# Import IIS module
Import-Module WebAdministration

# Create Application Pool
$appPoolName = "LdaOutcomesToolPool"
New-WebAppPool -Name $appPoolName

# Configure Application Pool
Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "startMode" -Value "AlwaysRunning"
Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "processModel.idleTimeout" -Value "00:00:00"
Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "recycling.periodicRestart.time" -Value "00:00:00"

# Set identity (use ApplicationPoolIdentity or specific service account)
Set-ItemProperty -Path "IIS:\AppPools\$appPoolName" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
```

**Manual Steps in IIS Manager:**

1. Open IIS Manager
2. Navigate to Application Pools
3. Right-click `LdaOutcomesToolPool` → Advanced Settings
4. Set:
   - .NET CLR Version: `No Managed Code`
   - Start Mode: `AlwaysRunning`
   - Identity: `ApplicationPoolIdentity` (or custom service account)

### 6.2 Create IIS Application

```powershell
# Create main website (if not using Default Web Site)
$siteName = "LdaOutcomesTool"
$hostName = "your-domain.com"

# Option A: Create new website
New-Website -Name $siteName `
    -PhysicalPath "C:\inetpub\LdaOutcomesTool\wwwroot" `
    -ApplicationPool $appPoolName `
    -HostHeader $hostName `
    -Port 443 `
    -Ssl

# Option B: Use Default Web Site and create application
New-WebApplication -Name "api" `
    -Site "Default Web Site" `
    -PhysicalPath "C:\inetpub\LdaOutcomesTool\api" `
    -ApplicationPool $appPoolName
```

### 6.3 Configure web.config for API

Create `C:\inetpub\LdaOutcomesTool\api\web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet"
                  arguments=".\LdaOutcomesTool.API.dll"
                  stdoutLogEnabled="true"
                  stdoutLogFile=".\logs\stdout"
                  hostingModel="inprocess">
        <environmentVariables>
          <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
        </environmentVariables>
      </aspNetCore>
      <httpProtocol>
        <customHeaders>
          <add name="X-Content-Type-Options" value="nosniff" />
          <add name="X-Frame-Options" value="DENY" />
          <add name="X-XSS-Protection" value="1; mode=block" />
          <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
        </customHeaders>
      </httpProtocol>
    </system.webServer>
  </location>
</configuration>
```

### 6.4 Configure SSL Certificate

**Option A: Using IIS Manager**

1. Open IIS Manager
2. Select server node
3. Double-click "Server Certificates"
4. Import your SSL certificate (.pfx file)
5. Right-click site → Edit Bindings
6. Add HTTPS binding:
   - Type: `https`
   - Port: `443`
   - SSL Certificate: Select your certificate

**Option B: Using PowerShell**

```powershell
# Import certificate
$certPassword = ConvertTo-SecureString -String "CertPassword" -AsPlainText -Force
$cert = Import-PfxCertificate -FilePath "C:\path\to\certificate.pfx" `
    -CertStoreLocation Cert:\LocalMachine\My `
    -Password $certPassword

# Bind certificate to website
New-WebBinding -Name $siteName -Protocol https -Port 443
$binding = Get-WebBinding -Name $siteName -Protocol https
$binding.AddSslCertificate($cert.Thumbprint, "my")
```

### 6.5 Configure URL Rewrite for SPA

Create `C:\inetpub\LdaOutcomesTool\wwwroot\web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Redirect API calls to API application -->
        <rule name="API" stopProcessing="true">
          <match url="^api/(.*)$" />
          <action type="Rewrite" url="http://localhost:5000/api/{R:1}" />
        </rule>

        <!-- SPA fallback routing -->
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api/" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>

    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>

    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="DENY" />
        <add name="Content-Security-Policy" value="default-src 'self' https://login.microsoftonline.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

**Note**: Install URL Rewrite Module if not already installed:
```
https://www.iis.net/downloads/microsoft/url-rewrite
```

### 6.6 Set Permissions

```powershell
# Grant IIS_IUSRS read access
icacls "C:\inetpub\LdaOutcomesTool" /grant "IIS_IUSRS:(OI)(CI)RX" /T

# Grant app pool identity write access to logs
icacls "C:\inetpub\LdaOutcomesTool\logs" /grant "IIS APPPOOL\LdaOutcomesToolPool:(OI)(CI)M" /T

# Grant app pool access to database connection (if using Windows Authentication)
# sqlcmd -Q "CREATE LOGIN [IIS APPPOOL\LdaOutcomesToolPool] FROM WINDOWS"
```

### 6.7 Start Application

```powershell
# Start application pool
Start-WebAppPool -Name $appPoolName

# Start website
Start-Website -Name $siteName

# Verify
Get-WebAppPoolState -Name $appPoolName
Get-WebsiteState -Name $siteName
```

---

## 7. Entra ID Configuration

### 7.1 Register Application in Entra ID

1. Sign in to Azure Portal: https://portal.azure.com
2. Navigate to **Microsoft Entra ID** → **App registrations**
3. Click **New registration**

**Registration Settings:**
- **Name**: LDA Outcomes Tool
- **Supported account types**: Accounts in this organizational directory only (Single tenant)
- **Redirect URI**:
  - Type: `Web`
  - URI: `https://your-domain.com/signin-oidc`

4. Click **Register**

### 7.2 Configure Authentication

After registration, configure:

**Redirect URIs:**
- `https://your-domain.com/signin-oidc`
- `https://your-domain.com/auth/callback`

**Front-channel logout URL:**
- `https://your-domain.com/signout-oidc`

**Implicit grant and hybrid flows:**
- ✅ ID tokens

**Advanced settings:**
- Allow public client flows: `No`

### 7.3 Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `LDA Outcomes Tool Production`
4. Expires: Choose appropriate duration (1-2 years)
5. Click **Add**
6. **IMPORTANT**: Copy the secret value immediately (only shown once)
7. Store securely in environment variables

### 7.4 Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. **Delegated permissions**:
   - `User.Read` (Sign in and read user profile)
   - `profile`
   - `email`
   - `openid`
5. Click **Add permissions**
6. Click **Grant admin consent** for your organization

### 7.5 Configure Token Configuration (Optional Claims)

1. Go to **Token configuration**
2. Click **Add optional claim**
3. Token type: **ID**
4. Add claims:
   - `email`
   - `family_name`
   - `given_name`
   - `upn`
5. Click **Add**

### 7.6 Note Configuration Values

Record these values for application configuration:

```
Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Directory (tenant) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (from step 7.3)
```

### 7.7 Configure App Roles (Optional but Recommended)

1. Go to **App roles**
2. Create roles:

**Administrator Role:**
```json
{
  "displayName": "Administrator",
  "description": "Full access to all features",
  "value": "administrator",
  "id": "[GENERATE_GUID]",
  "allowedMemberTypes": ["User"],
  "isEnabled": true
}
```

**Manager Role:**
```json
{
  "displayName": "Manager",
  "description": "Can edit any project",
  "value": "manager",
  "id": "[GENERATE_GUID]",
  "allowedMemberTypes": ["User"],
  "isEnabled": true
}
```

**Contributor Role:**
```json
{
  "displayName": "Contributor",
  "description": "Can create and edit own projects",
  "value": "contributor",
  "id": "[GENERATE_GUID]",
  "allowedMemberTypes": ["User"],
  "isEnabled": true
}
```

**Reader Role:**
```json
{
  "displayName": "Reader",
  "description": "Read-only access",
  "value": "reader",
  "id": "[GENERATE_GUID]",
  "allowedMemberTypes": ["User"],
  "isEnabled": true
}
```

### 7.8 Assign Users to Roles

1. Go to **Microsoft Entra ID** → **Enterprise applications**
2. Find "LDA Outcomes Tool"
3. Go to **Users and groups**
4. Click **Add user/group**
5. Select users and assign appropriate roles

---

## 8. Post-Deployment

### 8.1 Verify Deployment

```powershell
# Test website is running
Invoke-WebRequest -Uri "https://your-domain.com" -UseBasicParsing

# Test API health endpoint
Invoke-WebRequest -Uri "https://your-domain.com/api/v1/health" -UseBasicParsing

# Check IIS logs
Get-Content "C:\inetpub\LdaOutcomesTool\logs\*.log" -Tail 50
```

### 8.2 Create First Admin User

After first login via Entra ID:

```sql
-- Connect to database
psql -U lda_app_user -h localhost -d lda_outcomes_db

-- Update user role to administrator
UPDATE users
SET role = 'administrator'
WHERE email = 'your-admin@domain.com';

-- Verify
SELECT id, email, display_name, role FROM users;
```

### 8.3 Configure Scheduled Backups

**Create backup script** `C:\Scripts\BackupLdaDb.ps1`:

```powershell
$backupPath = "C:\Backups\LdaOutcomes"
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupPath\lda_outcomes_db_$date.backup"

# Create backup directory if not exists
New-Item -ItemType Directory -Path $backupPath -Force

# Run backup
& "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" `
    -U lda_app_user `
    -h localhost `
    -F c `
    -f $backupFile `
    lda_outcomes_db

# Delete backups older than 30 days
Get-ChildItem -Path $backupPath -Filter "*.backup" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item
```

**Schedule task:**

```powershell
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -File C:\Scripts\BackupLdaDb.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At 2am

$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount

Register-ScheduledTask -TaskName "LDA Outcomes Database Backup" `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Description "Daily backup of LDA Outcomes Tool database"
```

### 8.4 Configure Windows Firewall

```powershell
# Allow HTTPS
New-NetFirewallRule -DisplayName "LDA Outcomes Tool HTTPS" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 443 `
    -Action Allow

# Allow PostgreSQL (if on same server)
New-NetFirewallRule -DisplayName "PostgreSQL" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 5432 `
    -Action Allow `
    -RemoteAddress LocalSubnet
```

### 8.5 Set up Monitoring

**Configure Windows Event Log monitoring:**

```powershell
# Create custom event log source
New-EventLog -LogName Application -Source "LdaOutcomesTool"

# Test logging
Write-EventLog -LogName Application -Source "LdaOutcomesTool" `
    -EventId 1000 -EntryType Information `
    -Message "LDA Outcomes Tool deployed successfully"
```

**Set up Performance Counters:**

```powershell
# Monitor IIS worker process
Get-Counter "\Process(w3wp)\% Processor Time" -Continuous -SampleInterval 5
Get-Counter "\Process(w3wp)\Working Set" -Continuous -SampleInterval 5
```

### 8.6 Create Documentation

Document the following in your organization:

- Application URL
- Support contact information
- Escalation procedures
- Backup locations and retention policy
- Disaster recovery procedures
- Admin procedures (user management, database maintenance)

---

## 9. Troubleshooting

### 9.1 Common Issues

**Issue: 502.5 - Process Failure**

```powershell
# Check stdout logs
Get-Content "C:\inetpub\LdaOutcomesTool\api\logs\stdout_*.log"

# Verify .NET installation
dotnet --info

# Verify app pool is running
Get-WebAppPoolState -Name "LdaOutcomesToolPool"

# Test application directly
cd C:\inetpub\LdaOutcomesTool\api
dotnet LdaOutcomesTool.API.dll
```

**Issue: Database Connection Errors**

```powershell
# Test PostgreSQL connection
Test-NetConnection -ComputerName localhost -Port 5432

# Test credentials
psql -U lda_app_user -h localhost -d lda_outcomes_db

# Check connection string in environment variables
[Environment]::GetEnvironmentVariable("ConnectionStrings__DefaultConnection", "Machine")

# Check PostgreSQL logs
Get-Content "C:\Program Files\PostgreSQL\14\data\log\*.log" -Tail 50
```

**Issue: Entra ID Authentication Fails**

- Verify redirect URIs match exactly in Entra ID and appsettings.json
- Check client secret hasn't expired
- Verify tenant ID and client ID are correct
- Check firewall allows outbound HTTPS to login.microsoftonline.com
- Review browser console for errors

**Issue: 404 Errors for SPA Routes**

- Verify URL Rewrite module is installed
- Check web.config in wwwroot has correct rewrite rules
- Test with: `Invoke-WebRequest -Uri "https://your-domain.com/projects"`

**Issue: CORS Errors**

- Check CORS configuration in appsettings.json
- Verify frontend origin matches allowed origins
- Check browser console for specific CORS error messages

### 9.2 Diagnostic Commands

```powershell
# Check IIS application pool status
Get-WebAppPoolState -Name "LdaOutcomesToolPool"

# View IIS logs
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\*.log" -Tail 100

# View application logs
Get-Content "C:\inetpub\LdaOutcomesTool\logs\app-*.log" -Tail 100

# Check database connectivity
Test-NetConnection -ComputerName localhost -Port 5432

# List running .NET processes
Get-Process -Name "w3wp" | Select-Object Id, ProcessName, WorkingSet

# Check Windows Event Log
Get-EventLog -LogName Application -Source "LdaOutcomesTool" -Newest 50
```

### 9.3 Performance Tuning

**IIS Application Pool Optimization:**

```powershell
# Increase request queue length
Set-ItemProperty "IIS:\AppPools\LdaOutcomesToolPool" `
    -Name "queueLength" -Value 2000

# Set max worker processes (if multi-core)
Set-ItemProperty "IIS:\AppPools\LdaOutcomesToolPool" `
    -Name "processModel.maxProcesses" -Value 2

# Increase max concurrent requests
Set-ItemProperty "IIS:\AppPools\LdaOutcomesToolPool" `
    -Name "limits.maxWorkerThreads" -Value 200
```

**PostgreSQL Optimization:**

Edit `C:\Program Files\PostgreSQL\14\data\postgresql.conf`:

```ini
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB

# Connection settings
max_connections = 100

# Query tuning
random_page_cost = 1.1  # For SSD
effective_io_concurrency = 200  # For SSD
```

Restart PostgreSQL:
```powershell
Restart-Service postgresql-x64-14
```

### 9.4 Rollback Procedure

If deployment fails:

```powershell
# Stop application
Stop-WebAppPool -Name "LdaOutcomesToolPool"
Stop-Website -Name "LdaOutcomesTool"

# Restore previous version
Copy-Item -Path "C:\Backups\LdaOutcomesTool\api\*" `
    -Destination "C:\inetpub\LdaOutcomesTool\api" `
    -Recurse -Force

Copy-Item -Path "C:\Backups\LdaOutcomesTool\wwwroot\*" `
    -Destination "C:\inetpub\LdaOutcomesTool\wwwroot" `
    -Recurse -Force

# Restore database (if schema changed)
psql -U postgres -h localhost -d lda_outcomes_db < C:\Backups\lda_outcomes_db_backup.sql

# Start application
Start-WebAppPool -Name "LdaOutcomesToolPool"
Start-Website -Name "LdaOutcomesTool"
```

---

## 10. Production Checklist

Before go-live, verify:

- [ ] SSL certificate installed and working
- [ ] All environment variables set correctly
- [ ] Database connection successful
- [ ] Entra ID authentication working
- [ ] All API endpoints responding correctly
- [ ] Frontend loading and routing working
- [ ] User roles and permissions configured
- [ ] Automated backups scheduled and tested
- [ ] Monitoring and alerting configured
- [ ] Firewall rules configured
- [ ] Documentation complete
- [ ] Admin users created and roles assigned
- [ ] User training completed
- [ ] Support procedures documented
- [ ] Disaster recovery plan tested

---

## Document Information

**Version**: 1.0
**Last Updated**: 2024-10-08
**Platform**: Windows Server 2019/2022
**Maintained By**: Operations Team
