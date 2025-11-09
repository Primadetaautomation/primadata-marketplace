# 🎯 Intelligent Router

**Automatic agent/skill/plugin dispatch system for Claude Code**

## Overview

The Intelligent Router analyzes your questions and automatically:
- ✅ Loads relevant skills
- ✅ Dispatches the optimal primary agent
- 💡 Suggests optional agents you can activate
- 📚 Loads relevant documentation
- 🔌 Activates necessary plugins

**No manual configuration needed** - just ask your question naturally!

## Quick Start

### Installation

1. **Clone/Copy this skill to your project:**
```bash
cp -r .claude/skills/intelligent-router /path/to/your/project/.claude/skills/
```

2. **Copy the pre-prompt hook (optional but recommended):**
```bash
cp .claude/hooks/pre-prompt.sh /path/to/your/project/.claude/hooks/
chmod +x /path/to/your/project/.claude/hooks/pre-prompt.sh
```

3. **Update your skill-loader.js** (if you have one):
Add intelligent-router to the `skillMetadata` object.

### Usage

**That's it!** The router activates automatically when you ask questions like:

```
"Maak een login systeem"
"Fix deze bug in auth.ts"
"Create a REST API for products"
"Deploy to production"
"Optimaliseer deze SQL query"
```

It **skips** simple informational questions like:
```
"Wat is TDD?"
"How does React work?"
```

## How It Works

```
Your Question
    ↓
Smart Auto-Detect (should activate?)
    ↓
Intent Analysis (what are you trying to do?)
    ↓
Route Matching (which skills/agents/plugins?)
    ↓
Complexity Assessment (simple/medium/high/complex?)
    ↓
Resource Collection (gather everything needed)
    ↓
Transparent Report (show you the plan)
    ↓
Auto-Dispatch (start primary agent)
    ↓
Suggestions (optional agents you can activate)
```

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 INTELLIGENT ROUTER ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Detected Intent: User authentication system
📁 Complexity: HIGH
🎯 Domains: security, backend, frontend

✅ AUTO-LOADED SKILLS:
   - security-essentials
   - backend-development-patterns
   - testing-fundamentals

✅ AUTO-DISPATCHED:
   - backend-specialist
     → API endpoints and business logic

💡 OPTIONAL DISPATCH (you choose):
   [ ] security-specialist (OWASP compliance review)
   [ ] frontend-specialist (Login UI components)
   [ ] qa-testing-engineer (Security test strategy)

📚 RELEVANT DOCS:
   - docs/security.md (auto-loaded)
   - docs/backend.md (auto-loaded)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Testing

Test the router manually before using:

```bash
# Test a question
cd .claude/skills/intelligent-router/scripts
./analyze-intent.js analyze "Maak een login systeem"

# Get JSON output
./analyze-intent.js analyze "Fix bug" --json
```

## Supported Routes

The router recognizes 20+ intent patterns:

### Development
- **backend_api** - REST/GraphQL API development
- **backend_database** - SQL queries, schema design
- **frontend_ui** - React/Vue components, UI work
- **authentication** - Login systems, user registration
- **debugging** - Bug fixes, error resolution

### Quality & Security
- **security_review** - OWASP compliance, vulnerability scans
- **testing_unit** - TDD, unit/integration tests
- **testing_e2e** - Playwright, browser automation
- **accessibility** - WCAG compliance, inclusive design

### Operations
- **deployment** - CI/CD, production deploys
- **git_operations** - Worktrees, branching
- **architecture** - System design, tech stack decisions

### Specialized
- **code_search** - Finding code, codebase analysis
- **browser_automation** - Web scraping, UI testing
- **ux_design** - Dashboards, data visualization
- **data_engineering** - ETL pipelines, data warehouses
- **ai_ml_integration** - LLM integration, RAG systems
- **documentation** - Writing docs, README files

### Orchestration
- **complex_feature** - Multi-domain features → master-orchestrator

## Customization

### Add New Routes

Edit `routing-matrix.json`:

```json
{
  "routes": {
    "your_custom_route": {
      "intent": "Description of what this handles",
      "triggers": ["keyword1", "keyword2", "keyword3"],
      "complexity": "medium",
      "plugins": [],
      "agent": "your-agent-name",
      "skills": ["skill1", "skill2"],
      "tools": ["Read", "Write"],
      "docs": ["docs/relevant.md"],
      "priority": "high"
    }
  }
}
```

### Adjust Detection Sensitivity

Edit `auto_detect_config` in `routing-matrix.json`:

```json
{
  "auto_detect_config": {
    "min_word_count": 4,
    "action_verbs": ["maak", "bouw", "fix", ...],
    "skip_keywords": ["wat is", "hoe werkt", ...]
  }
}
```

### Change Complexity Thresholds

Edit `complexity_thresholds` in `routing-matrix.json`:

```json
{
  "complexity_thresholds": {
    "simple": {
      "max_words": 10,
      "max_domains": 1
    }
  }
}
```

## Multi-Language Support

The router supports **Dutch and English** out of the box:

**Dutch:**
```
"Maak een API"
"Fix deze bug"
"Optimaliseer query"
```

**English:**
```
"Create an API"
"Fix this bug"
"Optimize query"
```

**Want more languages?** Add keywords to `routing-matrix.json`:
- `action_verbs` - Action verbs in your language
- `skip_keywords` - Informational question starters
- `triggers` - Keywords for each route

## Architecture

```
.claude/skills/intelligent-router/
├── SKILL.md                    # Complete documentation
├── README.md                   # This file
├── routing-matrix.json         # Intent → Resource mappings
├── scripts/
│   └── analyze-intent.js       # Analysis engine
├── examples/
│   └── routing-scenarios.md    # Test scenarios
└── templates/                  # (Future: route templates)

.claude/hooks/
└── pre-prompt.sh              # Auto-activation hook
```

## Troubleshooting

### Router Not Activating

**Problem:** Question gets skipped when it shouldn't

**Solution:**
1. Check word count (minimum 4 words)
2. Add action verb to your question
3. Lower `min_word_count` in config
4. Add trigger keywords for your use case

### Wrong Agent Selected

**Problem:** Router picks incorrect primary agent

**Solution:**
1. Check `routing-matrix.json` triggers
2. Add more specific keywords for your route
3. Increase priority of correct route
4. Test with: `./analyze-intent.js analyze "your question"`

### Too Many Skills Loaded

**Problem:** Router loads unnecessary skills

**Solution:**
1. Review trigger keywords (too generic?)
2. Increase specificity of triggers
3. Adjust match scoring in `analyze-intent.js`

### Complexity Always "COMPLEX"

**Problem:** Simple questions marked as complex

**Solution:**
1. Check domain identification logic
2. Adjust `complexity_thresholds` in config
3. Review trigger overlap (too many matches?)

## Metrics & Improvement

Track router effectiveness in `.claude-memory/router-metrics.md`:

```markdown
# Router Metrics

## Week of 2025-01-09

- **Activation Rate:** 75% (activated on 30/40 questions)
- **Accuracy:** 85% (correct primary agent 25/30 times)
- **User Satisfaction:** 90% (27/30 accepted suggestions)
- **Average Iterations:** 2.1 (down from 3.5 without router)

## Top Triggered Routes
1. backend_api (12 times)
2. debugging (8 times)
3. authentication (5 times)

## Improvements Needed
- Add more frontend triggers
- Reduce complexity over-assessment
- Add Python-specific routes
```

## Contributing

Want to improve the router?

1. **Test new scenarios:** Add to `examples/routing-scenarios.md`
2. **Add routes:** Update `routing-matrix.json`
3. **Improve detection:** Edit `scripts/analyze-intent.js`
4. **Share learnings:** Update this README

## Version History

### v1.0.0 (2025-01-09)
- ✅ Initial release
- ✅ 20+ predefined routes
- ✅ Smart auto-detect
- ✅ Multi-language support (NL/EN)
- ✅ Transparent reporting
- ✅ Medium Router design (B)

### Future Plans
- [ ] Learning from past routing decisions
- [ ] User preference tracking
- [ ] Dynamic route creation
- [ ] Web UI for route visualization
- [ ] Community route sharing

## Resources

- **Full Documentation:** [SKILL.md](./SKILL.md)
- **Test Scenarios:** [examples/routing-scenarios.md](./examples/routing-scenarios.md)
- **Routing Matrix:** [routing-matrix.json](./routing-matrix.json)
- **Analysis Engine:** [scripts/analyze-intent.js](./scripts/analyze-intent.js)

## License

MIT

## Questions?

Test the router yourself:
```bash
cd .claude/skills/intelligent-router/scripts
./analyze-intent.js analyze "your question here"
```

---

**Built with the CLAUDE Framework** - Smart, transparent, effective agent orchestration.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
