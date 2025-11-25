---
name: ux-researcher-designer
description: UX research and design toolkit for Senior UX Designer/Researcher including data-driven persona generation, journey mapping, usability testing frameworks, and research synthesis. Use for user research, persona creation, journey mapping, and design validation.
triggers: [persona, UX, user research, journey map, usability, user testing, UX design, customer journey, user insights, design validation]
version: 1.0.0
agents: [ux-design-expert, frontend-specialist, product-manager]
context_levels:
  minimal: Core UX research principles and persona basics
  detailed: Complete persona generation and journey mapping patterns
  full: Working scripts, templates, and comprehensive examples
---

# UX Researcher & Designer

Comprehensive toolkit for user-centered research and experience design with data-driven approaches.

## Overview
This skill provides professional UX research and design capabilities including persona generation from real user data, customer journey mapping, usability testing frameworks, and research synthesis methods.

## When to Use This Skill
- Creating data-driven user personas
- Analyzing user behavior patterns and insights
- Mapping customer journeys and touchpoints
- Conducting usability research and validation
- Synthesizing research data into actionable insights
- Generating design implications from user data

## Core Capabilities

### 1. Data-Driven Persona Generation
Create research-backed personas from quantitative and qualitative user data:
- Analyze user behavior patterns from analytics
- Identify persona archetypes automatically
- Extract psychographics (motivations, values, attitudes)
- Generate realistic usage scenarios
- Provide confidence scoring based on sample size
- Derive design implications from persona data

### 2. Persona Archetypes
Built-in archetype templates for common user types:
- **Power User**: Tech-savvy, frequent user, efficiency-focused
- **Casual User**: Occasional user, values simplicity and ease-of-use
- **Business User**: ROI-focused, team collaboration oriented
- **Mobile First**: Primarily mobile usage, on-the-go access

### 3. Customer Journey Mapping
Map complete user journeys with:
- Touchpoint identification
- Pain point analysis
- Opportunity discovery
- Emotion mapping across journey stages

### 4. Usability Testing Frameworks
Structured approaches for:
- Test plan creation
- Success metrics definition
- User task scenarios
- Observation frameworks

### 5. Research Synthesis
Transform raw research into insights:
- Pattern identification across users
- Theme extraction from interviews
- Quantitative and qualitative data integration
- Actionable design recommendations

## Available Tools

### Python Script: persona_generator.py
**Location:** `scripts/persona_generator.py`

**Purpose:** Generate comprehensive, data-driven user personas from user data and optional interview insights.

**Usage:**
```bash
# JSON output
python scripts/persona_generator.py json

# Human-readable output
python scripts/persona_generator.py
```

**Features:**
- Analyzes usage frequency, feature usage, device patterns
- Identifies persona archetype based on behavior patterns
- Aggregates demographics (age, location, tech proficiency)
- Extracts psychographics (motivations, values, lifestyle)
- Generates usage scenarios with context and pain points
- Calculates confidence level based on sample size
- Provides design implications for each persona

**Input Data Structure:**
```python
user_data = [
    {
        'user_id': 'user_1',
        'age': 28,
        'usage_frequency': 'daily',  # daily, weekly, monthly
        'features_used': ['dashboard', 'reports', 'settings'],
        'primary_device': 'desktop',  # desktop, mobile, tablet
        'usage_context': 'work',  # work, personal
        'tech_proficiency': 7,  # 1-10 scale
        'pain_points': ['slow loading', 'confusing UI']
    }
    # ... more users
]
```

**Output Includes:**
- Persona name and archetype
- Demographics and psychographics
- Goals, needs, and frustrations
- Behavior patterns and feature preferences
- Usage scenarios with pain points
- Design implications
- Data confidence metrics

### TypeScript Script: persona-generator.ts
**Location:** `scripts/persona-generator.ts`

**Purpose:** Same functionality as Python version, integrated with Node.js/TypeScript ecosystem.

**Usage:**
```bash
# JSON output
ts-node scripts/persona-generator.ts --format=json

# Pretty output
ts-node scripts/persona-generator.ts
```

**TypeScript Advantages:**
- Type-safe data structures
- Better IDE integration
- Easy integration with existing Node.js projects
- Modern async/await patterns

## Design Implications Framework

Each generated persona includes specific design implications based on their characteristics:

**For High-Frequency Users:**
- Optimize for speed and efficiency
- Provide keyboard shortcuts and power features
- Minimize friction in common workflows

**For Casual Users:**
- Focus on discoverability and clear guidance
- Simplify onboarding experience
- Reduce cognitive load

**For Mobile Users:**
- Mobile-first responsive design
- Touch-optimized interactions
- Offline capability considerations

**For Business Users:**
- Professional visual design
- Enterprise features (SSO, audit logs, team management)
- Integration with business tools

## Best Practices

### Data Collection
1. **Minimum Sample Size**: 20+ users for Medium confidence, 50+ for High confidence
2. **Mix Methods**: Combine quantitative analytics with qualitative interviews
3. **Regular Updates**: Refresh personas quarterly or after major product changes
4. **Validation**: Test personas against real user behavior continuously

### Persona Usage
1. **Share Widely**: Make personas accessible to entire product team
2. **Reference Often**: Use in feature discussions and design reviews
3. **Update Regularly**: Keep personas current as user base evolves
4. **Measure Impact**: Track how persona-driven decisions affect metrics

### Research Synthesis
1. **Document Everything**: Keep detailed notes from all research activities
2. **Look for Patterns**: Identify recurring themes across multiple users
3. **Prioritize Insights**: Focus on actionable findings with high impact
4. **Validate Assumptions**: Test hypotheses with additional research

## Context Levels

### Level 1 - Minimal (Always Loaded)
- Core UX research principles
- Persona archetype definitions
- Basic usage patterns

### Level 2 - Detailed (Load on Request)
- Complete persona generation methodology
- Journey mapping frameworks
- Usability testing templates
- Research synthesis techniques

### Level 3 - Full (Scripts and Examples)
- Working Python and TypeScript scripts
- Sample data structures
- Complete persona examples
- Integration code samples

## Integration with Other Skills

Works well with:
- **ui-design-system**: Use personas to inform design token decisions
- **frontend-specialist**: Apply persona insights to component design
- **testing-fundamentals**: Create test scenarios based on persona behaviors
- **accessibility-specialist**: Ensure designs work for all persona types

## References

**UX Research Methods:**
- Nielsen Norman Group UX Research Guidelines
- IDEO Human-Centered Design Toolkit
- Google Design Sprint Methodology

**Persona Creation:**
- Alan Cooper's "The Inmates Are Running the Asylum"
- Data-Driven Personas (Jansen et al.)
- Jobs To Be Done Framework

**Journey Mapping:**
- Adaptive Path's Guide to Experience Mapping
- Service Design Toolkit

## Version History

**v1.0.0** - Initial release
- Data-driven persona generation
- Python and TypeScript implementations
- 4 persona archetype templates
- Design implications framework
- Confidence scoring system

---

**Maintained by:** Primadata Enhanced Toolkit
**Source:** Based on claude-skills repository by Alireza Rezvani
**Last Updated:** November 2025
