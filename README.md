# 🚀 Primadata Development Marketplace

**Complete Claude Code development ecosystem in één installatie**

[🇬🇧 English](#english-version) | [🇳🇱 Nederlands](#nederlandse-versie)

---

## 🇳🇱 Nederlandse Versie

### 🎯 Wat is dit?

De **Primadata Development Marketplace** combineert de beste Claude Code plugins voor moderne softwareontwikkeling in één eenvoudig te installeren pakket:

- **38 gespecialiseerde agents** voor development, testing, security, en meer
- **32 skills** voor TDD, debugging, collaboration, en best practices
- **Browser automation** met Chrome DevTools
- **Episodic memory** voor context over sessies heen
- **Writing tools** voor documentatie
- **Experimental features** voor advanced workflows

### ⚡ Snelle Installatie

```bash
# Stap 1: Voeg de marketplace toe
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Stap 2: Installeer alle plugins (of selecteer individueel)
claude plugin install claude-dev-toolkit@primadata-marketplace
claude plugin install superpowers@primadata-marketplace
claude plugin install superpowers-chrome@primadata-marketplace
claude plugin install elements-of-style@primadata-marketplace
claude plugin install episodic-memory@primadata-marketplace
claude plugin install superpowers-lab@primadata-marketplace
claude plugin install superpowers-developing-for-claude-code@primadata-marketplace
```

**Of installeer alles in één keer:**

```bash
# Installeer complete toolkit
claude plugin marketplace add Primadetaautomation/primadata-marketplace && \
  claude plugin install claude-dev-toolkit@primadata-marketplace && \
  claude plugin install superpowers@primadata-marketplace && \
  claude plugin install superpowers-chrome@primadata-marketplace && \
  claude plugin install episodic-memory@primadata-marketplace
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

### 🎯 Totaal Overzicht

| Component | Aantal |
|-----------|--------|
| **Plugins** | 7 |
| **Skills** | 32 |
| **Agents** | 38+ |

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

The **Primadata Development Marketplace** combines the best Claude Code plugins for modern software development in one easy-to-install package:

- **38 specialized agents** for development, testing, security, and more
- **32 skills** for TDD, debugging, collaboration, and best practices
- **Browser automation** with Chrome DevTools
- **Episodic memory** for cross-session context
- **Writing tools** for documentation
- **Experimental features** for advanced workflows

### ⚡ Quick Install

```bash
# Step 1: Add the marketplace
claude plugin marketplace add Primadetaautomation/primadata-marketplace

# Step 2: Install all plugins (or select individually)
claude plugin install claude-dev-toolkit@primadata-marketplace
claude plugin install superpowers@primadata-marketplace
claude plugin install superpowers-chrome@primadata-marketplace
claude plugin install elements-of-style@primadata-marketplace
claude plugin install episodic-memory@primadata-marketplace
claude plugin install superpowers-lab@primadata-marketplace
claude plugin install superpowers-developing-for-claude-code@primadata-marketplace
```

**Or install everything at once:**

```bash
# Install complete toolkit
claude plugin marketplace add Primadetaautomation/primadata-marketplace && \
  claude plugin install claude-dev-toolkit@primadata-marketplace && \
  claude plugin install superpowers@primadata-marketplace && \
  claude plugin install superpowers-chrome@primadata-marketplace && \
  claude plugin install episodic-memory@primadata-marketplace
```

### 📦 What's Included?

See Dutch version above for complete list of agents and skills.

### 🎯 Total Overview

| Component | Count |
|-----------|-------|
| **Plugins** | 7 |
| **Skills** | 32 |
| **Agents** | 38+ |

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

**Made with ❤️ by [Primadata Automation](https://github.com/Primadetaautomation)**
