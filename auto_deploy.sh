#!/bin/bash
set -e

# Configuration
APP_DIR="/var/www/MinecraftJeopardy"
LOG_FILE="/var/log/auto_deploy.log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Ensure we are in the right directory
cd "$APP_DIR" || exit 1

# Fetch latest changes
git fetch origin main

# Check if local is behind origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    log "Changes detected! Updating from $LOCAL to $REMOTE..."
    
    # Reset hard to match remote (force overwrite local changes)
    git reset --hard origin/main
    
    # Install dependencies if package.json changed
    # (Checking diff is complex, just running install is safer/easier)
    log "Installing dependencies..."
    npm ci --omit=dev >> "$LOG_FILE" 2>&1
    
    # Build
    log "Building application..."
    npm run build >> "$LOG_FILE" 2>&1
    
    # Restart
    log "Restarting PM2..."
    pm2 restart jeopardy >> "$LOG_FILE" 2>&1
    
    log "Deployment successful!"
else
    # No changes, do nothing (silent)
    # log "No changes detected."
    :
fi
