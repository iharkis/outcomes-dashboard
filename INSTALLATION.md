# Installation Guide for Ubuntu

This guide will help you install all required dependencies for LDA Outcomes Tool development on Ubuntu.

## 1. Install .NET 8.0 SDK

### Option A: Using Microsoft Package Repository (Recommended)

```bash
# Get Ubuntu version
declare repo_version=$(lsb_release -r -s)

# Download Microsoft package signing key
wget https://packages.microsoft.com/config/ubuntu/$repo_version/packages-microsoft-prod.deb -O packages-microsoft-prod.deb

# Install the signing key
sudo dpkg -i packages-microsoft-prod.deb

# Clean up
rm packages-microsoft-prod.deb

# Update package index
sudo apt-get update

# Install .NET SDK 8.0
sudo apt-get install -y dotnet-sdk-8.0

# Verify installation
dotnet --version
```

### Option B: Using Snap (Alternative)

```bash
sudo snap install dotnet-sdk --classic --channel=8.0
sudo snap alias dotnet-sdk.dotnet dotnet

# Verify
dotnet --version
```

### Troubleshooting .NET Installation

If you get "command not found" after installation:

```bash
# Add to PATH
echo 'export PATH=$PATH:$HOME/.dotnet' >> ~/.bashrc
source ~/.bashrc

# Or for system-wide
export DOTNET_ROOT=/usr/share/dotnet
export PATH=$PATH:$DOTNET_ROOT
```

## 2. Install Node.js 18+ LTS

### Using NodeSource Repository (Recommended)

```bash
# Download and execute NodeSource setup script
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Using NVM (Alternative - Recommended for Multiple Versions)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version
npm --version
```

## 3. Install SQLite (for Development Database)

```bash
# SQLite is usually pre-installed on Ubuntu, but if not:
sudo apt-get update
sudo apt-get install -y sqlite3 libsqlite3-dev

# Verify
sqlite3 --version
```

## 4. Install Git (if not already installed)

```bash
sudo apt-get update
sudo apt-get install -y git

# Verify
git --version

# Configure git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 5. Install VS Code (Optional but Recommended)

### Option A: Using Snap

```bash
sudo snap install code --classic
```

### Option B: Using apt

```bash
# Download package
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'

# Install
sudo apt-get install apt-transport-https
sudo apt-get update
sudo apt-get install code

# Clean up
rm -f packages.microsoft.gpg
```

### Recommended VS Code Extensions

After installing VS Code, install these extensions:

```bash
code --install-extension ms-dotnettools.csharp
code --install-extension Vue.volar
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension humao.rest-client
```

## 6. Install PostgreSQL (Optional - for Production-like Setup)

```bash
# Install PostgreSQL 14
sudo apt-get update
sudo apt-get install -y postgresql-14 postgresql-contrib-14

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
sudo systemctl status postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE lda_outcomes_db_dev;"
sudo -u postgres psql -c "CREATE USER lda_dev_user WITH PASSWORD 'DevPassword123!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lda_outcomes_db_dev TO lda_dev_user;"
```

## 7. Verify All Installations

```bash
# Create verification script
cat > /tmp/verify_installation.sh << 'EOF'
#!/bin/bash

echo "=== Verifying Installations ==="
echo ""

# .NET
if command -v dotnet &> /dev/null; then
    echo "✓ .NET SDK: $(dotnet --version)"
else
    echo "✗ .NET SDK: NOT FOUND"
fi

# Node.js
if command -v node &> /dev/null; then
    echo "✓ Node.js: $(node --version)"
else
    echo "✗ Node.js: NOT FOUND"
fi

# npm
if command -v npm &> /dev/null; then
    echo "✓ npm: $(npm --version)"
else
    echo "✗ npm: NOT FOUND"
fi

# SQLite
if command -v sqlite3 &> /dev/null; then
    echo "✓ SQLite: $(sqlite3 --version)"
else
    echo "✗ SQLite: NOT FOUND"
fi

# Git
if command -v git &> /dev/null; then
    echo "✓ Git: $(git --version)"
else
    echo "✗ Git: NOT FOUND"
fi

# Python (for prototype)
if command -v python3 &> /dev/null; then
    echo "✓ Python 3: $(python3 --version)"
else
    echo "✗ Python 3: NOT FOUND"
fi

echo ""
echo "=== End of Verification ==="
EOF

chmod +x /tmp/verify_installation.sh
/tmp/verify_installation.sh
```

## 8. Quick Installation Script (All at Once)

```bash
#!/bin/bash

echo "Installing LDA Outcomes Tool dependencies..."

# Update system
sudo apt-get update

# Install .NET SDK 8.0
wget https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y dotnet-sdk-8.0

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install SQLite
sudo apt-get install -y sqlite3 libsqlite3-dev

# Install Git
sudo apt-get install -y git

echo ""
echo "Installation complete! Verifying..."
echo ""

dotnet --version
node --version
npm --version
sqlite3 --version
git --version

echo ""
echo "All dependencies installed successfully!"
```

## Next Steps

After installing all dependencies:

1. **Follow GITHUB_SETUP.md** to push your code to GitHub
2. **Follow backend/README.md** (will be created) to set up the backend
3. **Follow frontend/README.md** (will be created) to set up the frontend
4. **Start development!**

## Troubleshooting

### Permission Issues

If you encounter permission errors:

```bash
# Fix npm global package permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Port Already in Use

```bash
# Find process using port 5000 (backend)
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>

# Find process using port 5173 (frontend)
sudo lsof -i :5173
```

### .NET HTTPS Certificate Issues

```bash
# Trust development certificate
dotnet dev-certs https --trust
```

## System Requirements

- **OS**: Ubuntu 20.04 LTS or later
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk Space**: 10 GB free space minimum
- **Internet**: Required for package installation

## Support

If you encounter issues during installation:

1. Check the error messages carefully
2. Search for specific error messages online
3. Consult the official documentation:
   - .NET: https://learn.microsoft.com/en-us/dotnet/core/install/linux-ubuntu
   - Node.js: https://nodejs.org/en/download/package-manager/
4. Create an issue in the GitHub repository
