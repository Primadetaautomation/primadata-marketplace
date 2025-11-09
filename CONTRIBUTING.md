# 🤝 Contributing to Primadata Marketplace

Thank you for your interest in contributing! This document explains how you can contribute to the marketplace.

[🇬🇧 English](#english) | [🇳🇱 Nederlands](#nederlands)

---

## 🇬🇧 English

## 📋 Contribution Process

### 1️⃣ Small Changes (typos, documentation)

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR-USERNAME/primadata-marketplace.git
cd primadata-marketplace

# Create a branch
git checkout -b fix/update-readme

# Make your changes
# ... edit files ...

# Commit and push
git add .
git commit -m "docs: Fix typo in README"
git push origin fix/update-readme

# Create a Pull Request on GitHub
```

### 2️⃣ Major Changes (new plugins, features)

**Open an Issue first to discuss your idea!**

1. Go to: https://github.com/Primadetaautomation/primadata-marketplace/issues
2. Click: "New Issue"
3. Describe your proposal
4. Wait for feedback before starting

### 3️⃣ Adding Plugins

To add a new plugin to the marketplace:

**Requirements:**
- Plugin must have a public GitHub repository
- Plugin must contain `.claude-plugin/plugin.json`
- Plugin must be documented (README.md)
- Plugin must be tested
- Include proper attribution in description

**Steps:**

1. Fork the repository
2. Edit `.claude-plugin/marketplace.json`
3. Add your plugin to the `plugins` array:

```json
{
  "name": "your-plugin-name",
  "source": {
    "source": "url",
    "url": "https://github.com/USERNAME/plugin-name.git"
  },
  "description": "Short plugin description. Based on original-author/repo if applicable.",
  "version": "1.0.0",
  "strict": true
}
```

4. Update `README.md` with plugin information
5. Update `CREDITS.md` with attribution
6. Test locally:

```bash
# Validate marketplace.json
cd primadata-marketplace
cat .claude-plugin/marketplace.json | jq .

# Test plugin installation
claude plugin install your-plugin-name@primadata-marketplace
```

7. Create a Pull Request

### 4️⃣ Creating Wrapper Plugins

For features from other projects (like my-claude-code-setup):

**Repository Structure:**
```
primadata-wrapper-plugin/
├── .claude-plugin/
│   └── plugin.json
├── agents/           # If applicable
├── skills/           # If applicable
├── commands/         # If applicable
├── README.md
├── LICENSE
└── CREDITS.md       # REQUIRED: Attribution
```

**Attribution Requirements:**
- Clear credit in plugin.json description
- CREDITS.md file with original source
- Link to original repository
- Maintain original license terms

## 🔍 Code Review Process

All Pull Requests are reviewed by maintainers:

- ✅ Code quality check
- ✅ Documentation completeness
- ✅ No breaking changes
- ✅ Plugins work correctly
- ✅ Proper attribution

## 📝 Commit Message Guidelines

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new plugin
fix: Fix typo in README
docs: Expand documentation
chore: Update dependencies
refactor: Reorganize plugin structure
```

## ⚠️ Important Notes

- **Attribution is mandatory** for derived work
- **Test before submitting** PRs
- **Document all changes** clearly
- **Respect original licenses**

---

## 🇳🇱 Nederlands

## 📋 Contribution Process

### 1️⃣ Voor Kleine Wijzigingen (typos, documentatie)

```bash
# Fork de repository op GitHub
# Clone je fork
git clone https://github.com/JOUW-USERNAME/primadata-marketplace.git
cd primadata-marketplace

# Maak een branch
git checkout -b fix/update-readme

# Maak je wijzigingen
# ... edit files ...

# Commit en push
git add .
git commit -m "docs: Fix typo in README"
git push origin fix/update-readme

# Maak een Pull Request op GitHub
```

### 2️⃣ Voor Grote Wijzigingen (nieuwe plugins, features)

**Open eerst een Issue om je idee te bespreken!**

1. Ga naar: https://github.com/Primadetaautomation/primadata-marketplace/issues
2. Klik: "New Issue"
3. Beschrijf je voorstel
4. Wacht op feedback voordat je begint

### 3️⃣ Plugin Toevoegingen

Om een nieuwe plugin toe te voegen aan de marketplace:

**Vereisten:**
- De plugin moet een publieke GitHub repository hebben
- De plugin moet een `.claude-plugin/plugin.json` bevatten
- De plugin moet gedocumenteerd zijn (README.md)
- De plugin moet getest zijn
- Inclusief juiste attributie in beschrijving

**Stappen:**

1. Fork de repository
2. Edit `.claude-plugin/marketplace.json`
3. Voeg je plugin toe aan de `plugins` array:

```json
{
  "name": "jouw-plugin-naam",
  "source": {
    "source": "url",
    "url": "https://github.com/USERNAME/plugin-naam.git"
  },
  "description": "Korte beschrijving. Gebaseerd op originele-auteur/repo indien van toepassing.",
  "version": "1.0.0",
  "strict": true
}
```

4. Update `README.md` met plugin informatie
5. Update `CREDITS.md` met attributie
6. Test lokaal:

```bash
# Test of de marketplace.json valide is
cd primadata-marketplace
cat .claude-plugin/marketplace.json | jq .

# Test de plugin installatie
claude plugin install jouw-plugin-naam@primadata-marketplace
```

7. Maak een Pull Request

### 4️⃣ Wrapper Plugins Maken

Voor features van andere projecten (zoals my-claude-code-setup):

**Repository Structuur:**
```
primadata-wrapper-plugin/
├── .claude-plugin/
│   └── plugin.json
├── agents/           # Indien van toepassing
├── skills/           # Indien van toepassing
├── commands/         # Indien van toepassing
├── README.md
├── LICENSE
└── CREDITS.md       # VERPLICHT: Attributie
```

**Attributie Vereisten:**
- Duidelijke credit in plugin.json beschrijving
- CREDITS.md bestand met originele bron
- Link naar originele repository
- Behoud originele licentie voorwaarden

## 🔍 Code Review Process

Alle Pull Requests worden gereviewd door de maintainer(s):

- ✅ Code kwaliteit check
- ✅ Documentatie compleetheid
- ✅ Geen breaking changes
- ✅ Plugins werken correct
- ✅ Juiste attributie

## 📝 Commit Message Guidelines

Gebruik [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Nieuwe plugin toegevoegd
fix: Typfout in README gerepareerd
docs: Documentatie uitgebreid
chore: Dependencies geüpdatet
```

## ⚠️ Belangrijke Opmerkingen

- **Attributie is verplicht** voor afgeleid werk
- **Test voor het indienen** van PRs
- **Documenteer alle wijzigingen** duidelijk
- **Respecteer originele licenties**

## ❓ Vragen?

- Open een [GitHub Issue](https://github.com/Primadetaautomation/primadata-marketplace/issues)
- Check bestaande issues voor antwoorden
- Email: rick@primadetaautomation.com

## 📄 License

Door bij te dragen ga je akkoord dat je bijdragen vallen onder de [MIT License](LICENSE).

---

**Bedankt voor je bijdrage!** 🙏
