#!/bin/bash

# Comprehensive Security Scan
# Checks for vulnerabilities, secrets, and security misconfigurations

set -e

echo "🔒 Running comprehensive security scan..."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES_FOUND=0

# 1. Dependency vulnerabilities
echo "📦 Checking for vulnerable dependencies..."
if command -v npm &> /dev/null; then
    if npm audit --audit-level=moderate; then
        echo -e "${GREEN}✓ No moderate+ vulnerabilities in dependencies${NC}"
    else
        echo -e "${RED}✗ Vulnerable dependencies found${NC}"
        ISSUES_FOUND=1
    fi
else
    echo -e "${YELLOW}⚠️  npm not found, skipping dependency check${NC}"
fi

# 2. Secret scanning
echo "🔐 Scanning for exposed secrets..."
if command -v gitleaks &> /dev/null; then
    if gitleaks detect --no-git --redact; then
        echo -e "${GREEN}✓ No secrets detected${NC}"
    else
        echo -e "${RED}✗ Potential secrets found${NC}"
        ISSUES_FOUND=1
    fi
else
    echo "  Manual pattern check..."
    PATTERNS=(
        "password\s*=\s*['\"][^'\"]{8,}['\"]"
        "api[_-]?key\s*=\s*['\"][^'\"]+['\"]"
        "secret\s*=\s*['\"][^'\"]+['\"]"
        "token\s*=\s*['\"][^'\"]+['\"]"
        "aws_access_key_id"
        "private[_-]?key"
        "-----BEGIN.*PRIVATE KEY-----"
    )

    for pattern in "${PATTERNS[@]}"; do
        if grep -r -E "$pattern" . \
            --exclude-dir=node_modules \
            --exclude-dir=.git \
            --exclude-dir=dist \
            --exclude="*.md" 2>/dev/null | grep -v "EXAMPLE\|PLACEHOLDER\|YOUR_.*_HERE"; then
            echo -e "${RED}✗ Potential secret found: $pattern${NC}"
            ISSUES_FOUND=1
        fi
    done

    if [ $ISSUES_FOUND -eq 0 ]; then
        echo -e "${GREEN}✓ No obvious secrets detected${NC}"
    fi
fi

# 3. Hardcoded IPs/URLs
echo "🌐 Checking for hardcoded IPs/URLs..."
if grep -r -E "https?://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git 2>/dev/null | grep -v localhost | grep -v "127.0.0.1"; then
    echo -e "${YELLOW}⚠️  Hardcoded IP addresses found${NC}"
fi

# 4. Insecure functions
echo "⚠️  Checking for insecure code patterns..."
INSECURE_PATTERNS=(
    "eval\("
    "innerHTML\s*="
    "dangerouslySetInnerHTML"
    "exec\("
    "__dirname.*req\."
)

for pattern in "${INSECURE_PATTERNS[@]}"; do
    if grep -r -E "$pattern" . \
        --include="*.ts" \
        --include="*.tsx" \
        --include="*.js" \
        --include="*.jsx" \
        --exclude-dir=node_modules \
        --exclude-dir=.git 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Potentially insecure pattern: $pattern${NC}"
    fi
done

# 5. SQL injection risks
echo "💉 Checking for SQL injection risks..."
if grep -r -E "query\(['\"].*\$\{" . \
    --include="*.ts" \
    --include="*.js" \
    --exclude-dir=node_modules 2>/dev/null; then
    echo -e "${RED}✗ Potential SQL injection (string interpolation in query)${NC}"
    ISSUES_FOUND=1
fi

# 6. Missing security headers check
echo "🛡️  Checking for security headers..."
if grep -r "helmet\|csurf\|express-rate-limit" . \
    --include="*.ts" \
    --include="*.js" \
    --exclude-dir=node_modules 2>/dev/null > /dev/null; then
    echo -e "${GREEN}✓ Security middleware detected${NC}"
else
    echo -e "${YELLOW}⚠️  No security middleware found (helmet, csurf, rate-limit)${NC}"
fi

# 7. HTTPS enforcement
echo "🔐 Checking for HTTPS enforcement..."
if grep -r "secure:\s*true" . \
    --include="*.ts" \
    --include="*.js" \
    --exclude-dir=node_modules 2>/dev/null > /dev/null; then
    echo -e "${GREEN}✓ Secure cookies configured${NC}"
else
    echo -e "${YELLOW}⚠️  No secure cookie configuration found${NC}"
fi

# 8. Password complexity
echo "🔑 Checking password handling..."
if grep -r "bcrypt\|argon2" . \
    --include="*.ts" \
    --include="*.js" \
    --exclude-dir=node_modules 2>/dev/null > /dev/null; then
    echo -e "${GREEN}✓ Strong password hashing detected${NC}"
else
    echo -e "${YELLOW}⚠️  No password hashing library found${NC}"
fi

# Summary
echo ""
echo "📊 Security Scan Summary:"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ No critical security issues found${NC}"
    exit 0
else
    echo -e "${RED}❌ Security issues detected. Review and remediate immediately.${NC}"
    exit 1
fi
