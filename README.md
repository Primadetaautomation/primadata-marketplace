# 🚀 Primadata Development Marketplace v1.6

**Complete Claude Code development ecosystem - 38+ agents, 41+ skills, MCP servers, browser automation**

[🇬🇧 English](#english-version) | [🇳🇱 Nederlands](#nederlandse-versie) | [📜 Credits](#credits)

[![Version](https://img.shields.io/badge/Version-1.6.0-blue)](https://github.com/Primadetaautomation/primadata-marketplace)
[![Plugins](https://img.shields.io/badge/Plugins-14-green)](https://github.com/Primadetaautomation/primadata-marketplace)
[![Agents](https://img.shields.io/badge/Agents-45+-orange)](https://github.com/Primadetaautomation/primadata-marketplace)
[![Skills](https://img.shields.io/badge/Skills-41+-purple)](https://github.com/Primadetaautomation/primadata-marketplace)

---

## 🇳🇱 Nederlandse Versie

### 🎯 Wat is dit?

De **Primadata Development Marketplace v1.6** combineert de beste Claude Code plugins voor moderne softwareontwikkeling:

- **38+ gespecialiseerde agents** voor development, testing, security, architectuur
- **41+ skills** voor TDD, debugging, collaboration, skill creation, en best practices
- **6 Official Anthropic skills** voor skill development, MCP servers, testing, en document manipulation
- **Intelligent Router** voor automatische agent/skill dispatching
- **MCP server integraties** voor Cloudflare, Notion, Gemini, Context7
- **Browser automation** met Chrome DevTools
- **Episodic memory** voor context over sessies heen
- **Writing tools** voor documentatie
- **Experimental features** voor advanced workflows
- **Plugin development tools** voor het maken van eigen plugins

### ⚡ Installatie Profielen

#### 💎 **Quick Power-Up** (My-Claude-Code-Setup Features) 🆕
```bash
# Voor gebruikers die ALLE my-claude-code-setup features willen in één keer:
claude plugin marketplace add Primadetaautomation/primadata-marketplace && \
  claude plugin install primadata-enhanced-toolkit@primadata-marketplace
```
**Inclusief:** Memory bank, cost tracking, security tools, prompt engineering, doc automation, extra agents

#### 🟢 **Minimal Profile** (Essentials)
```bash
# Voeg marketplace toe
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Installeer essentiële plugins
claude plugin install superpowers@primadata-marketplace
claude plugin install elements-of-style@primadata-marketplace
claude plugin install episodic-memory@primadata-marketplace
```

#### 🔵 **Standard Profile** (Recommended)
```bash
# Voeg marketplace toe
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Installeer standard set
claude plugin install claude-dev-toolkit@primadata-marketplace && \
  claude plugin install superpowers@primadata-marketplace && \
  claude plugin install episodic-memory@primadata-marketplace && \
  claude plugin install elements-of-style@primadata-marketplace
```

#### 🟣 **Professional Profile** (Full Development)
```bash
# Voeg marketplace toe
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Installeer professional set
claude plugin install claude-dev-toolkit@primadata-marketplace && \
  claude plugin install superpowers@primadata-marketplace && \
  claude plugin install superpowers-chrome@primadata-marketplace && \
  claude plugin install episodic-memory@primadata-marketplace && \
  claude plugin install elements-of-style@primadata-marketplace && \
  claude plugin install superpowers-lab@primadata-marketplace
```

#### 🔴 **Enterprise Profile** (Complete Suite)
```bash
# One-liner voor complete installatie
claude plugin marketplace add Primadetaautomation/primadata-marketplace && \
  for plugin in claude-dev-toolkit superpowers superpowers-chrome elements-of-style \
    episodic-memory superpowers-lab superpowers-developing-for-claude-code \
    claude-mcp-cloudflare-docs claude-mcp-notion claude-mcp-gemini \
    claude-mcp-context7 claude-code-metrics; do \
    claude plugin install $plugin@primadata-marketplace; \
  done
```

### 📦 Wat zit erin?

#### 1️⃣ **claude-dev-toolkit** (38 agents + 6 skills)

**Core Development Agents:**
- `senior-fullstack-developer` - Production-ready fullstack met TDD
- `backend-specialist` - API design, databases, Node.js/Python
- `frontend-specialist` - React/Vue/Next.js, Tailwind CSS
- `database-architect` - Database design en optimalisatie
- `solutions-architect` - System architecture en scalability
- `ux-ui-designer` - UI/UX design, Figma-to-code

**Testing & QA Agents:**
- `playwright-test-agent` - Browser automation, E2E testing
- `qa-testing-engineer` - Test strategie en coverage
- `test-automation-agent` - Automated testing pipelines

**Security & Compliance:**
- `accessibility-specialist` - WCAG compliance
- `security-compliance-agent` - Security audits
- `threat-modeling` - Security threat analysis

**Data & AI:**
- `data-engineer` - ETL pipelines, data warehouse
- `ml-ai-integration` - LLM integration, RAG systems
- `sql-universal-expert` - Universal SQL expert

**DevOps & Infrastructure:**
- `devops-automation-agent` - CI/CD automation
- `monitoring-observability` - Monitoring setup
- `performance-testing-agent` - Performance testing

**Orchestration:**
- `master-orchestrator` - Multi-agent coordination
- `context-manager` - Dynamic context management
- `session-memory` - Project memory

**Skills:**
- backend-development-patterns
- deployment-workflows
- production-code-standards
- security-essentials
- testing-fundamentals
- multi-tenant-patterns

#### 2️⃣ **superpowers** (20 skills)

**Testing Skills:**
- test-driven-development
- condition-based-waiting
- testing-anti-patterns

**Debugging Skills:**
- systematic-debugging
- root-cause-tracing
- verification-before-completion
- defense-in-depth

**Collaboration Skills:**
- brainstorming
- writing-plans
- executing-plans
- dispatching-parallel-agents
- requesting-code-review
- receiving-code-review
- using-git-worktrees
- finishing-a-development-branch
- subagent-driven-development

**Meta Skills:**
- using-superpowers
- writing-skills
- sharing-skills
- testing-skills-with-subagents

#### 3️⃣ **superpowers-chrome** (1 skill)
- browsing - Direct Chrome DevTools access

#### 4️⃣ **elements-of-style** (1 skill)
- writing-clearly-and-concisely - Clear writing guidance

#### 5️⃣ **episodic-memory** (1 skill)
- remembering-conversations - Semantic search over sessions

#### 6️⃣ **superpowers-lab** (1 skill)
- using-tmux-for-interactive-commands - Interactive CLI control

#### 7️⃣ **superpowers-developing-for-claude-code** (2 skills)
- working-with-claude-code
- developing-claude-code-plugins

#### 8️⃣ **primadata-enhanced-toolkit** (All-in-One Bundle) 🆕
Complete my-claude-code-setup features in één plugin:
- **Memory Bank System** - CLAUDE-* files voor project context
- **Cost Management** - /ccusage-daily, budget tracking
- **Security Tools** - /secure-prompts, /security-audit, OWASP checks
- **Prompt Engineering** - /apply-thinking-to, CoD mode (80% token reductie)
- **Documentation** - /create-release-note, /add-update-readme
- **Extra Agents** - code-searcher, get-current-datetime, ux-design-expert

#### 9️⃣ **claude-mcp-cloudflare-docs** (MCP Server)
- Cloudflare documentation access
- Vectorized search

#### 🔟 **claude-mcp-notion** (MCP Server)
- Notion integration
- Database en page access

#### 1️⃣1️⃣ **claude-mcp-gemini** (MCP Server)
- Google Gemini model access
- Alternative LLM capabilities

#### 1️⃣2️⃣ **claude-mcp-context7** (MCP Server)
- External semantic context
- Vector storage

#### 1️⃣3️⃣ **claude-code-metrics** (Observability)
- OpenTelemetry integration
- Performance tracking
- Error monitoring

#### 1️⃣4️⃣ **claude-mcp-chrome-devtools** (Optional)
- Chrome DevTools Protocol
- Alternative to superpowers-chrome

#### 1️⃣5️⃣ **Official Anthropic Skills** (Built-in) 🆕
Direct integration van officiële Anthropic skills:

**Development Skills:**
- `skill-creator` - Complete gids voor het maken van effectieve skills
  - Initialization scripts (`init_skill.py`)
  - Packaging/validation scripts
  - Progressive disclosure patterns

- `template-skill` - Basis template voor skill development
  - YAML frontmatter examples
  - Quick-start voor nieuwe skills

- `mcp-builder` - MCP server development gids
  - Python (FastMCP) en TypeScript (MCP SDK)
  - Agent-centric design principles
  - Comprehensive evaluation framework

- `webapp-testing` - Playwright-based testing toolkit
  - Server lifecycle management (`with_server.py`)
  - Browser automation patterns
  - UI verification

**Document Skills:**
- `document-skills/pdf` - PDF manipulation
- `document-skills/docx` - Word document creation/editing
- `document-skills/xlsx` - Excel spreadsheet handling
- `document-skills/pptx` - PowerPoint presentation generation

**UI Development:**
- `artifacts-builder` - React/HTML artifacts
  - Tailwind CSS + shadcn/ui
  - Interactive UI components

#### 1️⃣6️⃣ **Intelligent Router** (Built-in) 🆕
Automatisch agent/skill dispatch systeem:
- 📊 Intent detection en analyse
- 🎯 Smart resource matching
- ✅ Auto-loading van relevante skills
- 🤖 Automatic agent dispatch
- 📚 Context-aware documentation loading
- 25+ predefined routes voor alle development scenarios

### 🎯 Totaal Overzicht

| Component | Aantal |
|-----------|--------|
| **Plugins** | 14 |
| **Skills** | 41+ |
| **Agents** | 45+ |
| **MCP Servers** | 5+ |
| **Commands** | 10+ |
| **Built-in Skills** | 6 (Anthropic) + 1 (Router) |

### 🔧 Gebruik

Alle agents en skills zijn **automatisch beschikbaar** na installatie. Claude herkent automatisch wanneer deze nodig zijn.

**Voorbeelden:**

```bash
# Backend development
"Maak een REST API voor gebruikersbeheer"
→ Claude gebruikt automatisch: backend-specialist agent

# Testing
"Schrijf E2E tests voor de login flow"
→ Claude gebruikt automatisch: playwright-test-agent

# Architecture
"Ontwerp een schaalbaar microservices systeem"
→ Claude gebruikt automatisch: solutions-architect agent
```

**Of expliciet aanvragen:**

```bash
"Gebruik de senior-fullstack-developer agent om deze feature te implementeren"
```

### 🔄 Updates

```bash
# Update marketplace
claude plugin marketplace update primadata-marketplace

# Update individuele plugins
claude plugin update claude-dev-toolkit@primadata-marketplace
claude plugin update superpowers@primadata-marketplace
```

### 📚 Documentatie

- **Claude Dev Toolkit:** https://github.com/Primadetaautomation/claude-dev-toolkit
- **Superpowers:** https://github.com/obra/superpowers
- **Claude Code Docs:** https://code.claude.com/docs

### 🤝 Bijdragen

Vragen, suggesties of bugs? Open een issue op:
- https://github.com/Primadetaautomation/primadata-marketplace/issues

### 📄 Licentie

MIT License - Zie [LICENSE](LICENSE) voor details.

---

## 🇬🇧 English Version

### 🎯 What is this?

The **Primadata Development Marketplace v1.6** combines the best Claude Code plugins for modern software development:

- **38+ specialized agents** for development, testing, security, architecture
- **41+ skills** for TDD, debugging, collaboration, skill creation, and best practices
- **6 Official Anthropic skills** for skill development, MCP servers, testing, and document manipulation
- **Intelligent Router** for automatic agent/skill dispatching
- **MCP server integrations** for Cloudflare, Notion, Gemini, Context7
- **Browser automation** with Chrome DevTools
- **Episodic memory** for cross-session context
- **Writing tools** for documentation
- **Experimental features** for advanced workflows
- **Plugin development tools** for creating your own plugins

### ⚡ Installation Profiles

#### 💎 **Quick Power-Up** (My-Claude-Code-Setup Features) 🆕
```bash
# For users who want ALL my-claude-code-setup features in one go:
claude plugin marketplace add Primadetaautomation/primadata-marketplace && \
  claude plugin install primadata-enhanced-toolkit@primadata-marketplace
```
**Includes:** Memory bank, cost tracking, security tools, prompt engineering, doc automation, extra agents

#### 🟢 **Minimal Profile** (Essentials)
```bash
# Add marketplace
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Install essential plugins
claude plugin install superpowers@primadata-marketplace
claude plugin install elements-of-style@primadata-marketplace
claude plugin install episodic-memory@primadata-marketplace
```

#### 🔵 **Standard Profile** (Recommended)
```bash
# Add marketplace
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Install standard set
claude plugin install claude-dev-toolkit@primadata-marketplace && \
  claude plugin install superpowers@primadata-marketplace && \
  claude plugin install episodic-memory@primadata-marketplace && \
  claude plugin install elements-of-style@primadata-marketplace
```

#### 🟣 **Professional Profile** (Full Development)
```bash
# Add marketplace
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Install professional set
claude plugin install claude-dev-toolkit@primadata-marketplace && \
  claude plugin install superpowers@primadata-marketplace && \
  claude plugin install superpowers-chrome@primadata-marketplace && \
  claude plugin install episodic-memory@primadata-marketplace && \
  claude plugin install elements-of-style@primadata-marketplace && \
  claude plugin install superpowers-lab@primadata-marketplace
```

#### 🔴 **Enterprise Profile** (Complete Suite)
```bash
# One-liner for complete installation
claude plugin marketplace add Primadetaautomation/primadata-marketplace && \
  for plugin in claude-dev-toolkit superpowers superpowers-chrome elements-of-style \
    episodic-memory superpowers-lab superpowers-developing-for-claude-code \
    claude-mcp-cloudflare-docs claude-mcp-notion claude-mcp-gemini \
    claude-mcp-context7 claude-code-metrics; do \
    claude plugin install $plugin@primadata-marketplace; \
  done
```

### 📦 What's Included?

See Dutch version above for complete list of all 19 plugins with agents and skills.

### 🎯 Total Overview

| Component | Count |
|-----------|-------|
| **Plugins** | 14 |
| **Skills** | 41+ |
| **Agents** | 45+ |
| **Commands** | 10+ |
| **MCP Servers** | 5+ |
| **Built-in Skills** | 6 (Anthropic) + 1 (Router) |

### 🔧 Usage

All agents and skills are **automatically available** after installation. Claude automatically recognizes when they're needed.

**Examples:**

```bash
# Backend development
"Create a REST API for user management"
→ Claude automatically uses: backend-specialist agent

# Testing
"Write E2E tests for the login flow"
→ Claude automatically uses: playwright-test-agent

# Architecture
"Design a scalable microservices system"
→ Claude automatically uses: solutions-architect agent
```

**Or explicitly request:**

```bash
"Use the senior-fullstack-developer agent to implement this feature"
```

### 🔄 Updates

```bash
# Update marketplace
claude plugin marketplace update primadata-marketplace

# Update individual plugins
claude plugin update claude-dev-toolkit@primadata-marketplace
claude plugin update superpowers@primadata-marketplace
```

### 📚 Documentation

- **Claude Dev Toolkit:** https://github.com/Primadetaautomation/claude-dev-toolkit
- **Superpowers:** https://github.com/obra/superpowers
- **Claude Code Docs:** https://code.claude.com/docs

### 🤝 Contributing

Questions, suggestions, or bugs? Open an issue at:
- https://github.com/Primadetaautomation/primadata-marketplace/issues

### 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 📜 Credits

This marketplace integrates and builds upon the work of many talented developers and organizations:

### Core Contributors

- **[Jesse Beder (obra)](https://github.com/obra)** - Creator of the Superpowers ecosystem
  - superpowers, superpowers-chrome, superpowers-lab, superpowers-developing-for-claude-code
  - episodic-memory
  - elements-of-style

- **[George Liu (centminmod)](https://github.com/centminmod)** - My Claude Code Setup
  - Memory bank system concept
  - Cost management commands (/ccusage-daily)
  - Security commands (/secure-prompts, /security-audit)
  - Prompt engineering tools
  - Documentation automation commands
  - Specialized agents (code-searcher, ux-design-expert)
  - Claude Code metrics and OpenTelemetry setup
  - Gemini MCP server

- **[primautomation.nl](https://github.com/Primadetaautomation)** - Marketplace curator
  - claude-dev-toolkit (38 agents + 6 skills)
  - Marketplace curation and integration
  - Wrapper plugins for custom features

### MCP Server Authors

- **[Cloudflare](https://github.com/cloudflare)** - Cloudflare Documentation MCP
- **[Notion](https://github.com/makenotion)** - Notion MCP Server
- **[Upstash](https://github.com/upstash)** - Context7 MCP
- **[Chrome DevTools Team](https://github.com/ChromeDevTools)** - Chrome DevTools MCP

### Official Skills Integration

- **[Anthropic](https://www.anthropic.com/)** - For creating Claude and Claude Code
  - skill-creator, template-skill, mcp-builder, webapp-testing
  - document-skills (pdf, docx, xlsx, pptx)
  - artifacts-builder
  - Source: [anthropics/skills](https://github.com/anthropics/skills)

### Special Thanks

- All contributors to the open-source Claude Code ecosystem
- The Claude Code community for feedback and suggestions

### Attribution Note

The primadata-* wrapper plugins (memory-bank, cost-manager, security-pack, prompt-tools, docs-automation, specialized-agents) are based on features from [centminmod/my-claude-code-setup](https://github.com/centminmod/my-claude-code-setup) and are adapted with full attribution to work as Claude Code plugins.

---

**Made with ❤️ by [primautomation.nl](https://github.com/Primadetaautomation)**
