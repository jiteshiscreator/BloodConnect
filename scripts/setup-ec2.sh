#!/bin/bash
# Run once on EC2 to set up the server.
# ssh -i bloodconnect.pem ec2-user@98.93.14.217 'bash -s' < scripts/setup-ec2.sh
set -e

echo "=== Installing Node.js 22 ==="
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs

echo "=== Installing PM2 and nginx ==="
sudo npm install -g pm2
sudo dnf install -y nginx

echo "=== Configuring nginx ==="
sudo tee /etc/nginx/conf.d/bloodconnect.conf > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    root /home/ec2-user/BloodConnect/client/dist;
    index index.html;

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx

echo "=== Setting up app directory ==="
mkdir -p ~/BloodConnect
chmod 711 /home/ec2-user

echo "=== Creating .env template ==="
if [ ! -f ~/BloodConnect/server/.env ]; then
  mkdir -p ~/BloodConnect/server
  cat > ~/BloodConnect/server/.env << 'ENV'
NODE_ENV=production
PORT=5000

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bloodproject?retryWrites=true&w=majority

JWT_ACCESS_SECRET=REPLACE_WITH_STRONG_SECRET_MIN_64_CHARS
JWT_REFRESH_SECRET=REPLACE_WITH_DIFFERENT_STRONG_SECRET
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Emergency Blood Connector <your-email@gmail.com>"

CLIENT_URL=http://98.93.14.217
COOKIE_SECURE=false
ENV
  echo ""
  echo "IMPORTANT: Edit ~/BloodConnect/server/.env with your real values before first deploy."
fi

echo "=== Configuring PM2 to restart on reboot ==="
pm2 startup | grep "sudo" | bash || true
pm2 save

echo ""
echo "Setup complete. Next steps:"
echo "  1. Edit ~/BloodConnect/server/.env with production values"
echo "  2. Add these secrets to your GitHub repo (Settings > Secrets > Actions):"
echo "       EC2_HOST = 98.93.14.217"
echo "       EC2_USER = ec2-user"
echo "       EC2_KEY  = (paste full contents of bloodconnect.pem)"
echo "  3. Push to main branch to trigger the first deploy"
