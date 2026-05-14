# Telegram Claude Bot - QNAP Deployment Guide

## Overview
Telegram bot running on QNAP NAS using Docker Container Station with Node.js and Claude AI API.

## Bot Capabilities
- Responds to text messages via Claude AI
- Accepts voice/audio messages (basic - no transcription in QNAP version)
- Auto-restarts on NAS reboot (Restart policy: Unless Stopped)

## Requirements
- QNAP NAS with Container Station installed
- Telegram Bot Token (from @BotFather)
- Anthropic API Key (from console.anthropic.com)

## Quick Start

### 1. Create Telegram Bot
1. Open Telegram → search @BotFather
2. Send `/newbot`
3. Follow prompts (name, username)
4. Copy the **BOT TOKEN**

### 2. Get Anthropic API Key
1. Go to https://console.anthropic.com
2. API Keys → Create Key
3. Copy the **API KEY**

### 3. Deploy on QNAP Container Station

**Step 1: Create Container**
1. Open Container Station → **Create Container**
2. Image: `node:20-alpine`
3. Name: `telegram-claude-bot`
4. Publish port: `3000` (Host) → `3000` (Container)
5. Auto start policy: ✅ **Unless Stopped**

**Step 2: Install Dependencies in Container**
1. Enter container terminal (Execute button)
2. Install packages:
```bash
apk add --no-cache nodejs npm
mkdir -p /app/src
```

**Step 3: Create package.json**
```bash
node -e "const fs=require('fs');fs.writeFileSync('/app/pkg.json','{\"name\":\"telegram-bot\",\"version\":\"1.0.0\",\"dependencies\":{\"grammy\":\"latest\",\"dotenv\":\"latest\",\"@anthropic-ai/sdk\":\"latest\"}}');fs.renameSync('/app/pkg.json','/app/package.json')"
```

**Step 4: Install npm packages**
```bash
cd /app && npm install
```

**Step 5: Create bot code**
```bash
cat > /app/src/index.js << 'CODEEOF'
const { Bot } = require("grammy");
const Anthropic = require("@anthropic-ai/sdk").default || require("@anthropic-ai/sdk");

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "");
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

bot.on("message", async (ctx) => {
  const userMessage = ctx.message.text;
  if (!userMessage) {
    await ctx.reply("Solo puedo procesar mensajes de texto.");
    return;
  }
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: userMessage }],
    });
    const responseText = response.content.find(b => b.type === "text")?.text || "Sin respuesta";
    await ctx.reply(responseText);
  } catch (error) {
    console.error("Error:", error.message);
    await ctx.reply("Error: " + error.message);
  }
});

bot.start();
console.log("Bot iniciado en QNAP!");
CODEEOF
```

**Step 6: Start the bot**
```bash
cd /app
export TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_TOKEN
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
node src/index.js
```

### 4. Verify
Send a message to your Telegram bot - it should respond.

## Troubleshooting

### Bot doesn't respond
- Check if container is "Running" in Container Station
- Check container logs for errors
- Verify TELEGRAM_BOT_TOKEN and ANTHROPIC_API_KEY are correct

### Container won't start
- Check "Auto start policy" is set to "Unless Stopped"
- Verify port 3000 is not used by another application

### npm install fails
```bash
npm config set registry https://registry.npmjs.org
cd /app && npm install
```

## File Locations on QNAP
- Container: `/app/`
- Bot code: `/app/src/index.js`
- Container Station data: `/share/CACHEDEV1_DATA/Public/container-station-data/`

## Notes
- QNAP ARM processors may have issues with audio transcription (Whisper)
- Bot runs without volume mounting - code is lost on container delete
- For persistence, consider creating a Docker volume or using bind mounts
- Network access: `http://QNAP_IP:3000` for container logs (internal only)