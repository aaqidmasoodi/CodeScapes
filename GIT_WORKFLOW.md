# Git Workflow & Release Guide

This document outlines the standard operating procedures for developing, testing, and releasing CodeScape.

---

## 🏗️ Phase 1: Development (Feature Workflow)

All new features and non-trivial fixes should happen on a dedicated branch.

### 1. Start a Feature

```bash
# Update main first
git checkout main
git pull origin main

# Create your branch
# naming: feature/name-of-feature, fix/bug-description, chore/maintenance
git checkout -b feature/awesome-new-preview
```

### 2. The "Pre-Commit" Loop (Run Locally!)

Before committing, ensure your code is clean. Husky will try to run this, but running it manually saves time.

```bash
# 1. Format Code
npx prettier --write .

# 2. Type Check
npm run typecheck

# 3. Lint
npm run lint

# 4. Run Tests
npm run test -- --run
```

### 3. Commit & Push

```bash
git add .
git commit -m "feat(scope): descriptions of what you did"
git push origin feature/awesome-new-preview
```

### 4. Merge via Pull Request (GitHub)

1. Open a PR on GitHub.
2. Wait for **Web Quality CI** to pass.
3. Merge into `main` (Squash & Merge is recommended).
4. **Delete** the feature branch on GitHub.

### 5. Local Cleanup (Post-Merge)

```bash
git checkout main
git pull origin main
git branch -d feature/awesome-new-preview
# Optional: prune remote tracking references
git fetch -p
```

---

## 🚀 Phase 2: Release Workflow (Production)

Releases are triggered by **Git Tags**. When you push a tag like `v0.0.4`, GitHub Actions will automatically:

1. Build the app for macOS, Windows, and Linux.
2. Create a GitHub Release draft.
3. Upload the binaries (.dmg, .exe, .AppImage, .zip, .deb).

### 1. Preparing the Release

Make sure you are on the latest `main`.

```bash
git checkout main
git pull origin main
```

### 2. Bump Version & Commit

**CRITICAL:** The code must change for a release to be valid. You must bump the version in `package.json`.

```bash
# Bump version (updates package.json)
npm version patch --no-git-tag-version  # 0.0.4 -> 0.0.5

# Commit the bump
git add package.json
git commit -m "chore: bump version to x.y.z"
git push origin main
```

### 3. Tag & Trigger Release

```bash
# Create the tag matching the new version
git tag v0.0.5

# Push the tag to GitHub
git push origin v0.0.5
```

### 4. Monitor & Publish

1. Go to **GitHub Actions** tab to watch the "Release" workflow.
2. Once passing, Go to **Releases** on GitHub.
3. You will see a new **Draft Release**.
4. Edit the release notes and click **Publish**.

---

## ❓ FAQ: Strategy & Scenarios

### "I have 10 features to build. Do I make 10 branches?"

**Answer:** Ideally, **YES**.

- **Why?** If Feature #3 breaks everything, you don't want it blocking Feature #1 from being released.
- **Workflow:**
  1. `git checkout -b feature/login-page` -> Build -> Merge -> Delete.
  2. `git checkout -b feature/dark-mode` -> Build -> Merge -> Delete.
- **Shortcut:** If the features are small and related (e.g. "UI Polish"), you can group them into one branch like `feature/ui-improvements`.

### "Hotfixes: Critical Bug on Prod!"

If `main` is broken and you need a fix NOW:

1. `git checkout main` -> `git pull`.
2. `git checkout -b fix/critical-bug`.
3. Fix it -> Commit -> Push.
4. Merge to `main`.
5. Immediately Tag & Release (Phase 2).

### "Husky - DEPRECATED Warning"

Ignore lines about `#!/usr/bin/env sh`. It is a harmless warning from Husky v9.

### "CI Fails but Local Passes"

- **Line Endings:** Run `git diff -R` or check `.gitattributes`.
- **Lockfile:** run `npm ci` locally to see if your `package-lock.json` is synced.

---

## 🛡️ Branch Protection Rules (Main)

To prevent accidental deletions or direct pushes to `main`, configure these rules in your GitHub Repository Settings.

### 1. Go to Settings

1. Navigate to your repository on GitHub.
2. Click **Settings** (top bar).
3. On the left sidebar, click **Branches**.

### 2. Add Rule

1. Click **Add branch protection rule**.
2. **Branch name pattern**: `main`

### 3. Configure Rules (Recommended)

Check the following boxes:

- [x] **Require a pull request before merging**
  - [x] **Require approvals**: Set to `0` if working solo (forces PR flow but allows self-merge). Set to `1` if you want a review.
- [x] **Require status checks to pass before merging**
  - **Create a PR first!** Checks only appear in the list after they have run once.
    - **"No results" found?** This means CI hasn't run yet.
      1. Uncheck this rule for now.
      2. Click Save.
      3. Create your PR (Next Step below) and wait for tests to run.
      4. Come back here and enable this rule.
- [x] **Do not allow bypassing the above settings**
  - This ensures that even as an Admin/Owner, you must follow the PR flow.

### 4. Save

Click **Create** or **Save changes**.

**Result:**

- You can no longer `git push origin main`. It will begin rejecting you.
- You MUST create a branch -> PR -> Merge.
