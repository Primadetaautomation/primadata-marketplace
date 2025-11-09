#!/usr/bin/env node

/**
 * Skill Loader Utility
 * Helps discover and load Agent Skills based on task intent
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(process.env.HOME, '.claude/skills');

// Skill metadata extracted from SKILL.md frontmatter
const skillMetadata = {
  'production-code-standards': {
    triggers: ['production', 'code quality', 'standards', 'TDD', 'best practices', 'code review', 'maintainable', 'SOLID'],
    agents: ['senior-fullstack-developer', 'code-refactoring-specialist', 'qa-testing-engineer'],
    description: 'Production-ready code standards following CLAUDE Framework'
  },
  'security-essentials': {
    triggers: ['security', 'auth', 'authentication', 'authorization', 'OWASP', 'vulnerability', 'encryption', 'secure', 'XSS', 'CSRF', 'SQL injection'],
    agents: ['security-specialist', 'senior-fullstack-developer', 'qa-testing-engineer'],
    description: 'Security best practices, OWASP compliance, authentication patterns'
  },
  'testing-fundamentals': {
    triggers: ['test', 'testing', 'TDD', 'coverage', 'unit test', 'integration test', 'e2e', 'quality assurance', 'QA'],
    agents: ['qa-testing-engineer', 'senior-fullstack-developer', 'playwright-test-agent'],
    description: 'TDD workflow, comprehensive test strategies, test coverage'
  },
  'deployment-workflows': {
    triggers: ['deploy', 'deployment', 'CI/CD', 'pipeline', 'production', 'infrastructure', 'docker', 'kubernetes', 'vercel'],
    agents: ['devops-deployment-engineer', 'solutions-architect', 'security-specialist'],
    description: 'CI/CD pipelines, zero-downtime deployments, infrastructure as code'
  },
  'backend-development-patterns': {
    triggers: ['api', 'backend', 'REST', 'GraphQL', 'database', 'microservices', 'server', 'endpoint', 'PostgreSQL', 'Supabase'],
    agents: ['senior-fullstack-developer', 'database-migration-specialist', 'solutions-architect'],
    description: 'API design, database patterns, REST/GraphQL, microservices architecture'
  },
  'intelligent-router': {
    triggers: ['route', 'dispatch', 'orchestrate', 'auto-select', 'intelligent routing'],
    agents: ['master-orchestrator'],
    description: 'Analyzes questions and automatically dispatches optimal agents/skills/plugins'
  }
};

/**
 * Discover relevant skills based on task description
 * @param {string} taskDescription - User's task or question
 * @returns {string[]} - Array of relevant skill names
 */
function discoverSkills(taskDescription) {
  const normalizedTask = taskDescription.toLowerCase();
  const relevantSkills = [];

  Object.entries(skillMetadata).forEach(([skillName, metadata]) => {
    const matchCount = metadata.triggers.filter(trigger =>
      normalizedTask.includes(trigger.toLowerCase())
    ).length;

    if (matchCount > 0) {
      relevantSkills.push({ skillName, matchCount });
    }
  });

  // Sort by relevance (most matches first)
  relevantSkills.sort((a, b) => b.matchCount - a.matchCount);

  return relevantSkills.map(s => s.skillName);
}

/**
 * Get skills for specific agent
 * @param {string} agentName - Name of the agent
 * @returns {string[]} - Array of relevant skill names
 */
function getSkillsForAgent(agentName) {
  return Object.entries(skillMetadata)
    .filter(([_, metadata]) => metadata.agents.includes(agentName))
    .map(([skillName]) => skillName);
}

/**
 * List all available skills
 * @returns {Object} - Skills metadata
 */
function listAllSkills() {
  return skillMetadata;
}

/**
 * Get skill path
 * @param {string} skillName - Name of the skill
 * @returns {string} - Full path to skill directory
 */
function getSkillPath(skillName) {
  return path.join(SKILLS_DIR, skillName);
}

/**
 * Check if skill exists
 * @param {string} skillName - Name of the skill
 * @returns {boolean}
 */
function skillExists(skillName) {
  const skillPath = getSkillPath(skillName);
  return fs.existsSync(skillPath) && fs.existsSync(path.join(skillPath, 'SKILL.md'));
}

/**
 * Get skill content
 * @param {string} skillName - Name of the skill
 * @param {number} level - Context level (1-3)
 * @returns {string} - Skill content
 */
function loadSkill(skillName, level = 1) {
  if (!skillExists(skillName)) {
    throw new Error(`Skill '${skillName}' not found`);
  }

  const skillPath = getSkillPath(skillName);
  const mainContent = fs.readFileSync(path.join(skillPath, 'SKILL.md'), 'utf8');

  if (level === 1) {
    // Return only main SKILL.md (minimal context)
    return mainContent;
  }

  // For level 2 and 3, include additional files
  let content = mainContent;

  if (level >= 2) {
    // Add detailed patterns if they exist
    const detailedFiles = fs.readdirSync(skillPath)
      .filter(f => f.endsWith('.md') && f !== 'SKILL.md');

    detailedFiles.forEach(file => {
      const filePath = path.join(skillPath, file);
      content += '\n\n---\n\n';
      content += fs.readFileSync(filePath, 'utf8');
    });
  }

  if (level >= 3) {
    // List available scripts
    const scriptsDir = path.join(skillPath, 'scripts');
    if (fs.existsSync(scriptsDir)) {
      const scripts = fs.readdirSync(scriptsDir);
      content += '\n\n---\n\n## Available Scripts\n\n';
      scripts.forEach(script => {
        content += `- ${script}\n`;
      });
    }
  }

  return content;
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'discover':
      if (!arg) {
        console.error('Usage: skill-loader.js discover "task description"');
        process.exit(1);
      }
      const skills = discoverSkills(arg);
      console.log('Relevant skills for your task:');
      skills.forEach(skill => {
        console.log(`  - ${skill}: ${skillMetadata[skill].description}`);
      });
      break;

    case 'list':
      console.log('Available Agent Skills:\n');
      Object.entries(skillMetadata).forEach(([name, meta]) => {
        console.log(`📦 ${name}`);
        console.log(`   ${meta.description}`);
        console.log(`   Agents: ${meta.agents.join(', ')}`);
        console.log('');
      });
      break;

    case 'agent':
      if (!arg) {
        console.error('Usage: skill-loader.js agent <agent-name>');
        process.exit(1);
      }
      const agentSkills = getSkillsForAgent(arg);
      console.log(`Skills for ${arg}:`);
      agentSkills.forEach(skill => console.log(`  - ${skill}`));
      break;

    case 'load':
      if (!arg) {
        console.error('Usage: skill-loader.js load <skill-name> [level]');
        process.exit(1);
      }
      const level = parseInt(process.argv[4]) || 1;
      try {
        const content = loadSkill(arg, level);
        console.log(content);
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
      break;

    case 'help':
    default:
      console.log(`
Agent Skills Loader Utility

Usage:
  skill-loader.js discover "task description"  - Find relevant skills for a task
  skill-loader.js list                         - List all available skills
  skill-loader.js agent <agent-name>           - Show skills for specific agent
  skill-loader.js load <skill-name> [level]    - Load skill content (level 1-3)
  skill-loader.js help                         - Show this help

Examples:
  skill-loader.js discover "I need to create a secure API"
  skill-loader.js agent senior-fullstack-developer
  skill-loader.js load security-essentials 2
      `);
  }
}

// Export for programmatic use
module.exports = {
  discoverSkills,
  getSkillsForAgent,
  listAllSkills,
  skillExists,
  loadSkill,
  getSkillPath,
};
