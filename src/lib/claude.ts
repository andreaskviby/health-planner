// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';

function getClaudeClient(): Anthropic {
  const apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('Claude API key is not configured. Please add NEXT_PUBLIC_CLAUDE_API_KEY to your environment variables.');
  }
  
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true, // Only for client-side usage in PWA
  });
}

export interface HealthPlanInput {
  userProfile: {
    name: string;
    currentWeight: number;
    targetWeight: number;
    height: number;
    age: number;
    goals: string[];
    lifestyle: string[];
  };
  partnerProfile?: {
    name: string;
    goals: string[];
    lifestyle: string[];
  };
}

export async function generateHealthPlan(input: HealthPlanInput): Promise<string> {
  const anthropic = getClaudeClient();
  const prompt = `
Som en professionell hälsocoach, skapa en personlig hälsoplan för ${input.userProfile.name}.

Personuppgifter:
- Ålder: ${input.userProfile.age}
- Nuvarande vikt: ${input.userProfile.currentWeight} kg
- Målvikt: ${input.userProfile.targetWeight} kg
- Längd: ${input.userProfile.height} cm
- Mål: ${input.userProfile.goals.join(', ')}
- Livsstil: ${input.userProfile.lifestyle.join(', ')}

${input.partnerProfile ? `
Partner: ${input.partnerProfile.name}
Partnerns mål: ${input.partnerProfile.goals.join(', ')}
Partnerns livsstil: ${input.partnerProfile.lifestyle.join(', ')}

Skapa en plan som båda kan följa tillsammans.
` : ''}

Skapa en detaljerad, motiverande och realistisk hälsoplan på svenska. Inkludera:
1. Övergripande strategi
2. Näringsråd
3. Träningsplan
4. Livsstilsförändringar
5. Veckoschema
6. Motiverande ord

Håll en positiv, uppmuntrande ton och fokusera på hållbara förändringar.
`;

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return completion.content[0]?.type === 'text' ? 
      completion.content[0].text : 
      "Kunde inte generera hälsoplan. Försök igen senare.";
  } catch (error) {
    console.error('Error generating health plan:', error);
    throw new Error('Kunde inte generera hälsoplan. Kontrollera din API-nyckel och försök igen.');
  }
}

export interface RecipeGenerationInput {
  type: 'from-preferences' | 'from-link';
  userPreferences?: { yes: string[]; no: string[]; sometimes: string[] };
  url?: string;
  userName?: string;
}

export interface RecipeData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: string;
}

export async function generateRecipe(input: RecipeGenerationInput): Promise<RecipeData> {
  const anthropic = getClaudeClient();
  
  let prompt = '';
  
  if (input.type === 'from-preferences' && input.userPreferences) {
    prompt = `
Skapa ett hälsosamt recept på svenska baserat på dessa matpreferenser:

JA-lista (älskar dessa): ${input.userPreferences.yes.join(', ')}
NEJ-lista (undviker dessa): ${input.userPreferences.no.join(', ')}
IBLAND-lista (äter ibland): ${input.userPreferences.sometimes.join(', ')}

Skapa ett recept som:
- Använder ingredienser från JA-listan som bas
- Helt undviker NEJ-listan
- Kan inkludera IBLAND-listan sparsamt
- Är hälsosamt och näringsrikt
- Tar max 45 minuter att tillaga
- Ger 2-4 portioner

Svara i detta exakta JSON-format:
{
  "title": "Receptets namn",
  "description": "Kort beskrivning av rätten",
  "ingredients": ["ingrediens 1", "ingrediens 2", ...],
  "instructions": ["steg 1", "steg 2", ...],
  "cookingTime": "X min",
  "servings": "X"
}`;
  } else if (input.type === 'from-link' && input.url) {
    prompt = `
Analysera denna receptlänk och formatera informationen: ${input.url}

Skapa ett strukturerat recept baserat på länken. Om du inte kan komma åt länken, skapa ett hälsosamt recept baserat på vad URL:en antyder.

Svara i detta exakta JSON-format:
{
  "title": "Receptets namn",
  "description": "Kort beskrivning av rätten",
  "ingredients": ["ingrediens med mängd", "ingrediens med mängd", ...],
  "instructions": ["detaljerat steg 1", "detaljerat steg 2", ...],
  "cookingTime": "X min",
  "servings": "X"
}`;
  }

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const response = completion.content[0]?.type === 'text' ? completion.content[0].text : "";
    
    try {
      // Try to parse JSON response
      const recipeData = JSON.parse(response);
      return {
        title: recipeData.title || 'Nytt recept',
        description: recipeData.description || '',
        ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        cookingTime: recipeData.cookingTime || '',
        servings: recipeData.servings || '2'
      };
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.error('Failed to parse recipe JSON:', parseError);
      return {
        title: input.type === 'from-link' ? 'Recept från länk' : 'AI-genererat recept',
        description: 'Ett hälsosamt recept skapat speciellt för dig.',
        ingredients: ['Kunde inte hämta ingredienser. Försök igen.'],
        instructions: ['Kunde inte hämta instruktioner. Försök igen.'],
        cookingTime: '30 min',
        servings: '2'
      };
    }
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw new Error('Kunde inte generera recept. Kontrollera din API-nyckel och försök igen.');
  }
}

export async function generateMotivationalMessage(checkInData: { mood: number; energy: number; notes: string }): Promise<string> {
  const anthropic = getClaudeClient();
  const prompt = `
Som en personlig hälsocoach, ge en kort motiverande kommentar (max 100 ord) baserat på dagens incheckning:

Humör: ${checkInData.mood}/10
Energi: ${checkInData.energy}/10
Anteckningar: ${checkInData.notes}

Svara på svenska med en uppmuntrande, personlig ton som känns äkta och hjälpsam.
`;

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return completion.content[0]?.type === 'text' ? 
      completion.content[0].text : 
      "Bra jobbat idag! Fortsätt så här! 💪";
  } catch (error) {
    console.error('Error generating motivational message:', error);
    return "Bra jobbat idag! Fortsätt så här! 💪";
  }
}

export interface ActivitySuggestionInput {
  userProfile: {
    name: string;
    goals: string[];
    lifestyle: string[];
    age: number;
  };
  existingActivities: string[];
}

export interface ActivitySuggestion {
  name: string;
  description: string;
  duration: string;
  difficulty: 'Lätt' | 'Medel' | 'Svår';
  category: 'Kondition' | 'Styrka' | 'Flexibilitet' | 'Balans' | 'Mental hälsa' | 'Utomhus' | 'Grupp';
}

export async function generateActivitySuggestions(input: ActivitySuggestionInput): Promise<ActivitySuggestion[]> {
  const anthropic = getClaudeClient();
  const prompt = `
Som en personlig tränare och hälsocoach, föreslå 5 aktiviteter för ${input.userProfile.name} baserat på:

Ålder: ${input.userProfile.age}
Mål: ${input.userProfile.goals.join(', ')}
Livsstil: ${input.userProfile.lifestyle.join(', ')}

Befintliga aktiviteter (undvik dessa): ${input.existingActivities.join(', ')}

Skapa aktiviteter som:
- Passar personens mål och livsstil
- Är varierade och roliga
- Har olika svårighetsgrader
- Täcker olika kategorier (kondition, styrka, flexibilitet, etc.)
- Är realistiska och genomförbara

Svara i detta exakta JSON-format:
[
  {
    "name": "Aktivitetsnamn",
    "description": "Detaljerad beskrivning av aktiviteten och dess fördelar",
    "duration": "X min",
    "difficulty": "Lätt|Medel|Svår",
    "category": "Kondition|Styrka|Flexibilitet|Balans|Mental hälsa|Utomhus|Grupp"
  }
]`;

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const response = completion.content[0]?.type === 'text' ? completion.content[0].text : "";
    
    try {
      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (parseError) {
      console.error('Failed to parse activity suggestions JSON:', parseError);
      // Fallback suggestions
      return [
        {
          name: "Daglig promenad",
          description: "En lugn promenad som förbättrar kondition och mental hälsa samtidigt som den är lätt att genomföra.",
          duration: "30 min",
          difficulty: "Lätt" as const,
          category: "Kondition" as const
        },
        {
          name: "Hemmagym med kroppsvikt",
          description: "Enkla styrkeövningar hemma utan utrustning som bygger muskler och förbättrar kroppshållning.",
          duration: "20 min",
          difficulty: "Medel" as const,
          category: "Styrka" as const
        }
      ];
    }
  } catch (error) {
    console.error('Error generating activity suggestions:', error);
    throw new Error('Kunde inte generera aktivitetsförslag. Kontrollera din API-nyckel och försök igen.');
  }
}

export interface AdvancedHealthPlanInput {
  userProfile: {
    name: string;
    currentWeight: number;
    targetWeight: number;
    height: number;
    age: number;
    goals: string[];
    lifestyle: string[];
  };
  startDate: Date;
  weeksCount: number;
  basePlan: string;
}

export interface WeeklySchedule {
  week: number;
  startDate: Date;
  focus: string;
  goals: string[];
  exercises: string[];
  nutrition: string[];
  tips: string;
}

export async function generateAdvancedHealthPlan(input: AdvancedHealthPlanInput): Promise<WeeklySchedule[]> {
  const anthropic = getClaudeClient();
  const prompt = `
Som en professionell hälsocoach, skapa ett detaljerat ${input.weeksCount}-veckors schema för ${input.userProfile.name}.

Personuppgifter:
- Ålder: ${input.userProfile.age}
- Nuvarande vikt: ${input.userProfile.currentWeight} kg
- Målvikt: ${input.userProfile.targetWeight} kg
- Längd: ${input.userProfile.height} cm
- Mål: ${input.userProfile.goals.join(', ')}
- Livsstil: ${input.userProfile.lifestyle.join(', ')}
- Startdatum: ${input.startDate.toLocaleDateString('sv-SE')}

Baserad på denna hälsoplan:
${input.basePlan.substring(0, 500)}...

Skapa ett progressivt schema där varje vecka bygger på den föregående. Varje vecka ska ha:
- Ett specifikt fokusområde
- Konkreta mål
- Träningsaktiviteter (3-5 per vecka)
- Näringsråd
- Motiverande tips

Svara i detta exakta JSON-format:
[
  {
    "week": 1,
    "focus": "Veckoans fokusområde",
    "goals": ["mål 1", "mål 2", "mål 3"],
    "exercises": ["träning 1", "träning 2", "träning 3"],
    "nutrition": ["kost 1", "kost 2", "kost 3"],
    "tips": "Motiverande tips för veckan"
  }
]

Gör schemat realistiskt och hållbart på svenska.`;

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const response = completion.content[0]?.type === 'text' ? completion.content[0].text : "";
    
    try {
      const schedule = JSON.parse(response);
      if (Array.isArray(schedule)) {
        return schedule.map((week, index) => ({
          ...week,
          startDate: new Date(input.startDate.getTime() + (index * 7 * 24 * 60 * 60 * 1000))
        }));
      }
      return [];
    } catch (parseError) {
      console.error('Failed to parse weekly schedule JSON:', parseError);
      // Fallback schedule
      return Array.from({ length: Math.min(input.weeksCount, 4) }, (_, index) => ({
        week: index + 1,
        startDate: new Date(input.startDate.getTime() + (index * 7 * 24 * 60 * 60 * 1000)),
        focus: index === 0 ? "Grundläggande rutiner" : index === 1 ? "Öka intensiteten" : index === 2 ? "Bygga styrka" : "Bibehålla momentum",
        goals: [`Vecka ${index + 1} mål 1`, `Vecka ${index + 1} mål 2`],
        exercises: [`Träning ${index + 1}A`, `Träning ${index + 1}B`],
        nutrition: [`Kost ${index + 1}A`, `Kost ${index + 1}B`],
        tips: `Tips för vecka ${index + 1}: Fokusera på att bygga hälsosamma vanor.`
      }));
    }
  } catch (error) {
    console.error('Error generating advanced health plan:', error);
    throw new Error('Kunde inte generera veckoschema. Kontrollera din API-nyckel och försök igen.');
  }
}