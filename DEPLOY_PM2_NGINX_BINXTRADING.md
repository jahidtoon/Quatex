# Production Deployment: PM2 + Nginx (binxtrading.com)

This guide deploys the Quatex Next.js app behind Nginx using PM2 on port 3006.

- App name: `quatex-ui`
- Port: `3006` (configurable via `PORT`)
- Domain: `binxtrading.com` (+ optional `www`)

## 1) Server prerequisites

- Ubuntu 22.04+ recommended
- A records for `binxtrading.com` (and `www`) point to this server
- Node.js 18+ and PM2 installed

Install Node + PM2 (via NVM):

```bash
# Install NVM
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
# Install Node LTS
nvm install --lts
node -v
npm -v
# Install PM2
npm i -g pm2
pm2 -v
```

Install Nginx + Certbot:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo ufw allow 'Nginx Full' || true
```

## 2) Get the code on the server

```bash
# Example path (adjust as you like)
sudo mkdir -p /var/www/quatex
sudo chown -R $USER:$USER /var/www/quatex
cd /var/www/quatex

# Option A: clone from Git
# git clone <YOUR_REPO_URL> .

# Option B: upload files via SCP/SFTP and extract here
```

## 3) Environment variables

Create `.env.production` (or `.env`) in the project root.

Minimum recommended:

```bash
# Required for JWT auth
JWT_SECRET="generate-a-strong-random-secret"

# Prisma (SQLite). Use an absolute path to keep DB file stable
# Example stores DB under project dir
DATABASE_URL="file:./prod.db"

# Public site URL
NEXT_PUBLIC_SITE_URL="https://binxtrading.com"

# Optional RPCs (enable real deposit detection per network)
# RPC_ETH="https://mainnet.infura.io/v3/<key>"
# RPC_BSC="https://bsc-dataseed.binance.org/"
# RPC_TRON="https://api.trongrid.io"

# Optional: run demo simulation in watcher
WATCHER_SIMULATE=0
```

Note: If you change port, update `PORT` in PM2 (ecosystem file) or set it in the environment.

## 4) Install, build, and prepare DB

```bash
cd /var/www/quatex
npm ci
npm run prisma:generate
# For production use deploy (don’t create dev migrations on the server)
npx prisma migrate deploy
# Optional sample data
# npm run prisma:seed
npm run build
```

## 5) Start with PM2

Ensure logs directory exists:

```bash
mkdir -p ./logs
```

Start apps from `ecosystem.config.js` (already set to port 3006):

```bash
pm2 start ecosystem.config.js
pm2 status
# Persist across reboots
pm2 save
pm2 startup systemd -u $USER --hp $HOME
```

If you update environment vars later:

```bash
pm2 reload quatex-ui --update-env
pm2 reload quatex-deposit-watcher --update-env
```

Logs:

```bash
pm2 logs quatex-ui --lines 200
pm2 logs quatex-deposit-watcher --lines 200
```

## 6) Nginx reverse proxy for binxtrading.com

Create site config (HTTP only first; Certbot will add HTTPS automatically):

```bash
sudo tee /etc/nginx/sites-available/binxtrading.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name binxtrading.com www.binxtrading.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Temporary HTTP proxy until SSL is issued
    location / {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 75s;
        proxy_send_timeout 75s;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/binxtrading.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 7) Issue SSL with Certbot

```bash
sudo certbot --nginx -d binxtrading.com -d www.binxtrading.com --redirect --non-interactive --agree-tos -m your-email@example.com
# Test auto renewal
sudo certbot renew --dry-run
```

## 8) Admin user (optional)

```bash
# Create an admin account
npm run create:admin -- admin@binxtrading.com SuperSecurePass123
```

## 9) Troubleshooting

- App not reachable: `pm2 logs quatex-ui` and `sudo journalctl -u nginx -n 100 -e`
- 502/504 from Nginx: ensure PM2 app is online on 127.0.0.1:3006
- DB path errors: set absolute `DATABASE_URL` (e.g., `file:/var/www/quatex/prod.db`)
- JWT issues: set `JWT_SECRET` in environment and reload PM2 with `--update-env`

---

Deployed apps via PM2:
- `quatex-ui` (Next.js server on 3006)
- `quatex-deposit-watcher` (background job)

```bash
pm2 restart quatex-ui
pm2 restart quatex-deposit-watcher
```