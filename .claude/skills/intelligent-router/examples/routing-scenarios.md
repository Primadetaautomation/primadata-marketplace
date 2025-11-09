# Intelligent Router - Test Scenarios

## Purpose
Test cases to validate router behavior across different question types and complexities.

## Test Scenarios

### 1. Simple Bug Fix
**Input:** "Fix deze error in login.ts"

**Expected Output:**
```
Activate: true
Intent: Bug fixing
Complexity: SIMPLE
Domains: debugging

Auto-Loaded Skills:
  - systematic-debugging
  - testing-fundamentals

Auto-Dispatched:
  - senior-fullstack-developer

Optional:
  - qa-testing-engineer
```

### 2. Authentication System
**Input:** "Maak een login systeem met gebruikers registratie"

**Expected Output:**
```
Activate: true
Intent: User authentication
Complexity: HIGH
Domains: authentication, backend, security

Auto-Loaded Skills:
  - security-essentials
  - backend-development-patterns
  - testing-fundamentals

Auto-Dispatched:
  - backend-specialist

Optional:
  - security-specialist
  - frontend-specialist
  - qa-testing-engineer

Docs:
  - docs/security.md
  - docs/backend.md
```

### 3. Complete Dashboard Feature
**Input:** "Bouw een dashboard met gebruikers lijst, charts en export functionaliteit"

**Expected Output:**
```
Activate: true
Intent: Multi-domain feature
Complexity: COMPLEX
Domains: frontend, backend, data, ux

Auto-Loaded Skills:
  - backend-development-patterns
  - testing-fundamentals
  - brainstorming

Auto-Dispatched:
  - master-orchestrator
    Sub-agents:
      - backend-specialist
      - frontend-specialist
      - data-engineer
      - ux-design-expert
      - qa-testing-engineer

Docs:
  - docs/backend.md
  - docs/frontend.md
```

### 4. Simple Question (Should Skip)
**Input:** "Wat is TDD?"

**Expected Output:**
```
Activate: false
Reason: Question too simple or informational
```

### 5. Database Query Optimization
**Input:** "Optimaliseer deze SQL query die te traag is"

**Expected Output:**
```
Activate: true
Intent: Database optimization
Complexity: MEDIUM
Domains: data-engineering, backend

Auto-Loaded Skills:
  - backend-development-patterns

Auto-Dispatched:
  - data-engineer

Tools:
  - sql-universal-expert

Optional:
  - senior-fullstack-developer

Docs:
  - docs/backend.md
```

### 6. Security Review
**Input:** "Review deze auth code voor security vulnerabilities"

**Expected Output:**
```
Activate: true
Intent: Security audit
Complexity: HIGH
Domains: security

Auto-Loaded Skills:
  - security-essentials
  - production-code-standards

Auto-Dispatched:
  - security-specialist

Tools:
  - Grep
  - Bash

Docs:
  - docs/security.md
```

### 7. API Development
**Input:** "Maak een REST API voor producten met CRUD endpoints"

**Expected Output:**
```
Activate: true
Intent: API development
Complexity: MEDIUM
Domains: backend

Auto-Loaded Skills:
  - backend-development-patterns
  - testing-fundamentals

Auto-Dispatched:
  - backend-specialist

Tools:
  - Read
  - Write
  - Edit
  - Bash

Docs:
  - docs/backend.md
```

### 8. Frontend Component
**Input:** "Maak een React component voor product kaart met image en prijs"

**Expected Output:**
```
Activate: true
Intent: Frontend development
Complexity: MEDIUM
Domains: frontend

Auto-Loaded Skills:
  - testing-fundamentals

Auto-Dispatched:
  - frontend-specialist

Tools:
  - Read
  - Write
  - Edit

Docs:
  - docs/frontend.md
```

### 9. Deployment
**Input:** "Deploy deze app naar Railway production"

**Expected Output:**
```
Activate: true
Intent: Deploy to production
Complexity: HIGH
Domains: deployment

Auto-Loaded Skills:
  - deployment-workflows

Plugins:
  - railway-mcp-server

Tools:
  - Bash
  - mcp__railway-mcp-server

Docs:
  - docs/infrastructure.md
```

### 10. Code Search
**Input:** "Waar wordt de calculateTotal functie gebruikt?"

**Expected Output:**
```
Activate: true
Intent: Finding code
Complexity: SIMPLE
Domains: code_search

Plugins:
  - primadata-enhanced-toolkit

Auto-Dispatched:
  - code-searcher

Tools:
  - Grep
  - Read
  - Glob
```

### 11. E2E Testing
**Input:** "Maak E2E tests voor het checkout proces"

**Expected Output:**
```
Activate: true
Intent: End-to-end testing
Complexity: HIGH
Domains: testing_e2e

Auto-Loaded Skills:
  - testing-fundamentals

Auto-Dispatched:
  - playwright-test-agent

Tools:
  - Bash
  - mcp__chrome-devtools

Docs:
  - docs/testing.md
```

### 12. UX Design
**Input:** "Design een premium dashboard met data visualisatie charts"

**Expected Output:**
```
Activate: true
Intent: UI/UX design
Complexity: MEDIUM
Domains: ux_design

Plugins:
  - primadata-enhanced-toolkit

Auto-Dispatched:
  - ux-design-expert

Tools:
  - Read
  - Write
  - WebFetch

Docs:
  - docs/frontend.md
```

### 13. Short Question (Should Skip)
**Input:** "Fix typo"

**Expected Output:**
```
Activate: false
Reason: Question too simple or informational (< 5 words)
```

### 14. Informational (Should Skip)
**Input:** "Hoe werkt authentication in deze app?"

**Expected Output:**
```
Activate: false
Reason: Question too simple or informational (skip keyword: "hoe werkt")
```

### 15. Git Workflow
**Input:** "Maak een git worktree voor deze feature branch"

**Expected Output:**
```
Activate: true
Intent: Git workflows
Complexity: SIMPLE
Domains: git_operations

Auto-Loaded Skills:
  - superpowers:using-git-worktrees

Tools:
  - Bash
```

## Running Tests

```bash
# Test individual scenarios
cd .claude/skills/intelligent-router/scripts
./analyze-intent.js analyze "Fix deze error in login.ts"
./analyze-intent.js analyze "Maak een login systeem"

# Test all scenarios (create test runner)
npm test  # (if package.json configured)

# Manual validation
# Compare actual output with expected output above
```

## Success Criteria

- ✅ Correct activation detection (activate vs skip)
- ✅ Accurate intent identification
- ✅ Appropriate complexity assessment
- ✅ Correct primary agent selection
- ✅ Relevant skills loaded
- ✅ Useful optional agent suggestions
- ✅ Appropriate docs recommended

## Known Edge Cases

1. **Ambiguous questions** - May match multiple routes equally
   - Solution: Highest priority route wins

2. **Very long questions** - May trigger multiple high matches
   - Solution: master-orchestrator for complex scenarios

3. **Non-English questions** - Trigger keywords are mixed NL/EN
   - Solution: Both Dutch and English keywords in matrix

4. **Technical jargon** - May not match any triggers
   - Solution: Expand trigger keywords based on usage

## Metrics to Track

- **Activation Rate:** % of questions that activate router
- **Accuracy:** % of correct primary agent selections
- **Relevance:** % of users who dispatch suggested optional agents
- **Iteration Count:** Average back-and-forth needed

Store in: `.claude-memory/router-metrics.md`
