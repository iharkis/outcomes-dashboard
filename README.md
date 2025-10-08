# Outcomes Tool

A comprehensive web-based project management system designed to help organizations systematically plan, track, and evaluate project outcomes through a structured four-phase approach.

## 🎯 Key Features

- **Plan Phase**: Define outcomes, touchpoints, indicators, and relationships
- **Create Phase**: Log project decisions and their impacts
- **Evaluate Phase**: Conduct evaluations at touchpoints with action items
- **Review Phase**: Complete final project reviews and generate reports

## 📁 Project Structure

```
lda-outcomes-tool/
├── prototype/          # Original HTML/CSS/JS prototype
├── backend/           # ASP.NET Core Web API
├── frontend/          # Vue.js application
├── docs/              # Complete documentation
└── README.md
```

## 🚀 Quick Start

### Running the Prototype

```bash
cd prototype
python3 -m http.server 8000
```

Open: http://localhost:8000

### Running the Production Version

**Backend:**
```bash
cd backend/LdaOutcomesTool.API
dotnet restore
dotnet run
```

**Frontend:**
```bash
cd frontend/lda-outcomes-tool-ui
npm install
npm run dev
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- [Requirements Document](docs/REQUIREMENTS.md) - Complete feature specifications
- [Architecture Documentation](docs/ARCHITECTURE.md) - System architecture and diagrams
- [Database Schema](docs/database_schema.sql) - PostgreSQL schema
- [API Specification](docs/API_SPECIFICATION.md) - Complete REST API documentation
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Windows Server deployment
- [Developer Setup](docs/DEVELOPER_SETUP.md) - Local development environment setup

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Vue.js 3, Vite, Tailwind CSS |
| Backend | ASP.NET Core 8.0 |
| Database | PostgreSQL (Production), SQLite (Development) |
| Authentication | Microsoft Entra ID |
| Web Server | IIS (Production) |

## 📋 Development Status

**Current Phase**: Plan Phase Implementation

- [x] Project structure setup
- [x] Documentation complete
- [ ] Backend API implementation
- [ ] Frontend implementation
- [ ] Authentication integration
- [ ] Create phase
- [ ] Evaluate phase
- [ ] Review phase

## 🔧 Prerequisites

### Development

- .NET 8.0 SDK
- Node.js 18+ LTS
- PostgreSQL 14+ (or SQLite for local dev)
- Git

### Production

- Windows Server 2019/2022
- IIS 10+
- PostgreSQL 14+
- Microsoft Entra ID tenant
- SSL certificate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

[Add your license here]

## 👥 Contact

Project Repository: https://github.com/iharkis/lda-outcomes-tool

## 🙏 Acknowledgments

- Original prototype developed as requirements gathering tool
- Architecture designed for enterprise deployment on Windows Server
- Built to integrate with Microsoft 365 ecosystem
