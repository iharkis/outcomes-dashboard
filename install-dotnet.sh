#!/bin/bash

# LDA Outcomes Tool - .NET 8.0 SDK Installation Script for Ubuntu
# This script installs the .NET 8.0 SDK required for backend development

set -e

echo "========================================"
echo "  Installing .NET 8.0 SDK for Ubuntu"
echo "========================================"
echo ""

# Get Ubuntu version
UBUNTU_VERSION=$(lsb_release -rs)
echo "Detected Ubuntu version: $UBUNTU_VERSION"
echo ""

# Download Microsoft package signing key
echo "📦 Downloading Microsoft package repository configuration..."
wget -q https://packages.microsoft.com/config/ubuntu/$UBUNTU_VERSION/packages-microsoft-prod.deb -O packages-microsoft-prod.deb

# Install the signing key
echo "🔑 Installing Microsoft package signing key..."
sudo dpkg -i packages-microsoft-prod.deb

# Clean up
rm packages-microsoft-prod.deb

# Update package index
echo "🔄 Updating package index..."
sudo apt-get update > /dev/null 2>&1

# Install .NET SDK 8.0
echo "⬇️  Installing .NET SDK 8.0..."
sudo apt-get install -y dotnet-sdk-8.0

echo ""
echo "✅ Installation complete!"
echo ""

# Verify installation
if command -v dotnet &> /dev/null; then
    echo "🎉 .NET SDK installed successfully!"
    echo "Version: $(dotnet --version)"
    echo ""

    # Test dotnet command
    echo "Testing .NET CLI..."
    dotnet --info | head -10

    echo ""
    echo "========================================"
    echo "  Installation Successful!"
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo "1. cd backend/"
    echo "2. Follow the backend README for setup"
    echo ""
else
    echo "❌ Installation failed. .NET command not found."
    echo ""
    echo "Troubleshooting:"
    echo "1. Try running: export DOTNET_ROOT=/usr/share/dotnet"
    echo "2. Try running: export PATH=\$PATH:\$DOTNET_ROOT"
    echo "3. Reload your shell: source ~/.bashrc"
    echo "4. Check the INSTALLATION.md file for alternative methods"
    exit 1
fi
