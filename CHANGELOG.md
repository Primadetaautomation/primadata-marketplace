# Changelog

## [1.6.0] - 2025-11-10

### Added

#### Official Anthropic Skills Integration (6 new skills)
- **skill-creator** - Complete guide for creating effective skills
  - Initialization scripts (`init_skill.py`)
  - Packaging/validation scripts (`package_skill.py`)
  - Progressive disclosure patterns
  - Step-by-step skill creation workflow

- **template-skill** - Basic template for skill development
  - YAML frontmatter examples
  - Quick-start for new skills
  - Proper structure and conventions

- **mcp-builder** - MCP server development guide
  - Python (FastMCP) implementation guide
  - TypeScript (MCP SDK) implementation guide
  - Agent-centric design principles
  - Comprehensive evaluation framework
  - Best practices and quality checklists

- **webapp-testing** - Playwright-based testing toolkit
  - Server lifecycle management (`with_server.py`)
  - Browser automation patterns
  - UI verification workflows
  - Multiple server support

- **document-skills** - Document manipulation suite (4 sub-skills)
  - `document-skills/pdf` - PDF manipulation and extraction
  - `document-skills/docx` - Word document creation/editing
  - `document-skills/xlsx` - Excel spreadsheet handling
  - `document-skills/pptx` - PowerPoint presentation generation

- **artifacts-builder** - React/HTML artifacts
  - Tailwind CSS + shadcn/ui integration
  - Interactive UI components
  - Claude.ai artifact creation

#### Intelligent Router Enhancements
- **5 new routing patterns** added to routing-matrix.json:
  - `skill_creation` - For skill development workflows
  - `mcp_development` - For MCP server/plugin development
  - `webapp_testing_playwright` - For Playwright-based testing
  - `document_manipulation` - For document creation/editing
  - `artifact_building` - For React/HTML artifact creation

- **Enhanced existing routes:**
  - `browser_automation` - Now includes webapp-testing skill
  - `testing_e2e` - Now includes webapp-testing skill

#### Skills Directory Structure
```
.claude/skills/
├── intelligent-router/     (enhanced with new routes)
├── skill-creator/          (new - Anthropic)
├── template-skill/         (new - Anthropic)
├── mcp-builder/           (new - Anthropic)
├── webapp-testing/        (new - Anthropic)
├── document-skills/       (new - Anthropic)
│   ├── pdf/
│   ├── docx/
│   ├── xlsx/
│   └── pptx/
└── artifacts-builder/     (new - Anthropic)
```

### Changed

#### README.md
- Updated version: 1.5 → 1.6
- Updated skill count: 35+ → 41+
- Added "Official Anthropic Skills" section (item 15)
- Added "Intelligent Router" section (item 16)
- Updated total overview table with built-in skills count
- Enhanced feature descriptions for both Dutch and English versions

#### routing-matrix.json
- Added 5 new route definitions
- Enhanced 2 existing routes with webapp-testing skill
- Improved trigger keywords for better intent matching
- Updated route count: 20 → 25+ routes

#### Documentation
- Added Anthropic attribution in Credits section
- Updated skill counts in badges
- Enhanced feature lists with new capabilities

### Testing

All new routing patterns verified:
- ✅ Skill creation triggers correctly
- ✅ MCP development dispatches backend-specialist + mcp-builder
- ✅ Document manipulation loads appropriate document-skills
- ✅ Artifact building loads artifacts-builder + frontend-specialist
- ✅ Webapp testing routes properly to playwright-test-agent

### Attribution

New skills properly attributed to:
- **[Anthropic](https://www.anthropic.com/)** - Official skills from [anthropics/skills](https://github.com/anthropics/skills)
  - License: Apache 2.0 (open source)
  - Document skills: Source-available (reference only)

### Statistics

**Before v1.6:**
- Skills: 35+
- Built-in: 1 (intelligent-router)

**After v1.6:**
- Skills: 41+ (+6 Anthropic skills)
- Built-in: 7 (1 router + 6 Anthropic skills)

### Breaking Changes
None - all additions are backward compatible.

### Upgrade Path
No action required - new skills are automatically available in `.claude/skills/` directory.

---

## [1.5.0] - 2025-11-09

### Added

#### New Plugin Entries (7 new plugins)
- **primadata-enhanced-toolkit** - All-in-one bundle of my-claude-code-setup features (memory bank, cost tracking, security, prompt tools, docs automation, agents)
- **claude-mcp-cloudflare-docs** - Cloudflare documentation MCP server
- **claude-mcp-notion** - Notion integration MCP server
- **claude-mcp-gemini** - Gemini CLI MCP server
- **claude-mcp-context7** - Context7 semantic storage MCP
- **claude-code-metrics** - OpenTelemetry metrics integration
- **claude-mcp-chrome-devtools** - Chrome DevTools Protocol (optional)

#### New Documentation
- **CREDITS.md** - Complete attribution for all sources
- **INSTALL.md** - Comprehensive installation guide with profiles
- **CREATE_ENHANCED_TOOLKIT.md** - Simple guide to create the enhanced toolkit repository
- **WRAPPER_PLUGINS.md** - Reference for potential future plugin separation
- **CHANGELOG.md** - This changelog

#### Installation Profiles
- **Quick Power-Up** - All my-claude-code-setup features (1 plugin) 🆕
- **Minimal Profile** - Essential tools only (3 plugins)
- **Standard Profile** - Recommended set (4 plugins)
- **Professional Profile** - Full development (6 plugins)
- **Enterprise Profile** - Complete suite (14 plugins)

### Changed

#### marketplace.json
- Updated version to 1.5.0
- Added 7 new plugin entries (1 enhanced toolkit + 6 MCP servers)
- Updated description to reflect enhanced capabilities

#### README.md
- Updated to v1.5 with new features
- Added badges for version, plugins, agents, skills
- New "Quick Power-Up" installation profile for my-claude-code-setup features
- Added comprehensive credits section
- Updated totals: 14 plugins, 45+ agents, 35+ skills

#### CONTRIBUTING.md
- Added English version alongside Dutch
- New section on creating wrapper plugins
- Attribution requirements
- Updated code review process
- Added contact email

### Attribution

All new features properly attributed to:
- **George Liu (centminmod)** - my-claude-code-setup features
- **Jesse Beder (obra)** - Superpowers ecosystem
- **Cloudflare, Notion, Upstash** - MCP servers
- **Anthropic** - Claude and Claude Code

### Notes for Implementation

Only ONE repository needs to be created:
- **primadata-enhanced-toolkit** - Bundles all my-claude-code-setup features

See CREATE_ENHANCED_TOOLKIT.md for simple 15-minute setup instructions.

### Breaking Changes
None - all additions are backward compatible.

---

## [1.0.0] - Previous Version

Initial release with:
- claude-dev-toolkit
- superpowers ecosystem
- Basic marketplace structure