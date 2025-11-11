# Claude Code Configuration - Primadata Marketplace

## Git Worktree Configuration

**Worktree Directory**: `.worktrees/` (project-local, hidden)

### For Agents

When working on features that require isolated workspaces:
- **Automatically create worktrees** in `.worktrees/<branch-name>/`
- Directory is already in `.gitignore` - safe to use
- Each worktree gets its own dependency installation

### Directory Structure

```
primadata-marketplace/
├── .worktrees/           # Isolated workspaces (git-ignored)
│   ├── feature-name-1/   # Branch: feature/name-1
│   ├── feature-name-2/   # Branch: feature/name-2
│   └── bugfix-xyz/       # Branch: bugfix/xyz
├── .gitignore            # Contains .worktrees/
└── [main project files]
```

### When Agents Should Use Worktrees

**✅ Use worktrees for:**
- Feature development after brainstorming approval
- Executing multi-step implementation plans
- Working on features that need isolation from current workspace
- Parallel development of multiple features

**❌ Don't use worktrees for:**
- Quick fixes to current branch
- Simple file edits
- Documentation updates

### Setup Commands (for reference)

```bash
# Agents will automatically run these:
cd /Users/jamese/repos/primadata-marketplace
git worktree add .worktrees/<branch-name> -b <branch-name>
cd .worktrees/<branch-name>
npm install  # Auto-detected from package.json
npm test     # Verify clean baseline
```

### Cleanup After Feature Complete

```bash
# Return to main repository
cd /Users/jamese/repos/primadata-marketplace

# Remove worktree (keeps branch)
git worktree remove .worktrees/<branch-name>

# Or remove and delete branch
git worktree remove .worktrees/<branch-name>
git branch -D <branch-name>
```

---

*This configuration enables agents to automatically create isolated workspaces when needed.*
