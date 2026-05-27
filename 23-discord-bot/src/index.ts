import { Client, GatewayIntentBits, Events, Message } from "discord.js";
import OpenAI from "openai";
import { config } from "dotenv";
import { execSync } from "child_process";
import * as fs from "fs";

config();

const TOKEN = process.env.DISCORD_TOKEN || "";
const API_KEY = process.env.OPENAI_API_KEY || "";
const BASE_URL = process.env.OPENAI_BASE_URL || "https://opencode.ai/zen/go/v1";
const MODEL = process.env.MODEL || "deepseek-v4-flash";
const VISION_MODEL = process.env.VISION_MODEL || "qwen3.6-plus";
const SOUL = process.env.BOT_SOUL || "Eres un asistente de IA ejecutándote en un QNAP NAS llamado Aldukehome (192.168.100.10)";
const AUTO_CHANNELS = (process.env.AUTO_CHANNELS || "").split(",").map(s => s.trim()).filter(Boolean);

if (!TOKEN) { console.error("No Discord token"); process.exit(1); }
if (!API_KEY) { console.error("No API key"); process.exit(1); }

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const SOCKET = "/var/run/docker.sock";

const dockerApi = async (path: string): Promise<string> => {
  try {
    const url = `http://localhost${path}`;
    const r = execSync(`curl -s --unix-socket ${SOCKET} ${url} 2>&1`, { timeout: 10000 }).toString();
    return r.slice(0, 4000);
  } catch (e: any) { return "Error: " + e.message; }
};

const runCmd = (cmd: string) => {
  try {
    return execSync(cmd, { timeout: 15000, shell: "/bin/sh" }).toString().slice(0, 4000);
  } catch (e: any) { return "Error: " + e.message; }
};

const TOOLS: Record<string, (args: string) => string | Promise<string>> = {
  shell: runCmd,
  run_command: runCmd,
  exec: runCmd,
  cmd: runCmd,
  bash: runCmd,
  docker_ps: async () => {
    const r = await dockerApi("/containers/json?all=true");
    try {
      const containers = JSON.parse(r);
      return containers.map((c: any) => `${c.Names[0].replace("/", "")}\t${c.Image}\t${c.State}`).join("\n") || "Sin contenedores";
    } catch { return r; }
  },
  docker_logs: async (name) => {
    return await dockerApi(`/containers/${name}/logs?tail=30&stdout=true&stderr=true`);
  },
  docker_restart: async (name) => {
    await dockerApi(`/containers/${name}/restart`);
    return `Contenedor ${name} reiniciado`;
  },
  ls: (p) => {
    try { return execSync(`ls -la ${p} 2>&1`, { timeout: 5000 }).toString().slice(0, 4000); }
    catch (e: any) { return "Error: " + e.message; }
  },
  cat: (p) => {
    try { return execSync(`cat ${p} 2>&1`, { timeout: 5000 }).toString().slice(0, 4000); }
    catch (e: any) { return "Error: " + e.message; }
  },
  df: () => {
    try { return execSync("df -h 2>&1", { timeout: 5000 }).toString(); }
    catch (e: any) { return "Error: " + e.message; }
  },
  uptime: () => {
    try { return execSync("uptime 2>&1", { timeout: 5000 }).toString(); }
    catch (e: any) { return "Error: " + e.message; }
  },
  weather: (location) => {
    try {
      return execSync(`curl -s "wttr.in/${location || "auto"}?format=%l:+%t+%h+%w+%C" 2>&1`, { timeout: 10000 }).toString();
    } catch (e: any) { return "Error: " + e.message; }
  },
  clima: (location) => {
    try {
      return execSync(`curl -s "wttr.in/${location || "auto"}?format=%l:+%t+%h+%w+%C" 2>&1`, { timeout: 10000 }).toString();
    } catch (e: any) { return "Error: " + e.message; }
  },
  github: (query) => {
    try {
      return execSync(`curl -s "https://api.github.com/${query}" 2>&1 | head -50`, { timeout: 10000 }).toString().slice(0, 4000);
    } catch (e: any) { return "Error: " + e.message; }
  },
};

const findTool = (text: string): { name: string; args: string } | null => {
  const match = text.match(/\[TOOL:\s*(\w+)\]\s*(.*?)(?:\n|$)/s);
  if (!match) return null;
  const name = match[1].toLowerCase();
  const args = match[2].trim().replace(/[}>\]]+$/, "").trim();
  return { name, args };
};

const systemPrompt = `Eres agente IA en QNAP Aldukehome. Ayudas a Alex.

Herramientas disponibles (usar [TOOL: nombre] args):
[TOOL: shell] comando - cualquier comando bash
[TOOL: docker_ps] - listar contenedores Docker
[TOOL: docker_logs] nombre - ver logs de contenedor
[TOOL: docker_restart] nombre - reiniciar contenedor
[TOOL: weather] ciudad - clima
[TOOL: clima] ciudad - clima en español
[TOOL: github] repos/user/repo - info de repo
[TOOL: ls] ruta - listar archivos
[TOOL: cat] ruta - ver archivo
[TOOL: df] - espacio en disco
[TOOL: uptime] - tiempo encendido

Pon el marcador [TOOL: ...] en tu respuesta y espera el resultado.
Responde en español.`;

const ask = async (messages: any[]) => {
  const r = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 4096,
    messages,
  });
  return r.choices[0]?.message?.content || "";
};

const processMessage = async (msg: Message, userText: string) => {
  const startTime = Date.now();
  console.log(`MSG from ${msg.author.tag}: ${userText.slice(0, 80)}`);

  try {
    const msgs: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ];

    let response = await ask(msgs);
    const tool = findTool(response);

    if (tool) {
      console.log(`TOOL: ${tool.name} | ${tool.args.slice(0, 80)}`);
      const toolFn = TOOLS[tool.name];
      const result = toolFn ? await Promise.resolve(toolFn(tool.args)) : "Tool not found";
      console.log(`RESULT: ${result.slice(0, 100)}`);

      msgs.push({ role: "assistant", content: response });
      msgs.push({ role: "user", content: `Resultado de ${tool.name}:\n${result}\n\nResponde al usuario.` });
      response = await ask(msgs);
    }

    const sendMsg = async (text: string) => {
      try { await msg.reply(text); }
      catch { await msg.channel.send(text); }
    };
    if (response.length > 1900) {
      const chunks = response.match(/[\s\S]{1,1900}/g) || [];
      for (const chunk of chunks) {
        await sendMsg(chunk);
      }
    } else {
      await sendMsg(response);
    }

    console.log(`AI RESP: ${response?.slice(0, 200)}`);
    console.log(`REPLY in ${Date.now() - startTime}ms`);
  } catch (error: any) {
    console.error(`ERR:`, error.message);
    try { await msg.channel.send("Error: " + error.message); } catch (e2: any) {
      console.error(`ERR2:`, e2.message);
    }
  }
};

discord.once(Events.ClientReady, (c) => {
  console.log(`Bot listo como ${c.user.tag}`);
  c.guilds.cache.forEach(g => {
    console.log(`GUILD: ${g.name} (${g.id})`);
    g.channels.cache.forEach(ch => {
      if (ch.isTextBased()) {
        console.log(`  CHANNEL: ${ch.name} (${ch.id})`);
      }
    });
  });
});

discord.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;

  console.log(`EVENT ch:${msg.channel?.name || "DM"} author:${msg.author.tag} content:"${msg.content.slice(0,50)}"`);

  const botId = discord.user!.id;
  const isDM = msg.guild === null;
  const isMentioned = msg.mentions.users.has(botId);
  const mentionRegex = new RegExp(`<@!?${botId}>`, "g");

  let userText = msg.content;

  if (isMentioned) {
    userText = userText.replace(mentionRegex, "").trim();
  }

  const isAutoChannel = AUTO_CHANNELS.includes(msg.channelId) || AUTO_CHANNELS.includes(msg.channel?.name || "");

  if (isDM || isMentioned || isAutoChannel) {
    if (!userText && isAutoChannel) userText = msg.content || "Hola";
    await processMessage(msg, userText || "Hola");
  }
});

discord.login(TOKEN);
