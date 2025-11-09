# 🔌 Wrapper Plugin Repositories

This document outlines the wrapper plugins that need to be created as separate GitHub repositories to package features from [centminmod/my-claude-code-setup](https://github.com/centminmod/my-claude-code-setup) for the Primadata Marketplace.

## ⚠️ Important Note

These repositories need to be created at:
- https://github.com/Primadetaautomation/[plugin-name]

Each wrapper plugin packages specific features from my-claude-code-setup with proper attribution.

---

## 1. primadata-memory-bank

**Repository:** `https://github.com/Primadetaautomation/primadata-memory-bank`

### Structure:
```
primadata-memory-bank/
├── .claude-plugin/
│   └── plugin.json
├── agents/
│   └── memory-bank-synchronizer.md
├── templates/
│   ├── CLAUDE-activeContext.md
│   ├── CLAUDE-patterns.md
│   ├── CLAUDE-decisions.md
│   └── CLAUDE-troubleshooting.md
├── commands/
│   └── init-memory-bank.md
├── README.md
├── LICENSE (MIT)
└── CREDITS.md
```

### plugin.json:
```json
{
  "name": "primadata-memory-bank",
  "version": "1.0.0",
  "description": "Structured memory bank system for persistent project context",
  "author": "Primadata Automation (based on centminmod/my-claude-code-setup)"
}
```

### Files to Port:
- agents/memory-bank-synchronizer.md from my-claude-code-setup
- CLAUDE-*.md template structure
- Documentation about memory bank system

---

## 2. primadata-cost-manager

**Repository:** `https://github.com/Primadetaautomation/primadata-cost-manager`

### Structure:
```
primadata-cost-manager/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   └── ccusage-daily.md
├── scripts/
│   └── calculate-costs.js
├── config/
│   └── cost-config-template.json
├── README.md
├── LICENSE (MIT)
└── CREDITS.md
```

### plugin.json:
```json
{
  "name": "primadata-cost-manager",
  "version": "1.0.0",
  "description": "Cost tracking and optimization for Claude Code usage",
  "author": "Primadata Automation (based on centminmod/my-claude-code-setup)"
}
```

### Files to Port:
- commands/ccusage/ccusage-daily.md
- Cost calculation logic
- Usage tracking patterns

---

## 3. primadata-security-pack

**Repository:** `https://github.com/Primadetaautomation/primadata-security-pack`

### Structure:
```
primadata-security-pack/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── secure-prompts.md
│   ├── security-audit.md
│   └── check-best-practices.md
├── test-examples/
│   └── (security test files)
├── checklists/
│   ├── owasp-top-10.md
│   └── security-checklist.md
├── README.md
├── LICENSE (MIT)
└── CREDITS.md
```

### plugin.json:
```json
{
  "name": "primadata-security-pack",
  "version": "1.0.0",
  "description": "Enterprise security tools for Claude Code projects",
  "author": "Primadata Automation (based on centminmod/my-claude-code-setup)"
}
```

### Files to Port:
- commands/security/*.md
- test-examples/ directory
- Security patterns and checklists

---

## 4. primadata-prompt-tools

**Repository:** `https://github.com/Primadetaautomation/primadata-prompt-tools`

### Structure:
```
primadata-prompt-tools/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── apply-thinking-to.md
│   └── convert-to-todowrite-tasklist-prompt.md
├── skills/
│   └── chain-of-draft.md
├── patterns/
│   └── anthropic-thinking-patterns.md
├── README.md
├── LICENSE (MIT)
└── CREDITS.md
```

### plugin.json:
```json
{
  "name": "primadata-prompt-tools",
  "version": "1.0.0",
  "description": "Advanced prompt engineering tools with 80% token reduction",
  "author": "Primadata Automation (based on centminmod/my-claude-code-setup)"
}
```

### Files to Port:
- commands/anthropic/*.md
- commands/promptengineering/*.md
- Chain of Draft patterns from code-searcher agent

---

## 5. primadata-docs-automation

**Repository:** `https://github.com/Primadetaautomation/primadata-docs-automation`

### Structure:
```
primadata-docs-automation/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── create-release-note.md
│   ├── add-update-readme.md
│   └── cleanup-context.md
├── templates/
│   ├── release-note-template.md
│   └── readme-template.md
├── README.md
├── LICENSE (MIT)
└── CREDITS.md
```

### plugin.json:
```json
{
  "name": "primadata-docs-automation",
  "version": "1.0.0",
  "description": "Documentation automation for release notes and README generation",
  "author": "Primadata Automation (based on centminmod/my-claude-code-setup)"
}
```

### Files to Port:
- commands/documentation/*.md
- commands/cleanup/*.md
- Documentation templates

---

## 6. primadata-specialized-agents

**Repository:** `https://github.com/Primadetaautomation/primadata-specialized-agents`

### Structure:
```
primadata-specialized-agents/
├── .claude-plugin/
│   └── plugin.json
├── agents/
│   ├── code-searcher.md
│   ├── get-current-datetime.md
│   └── ux-design-expert.md
├── README.md
├── LICENSE (MIT)
└── CREDITS.md
```

### plugin.json:
```json
{
  "name": "primadata-specialized-agents",
  "version": "1.0.0",
  "description": "Specialized agents for code search, datetime, and UX design",
  "author": "Primadata Automation (based on centminmod/my-claude-code-setup)"
}
```

### Files to Port:
- agents/code-searcher.md
- agents/get-current-datetime.md
- agents/ux-design-expert.md

---

## 🔧 Creating the Wrapper Plugins

### Step-by-Step Process:

1. **Create Repository**
   ```bash
   # For each plugin
   mkdir primadata-[plugin-name]
   cd primadata-[plugin-name]
   git init
   ```

2. **Copy Files from my-claude-code-setup**
   ```bash
   # Clone source
   git clone https://github.com/centminmod/my-claude-code-setup.git temp-source

   # Copy relevant files to wrapper plugin
   cp -r temp-source/.claude/[relevant-files] ./
   ```

3. **Create plugin.json**
   ```bash
   mkdir -p .claude-plugin
   # Add plugin.json with proper attribution
   ```

4. **Add Attribution**
   ```bash
   # Create CREDITS.md with full attribution
   # Update all file headers with source attribution
   ```

5. **Create README**
   ```bash
   # Document features, installation, usage
   # Link to original repository
   ```

6. **Add License**
   ```bash
   # Use MIT license
   # Include original copyright notices
   ```

7. **Test Plugin**
   ```bash
   # Test local installation
   claude plugin install file:./primadata-[plugin-name]
   ```

8. **Publish to GitHub**
   ```bash
   git add .
   git commit -m "feat: Initial release with attribution to centminmod/my-claude-code-setup"
   git remote add origin https://github.com/Primadetaautomation/primadata-[plugin-name].git
   git push -u origin main
   ```

## 📄 Attribution Template

Each wrapper plugin MUST include this in CREDITS.md:

```markdown
# Credits

This plugin is based on features from:
- **Repository:** [centminmod/my-claude-code-setup](https://github.com/centminmod/my-claude-code-setup)
- **Author:** George Liu (centminmod)
- **License:** MIT

## Specific Features Ported:
- [List specific files/features]

## Modifications:
- Packaged as Claude Code plugin
- [List any modifications made]

## Original Copyright:
Copyright (c) 2024 George Liu

## Current Maintainer:
Primadata Automation - rick@primadetaautomation.com
```

## ✅ Checklist for Each Wrapper Plugin

- [ ] Repository created at GitHub
- [ ] Files ported from my-claude-code-setup
- [ ] plugin.json with attribution in description
- [ ] CREDITS.md with full attribution
- [ ] README.md with features and usage
- [ ] LICENSE file (MIT)
- [ ] Tested locally
- [ ] Pushed to GitHub
- [ ] marketplace.json updated with correct URL

## 📝 Notes

1. **Attribution is mandatory** - Every file must credit the original source
2. **Test thoroughly** - Ensure features work as standalone plugins
3. **Maintain compatibility** - Don't break existing functionality
4. **Document changes** - Note any modifications from original
5. **Respect licenses** - Follow MIT license terms

---

*This document guides the creation of wrapper plugins. Once repositories are created, update marketplace.json with actual URLs.*