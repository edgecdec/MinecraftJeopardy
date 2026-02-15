#!/bin/bash

# Configuration
APP_DIR="/var/www/MinecraftJeopardy"
LOG_FILE="/var/log/auto_deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "Starting Auto-Deploy Watcher (10s interval)..."

while true; do
    # Go to dir
    cd "$APP_DIR" || { log "Failed to cd to $APP_DIR"; exit 1; }

    # Fetch
    git fetch origin main > /dev/null 2>&1

    # Compare
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)

    if [ "$LOCAL" != "$REMOTE" ]; then
        log "Changes detected! Updating..."
        
        git reset --hard origin/main >> "$LOG_FILE" 2>&1
        
        log "Installing dependencies..."
        npm ci --omit=dev >> "$LOG_FILE" 2>&1
        
        log "Building..."
        npm run build >> "$LOG_FILE" 2>&1
        
        log "Restarting App..."
        pm2 restart jeopardy >> "$LOG_FILE" 2>&1
        
        log "Deployment Complete. Waiting for next change..."
    fi

    # Wait 10 seconds
    sleep 10
done
