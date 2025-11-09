#!/bin/bash

# Pre-Prompt Hook: Intelligent Router Auto-Activation
# This hook activates the intelligent-router skill before processing user prompts
# The router internally decides whether to activate based on smart auto-detect

# Path to router analyzer
ROUTER_SCRIPT="$HOME/.claude/skills/intelligent-router/scripts/analyze-intent.js"

# Only activate if router exists
if [ -f "$ROUTER_SCRIPT" ]; then
    # Router is available - it will auto-activate if needed
    # The skill itself handles smart detection
    echo "🎯 Intelligent Router: Ready (smart auto-detect active)"
else
    # Router not installed - skip silently
    :
fi
