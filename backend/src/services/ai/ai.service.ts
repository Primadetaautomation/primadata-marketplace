import OpenAI from 'openai';
import { AISummary, OutreachMessage, LinkedInProfile, CampaignCriteria } from '../../types';
import { logger } from '../../utils/logger';

export class AIService {
  private openai: OpenAI | null = null;
  private anthropic: any = null; // TODO: Add Anthropic SDK when needed

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      logger.warn('OpenAI API key not configured');
    }

    // TODO: Initialize Anthropic client when SDK is added
    if (process.env.ANTHROPIC_API_KEY) {
      logger.info('Anthropic API key configured');
    }
  }

  async scoreCandidateForCampaign(
    profile: LinkedInProfile,
    campaignCriteria: CampaignCriteria,
    campaignPrompt?: string
  ): Promise<AISummary> {
    if (!this.openai) {
      throw new Error('AI service not configured');
    }

    try {
      const systemPrompt = `Je bent een expert recruiter die kandidaten beoordeelt voor specifieke campagnes.
Beoordeel de kandidaat op basis van de gegeven criteria en geef een match score van 0-100.
Wees kritisch maar eerlijk. Geef concrete redenen voor je score.`;

      const userPrompt = `
Beoordeel deze kandidaat:

**Profiel:**
- Naam: ${profile.fullName}
- Huidige functie: ${profile.currentTitle || 'Onbekend'}
- Bedrijf: ${profile.currentCompany || 'Onbekend'}
- Headline: ${profile.headline || 'Geen'}
- Locatie: ${profile.location || 'Onbekend'}
- Over: ${profile.about || 'Geen beschrijving'}
- Skills: ${profile.skills?.join(', ') || 'Geen skills vermeld'}

**Ervaring:**
${profile.experience?.map(exp => `- ${exp.title} bij ${exp.company} (${exp.duration || 'Onbekend'})`).join('\n') || 'Geen ervaring vermeld'}

**Campagne Criteria:**
- Gewenste skills: ${campaignCriteria.skills?.join(', ') || 'Alle skills'}
- Gewenste functies: ${campaignCriteria.titles?.join(', ') || 'Alle functies'}
- Gewenste bedrijven: ${campaignCriteria.companies?.join(', ') || 'Alle bedrijven'}
- Gewenste locaties: ${campaignCriteria.locations?.join(', ') || 'Alle locaties'}
- Min ervaring: ${campaignCriteria.minExperience || 0} jaar

${campaignPrompt ? `\n**Aanvullende instructies:** ${campaignPrompt}` : ''}

Geef je antwoord in het volgende JSON formaat:
{
  "matchScore": <0-100>,
  "bullets": ["<bullet 1>", "<bullet 2>", "<bullet 3>"],
  "reasoning": "<uitgebreide redenering>",
  "coreSkills": ["<skill 1>", "<skill 2>"],
  "recommendations": ["<aanbeveling 1>", "<aanbeveling 2>"]
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');

      return {
        matchScore: Math.min(100, Math.max(0, result.matchScore || 0)),
        bullets: result.bullets || [],
        reasoning: result.reasoning || '',
        coreSkills: result.coreSkills || [],
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      logger.error('AI scoring error:', error);
      throw error;
    }
  }

  async generateOutreachEmail(
    profile: LinkedInProfile,
    campaignName: string,
    aiSummary: AISummary,
    customPrompt?: string
  ): Promise<OutreachMessage> {
    if (!this.openai) {
      throw new Error('AI service not configured');
    }

    try {
      const systemPrompt = `Je bent een expert recruitment consultant die persoonlijke, authentieke outreach e-mails schrijft.
Je schrijft in het Nederlands, tenzij anders gevraagd.
Je e-mails zijn:
- 150-170 woorden lang
- Persoonlijk en authentiek (geen standaard templates)
- Professioneel maar toegankelijk
- Gericht op het starten van een gesprek
- Eindigend met 1 concrete vraag die een reactie uitlokt
- GEEN gebruik van overdreven superlatieven of buzzwords
- GEEN lange opsommingen van bedrijfsvoordelen`;

      const userPrompt = `
Schrijf een persoonlijke outreach e-mail voor deze kandidaat:

**Kandidaat:**
- Naam: ${profile.firstName || profile.fullName}
- Functie: ${profile.currentTitle}
- Bedrijf: ${profile.currentCompany}
- Achtergrond: ${aiSummary.bullets.join(', ')}
- Core skills: ${aiSummary.coreSkills.join(', ')}

**Campagne:** ${campaignName}

${customPrompt ? `**Specifieke instructies:** ${customPrompt}` : ''}

**Match score:** ${aiSummary.matchScore}/100
**Waarom interessant:** ${aiSummary.reasoning}

Schrijf een e-mail die:
1. Direct persoonlijk aanvoelt (refereer naar iets specifieks uit hun profiel)
2. Duidelijk maakt waarom je contact opneemt
3. De waarde voor hen benadrukt (niet voor jou/het bedrijf)
4. Eindigt met één concrete vraag

Geef je antwoord in het volgende JSON formaat:
{
  "subject": "<onderwerpregel>",
  "body": "<e-mail body>",
  "personalizedElements": ["<element 1>", "<element 2>"]
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');

      return {
        subject: result.subject || 'Interessante mogelijkheid voor jou',
        body: result.body || '',
        personalizedElements: result.personalizedElements || [],
      };
    } catch (error) {
      logger.error('AI email generation error:', error);
      throw error;
    }
  }

  async generateFollowUpEmail(
    profile: LinkedInProfile,
    previousMessage: string,
    followUpNumber: number,
    replied: boolean = false
  ): Promise<OutreachMessage> {
    if (!this.openai) {
      throw new Error('AI service not configured');
    }

    try {
      const systemPrompt = `Je bent een expert recruitment consultant die tactvolle follow-up e-mails schrijft.
Je schrijft in het Nederlands, kort en respectvol.
Follow-ups zijn:
- Maximaal 80 woorden
- Vriendelijk maar niet opdringerig
- Gericht op waarde toevoegen
- Respectvol voor hun tijd`;

      const userPrompt = `
Schrijf follow-up e-mail #${followUpNumber} voor:

**Kandidaat:** ${profile.firstName || profile.fullName}
**Functie:** ${profile.currentTitle}

**Vorige bericht:**
${previousMessage}

${replied ? '**Ze hebben gereageerd maar nog geen duidelijk antwoord gegeven**' : '**Ze hebben nog niet gereageerd**'}

Schrijf een follow-up die:
1. Kort en to-the-point is
2. Nieuwe informatie of waarde toevoegt
3. Respectvol is voor hun tijd
4. ${followUpNumber >= 3 ? 'Dit is de laatste poging maakt duidelijk' : 'Vriendelijk herinnert zonder opdringerig te zijn'}

Geef je antwoord in het volgende JSON formaat:
{
  "subject": "Re: <oorspronkelijke onderwerpregel>",
  "body": "<e-mail body>",
  "personalizedElements": ["<element 1>"]
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');

      return {
        subject: result.subject || 'Re: Interessante mogelijkheid',
        body: result.body || '',
        personalizedElements: result.personalizedElements || [],
      };
    } catch (error) {
      logger.error('AI follow-up generation error:', error);
      throw error;
    }
  }

  async extractStructuredData(text: string, schema: any): Promise<any> {
    if (!this.openai) {
      throw new Error('AI service not configured');
    }

    try {
      const systemPrompt = `Je bent een expert in het extraheren van gestructureerde data uit tekst.
Extraheer alleen informatie die expliciet in de tekst staat.
Vul geen informatie in die je niet zeker weet.`;

      const userPrompt = `
Extraheer de volgende informatie uit deze tekst:

**Tekst:**
${text}

**Gewenst schema:**
${JSON.stringify(schema, null, 2)}

Geef je antwoord in JSON formaat volgens het opgegeven schema.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      logger.error('AI extraction error:', error);
      throw error;
    }
  }

  async improveEmailSubject(subject: string, profile: LinkedInProfile): Promise<string> {
    if (!this.openai) {
      return subject; // Return original if AI not configured
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Verbeter e-mail onderwerpregels. Maak ze persoonlijk, intrigerend en max 50 karakters. Geen clickbait.',
          },
          {
            role: 'user',
            content: `Verbeter deze onderwerpregel voor ${profile.firstName}: "${subject}"`,
          },
        ],
        temperature: 0.8,
        max_tokens: 50,
      });

      return completion.choices[0].message.content || subject;
    } catch (error) {
      logger.error('AI subject improvement error:', error);
      return subject;
    }
  }

  async detectLanguage(text: string): Promise<string> {
    if (!this.openai) {
      return 'nl'; // Default to Dutch
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Detect the language of the text. Return only the ISO 639-1 language code (e.g., "en", "nl", "de").',
          },
          {
            role: 'user',
            content: text.substring(0, 500), // Use first 500 chars
          },
        ],
        temperature: 0,
        max_tokens: 10,
      });

      return completion.choices[0].message.content?.toLowerCase() || 'nl';
    } catch (error) {
      logger.error('Language detection error:', error);
      return 'nl';
    }
  }
}

export default new AIService();