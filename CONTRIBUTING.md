# 🤝 Contributing to Primadata Marketplace

Bedankt voor je interesse om bij te dragen! Dit document legt uit hoe je kunt bijdragen.

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
  "description": "Korte beschrijving van de plugin",
  "version": "1.0.0",
  "strict": true
}
```

4. Update `README.md` met plugin informatie
5. Test lokaal:

```bash
# Test of de marketplace.json valide is
cd primadata-marketplace
cat .claude-plugin/marketplace.json | jq .

# Test de plugin installatie
claude plugin install jouw-plugin-naam@primadata-marketplace
```

6. Maak een Pull Request

## 🔍 Code Review Process

Alle Pull Requests worden gereviewd door de maintainer(s):

- ✅ Code kwaliteit check
- ✅ Documentatie compleetheid
- ✅ Geen breaking changes
- ✅ Plugins werken correct

## 📝 Commit Message Guidelines

Gebruik [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Nieuwe plugin toegevoegd
fix: Typfout in README gerepareerd
docs: Documentatie uitgebreid
chore: Dependencies geüpdatet
```

## ❓ Vragen?

- Open een [GitHub Issue](https://github.com/Primadetaautomation/primadata-marketplace/issues)
- Check bestaande issues voor antwoorden

## 📄 License

Door bij te dragen ga je akkoord dat je bijdragen vallen onder de [MIT License](LICENSE).

---

**Bedankt voor je bijdrage!** 🙏
