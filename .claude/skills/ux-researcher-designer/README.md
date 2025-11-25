# UX Researcher & Designer Skill

Data-driven persona generation and user research toolkit.

## Quick Start

### Python Version
```bash
# Human-readable output
python scripts/persona_generator.py

# JSON output for integration
python scripts/persona_generator.py json
```

### TypeScript Version
```bash
# Human-readable output
ts-node scripts/persona-generator.ts

# JSON output
ts-node scripts/persona-generator.ts --format=json
```

## Features

- **Data-Driven Personas**: Generate personas from real user analytics data
- **4 Archetype Templates**: Power User, Casual User, Business User, Mobile First
- **Confidence Scoring**: High/Medium/Low based on sample size (50+/20+/<20 users)
- **Design Implications**: Concrete design recommendations per persona
- **Multiple Formats**: JSON for integration, human-readable for documentation

## Sample Output

```
============================================================
PERSONA: Alex the Power User
============================================================

📝 A daily user who primarily uses the product for work purposes

Archetype: Power User
Quote: "I need tools that can keep up with my workflow"

👤 Demographics:
  • Age Range: 25-34
  • Location Type: urban
  • Tech Proficiency: Advanced

🧠 Psychographics:
  Motivations: Efficiency, Control
  Values: Time-saving

🎯 Goals & Needs:
  • Complete tasks efficiently
  • Professional productivity
  • Save time

😤 Frustrations:
  • Slow loading times
  • Confusing UI
  • Missing features

📊 Behaviors:
  • Frequently uses: dashboard
  • Frequently uses: reports
  • Frequently uses: settings

💡 Design Implications:
  → Optimize for speed and efficiency
  → Provide keyboard shortcuts and power features
  → Professional visual design
  → Enterprise features (SSO, audit logs)

📈 Data: Based on 30 users
    Confidence: Medium
```

## Documentation

See [SKILL.md](./SKILL.md) for complete documentation.
