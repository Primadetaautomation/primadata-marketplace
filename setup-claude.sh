#!/bin/bash
# =============================================================================
# Claude Code Setup Script
# =============================================================================
# Installeert CLAUDE.md en skills in je project
#
# Gebruik:
#   curl -sL https://raw.githubusercontent.com/Primadetaautomation/claude-dev-toolkit/main/setup-claude.sh | bash
#
# Of lokaal:
#   ./setup-claude.sh
#
# Opties:
#   --skills-only    Alleen skills installeren, geen CLAUDE.md
#   --claude-only    Alleen CLAUDE.md installeren, geen skills
#   --force          Overschrijf bestaande bestanden
#   --help           Toon deze help
# =============================================================================

set -e

# Kleuren voor output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuratie
REPO_URL="https://raw.githubusercontent.com/Primadetaautomation/claude-dev-toolkit/main"
SKILLS_REPO="https://github.com/Primadetaautomation/claude-dev-toolkit.git"

# Defaults
INSTALL_CLAUDE=true
INSTALL_SKILLS=true
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skills-only)
            INSTALL_CLAUDE=false
            shift
            ;;
        --claude-only)
            INSTALL_SKILLS=false
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help)
            echo "Claude Code Setup Script"
            echo ""
            echo "Gebruik:"
            echo "  ./setup-claude.sh [opties]"
            echo ""
            echo "Opties:"
            echo "  --skills-only    Alleen skills installeren"
            echo "  --claude-only    Alleen CLAUDE.md installeren"
            echo "  --force          Overschrijf bestaande bestanden"
            echo "  --help           Toon deze help"
            exit 0
            ;;
        *)
            echo -e "${RED}Onbekende optie: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Claude Code Setup Script v5.1          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check of we in een project directory zijn
if [ ! -d ".git" ] && [ ! -f "package.json" ] && [ ! -f "requirements.txt" ]; then
    echo -e "${YELLOW}Waarschuwing: Dit lijkt geen project directory te zijn.${NC}"
    read -p "Toch doorgaan? (j/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        exit 1
    fi
fi

# Installeer CLAUDE.md
if [ "$INSTALL_CLAUDE" = true ]; then
    echo -e "${BLUE}[1/2] CLAUDE.md installeren...${NC}"

    if [ -f "CLAUDE.md" ] && [ "$FORCE" = false ]; then
        echo -e "${YELLOW}  CLAUDE.md bestaat al. Gebruik --force om te overschrijven.${NC}"
    else
        curl -sL "${REPO_URL}/CLAUDE.md" -o CLAUDE.md
        echo -e "${GREEN}  ✓ CLAUDE.md geinstalleerd${NC}"
    fi
else
    echo -e "${YELLOW}[1/2] CLAUDE.md overgeslagen (--skills-only)${NC}"
fi

# Installeer skills
if [ "$INSTALL_SKILLS" = true ]; then
    echo -e "${BLUE}[2/2] Skills installeren...${NC}"

    # Maak .claude/skills directory
    mkdir -p .claude/skills

    # Lijst van skills om te installeren
    SKILLS=(
        "backend-development-patterns"
        "deployment-workflows"
        "production-code-standards"
        "security-essentials"
        "testing-fundamentals"
        "intelligent-router"
        "supabase-rls-fix"
        "ui-design-system"
        "ux-researcher-designer"
    )

    # Extra bestanden
    EXTRA_FILES=(
        "hybrid-supabase-auth.md"
        "skill-loader.js"
        "README.md"
        "QUICK_START.md"
    )

    # Clone repo tijdelijk
    TEMP_DIR=$(mktemp -d)
    echo -e "  Downloading skills..."
    git clone --depth 1 --quiet "$SKILLS_REPO" "$TEMP_DIR" 2>/dev/null

    # Kopieer skills
    for skill in "${SKILLS[@]}"; do
        if [ -d "$TEMP_DIR/skills/$skill" ]; then
            if [ -d ".claude/skills/$skill" ] && [ "$FORCE" = false ]; then
                echo -e "${YELLOW}  - $skill bestaat al, overgeslagen${NC}"
            else
                cp -r "$TEMP_DIR/skills/$skill" ".claude/skills/"
                echo -e "${GREEN}  ✓ $skill${NC}"
            fi
        fi
    done

    # Kopieer extra bestanden
    for file in "${EXTRA_FILES[@]}"; do
        if [ -f "$TEMP_DIR/skills/$file" ]; then
            if [ -f ".claude/skills/$file" ] && [ "$FORCE" = false ]; then
                echo -e "${YELLOW}  - $file bestaat al, overgeslagen${NC}"
            else
                cp "$TEMP_DIR/skills/$file" ".claude/skills/"
                echo -e "${GREEN}  ✓ $file${NC}"
            fi
        fi
    done

    # Cleanup
    rm -rf "$TEMP_DIR"

    echo -e "${GREEN}  ✓ Skills geinstalleerd in .claude/skills/${NC}"
else
    echo -e "${YELLOW}[2/2] Skills overgeslagen (--claude-only)${NC}"
fi

# Voeg .claude/ toe aan .gitignore als het nog niet bestaat
if [ -f ".gitignore" ]; then
    if ! grep -q "^\.claude/$" .gitignore 2>/dev/null; then
        echo -e "${BLUE}Toevoegen .claude/ aan .gitignore...${NC}"
        echo "" >> .gitignore
        echo "# Claude Code lokale configuratie" >> .gitignore
        echo ".claude/" >> .gitignore
        echo -e "${GREEN}  ✓ .gitignore bijgewerkt${NC}"
    fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Setup compleet!                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Geinstalleerd:"
[ "$INSTALL_CLAUDE" = true ] && echo -e "  ${GREEN}✓${NC} CLAUDE.md (v5.1)"
[ "$INSTALL_SKILLS" = true ] && echo -e "  ${GREEN}✓${NC} Skills in .claude/skills/"
echo ""
echo -e "Volgende stappen:"
echo -e "  1. Open je project in Claude Code"
echo -e "  2. Claude laadt automatisch CLAUDE.md"
echo -e "  3. Skills worden geladen op basis van je taken"
echo ""
echo -e "${BLUE}Documentatie: https://github.com/Primadetaautomation/claude-dev-toolkit${NC}"
