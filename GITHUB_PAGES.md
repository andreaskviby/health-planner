# Deployment på GitHub Pages 🚀

Denna guide visar hur du deployar Health Planner PWA på GitHub Pages.

## Automatisk deployment (Rekommenderad)

Health Planner är konfigurerad för automatisk deployment till GitHub Pages via GitHub Actions.

### Förutsättningar

- Ett GitHub-konto
- En fork eller klon av health-planner repository
- GitHub Pages aktiverat för ditt repository

### Steg 1: Aktivera GitHub Pages

1. Gå till ditt GitHub repository
2. Klicka på **Settings** (Inställningar)
3. Scrolla ner till **Pages** i vänstermenyn
4. Under **Source**, välj **GitHub Actions**

### Steg 2: Automatisk deployment

GitHub Actions workflow är redan konfigurerad. När du pushar till `main`-branchen:

1. Koden byggs automatiskt med Next.js static export
2. PWA-filer (service worker, manifest) konfigureras för GitHub Pages
3. Statiska filer deployar till GitHub Pages
4. Din app blir tillgänglig på: `https://ditt-användarnamn.github.io/health-planner/`

### Workflow-konfiguration

Workflow-filen finns i `.github/workflows/deploy.yml` och hanterar:

- ✅ Node.js 18 setup
- ✅ Beroenden installation
- ✅ Next.js build med static export
- ✅ PWA konfiguration för GitHub Pages
- ✅ Automatisk deployment till GitHub Pages

## Manuell deployment (För utvecklare)

Om du behöver bygga och deploya manuellt:

### Steg 1: Bygg för GitHub Pages

```bash
# Installera beroenden
npm install

# Bygg för GitHub Pages
npm run build:github
```

### Steg 2: Deploya manuellt

```bash
# Använde 'gh-pages' package för manuell deployment
npm install -g gh-pages

# Deploya out-mappen till gh-pages branch
gh-pages -d out -b gh-pages
```

## PWA-funktionalitet på GitHub Pages

Health Planner behåller full PWA-funktionalitet på GitHub Pages:

### ✅ Vad som fungerar:

- **Service Worker**: Offline-funktionalitet
- **App Manifest**: "Add to Home Screen"
- **Cachning**: Statiska assets cachas
- **Offline-mode**: App fungerar utan internetanslutning
- **Responsiv design**: Fungerar på alla enheter

### ⚠️ Begränsningar:

- **API-anrop**: OpenAI API kräver CORS-kompatibilitet
- **Bluetooth**: Kräver HTTPS (fungerar på GitHub Pages)
- **Lokalt lagring**: IndexedDB och localStorage fungerar
- **Backend**: Ingen server-side functionality (detta är avsiktligt för en PWA)

## Konfiguration

### Miljövariabler

För GitHub Pages deployment, sätt miljövariabler i GitHub repository:

1. Gå till **Settings** → **Secrets and variables** → **Actions**
2. Lägg till under **Variables**:

```
NEXT_PUBLIC_OPENAI_API_KEY=din-openai-api-nyckel
```

### Base Path

Applikationen konfigureras automatiskt med bas-sökvägen `/health-planner` för GitHub Pages.

## Troubleshooting

### Vanliga problem:

**Problem**: 404-fel vid navigering
- **Lösning**: GitHub Actions skapar automatiskt 404.html för SPA-routing

**Problem**: PWA installerar inte
- **Lösning**: Kontrollera att HTTPS är aktiverat (GitHub Pages använder HTTPS automatiskt)

**Problem**: Assets läser inte in
- **Lösning**: Kontrollera att base path är korrekt konfigurerad

**Problem**: Service Worker registrerar inte
- **Lösning**: Kontrollera att `.nojekyll` filen finns (skapas automatiskt)

### Debug GitHub Actions

Om deployment misslyckas:

1. Gå till **Actions** tab i ditt repository
2. Klicka på den misslyckade workflow-körningen
3. Expandera stegen för att se detaljerade loggar
4. Vanliga lösningar:
   - Kontrollera Node.js version (kräver 18+)
   - Verifiera package.json beroenden
   - Säkerställ att GitHub Pages är aktiverat

## Prestanda på GitHub Pages

GitHub Pages levererar excellent prestanda för PWA:

- **CDN**: Globalt distribuerat nätverk
- **HTTPS**: SSL-certifikat inkluderat
- **Caching**: Statiska assets cachas effektivt
- **Compression**: Gzip-komprimering aktiverad

## Domänanpassning (Valfritt)

För att använda en egen domän:

1. Lägg till en `CNAME` fil i `public/` mappen med din domän
2. Konfigurera DNS för din domän att peka på GitHub Pages
3. Aktivera "Enforce HTTPS" i GitHub Pages inställningar

Exempel CNAME fil:
```
din-domän.se
```

## Support

För ytterligare hjälp:
- GitHub Pages dokumentation: https://docs.github.com/en/pages
- Next.js static export: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- GitHub Actions: https://docs.github.com/en/actions