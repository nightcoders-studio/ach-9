# PM2 Deployment Guide - Mitabut API

## Prerequisites

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

### 3. Setup Database
```bash
# Create database and tables
mysql -u root -p < skemadebe.sql

# Seed test users
npm run seed
```

### 4. Start with PM2

```bash
# Start the application
pm2 start src/index.js --name mitabut-api

# Or with ecosystem file (recommended)
pm2 start ecosystem.config.js
```

---

## Ecosystem Config (ecosystem.config.js)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'mitabut-api',
    script: 'src/index.js',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
};
```

---

## PM2 Commands

### Basic Commands
```bash
# Start application
pm2 start mitabut-api

# Stop application
pm2 stop mitabut-api

# Restart application
pm2 restart mitabut-api

# Reload application (zero-downtime)
pm2 reload mitabut-api

# Delete from PM2
pm2 delete mitabut-api

# Show status
pm2 status

# Show logs
pm2 logs mitabut-api

# Show logs (last 100 lines)
pm2 logs mitabut-api --lines 100

# Clear logs
pm2 flush mitabut-api
```

### Monitoring
```bash
# Monitor CPU/Memory usage
pm2 monit

# Show detailed info
pm2 show mitabut-api

# List all processes
pm2 list
```

### Cluster Mode (Production)
```bash
# Start with cluster mode (maximize CPU usage)
pm2 start src/index.js -i max --name mitabut-api

# Start with specific instances
pm2 start src/index.js -i 4 --name mitabut-api

# Cluster with ecosystem config
pm2 start ecosystem.config.js -i max
```

---

## Startup Script (System Boot)

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save

# Now PM2 will restart on system boot
```

---

## Environment Variables

Edit `.env` before starting:

```env
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mitabut_db

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

---

## Logs

PM2 logs are stored in:
```
logs/
├── out.log    # Application stdout
└── err.log   # Application stderr
```

View logs:
```bash
pm2 logs mitabut-api --nostream
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or in PM2
pm2 delete all
```

### Database Connection Error
```bash
# Verify MySQL is running
mysql -u root -p

# Test connection
mysql -u root -p -e "SELECT 1"
```

### Restart Loop
```bash
# Check error logs
pm2 logs mitabut-api --err

# Increase memory
pm2 restart mitabut-api --exp-backoff-restart-delay=100
```

---

## Security (Production)

```bash
# Set NODE_ENV to production
pm2 restart mitabut-api --update-env

# Use environment variables for secrets
pm2 start src/index.js --env production

# Enable log rotation (install logrotate separately)
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `pm2 start src/index.js` | Start app |
| `pm2 stop mitabut-api` | Stop app |
| `pm2 restart mitabut-api` | Restart app |
| `pm2 reload mitabut-api` | Zero-downtime reload |
| `pm2 delete mitabut-api` | Remove from PM2 |
| `pm2 status` | Show status |
| `pm2 logs mitabut-api` | Show logs |
| `pm2 monit` | Monitor resources |
| `pm2 save` | Save process list |
| `pm2 startup` | Auto-start on boot |