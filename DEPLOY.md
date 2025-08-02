# Deployment på Laravel Forge 🚀

Denna guide visar hur du deployar Health Planner PWA på Laravel Forge som en Node.js-applikation.

## Förutsättningar

- Ett Laravel Forge-konto
- En server på Forge (Ubuntu 20.04+ rekommenderas)
- En domän som pekar på din server
- OpenAI API-nyckel

## Steg 1: Förbered servern

### 1.1 Skapa en ny site på Forge

1. Logga in på Laravel Forge
2. Välj din server
3. Klicka på "New Site"
4. Fyll i:
   - **Root Domain**: `din-domän.se`
   - **Project Type**: "Static HTML / Vue.js / React / ..."
   - **Web Directory**: `/public` (detta kommer vi ändra senare)

### 1.2 Installera Node.js

SSH till din server och installera Node.js 18+:

```bash
# Via Forge Server Management, kör dessa kommandon:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifiera installation
node --version
npm --version
```

## Steg 2: Konfigurera Git Repository

### 2.1 Anslut GitHub Repository

1. I Forge, gå till din site
2. Klicka på "Apps" tab
3. Klicka på "Install Repository"
4. Fyll i:
   - **Provider**: GitHub
   - **Repository**: `andreaskviby/health-planner`
   - **Branch**: `main`

### 2.2 Deployment Script

Ersätt det automatiskt genererade deployment scriptet med detta:

```bash
cd /home/forge/din-domän.se

# Stäng av maintenance mode om det är aktiverat
# (Inte nödvändigt för Node.js apps, men bra practice)

# Hämta senaste koden
git pull origin $FORGE_SITE_BRANCH

# Installera dependencies
npm ci --only=production

# Bygg applikationen
npm run build

# PM2 process management
# Stoppa tidigare process
pm2 stop health-planner 2>/dev/null || true

# Starta applikationen
pm2 start npm --name "health-planner" -- start

# Spara PM2 konfiguration
pm2 save

# Säkerställ att PM2 startar om vid server restart
pm2 startup
```

## Steg 3: Miljövariabler

### 3.1 Konfigurera Environment File

1. I Forge, gå till din site
2. Klicka på "Environment"
3. Lägg till dessa variabler:

```env
# OpenAI API Configuration
NEXT_PUBLIC_OPENAI_API_KEY=din-openai-api-nyckel-här

# Next.js Production Settings
NODE_ENV=production
PORT=3000

# Optional: Custom hostname
HOSTNAME=0.0.0.0
```

### 3.2 SSL och HTTPS

1. I Forge, gå till din site
2. Klicka på "SSL"
3. Välj "LetsEncrypt" för gratis SSL-certifikat
4. Aktivera "Force HTTPS"

## Steg 4: Nginx Konfiguration

### 4.1 Uppdatera Nginx Config

Ersätt standard Nginx-konfigurationen för din site:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name din-domän.se;
    root /home/forge/din-domän.se/public;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/din-domän.se/server.crt;
    ssl_certificate_key /etc/nginx/ssl/din-domän.se/server.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # PWA Headers för service worker
    add_header Cache-Control "public, max-age=0, must-revalidate" always;
    
    # Manifest och PWA filer
    location ~* \.(webmanifest|json)$ {
        add_header Cache-Control "public, max-age=604800";
        add_header Content-Type "application/manifest+json";
    }

    # Service Worker
    location /sw.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }

    # Static assets
    location /_next/static/ {
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    # API routes och dynamiskt innehåll
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support för utveckling (optional)
        proxy_set_header Connection "upgrade";
    }

    # Fallback för PWA routing
    location ~* ^.+\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        try_files $uri @nextjs;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location @nextjs {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    access_log /var/log/nginx/din-domän.se-access.log;
    error_log  /var/log/nginx/din-domän.se-error.log error;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name din-domän.se;
    return 301 https://$server_name$request_uri;
}
```

## Steg 5: Process Management

### 5.1 PM2 Setup

SSH till din server och konfigurera PM2:

```bash
# Installera PM2 globalt
sudo npm install -g pm2

# Navigera till app-directory
cd /home/forge/din-domän.se

# Skapa PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'health-planner',
    script: 'npm',
    args: 'start',
    cwd: '/home/forge/din-domän.se',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Starta med ecosystem config
pm2 start ecosystem.config.js

# Spara konfiguration
pm2 save

# Sätt upp auto-start vid server restart
pm2 startup

# Följa loggar
pm2 logs health-planner
```

## Steg 6: Deployment och Testing

### 6.1 Första Deployment

1. I Forge, klicka på "Deploy Now"
2. Vänta på att deployment är klart
3. Kontrollera att processen körs: `pm2 status`

### 6.2 Testa PWA-funktionalitet

1. Besök din domän i Chrome/Safari
2. Kontrollera att service worker registreras (DevTools → Application → Service Workers)
3. Testa "Add to Home Screen" funktionalitet
4. Verifiera offline-funktionalitet

### 6.3 Monitoring

```bash
# PM2 monitoring
pm2 monit

# Nginx access logs
tail -f /var/log/nginx/din-domän.se-access.log

# Application logs
pm2 logs health-planner --lines 100
```

## Steg 7: Automatiska Deployments

### 7.1 GitHub Webhooks

1. I Forge, gå till din site
2. Klicka på "Apps" → "Enable Quick Deploy"
3. Detta skapar en webhook som automatiskt deployar när du pushar till main-branchen

### 7.2 Deployment Notifications

Konfigurera Slack/Discord webhooks i Forge för deployment-notifikationer.

## Troubleshooting

### Vanliga problem och lösningar:

**Problem**: App startar inte
```bash
# Kontrollera PM2 status
pm2 status

# Kolla loggar
pm2 logs health-planner

# Restart process
pm2 restart health-planner
```

**Problem**: 502 Bad Gateway
- Kontrollera att Node.js process körs på port 3000
- Verifiera Nginx proxy_pass konfiguration

**Problem**: PWA installerar inte
- Kontrollera SSL-certifikat
- Verifiera manifest.json är tillgänglig
- Kolla service worker registrering

**Problem**: Environment variabler laddas inte
- Kontrollera .env konfiguration i Forge
- Restart PM2 process efter ändringar

## Prestanda och Säkerhet

### Prestanda-optimering:
- Använd CDN för statiska assets (CloudFlare)
- Implementera Redis för caching om nödvändigt
- Övervaka minnenanvändning med PM2

### Säkerhet:
- Håll Node.js och npm uppdaterade
- Använd endast HTTPS
- Implementera rate limiting om nödvändigt
- Regelbundna säkerhetsuppdateringar via Forge

## Support

För ytterligare hjälp:
- Laravel Forge dokumentation: https://forge.laravel.com/docs
- Next.js deployment guide: https://nextjs.org/docs/deployment
- PM2 dokumentation: https://pm2.keymetrics.io/docs/