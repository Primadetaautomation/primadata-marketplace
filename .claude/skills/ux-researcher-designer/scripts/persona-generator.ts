#!/usr/bin/env ts-node
/**
 * Data-Driven Persona Generator (TypeScript)
 * Creates research-backed user personas from user data and interviews
 */

// Type Definitions
interface UserData {
  user_id: string;
  age?: number;
  usage_frequency?: 'daily' | 'weekly' | 'monthly';
  features_used?: string[];
  primary_device?: 'desktop' | 'mobile' | 'tablet';
  usage_context?: 'work' | 'personal';
  tech_proficiency?: number; // 1-10 scale
  location_type?: 'urban' | 'suburban' | 'rural';
  pain_points?: string[];
}

interface InterviewInsight {
  quotes?: string[];
  motivations?: string[];
  values?: string[];
  goals?: string[];
  needs?: string[];
}

interface Demographics {
  age_range: string;
  location_type: string;
  occupation_category: string;
  education_level: string;
  tech_proficiency: string;
}

interface Psychographics {
  motivations: string[];
  values: string[];
  attitudes: string[];
  lifestyle: string;
}

interface Behaviors {
  usage_patterns: string[];
  feature_preferences: string[];
  interaction_style: string;
  learning_preference: string;
}

interface NeedsAndGoals {
  primary_goals: string[];
  secondary_goals: string[];
  functional_needs: string[];
  emotional_needs: string[];
}

interface Scenario {
  title: string;
  context: string;
  goal: string;
  steps: string[];
  pain_points: string[];
}

interface DataPoints {
  sample_size: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  last_updated: string;
  validation_method: string;
}

interface Persona {
  name: string;
  archetype: string;
  tagline: string;
  demographics: Demographics;
  psychographics: Psychographics;
  behaviors: Behaviors;
  needs_and_goals: NeedsAndGoals;
  frustrations: string[];
  scenarios: Scenario[];
  quote: string;
  data_points: DataPoints;
  design_implications: string[];
}

interface Patterns {
  usage_frequency: Record<string, number>;
  feature_usage: Record<string, number>;
  devices: Record<string, number>;
  contexts: Record<string, number>;
  pain_points: string[];
  success_metrics: string[];
}

type Archetype = 'power_user' | 'casual_user' | 'business_user' | 'mobile_first';

// Archetype Templates
const ARCHETYPE_TEMPLATES: Record<Archetype, any> = {
  power_user: {
    characteristics: ['tech-savvy', 'frequent user', 'early adopter', 'efficiency-focused'],
    goals: ['maximize productivity', 'automate workflows', 'access advanced features'],
    frustrations: ['slow performance', 'limited customization', 'lack of shortcuts'],
    quote: "I need tools that can keep up with my workflow"
  },
  casual_user: {
    characteristics: ['occasional user', 'basic needs', 'prefers simplicity'],
    goals: ['accomplish specific tasks', 'easy to use', 'minimal learning curve'],
    frustrations: ['complexity', 'too many options', 'unclear navigation'],
    quote: "I just want it to work without having to think about it"
  },
  business_user: {
    characteristics: ['professional context', 'ROI-focused', 'team collaboration'],
    goals: ['improve team efficiency', 'track metrics', 'integrate with tools'],
    frustrations: ['lack of reporting', 'poor collaboration features', 'no enterprise features'],
    quote: "I need to show clear value to my stakeholders"
  },
  mobile_first: {
    characteristics: ['primarily mobile', 'on-the-go usage', 'quick interactions'],
    goals: ['access anywhere', 'quick actions', 'offline capability'],
    frustrations: ['poor mobile experience', 'desktop-only features', 'slow loading'],
    quote: "My phone is my primary computing device"
  }
};

/**
 * PersonaGenerator Class
 */
class PersonaGenerator {
  /**
   * Generate persona from user data and optional interview insights
   */
  generatePersonaFromData(
    userData: UserData[],
    interviewInsights: InterviewInsight[] = []
  ): Persona {
    // Analyze user data for patterns
    const patterns = this.analyzeUserPatterns(userData);

    // Identify persona archetype
    const archetype = this.identifyArchetype(patterns);

    // Generate persona
    const persona: Persona = {
      name: this.generateName(archetype),
      archetype,
      tagline: this.generateTagline(patterns),
      demographics: this.aggregateDemographics(userData),
      psychographics: this.extractPsychographics(patterns, interviewInsights),
      behaviors: this.analyzeBehaviors(userData),
      needs_and_goals: this.identifyNeeds(patterns, interviewInsights),
      frustrations: this.extractFrustrations(patterns, interviewInsights),
      scenarios: this.generateScenarios(archetype, patterns),
      quote: this.selectQuote(interviewInsights, archetype),
      data_points: this.calculateDataPoints(userData),
      design_implications: this.deriveDesignImplications(patterns)
    };

    return persona;
  }

  /**
   * Analyze patterns in user data
   */
  private analyzeUserPatterns(userData: UserData[]): Patterns {
    const patterns: Patterns = {
      usage_frequency: {},
      feature_usage: {},
      devices: {},
      contexts: {},
      pain_points: [],
      success_metrics: []
    };

    for (const user of userData) {
      // Frequency patterns
      const freq = user.usage_frequency || 'medium';
      patterns.usage_frequency[freq] = (patterns.usage_frequency[freq] || 0) + 1;

      // Feature usage
      for (const feature of user.features_used || []) {
        patterns.feature_usage[feature] = (patterns.feature_usage[feature] || 0) + 1;
      }

      // Device patterns
      const device = user.primary_device || 'desktop';
      patterns.devices[device] = (patterns.devices[device] || 0) + 1;

      // Context patterns
      const context = user.usage_context || 'work';
      patterns.contexts[context] = (patterns.contexts[context] || 0) + 1;

      // Pain points
      if (user.pain_points) {
        patterns.pain_points.push(...user.pain_points);
      }
    }

    return patterns;
  }

  /**
   * Identify persona archetype based on patterns
   */
  private identifyArchetype(patterns: Patterns): Archetype {
    const freqPattern = this.getMostCommon(patterns.usage_frequency) || 'medium';
    const devicePattern = this.getMostCommon(patterns.devices) || 'desktop';
    const featureCount = Object.keys(patterns.feature_usage).length;

    if (freqPattern === 'daily' && featureCount > 10) {
      return 'power_user';
    } else if (devicePattern === 'mobile' || devicePattern === 'tablet') {
      return 'mobile_first';
    } else if ((patterns.contexts['work'] || 0) > (patterns.contexts['personal'] || 0)) {
      return 'business_user';
    } else {
      return 'casual_user';
    }
  }

  /**
   * Get most common key from object
   */
  private getMostCommon(obj: Record<string, number>): string | null {
    const entries = Object.entries(obj);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  /**
   * Generate persona name based on archetype
   */
  private generateName(archetype: Archetype): string {
    const names: Record<Archetype, string[]> = {
      power_user: ['Alex', 'Sam', 'Jordan', 'Morgan'],
      casual_user: ['Pat', 'Jamie', 'Casey', 'Riley'],
      business_user: ['Taylor', 'Cameron', 'Avery', 'Blake'],
      mobile_first: ['Quinn', 'Skylar', 'River', 'Sage']
    };

    const roles: Record<Archetype, string> = {
      power_user: 'the Power User',
      casual_user: 'the Casual User',
      business_user: 'the Business Professional',
      mobile_first: 'the Mobile Native'
    };

    const namePool = names[archetype];
    const firstName = namePool[Math.floor(Math.random() * namePool.length)];

    return `${firstName} ${roles[archetype]}`;
  }

  /**
   * Generate persona tagline
   */
  private generateTagline(patterns: Patterns): string {
    const freq = this.getMostCommon(patterns.usage_frequency) || 'regular';
    const context = this.getMostCommon(patterns.contexts) || 'general';

    return `A ${freq} user who primarily uses the product for ${context} purposes`;
  }

  /**
   * Aggregate demographic information
   */
  private aggregateDemographics(userData: UserData[]): Demographics {
    const demographics: Demographics = {
      age_range: '',
      location_type: '',
      occupation_category: '',
      education_level: '',
      tech_proficiency: ''
    };

    if (userData.length === 0) return demographics;

    // Age range
    const ages = userData.filter(u => u.age).map(u => u.age!);
    if (ages.length > 0) {
      const avgAge = ages.reduce((a, b) => a + b, 0) / ages.length;
      if (avgAge < 25) demographics.age_range = '18-24';
      else if (avgAge < 35) demographics.age_range = '25-34';
      else if (avgAge < 45) demographics.age_range = '35-44';
      else demographics.age_range = '45+';
    }

    // Location type
    const locations = userData.filter(u => u.location_type).map(u => u.location_type!);
    if (locations.length > 0) {
      demographics.location_type = this.mostFrequent(locations);
    }

    // Tech proficiency
    const techScores = userData.filter(u => u.tech_proficiency).map(u => u.tech_proficiency!);
    if (techScores.length > 0) {
      const avgTech = techScores.reduce((a, b) => a + b, 0) / techScores.length;
      if (avgTech < 3) demographics.tech_proficiency = 'Beginner';
      else if (avgTech < 7) demographics.tech_proficiency = 'Intermediate';
      else demographics.tech_proficiency = 'Advanced';
    }

    return demographics;
  }

  /**
   * Extract psychographic information
   */
  private extractPsychographics(patterns: Patterns, interviews: InterviewInsight[]): Psychographics {
    const psychographics: Psychographics = {
      motivations: [],
      values: [],
      attitudes: [],
      lifestyle: ''
    };

    // Extract from patterns
    if ((patterns.usage_frequency['daily'] || 0) > 0) {
      psychographics.motivations.push('Efficiency');
      psychographics.values.push('Time-saving');
    }

    if ((patterns.devices['mobile'] || 0) > (patterns.devices['desktop'] || 0)) {
      psychographics.lifestyle = 'On-the-go, mobile-first';
      psychographics.values.push('Flexibility');
    }

    // Extract from interviews
    for (const interview of interviews) {
      if (interview.motivations) psychographics.motivations.push(...interview.motivations);
      if (interview.values) psychographics.values.push(...interview.values);
    }

    // Deduplicate and limit
    psychographics.motivations = [...new Set(psychographics.motivations)].slice(0, 5);
    psychographics.values = [...new Set(psychographics.values)].slice(0, 5);

    return psychographics;
  }

  /**
   * Analyze user behaviors
   */
  private analyzeBehaviors(userData: UserData[]): Behaviors {
    const behaviors: Behaviors = {
      usage_patterns: [],
      feature_preferences: [],
      interaction_style: '',
      learning_preference: ''
    };

    if (userData.length === 0) return behaviors;

    // Usage patterns
    const frequencies = userData.map(u => u.usage_frequency || 'medium');
    const freqCounts = this.countOccurrences(frequencies);
    behaviors.usage_patterns = Object.entries(freqCounts)
      .map(([freq, count]) => `${freq}: ${count} users`)
      .slice(0, 3);

    // Feature preferences
    const allFeatures = userData.flatMap(u => u.features_used || []);
    const featureCounts = this.countOccurrences(allFeatures);
    behaviors.feature_preferences = Object.entries(featureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feat]) => feat);

    // Interaction style
    if (behaviors.feature_preferences.length > 10) {
      behaviors.interaction_style = 'Exploratory - uses many features';
    } else {
      behaviors.interaction_style = 'Focused - uses core features';
    }

    return behaviors;
  }

  /**
   * Identify user needs and goals
   */
  private identifyNeeds(patterns: Patterns, interviews: InterviewInsight[]): NeedsAndGoals {
    const needs: NeedsAndGoals = {
      primary_goals: [],
      secondary_goals: [],
      functional_needs: [],
      emotional_needs: []
    };

    // Derive from usage patterns
    if ((patterns.usage_frequency['daily'] || 0) > 0) {
      needs.primary_goals.push('Complete tasks efficiently');
      needs.functional_needs.push('Speed and performance');
    }

    if ((patterns.contexts['work'] || 0) > 0) {
      needs.primary_goals.push('Professional productivity');
      needs.functional_needs.push('Integration with work tools');
    }

    // Common emotional needs
    needs.emotional_needs = [
      'Feel confident using the product',
      'Trust the system with data',
      'Feel supported when issues arise'
    ];

    // Extract from interviews
    for (const interview of interviews) {
      if (interview.goals) needs.primary_goals.push(...interview.goals.slice(0, 2));
      if (interview.needs) needs.functional_needs.push(...interview.needs.slice(0, 3));
    }

    return needs;
  }

  /**
   * Extract user frustrations
   */
  private extractFrustrations(patterns: Patterns, interviews: InterviewInsight[]): string[] {
    let frustrations: string[] = [];

    if (patterns.pain_points.length > 0) {
      const counts = this.countOccurrences(patterns.pain_points);
      frustrations = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pain]) => pain);
    }

    // Add default frustrations if not enough data
    if (frustrations.length < 3) {
      frustrations.push(
        'Slow loading times',
        'Confusing navigation',
        'Lack of mobile optimization'
      );
    }

    return frustrations.slice(0, 5);
  }

  /**
   * Generate usage scenarios
   */
  private generateScenarios(archetype: Archetype, patterns: Patterns): Scenario[] {
    const scenarioTemplates: Record<Archetype, Scenario[]> = {
      power_user: [{
        title: 'Bulk Processing',
        context: "Monday morning, needs to process week's data",
        goal: 'Complete batch operations quickly',
        steps: ['Import data', 'Apply bulk actions', 'Export results'],
        pain_points: ['No keyboard shortcuts', 'Slow processing']
      }],
      casual_user: [{
        title: 'Quick Task',
        context: 'Needs to complete single task',
        goal: 'Get in, complete task, get out',
        steps: ['Find feature', 'Complete task', 'Save/Exit'],
        pain_points: ["Can't find feature", 'Too many steps']
      }],
      business_user: [{
        title: 'Team Collaboration',
        context: 'Working with team on project',
        goal: 'Share and collaborate efficiently',
        steps: ['Create content', 'Share with team', 'Track feedback'],
        pain_points: ['No real-time collaboration', 'Poor permission management']
      }],
      mobile_first: [{
        title: 'On-the-Go Access',
        context: 'Commuting, needs quick access',
        goal: 'Complete task on mobile',
        steps: ['Open mobile app', 'Quick action', 'Sync with desktop'],
        pain_points: ['Feature parity issues', 'Poor mobile UX']
      }]
    };

    return scenarioTemplates[archetype];
  }

  /**
   * Select representative quote
   */
  private selectQuote(interviews: InterviewInsight[], archetype: Archetype): string {
    // Try to find a real quote
    for (const interview of interviews) {
      if (interview.quotes && interview.quotes.length > 0) {
        return interview.quotes[0];
      }
    }

    // Use archetype default
    return ARCHETYPE_TEMPLATES[archetype].quote;
  }

  /**
   * Calculate supporting data points
   */
  private calculateDataPoints(userData: UserData[]): DataPoints {
    return {
      sample_size: userData.length,
      confidence_level: userData.length > 50 ? 'High' : userData.length > 20 ? 'Medium' : 'Low',
      last_updated: 'Current',
      validation_method: 'Quantitative analysis + Qualitative interviews'
    };
  }

  /**
   * Derive design implications from persona
   */
  private deriveDesignImplications(patterns: Patterns): string[] {
    const implications: string[] = [];

    // Based on frequency
    if ((patterns.usage_frequency['daily'] || 0) > (patterns.usage_frequency['weekly'] || 0)) {
      implications.push('Optimize for speed and efficiency');
      implications.push('Provide keyboard shortcuts and power features');
    } else {
      implications.push('Focus on discoverability and guidance');
      implications.push('Simplify onboarding experience');
    }

    // Based on device
    if ((patterns.devices['mobile'] || 0) > 0) {
      implications.push('Mobile-first responsive design');
      implications.push('Touch-optimized interactions');
    }

    // Based on context
    if ((patterns.contexts['work'] || 0) > (patterns.contexts['personal'] || 0)) {
      implications.push('Professional visual design');
      implications.push('Enterprise features (SSO, audit logs)');
    }

    return implications.slice(0, 5);
  }

  /**
   * Format persona for display
   */
  formatPersonaOutput(persona: Persona): string {
    const lines: string[] = [];
    lines.push('='.repeat(60));
    lines.push(`PERSONA: ${persona.name}`);
    lines.push('='.repeat(60));
    lines.push(`\n📝 ${persona.tagline}\n`);

    lines.push(`Archetype: ${persona.archetype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
    lines.push(`Quote: "${persona.quote}"\n`);

    lines.push('👤 Demographics:');
    for (const [key, value] of Object.entries(persona.demographics)) {
      if (value) {
        lines.push(`  • ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}`);
      }
    }

    lines.push('\n🧠 Psychographics:');
    if (persona.psychographics.motivations.length > 0) {
      lines.push(`  Motivations: ${persona.psychographics.motivations.join(', ')}`);
    }
    if (persona.psychographics.values.length > 0) {
      lines.push(`  Values: ${persona.psychographics.values.join(', ')}`);
    }

    lines.push('\n🎯 Goals & Needs:');
    for (const goal of persona.needs_and_goals.primary_goals.slice(0, 3)) {
      lines.push(`  • ${goal}`);
    }

    lines.push('\n😤 Frustrations:');
    for (const frustration of persona.frustrations.slice(0, 3)) {
      lines.push(`  • ${frustration}`);
    }

    lines.push('\n📊 Behaviors:');
    for (const pref of persona.behaviors.feature_preferences.slice(0, 3)) {
      lines.push(`  • Frequently uses: ${pref}`);
    }

    lines.push('\n💡 Design Implications:');
    for (const implication of persona.design_implications) {
      lines.push(`  → ${implication}`);
    }

    lines.push(`\n📈 Data: Based on ${persona.data_points.sample_size} users`);
    lines.push(`    Confidence: ${persona.data_points.confidence_level}`);

    return lines.join('\n');
  }

  // Helper methods
  private mostFrequent<T>(arr: T[]): T {
    const counts = this.countOccurrences(arr);
    return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as T;
  }

  private countOccurrences<T>(arr: T[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of arr) {
      const key = String(item);
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }
}

/**
 * Create sample user data for testing
 */
function createSampleUserData(): UserData[] {
  return Array.from({ length: 30 }, (_, i) => ({
    user_id: `user_${i}`,
    age: 25 + (i % 30),
    usage_frequency: (['daily', 'weekly', 'monthly'] as const)[i % 3],
    features_used: ['dashboard', 'reports', 'settings', 'sharing', 'export'].slice(0, 3 + (i % 3)),
    primary_device: (['desktop', 'mobile', 'tablet'] as const)[i % 3],
    usage_context: (['work', 'personal'] as const)[i % 2],
    tech_proficiency: 3 + (i % 7),
    pain_points: ['slow loading', 'confusing UI', 'missing features'].slice(0, (i % 3) + 1)
  }));
}

/**
 * Main execution
 */
function main() {
  const generator = new PersonaGenerator();

  // Create sample data
  const userData = createSampleUserData();

  // Optional interview insights
  const interviewInsights: InterviewInsight[] = [
    {
      quotes: ["I need to see all my data in one place"],
      motivations: ['Efficiency', 'Control'],
      goals: ['Save time', 'Make better decisions']
    }
  ];

  // Generate persona
  const persona = generator.generatePersonaFromData(userData, interviewInsights);

  // Output
  const args = process.argv.slice(2);
  if (args.includes('--format=json') || args.includes('json')) {
    console.log(JSON.stringify(persona, null, 2));
  } else {
    console.log(generator.formatPersonaOutput(persona));
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { PersonaGenerator, UserData, Persona, InterviewInsight };
