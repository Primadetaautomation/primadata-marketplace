#!/bin/bash

# Pre-commit Quality Gate
# Run this before committing code to ensure standards compliance

set -e

echo "🔍 Running pre-commit quality checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${YELLOW}⚠️  $1 not found, skipping $2${NC}"
        return 1
    fi
    return 0
}

# Track failures
FAILED=0

# 1. Linting
echo "📝 Running linter..."
if check_tool "eslint" "linting"; then
    if eslint . --ext .ts,.tsx,.js,.jsx; then
        echo -e "${GREEN}✓ Linting passed${NC}"
    else
        echo -e "${RED}✗ Linting failed${NC}"
        FAILED=1
    fi
fi

# 2. Type checking
echo "🔤 Running type checker..."
if check_tool "tsc" "type checking"; then
    if tsc --noEmit; then
        echo -e "${GREEN}✓ Type checking passed${NC}"
    else
        echo -e "${RED}✗ Type checking failed${NC}"
        FAILED=1
    fi
fi

# 3. Tests
echo "🧪 Running tests..."
if check_tool "npm" "tests"; then
    if npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'; then
        echo -e "${GREEN}✓ Tests passed with sufficient coverage${NC}"
    else
        echo -e "${RED}✗ Tests failed or coverage below 80%${NC}"
        FAILED=1
    fi
fi

# 4. Security scan
echo "🔒 Scanning for vulnerabilities..."
if check_tool "npm" "security scan"; then
    if npm audit --audit-level=high; then
        echo -e "${GREEN}✓ No high/critical vulnerabilities${NC}"
    else
        echo -e "${YELLOW}⚠️  Vulnerabilities found, review npm audit output${NC}"
    fi
fi

# 5. Check for hardcoded secrets
echo "🔐 Checking for secrets..."
if check_tool "gitleaks" "secret scanning"; then
    if gitleaks detect --no-git; then
        echo -e "${GREEN}✓ No secrets detected${NC}"
    else
        echo -e "${RED}✗ Potential secrets found${NC}"
        FAILED=1
    fi
else
    echo "  Checking for common patterns manually..."
    if grep -r -E "(password|secret|api[_-]?key|token)\s*=\s*['\"][^'\"]+['\"]" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null; then
        echo -e "${RED}✗ Possible hardcoded secrets found${NC}"
        FAILED=1
    else
        echo -e "${GREEN}✓ No obvious secrets detected${NC}"
    fi
fi

# 6. Check function length
echo "📏 Checking function length..."
LONG_FUNCTIONS=$(find . -name "*.ts" -o -name "*.js" | grep -v node_modules | xargs grep -E "^\s*(function|async function|const \w+ = \(.*\) =>)" -A 25 | grep -c "^--$" || true)
if [ "$LONG_FUNCTIONS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found functions longer than 20 lines${NC}"
else
    echo -e "${GREEN}✓ All functions within size limits${NC}"
fi

# Final result
echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All quality checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Quality checks failed. Please fix issues before committing.${NC}"
    exit 1
fi
