#!/usr/bin/env node

/**
 * Intelligent Intent Analyzer
 * Smart auto-detection for routing user questions to appropriate agents/skills
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');

const MATRIX_PATH = path.join(__dirname, '..', 'routing-matrix.json');

/**
 * Load routing matrix
 */
function loadRoutingMatrix() {
  try {
    const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
    return matrix;
  } catch (error) {
    console.error('Failed to load routing matrix:', error.message);
    process.exit(1);
  }
}

/**
 * Analyze if question should trigger router
 * @param {string} question - User's question/request
 * @param {Object} config - Auto-detect configuration
 * @returns {boolean} - Whether to activate router
 */
function shouldActivateRouter(question, config) {
  const normalized = question.toLowerCase().trim();
  const wordCount = normalized.split(/\s+/).length;

  // Skip if too short
  if (wordCount < config.min_word_count) {
    return false;
  }

  // Skip if it's just a question about concepts
  const isSimpleQuestion = config.skip_keywords.some(keyword =>
    normalized.startsWith(keyword)
  );
  if (isSimpleQuestion) {
    return false;
  }

  // Activate if contains action verbs
  const hasActionVerb = config.action_verbs.some(verb =>
    normalized.includes(verb)
  );
  if (hasActionVerb) {
    return true;
  }

  // Activate if long enough and seems like a task
  if (wordCount >= 10) {
    return true;
  }

  return false;
}

/**
 * Calculate match score for a route
 * @param {string} question - User's question
 * @param {Object} route - Route configuration
 * @returns {number} - Match score (0-100)
 */
function calculateMatchScore(question, route) {
  const normalized = question.toLowerCase();
  let score = 0;
  let matchedTriggers = [];

  // Check trigger keywords
  route.triggers.forEach(trigger => {
    if (normalized.includes(trigger.toLowerCase())) {
      score += 10;
      matchedTriggers.push(trigger);
    }
  });

  // Bonus for multiple trigger matches
  if (matchedTriggers.length > 1) {
    score += matchedTriggers.length * 5;
  }

  // Priority boost
  const priorityBoost = {
    'critical': 20,
    'high': 10,
    'medium': 5,
    'low': 0
  };
  score += priorityBoost[route.priority] || 0;

  return { score, matchedTriggers };
}

/**
 * Find matching routes for question
 * @param {string} question - User's question
 * @param {Object} matrix - Routing matrix
 * @returns {Array} - Sorted array of matching routes
 */
function findMatchingRoutes(question, matrix) {
  const matches = [];

  Object.entries(matrix.routes).forEach(([routeName, route]) => {
    const { score, matchedTriggers } = calculateMatchScore(question, route);

    if (score > 0) {
      matches.push({
        routeName,
        route,
        score,
        matchedTriggers
      });
    }
  });

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

/**
 * Determine domains involved
 * @param {Array} matches - Matched routes
 * @returns {Array} - List of domains
 */
function identifyDomains(matches) {
  const domains = new Set();

  matches.forEach(match => {
    // Extract domain from route name (e.g., "backend_api" -> "backend")
    const domain = match.routeName.split('_')[0];
    domains.add(domain);
  });

  return Array.from(domains);
}

/**
 * Assess complexity based on matches and question
 * @param {string} question - User's question
 * @param {Array} matches - Matched routes
 * @param {Array} domains - Identified domains
 * @param {Object} thresholds - Complexity thresholds
 * @returns {string} - Complexity level
 */
function assessComplexity(question, matches, domains, thresholds) {
  const wordCount = question.split(/\s+/).length;
  const domainCount = domains.length;

  // Complex if multiple domains
  if (domainCount >= (thresholds.complex.min_domains || 3)) {
    return 'complex';
  }

  // High if multiple matches with high priority
  const highPriorityMatches = matches.filter(m =>
    m.route.priority === 'critical' || m.route.priority === 'high'
  );
  if (highPriorityMatches.length >= 2 || domainCount === 3) {
    return 'high';
  }

  // Medium if moderate word count or 2 domains
  if (wordCount >= thresholds.medium.max_words || domainCount === 2) {
    return 'medium';
  }

  // Simple otherwise
  return 'simple';
}

/**
 * Select primary route/agent
 * @param {Array} matches - Matched routes
 * @returns {Object|null} - Primary route or null
 */
function selectPrimaryRoute(matches) {
  if (matches.length === 0) return null;

  // Highest scored route is primary
  return matches[0];
}

/**
 * Collect all unique skills from matches
 * @param {Array} matches - Matched routes
 * @returns {Array} - List of skills to load
 */
function collectSkills(matches) {
  const skills = new Set();

  matches.forEach(match => {
    match.route.skills.forEach(skill => skills.add(skill));
  });

  return Array.from(skills);
}

/**
 * Collect all unique plugins from matches
 * @param {Array} matches - Matched routes
 * @returns {Array} - List of plugins
 */
function collectPlugins(matches) {
  const plugins = new Set();

  matches.forEach(match => {
    match.route.plugins.forEach(plugin => plugins.add(plugin));
  });

  return Array.from(plugins);
}

/**
 * Collect all relevant docs from matches
 * @param {Array} matches - Matched routes
 * @returns {Array} - List of docs to load
 */
function collectDocs(matches) {
  const docs = new Set();

  matches.forEach(match => {
    match.route.docs.forEach(doc => docs.add(doc));
  });

  return Array.from(docs);
}

/**
 * Determine optional agents to suggest
 * @param {Array} matches - Matched routes
 * @param {Object} primary - Primary route
 * @returns {Array} - List of optional agents
 */
function determineOptionalAgents(matches, primary) {
  const optional = new Set();

  matches.slice(1, 4).forEach(match => {
    // Add agents from secondary matches
    if (match.route.agent && match.route.agent !== primary?.route?.agent) {
      optional.add({
        agent: match.route.agent,
        reason: match.route.intent,
        priority: match.route.priority
      });
    }

    // Add explicitly defined optional agents
    if (match.route.optional_agents) {
      match.route.optional_agents.forEach(agent => {
        optional.add({
          agent,
          reason: `Related to ${match.route.intent}`,
          priority: 'optional'
        });
      });
    }
  });

  return Array.from(optional);
}

/**
 * Main analysis function
 * @param {string} question - User's question/request
 * @returns {Object} - Complete analysis result
 */
function analyzeIntent(question) {
  const matrix = loadRoutingMatrix();
  const config = matrix.auto_detect_config;

  // Check if should activate
  const shouldActivate = shouldActivateRouter(question, config);

  if (!shouldActivate) {
    return {
      activate: false,
      reason: 'Question too simple or informational'
    };
  }

  // Find matching routes
  const matches = findMatchingRoutes(question, matrix);

  if (matches.length === 0) {
    return {
      activate: false,
      reason: 'No matching routes found'
    };
  }

  // Analyze
  const domains = identifyDomains(matches);
  const complexity = assessComplexity(question, matches, domains, matrix.complexity_thresholds);
  const primary = selectPrimaryRoute(matches);
  const skills = collectSkills(matches);
  const plugins = collectPlugins(matches);
  const docs = collectDocs(matches);
  const optionalAgents = determineOptionalAgents(matches, primary);

  return {
    activate: true,
    analysis: {
      question,
      intent: primary.route.intent,
      complexity,
      domains,
      matchCount: matches.length,
      topMatches: matches.slice(0, 3).map(m => ({
        route: m.routeName,
        score: m.score,
        triggers: m.matchedTriggers
      }))
    },
    dispatch: {
      primary: {
        agent: primary.route.agent,
        route: primary.routeName,
        reason: primary.route.intent,
        score: primary.score
      },
      skills,
      plugins,
      docs,
      tools: primary.route.tools,
      optionalAgents,
      checkMemory: config.always_check_memory
    },
    recommendations: {
      autoDispatch: matrix.complexity_thresholds[complexity]?.auto_dispatch ?? true,
      requiresConfirmation: matrix.complexity_thresholds[complexity]?.requires_confirmation ?? false,
      notes: primary.route.notes || null
    }
  };
}

/**
 * Format analysis for display
 * @param {Object} result - Analysis result
 * @returns {string} - Formatted output
 */
function formatAnalysis(result) {
  if (!result.activate) {
    return `Router: Skipped (${result.reason})`;
  }

  const { analysis, dispatch, recommendations } = result;

  let output = '\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += '🎯 INTELLIGENT ROUTER ANALYSIS\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  // Analysis Section
  output += `📊 Detected Intent: ${analysis.intent}\n`;
  output += `📁 Complexity: ${analysis.complexity.toUpperCase()}\n`;
  output += `🎯 Domains: ${analysis.domains.join(', ')}\n`;
  output += `🔍 Matches: ${analysis.matchCount} routes\n\n`;

  // Skills Section
  if (dispatch.skills.length > 0) {
    output += '✅ AUTO-LOADED SKILLS:\n';
    dispatch.skills.forEach(skill => {
      output += `   - ${skill}\n`;
    });
    output += '\n';
  }

  // Plugins Section
  if (dispatch.plugins.length > 0) {
    output += '🔌 PLUGINS AVAILABLE:\n';
    dispatch.plugins.forEach(plugin => {
      output += `   - ${plugin}\n`;
    });
    output += '\n';
  }

  // Docs Section
  if (dispatch.docs.length > 0) {
    output += '📚 RELEVANT DOCS:\n';
    dispatch.docs.forEach(doc => {
      output += `   - ${doc} (auto-loaded)\n`;
    });
    output += '\n';
  }

  // Primary Agent
  if (dispatch.primary.agent) {
    output += '✅ AUTO-DISPATCHED:\n';
    output += `   - ${dispatch.primary.agent}\n`;
    output += `     → ${dispatch.primary.reason}\n`;
    if (recommendations.notes) {
      output += `     Note: ${recommendations.notes}\n`;
    }
    output += '\n';
  }

  // Memory Check
  if (dispatch.checkMemory) {
    output += '🧠 EPISODIC MEMORY:\n';
    output += '   - Checking past conversations (recommended)\n\n';
  }

  // Optional Agents
  if (dispatch.optionalAgents.length > 0) {
    output += '💡 OPTIONAL DISPATCH (you choose):\n';
    dispatch.optionalAgents.forEach(opt => {
      output += `   [ ] ${opt.agent}\n`;
      output += `       → ${opt.reason}\n`;
    });
    output += '\n';
    output += '👉 Use Task tool to dispatch additional agents\n\n';
  }

  // Tools Available
  if (dispatch.tools && dispatch.tools.length > 0) {
    output += '🛠️ TOOLS ACTIVATED:\n';
    output += `   ${dispatch.tools.join(', ')}\n\n`;
  }

  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

  return output;
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'analyze') {
    const question = process.argv.slice(3).join(' ');

    if (!question) {
      console.error('Usage: analyze-intent.js analyze "your question here"');
      process.exit(1);
    }

    const result = analyzeIntent(question);
    console.log(formatAnalysis(result));

    // Output JSON if --json flag
    if (process.argv.includes('--json')) {
      console.log('\nJSON Output:');
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    console.log(`
Intelligent Intent Analyzer

Usage:
  analyze-intent.js analyze "your question"    - Analyze a question
  analyze-intent.js analyze "question" --json  - Output JSON result

Examples:
  analyze-intent.js analyze "Maak een login systeem"
  analyze-intent.js analyze "Fix deze bug in auth.ts"
  analyze-intent.js analyze "Deploy to production"
    `);
  }
}

// Export for programmatic use
module.exports = {
  analyzeIntent,
  formatAnalysis,
  shouldActivateRouter
};
