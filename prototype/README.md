# LDA Outcomes Tool - Prototype

This is the original HTML/CSS/JavaScript prototype of the LDA Outcomes Tool.

## Running the Prototype

### Option 1: Python HTTP Server

```bash
# Navigate to prototype folder
cd prototype

# Python 3
python3 -m http.server 8000

# Python 2 (if needed)
python -m SimpleHTTPServer 8000
```

Then open your browser to: http://localhost:8000

### Option 2: Any HTTP Server

You can use any static file server:

```bash
# Using Node.js http-server
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

## Features

This prototype demonstrates all four phases:
- **Plan**: Define outcomes, touchpoints, indicators, and relationships
- **Create**: Log decisions with outcome impacts
- **Evaluate**: Conduct touchpoint evaluations
- **Review**: Complete final project reviews

## Data Storage

All data is stored in browser localStorage. Data will persist until you clear browser storage.

## Limitations

- Single-user only (no authentication)
- No database backend
- No multi-device sync
- Data stored in browser only

## Production Version

The production version is being built in the `backend/` and `frontend/` directories with:
- ASP.NET Core backend API
- Vue.js frontend
- PostgreSQL database
- Microsoft Entra ID authentication
- Multi-user support
