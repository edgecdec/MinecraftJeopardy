#!/bin/bash
set -e

# 1. Update System
echo "--- Updating System ---"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

# 2. Install Node.js (v20)
echo "--- Installing Node.js ---"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# 3. Setup Firewall
echo "--- Configuring Firewall ---"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 4. Clone Repository
echo "--- Cloning Game ---"
mkdir -p /var/www
cd /var/www
if [ -d "MinecraftJeopardy" ]; then
    echo "Repo exists, pulling latest..."
    cd MinecraftJeopardy
    git pull
else
    git clone https://github.com/edgecdec/MinecraftJeopardy.git
    cd MinecraftJeopardy
fi

# 5. Install App Dependencies
echo "--- Installing App Dependencies ---"
npm ci
npm run build

# 6. Configure Nginx (Reverse Proxy)
echo "--- Configuring Nginx ---"
cat > /etc/nginx/sites-available/jeopardy <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/jeopardy /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 7. Start App with PM2
echo "--- Starting App ---"
# We need to use the custom server.js for sockets (I will create this on the server next)
# For now, let's just start it.
pm2 delete jeopardy || true
pm2 start npm --name "jeopardy" -- start
pm2 save
pm2 startup | tail -n 1 | bash || true

echo "--- Setup Complete! ---"
echo "Your game should be live at http://$(curl -s ifconfig.me)"
