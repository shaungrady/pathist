# Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for automated release management. This document covers the one-time setup and the ongoing release workflow.

## One-Time Setup

### 1. Configure NPM Token

Before releases can be published, you need to add an NPM token to GitHub:

1. **Generate an npm token:**
   ```bash
   npm login
   ```
   Then create a token at https://www.npmjs.com/settings/[username]/tokens
   - Token type: **Automation** (for CI/CD)
   - Expiration: Set according to your security preferences

2. **Add the token to GitHub:**
   - Go to: Repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

### 2. Verify GitHub Actions Permissions

Ensure the release workflow has proper permissions:
- Go to: Repository Settings → Actions → General
- Under "Workflow permissions", select:
  - ✅ **Read and write permissions**
  - ✅ **Allow GitHub Actions to create and approve pull requests**

## Release Workflow

### During Development

When you make changes that should be included in the next release, create a changeset:

```bash
pnpm changeset
```

You'll be prompted to:
1. **Select the bump type:**
   - `patch` - Bug fixes, minor tweaks (0.1.0 → 0.1.1)
   - `minor` - New features, backwards-compatible (0.1.0 → 0.2.0)
   - `major` - Breaking changes (0.1.0 → 1.0.0)

2. **Write a summary:**
   - Describe what changed from a user's perspective
   - This will appear in the CHANGELOG and GitHub release notes

This creates a markdown file in `.changeset/`. **Commit this file with your changes.**

**Example:**
```bash
# Make your changes
git add src/pathist.ts

# Create a changeset
pnpm changeset
# Choose "minor", write: "Add new pathTo() method for searching paths"

# Commit both the code and changeset
git add .changeset/*.md
git commit -m "feat: add pathTo() search method"
git push
```

### Cutting a Release

When you're ready to publish a new version:

#### Option A: Manual (Recommended for First Release)

```bash
# 1. Consume changesets and update version/CHANGELOG
pnpm version-packages

# This will:
# - Update package.json version
# - Generate/update CHANGELOG.md
# - Delete consumed changeset files

# 2. Review the changes
git diff

# 3. Commit and push
git add .
git commit -m "chore: release v$(node -p "require('./package.json').version")"
git push

# 4. GitHub Actions will automatically publish to npm
```

#### Option B: Via Release PR (Automatic)

**You don't create this PR manually** - the GitHub Actions workflow creates it for you:

1. When you push changesets to `main`, the workflow automatically:
   - Creates/updates a PR titled **"Version Packages"** (or your configured title)
   - Shows the version bump and changelog updates in the PR
   - Keeps this PR updated as you add more changesets

2. **To release:**
   - Find the "Version Packages" PR in your repository
   - Review the changes (version bump, CHANGELOG updates)
   - Merge the PR when ready
   - GitHub Actions automatically publishes to npm

**Where to find it:** Go to your repository → Pull Requests → Look for "Version Packages" or "chore: version packages"

## What Happens Automatically

### On Every Push to `main`:

The release workflow (`.github/workflows/release.yml`) runs and does one of two things:

1. **If changeset files exist in `.changeset/`:**
   - Automatically creates or updates a PR titled "Version Packages"
   - This PR contains:
     - Version bump in `package.json`
     - Updated `CHANGELOG.md` with all changeset summaries
     - Deletion of consumed changeset files
   - The PR stays open until you merge it
   - Adding more changesets will update this same PR

2. **If NO changeset files exist (this happens after merging the "Version Packages" PR):**
   - Builds the package
   - Publishes to npm with the new version
   - Creates a GitHub release with changelog notes
   - Tags the commit with the version number

### After Publishing:

- 📦 Package is available on npm: `npm install pathist@latest`
- 🏷️ GitHub release is created with changelog
- 📝 CHANGELOG.md is updated in the repository

## Verification

After a release is published, verify:

```bash
# Check npm
npm view pathist version
npm view pathist

# Test installation
mkdir test-install && cd test-install
npm init -y
npm install pathist
node -e "console.log(require('pathist'))"
```

## Troubleshooting

### Release workflow fails with "401 Unauthorized"
- Check that `NPM_TOKEN` secret is set correctly in GitHub
- Verify the token hasn't expired
- Ensure the token has "Automation" permissions

### No Release PR is created
- Verify changesets exist: `ls .changeset/*.md` (should show files other than README.md)
- Check that you pushed to the `main` branch
- Review workflow runs: Actions tab → Release workflow

### Version not updated after merge
- Ensure the Release PR was merged (not closed)
- Check workflow logs for errors
- Verify `package.json` permissions in workflow settings

### Publishing fails with "Package already exists"
- The version might already be published
- Check `npm view pathist versions`
- Create a new changeset and bump the version again

## Advanced: Snapshot Releases

For testing pre-release versions without publishing:

```bash
# Create a snapshot release
pnpm changeset version --snapshot beta

# Publish to npm with a tag
pnpm changeset publish --tag beta
```

This publishes as `pathist@0.1.0-beta-20251127120000` and can be installed with:
```bash
npm install pathist@beta
```

## Manual Publishing (Emergency Only)

If the automated workflow fails and you need to publish manually:

```bash
# 1. Ensure you're on main with latest changes
git checkout main && git pull

# 2. Verify tests pass
pnpm ci

# 3. Build the package
pnpm build

# 4. Publish (you'll be prompted for npm OTP if 2FA is enabled)
npm publish

# 5. Create a git tag
git tag v$(node -p "require('./package.json').version")
git push --tags
```

## References

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/) (optional, but recommended for commit messages)
