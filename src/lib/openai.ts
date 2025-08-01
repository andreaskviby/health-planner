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

export async function generateRecipes(foodLists: { yes: string[]; no: string[]; sometimes: string[] }): Promise<string[]> {
  const openai = getOpenAIClient();
  const prompt = `
Baserat på dessa matpreferenser, skapa 5 hälsosamma recept på svenska:

JA-lista (älskar dessa): ${foodLists.yes.join(', ')}
NEJ-lista (undviker dessa): ${foodLists.no.join(', ')}
IBLAND-lista (äter ibland): ${foodLists.sometimes.join(', ')}

Skapa recept som:
- Använder ingredienser från JA-listan
- Helt undviker NEJ-listan
- Kan inkludera IBLAND-listan i måttliga mängder
- Är hälsosamma och näringsrika
- Tar max 30 minuter att tillaga

Format: 
Recept 1: [Namn] - [Kort beskrivning och tillagningssteg]
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du är en kockexpert som skapar hälsosamma recept baserat på matpreferenser."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8,
    });

    const recipesText = completion.choices[0]?.message?.content || "";
    return recipesText.split('\n').filter(line => line.trim().startsWith('Recept')).map(line => line.trim());
  } catch (error) {
    console.error('Error generating recipes:', error);
    return ["Kunde inte generera recept. Försök igen senare."];
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