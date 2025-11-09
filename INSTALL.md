# 📦 Installation Guide - Primadata Marketplace v2.0

This guide provides detailed instructions for installing and configuring the Primadata Marketplace plugins.

## 🚀 Prerequisites

### Required Software

1. **Claude Code CLI**
   ```bash
   # Check if installed
   claude --version

   # If not installed, visit:
   # https://docs.anthropic.com/en/docs/claude-code/installation
   ```

2. **Git** (for plugin installation)
   ```bash
   git --version
   ```

3. **Optional but Recommended:**
   - **ripgrep** - Fast searching: `brew install ripgrep` (macOS) or `apt install ripgrep` (Linux)
   - **fd** - Fast file finder: `brew install fd` (macOS) or `apt install fd-find` (Linux)
   - **jq** - JSON processor: `brew install jq` (macOS) or `apt install jq` (Linux)
   - **Chrome** - For browser automation features
   - **tmux** - For interactive CLI control: `brew install tmux` (macOS) or `apt install tmux` (Linux)

## 🎯 Installation Profiles

Choose the profile that best fits your needs:

### 🟢 Minimal Profile (Essential Tools Only)
**Best for:** Quick start, basic development needs, minimal resource usage

```bash
# Step 1: Add the marketplace
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Step 2: Install essential plugins
claude plugin install superpowers@primadata-marketplace
claude plugin install elements-of-style@primadata-marketplace
claude plugin install episodic-memory@primadata-marketplace
```

**Includes:**
- Core skills for TDD and debugging
- Writing guidance
- Session memory

### 🔵 Standard Profile (Recommended)
**Best for:** Most developers, balanced feature set, good performance

```bash
# Step 1: Add the marketplace
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Step 2: Install standard set
claude plugin install claude-dev-toolkit@primadata-marketplace && \
  claude plugin install superpowers@primadata-marketplace && \
  claude plugin install episodic-memory@primadata-marketplace && \
  claude plugin install primadata-cost-manager@primadata-marketplace && \
  claude plugin install primadata-memory-bank@primadata-marketplace
```

**Includes everything from Minimal plus:**
- 38 specialized agents
- Cost tracking and management
- Structured memory bank system

### 🟣 Professional Profile (Full Development)
**Best for:** Professional developers, complex projects, team environments

```bash
# Step 1: Add the marketplace
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Step 2: Install professional set
claude plugin install claude-dev-toolkit@primadata-marketplace && \
  claude plugin install superpowers@primadata-marketplace && \
  claude plugin install superpowers-chrome@primadata-marketplace && \
  claude plugin install episodic-memory@primadata-marketplace && \
  claude plugin install primadata-cost-manager@primadata-marketplace && \
  claude plugin install primadata-memory-bank@primadata-marketplace && \
  claude plugin install primadata-security-pack@primadata-marketplace && \
  claude plugin install primadata-prompt-tools@primadata-marketplace
```

**Includes everything from Standard plus:**
- Browser automation
- Enterprise security tools
- Advanced prompt engineering

### 🔴 Enterprise Profile (Complete Suite)
**Best for:** Enterprise teams, maximum capabilities, all features

```bash
# One-liner installation (copy entire block)
claude plugin marketplace add Primadetaautomation/primadata-marketplace && \
  for plugin in claude-dev-toolkit superpowers superpowers-chrome elements-of-style \
    episodic-memory superpowers-lab superpowers-developing-for-claude-code \
    primadata-memory-bank primadata-cost-manager primadata-security-pack \
    primadata-prompt-tools primadata-docs-automation primadata-specialized-agents \
    claude-mcp-cloudflare-docs claude-mcp-notion claude-code-metrics; do \
    claude plugin install $plugin@primadata-marketplace; \
  done
```

**Includes everything plus:**
- Documentation automation
- MCP server integrations
- Experimental features
- Development tools for creating plugins

## 🔧 Post-Installation Setup

### 1. Verify Installation

```bash
# List installed plugins
claude plugin list

# Check specific plugin
claude plugin info superpowers@primadata-marketplace
```

### 2. Configure Memory Bank (if installed)

When using `primadata-memory-bank`, initialize your project:

```bash
# In your project directory
echo "# Project Context" > CLAUDE-activeContext.md
echo "# Code Patterns" > CLAUDE-patterns.md
echo "# Architecture Decisions" > CLAUDE-decisions.md
echo "# Troubleshooting Log" > CLAUDE-troubleshooting.md
```

### 3. Set Up Cost Tracking (if installed)

With `primadata-cost-manager`, configure budget alerts:

```bash
# Create cost tracking config
mkdir -p .claude
echo '{
  "budget": {
    "daily_limit": 10.00,
    "monthly_limit": 200.00,
    "alert_threshold": 0.8
  }
}' > .claude/cost-config.json
```

### 4. Configure MCP Servers (if installed)

For MCP server plugins, additional setup may be required:

#### Notion MCP
```bash
# Set Notion API key
export NOTION_API_KEY="your-api-key"
```

#### Cloudflare Docs MCP
```bash
# No configuration needed - works out of the box
```

#### Context7 MCP
```bash
# Set Upstash credentials
export UPSTASH_REDIS_REST_URL="your-url"
export UPSTASH_REDIS_REST_TOKEN="your-token"
```

## 🔄 Updating Plugins

### Update All Plugins
```bash
# Update the marketplace first
claude plugin marketplace update primadata-marketplace

# Then update all plugins
claude plugin update --all
```

### Update Specific Plugin
```bash
claude plugin update superpowers@primadata-marketplace
```

## 🗑️ Uninstalling

### Remove Specific Plugin
```bash
claude plugin uninstall superpowers@primadata-marketplace
```

### Remove All Marketplace Plugins
```bash
# List all from marketplace
claude plugin list | grep primadata-marketplace

# Uninstall each
claude plugin uninstall [plugin-name]@primadata-marketplace
```

### Remove Marketplace
```bash
claude plugin marketplace remove primadata-marketplace
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Plugin Installation Fails
```bash
# Clear cache and retry
claude plugin cache clear
claude plugin install [plugin-name]@primadata-marketplace
```

#### 2. MCP Server Not Working
```bash
# Check if MCP is running
ps aux | grep mcp

# Restart Claude Code
claude restart
```

#### 3. Memory Bank Not Persisting
```bash
# Ensure files are not in .gitignore
cat .gitignore | grep CLAUDE

# If present, remove from .gitignore
```

#### 4. Cost Tracking Not Working
```bash
# Verify plugin is loaded
claude plugin info primadata-cost-manager@primadata-marketplace

# Check logs
claude logs | grep cost
```

### Getting Help

1. **Check Documentation:**
   - Main README: [README.md](README.md)
   - Credits: [CREDITS.md](CREDITS.md)
   - Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)

2. **Open an Issue:**
   - https://github.com/Primadetaautomation/primadata-marketplace/issues

3. **Contact:**
   - Email: rick@primadetaautomation.com

## 📊 Performance Considerations

### Token Usage by Profile

| Profile | Avg. Tokens/Hour | Monthly Cost (Est.) |
|---------|------------------|---------------------|
| Minimal | 5,000-10,000 | $5-10 |
| Standard | 10,000-20,000 | $10-20 |
| Professional | 20,000-40,000 | $20-40 |
| Enterprise | 40,000-80,000 | $40-80 |

*Estimates based on typical usage with Claude Sonnet 3.5*

### Resource Requirements

| Profile | RAM | CPU | Disk Space |
|---------|-----|-----|------------|
| Minimal | 2GB | 2 cores | 100MB |
| Standard | 4GB | 2 cores | 500MB |
| Professional | 8GB | 4 cores | 1GB |
| Enterprise | 16GB | 4 cores | 2GB |

## ✅ Installation Checklist

- [ ] Claude Code CLI installed
- [ ] Git installed
- [ ] Marketplace added
- [ ] Plugins installed per chosen profile
- [ ] Memory bank initialized (if applicable)
- [ ] Cost tracking configured (if applicable)
- [ ] MCP servers configured (if applicable)
- [ ] Installation verified with `claude plugin list`

## 🎉 Next Steps

1. **Start Using:** Open Claude Code in your project directory
2. **Explore Features:** Try different agents and skills
3. **Customize:** Adjust settings in `.claude/settings.json`
4. **Contribute:** Share feedback and improvements

---

*Installation guide v2.0 - Last updated: November 2025*