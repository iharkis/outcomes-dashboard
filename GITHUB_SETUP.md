# GitHub Setup Instructions

Follow these steps to push your LDA Outcomes Tool to GitHub.

## Step 1: Create GitHub Repository

1. Go to https://github.com/iharkis
2. Click the **"+"** button (top right) → **"New repository"**
3. Fill in repository details:
   - **Repository name**: `lda-outcomes-tool`
   - **Description**: "Project outcomes planning and evaluation tool - 4-phase approach for tracking outcomes, decisions, evaluations, and reviews"
   - **Visibility**: **Public** ✅
   - **Initialize**: Do NOT check any boxes (no README, no .gitignore, no license)
4. Click **"Create repository"**

## Step 2: Configure Git (If Not Already Done)

```bash
# Set your name and email (use your GitHub email)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify
git config --global --list
```

## Step 3: Add All Files to Git

```bash
# Make sure you're in the project root
cd /home/iain/lda_outcomes_tool

# Check current status
git status

# Add all files
git add .

# Check what will be committed
git status

# You should see:
# - .gitignore files
# - README.md
# - docs/ folder
# - prototype/ folder
# - backend/ folder (initially empty)
# - frontend/ folder (initially empty)
```

## Step 4: Create Initial Commit

```bash
# Create first commit
git commit -m "Initial commit: Project structure and documentation

- Complete documentation (requirements, architecture, API spec, deployment guide)
- Original HTML/CSS/JS prototype
- Project structure ready for backend and frontend development
- .gitignore files configured
- README with quick start instructions"

# Verify commit was created
git log
```

## Step 5: Connect to GitHub

```bash
# Add GitHub remote (replace 'iharkis' if needed)
git remote add origin https://github.com/iharkis/lda-outcomes-tool.git

# Verify remote was added
git remote -v

# Should show:
# origin  https://github.com/iharkis/lda-outcomes-tool.git (fetch)
# origin  https://github.com/iharkis/lda-outcomes-tool.git (push)
```

## Step 6: Push to GitHub

```bash
# Push to GitHub
git push -u origin main
```

**You will be prompted for credentials:**
- **Username**: `iharkis`
- **Password**: Use a **Personal Access Token** (not your GitHub password)

### Creating a Personal Access Token (if needed):

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Set:
   - **Note**: "LDA Outcomes Tool Development"
   - **Expiration**: 90 days (or custom)
   - **Scopes**: Check **`repo`** (all checkboxes under it)
4. Click **"Generate token"**
5. **Copy the token immediately** (you won't see it again!)
6. Use this token as your password when pushing

### Alternative: SSH Key (Recommended for Long-term)

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# 1. Go to https://github.com/settings/keys
# 2. Click "New SSH key"
# 3. Paste the public key
# 4. Click "Add SSH key"

# Change remote to SSH
git remote set-url origin git@github.com:iharkis/lda-outcomes-tool.git

# Push
git push -u origin main
```

## Step 7: Verify on GitHub

1. Go to https://github.com/iharkis/lda-outcomes-tool
2. You should see:
   - README.md displayed on the main page
   - All folders (docs, prototype, backend, frontend)
   - Latest commit message

## Step 8: Set Up GitHub Repository Settings (Optional)

### Add Topics/Tags:
1. Click the ⚙️ icon next to "About" (top right)
2. Add topics: `project-management`, `outcomes-tracking`, `vuejs`, `dotnet`, `evaluation-tool`

### Enable Issues:
1. Go to **Settings** → **General**
2. Under "Features", ensure **Issues** is checked

### Set Up Branch Protection (Optional):
1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable "Require pull request reviews before merging"

## Common Git Commands Going Forward

```bash
# Check status
git status

# See what changed
git diff

# Add specific files
git add <filename>

# Add all changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes (when collaborating)
git pull

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# View commit history
git log --oneline

# View remote info
git remote -v
```

## Troubleshooting

### "Permission denied (publickey)"
- Your SSH key isn't set up or added to GitHub
- Follow SSH key setup steps above

### "Authentication failed"
- You're using your GitHub password instead of a Personal Access Token
- Create and use a PAT (see Step 6)

### "Repository not found"
- Check the repository name and your GitHub username
- Verify: `git remote -v`

### "refusing to merge unrelated histories"
- This happens if you initialized repo with README on GitHub
- Solution: `git pull origin main --allow-unrelated-histories`

### Files not being tracked
- Check they're not in .gitignore
- Use `git status` to see what's tracked

## Next Steps After Pushing

1. **Add Repository Description** on GitHub
2. **Create Project Board** for tracking tasks
3. **Set up Branch Protection** rules
4. **Invite Collaborators** if working with a team
5. **Clone to Company Repo** when ready:
   ```bash
   # Company admin would run:
   git clone https://github.com/iharkis/lda-outcomes-tool.git
   cd lda-outcomes-tool
   git remote set-url origin https://github.com/company/lda-outcomes-tool.git
   git push -u origin main
   ```

## Keeping Forks in Sync

If you create a company fork:

```bash
# In the company repo, add original as upstream
git remote add upstream https://github.com/iharkis/lda-outcomes-tool.git

# Fetch updates from personal repo
git fetch upstream

# Merge updates
git merge upstream/main

# Push to company repo
git push origin main
```

---

**Your GitHub repository should now be live at:**
https://github.com/iharkis/lda-outcomes-tool

**Clone URL for others:**
```bash
git clone https://github.com/iharkis/lda-outcomes-tool.git
```
