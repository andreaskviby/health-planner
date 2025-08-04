// lib/openai.ts
import OpenAI from 'openai';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.');
  }
  
  return new OpenAI({
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
  const openai = getOpenAIClient();
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du är en professionell hälsocoach som skapar personliga, motiverande hälsoplaner på svenska."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Kunde inte generera hälsoplan. Försök igen senare.";
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
  const openai = getOpenAIClient();
  
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du är en professionell kock som skapar strukturerade recept på svenska. Svara alltid med giltig JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "";
    
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
  const openai = getOpenAIClient();
  const prompt = `
Som en personlig hälsocoach, ge en kort motiverande kommentar (max 100 ord) baserat på dagens incheckning:

Humör: ${checkInData.mood}/10
Energi: ${checkInData.energy}/10
Anteckningar: ${checkInData.notes}

Svara på svenska med en uppmuntrande, personlig ton som känns äkta och hjälpsam.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du är en varm, uppmuntrande hälsocoach som ger korta, personliga motiverande meddelanden på svenska."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || "Bra jobbat idag! Fortsätt så här! 💪";
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
  const openai = getOpenAIClient();
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
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du är en professionell personlig tränare som skapar skräddarsydda aktivitetsförslag på svenska. Svara alltid med giltig JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content || "";
    
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