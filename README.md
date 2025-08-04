# Health Planner for Couples 💕

En modern PWA (Progressive Web App) för par som vill förbättra sin hälsa tillsammans med hjälp av AI-coaching och Bluetooth-synkning.

[![Deploy to GitHub Pages](https://github.com/andreaskviby/health-planner/actions/workflows/deploy.yml/badge.svg)](https://github.com/andreaskviby/health-planner/actions/workflows/deploy.yml)

## Live Demo 🌐

**GitHub Pages**: [https://andreaskviby.github.io/health-planner/](https://andreaskviby.github.io/health-planner/)

Appen kan installeras som PWA direkt från webbläsaren och fungerar offline!

## Funktioner ✨

- **AI-driven hälsoplaner**: Personliga hälsoplaner genererade av OpenAI GPT-4
- **Par-funktionalitet**: Synka data via Bluetooth i "kramar mode"
- **Offline-först**: Fungerar helt offline tack vare PWA-teknik
- **Dagliga check-ins**: Spåra humör, energi och framsteg
- **Matlistor**: Skapa ja/nej/ibland-listor för bättre receptförslag
- **AI-recept**: Få receptförslag baserat på dina matpreferenser
- **Digital coach**: Motiverande meddelanden från AI
- **Modern design**: Kaxig och responsiv design med Tailwind CSS

## Teknikstack 🚀

- **Next.js 15** - React framework för optimal prestanda
- **TypeScript** - Typsäkerhet
- **Tailwind CSS** - Modern styling
- **PWA** - Offline-funktionalitet med service workers
- **IndexedDB** - Lokal datalagring
- **Web Bluetooth API** - Partner-synkning
- **OpenAI API** - AI-coaching och recept

## Deployment 🚀

### GitHub Pages (Rekommenderad)

Health Planner kan enkelt hostas på GitHub Pages **kostnadsfritt**:

1. **Förka repository** på GitHub
2. **Aktivera GitHub Pages** i repository settings → Pages → Source: "GitHub Actions"
3. **Pushar till main-branchen** triggar automatisk deployment
4. **Din app är live** på `https://ditt-användarnamn.github.io/health-planner/`

**Full PWA-funktionalitet bevaras**: offline-mode, "Add to Home Screen", push-notifikationer.

📖 **Detaljerad guide**: [GITHUB_PAGES.md](GITHUB_PAGES.md)

### Lokal utveckling

1. Klona repositoryt
```bash
git clone https://github.com/andreaskviby/health-planner.git
cd health-planner
```

2. Installera beroenden
```bash
npm install
```

3. Kopiera miljövariabler
```bash
cp .env.example .env.local
```

4. Lägg till din OpenAI API-nyckel i `.env.local`
```
NEXT_PUBLIC_OPENAI_API_KEY=din-openai-api-nyckel
```

5. Starta utvecklingsservern
```bash
npm run dev
```

6. Bygg för produktion
```bash
npm run build
```

### Andra deployment-alternativ

- **Laravel Forge**: Se [DEPLOY.md](DEPLOY.md) för detaljerad guide
- **Vercel/Netlify**: Standard Next.js deployment
- **Docker**: Containeriserad deployment

## Användning 🎯

1. **Första gången**: Fyll i din profil med mål och livsstil
2. **Dagliga check-ins**: Registrera humör, energi och aktiviteter
3. **Hälsoplan**: Låt AI skapa en personlig hälsoplan
4. **Matlistor**: Skapa dina mat-preferenser för bättre AI-recept
5. **Partner-synkning**: Aktivera "kramar mode" för att synka med din partner via Bluetooth

## PWA-installation 📱

Appen kan installeras som en PWA på mobila enheter och datorer för en app-liknande upplevelse:

1. Öppna webbsidan i Chrome/Safari
2. Klicka på "Lägg till på startskärm" eller "Installera"
3. Använd som en vanlig app med offline-funktionalitet

## Bluetooth-synkning 💕

"Kramar mode" använder Web Bluetooth API för att synka data mellan partners:

1. Båda partners aktiverar "kramar mode"
2. Håll enheterna nära varandra
3. Data synkas säkert mellan enheterna
4. Fungerar helt lokalt utan externa servrar

## Utveckling 🛠️

```bash
# Utvecklingsserver
npm run dev

# Bygg för produktion
npm run build

# Linting
npm run lint

# Typ-kontroll
npx tsc --noEmit
```

## Licens 📄

MIT License - se LICENSE-filen för detaljer.

## Bidrag 🤝

Bidrag är välkomna! Skapa gärna en issue eller pull request.

---

Byggd med ❤️ för par som vill förbättra sin hälsa tillsammans.
