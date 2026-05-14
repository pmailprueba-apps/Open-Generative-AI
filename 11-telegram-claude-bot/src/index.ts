import { Bot } from "grammy";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";
import https from "https";
import { spawn } from "child_process";

config();

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "");
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "✓ configurada" : "✗ falta");

const downloadFile = (fileId: string, filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bot.api.getFile(fileId).then((fileInfo) => {
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;
      const stream = fs.createWriteStream(filePath);
      https.get(fileUrl, (response) => {
        response.pipe(stream);
        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
      }).on("error", reject);
    }).catch(reject);
  });
};

const transcribeAudio = (audioPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pythonCode = `
from faster_whisper import WhisperModel
model = WhisperModel("base", compute_type="int8")
segments, info = model.transcribe("${audioPath}", language="es")
result = []
for segment in segments:
    result.append(segment.text)
print("TRANSCRIBE:" + " ".join(result))
`;

    const proc = spawn("/usr/local/bin/python3.11", ["-c", pythonCode], {
      env: { ...process.env, KMP_DUPLICATE_LIB_OK: "TRUE" },
    });
    let result = "";
    let error = "";

    proc.stdout.on("data", (data) => {
      result += data.toString();
    });

    proc.stderr.on("data", (data) => {
      error += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        const text = result.replace("TRANSCRIBE:", "").trim();
        resolve(text);
      } else {
        reject(new Error(error || "Error en transcripción"));
      }
    });
  });
};

bot.on("message", async (ctx) => {
  const userMessage = ctx.message.text;

  if (!userMessage) {
    if (ctx.message.voice || ctx.message.audio) {
      try {
        const fileId = ctx.message.voice?.file_id || ctx.message.audio?.file_id;
        const ext = ctx.message.voice ? "oga" : "mp3";
        const fileName = `audio_${Date.now()}.${ext}`;
        const audioPath = path.join("/tmp", fileName);

        await ctx.reply("Recibí tu audio. Transcribiendo...");
        await downloadFile(fileId!, audioPath);

        const texto = await transcribeAudio(audioPath);
        console.log("Transcripción:", texto);

        await ctx.reply(`**Transcripción:**\n${texto}`);

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: texto,
            },
          ],
        });

        const responseText =
          response.content.find((block) => block.type === "text")?.text || "No pude generar una respuesta.";

        await ctx.reply(responseText, { parse_mode: "Markdown" });

        fs.unlinkSync(audioPath);
      } catch (error) {
        console.error("Error al procesar audio:", error);
        await ctx.reply("No pude procesar el audio. Intenta enviar un mensaje de texto.");
      }
      return;
    }

    await ctx.reply("Solo puedo procesar mensajes de texto o audios.");
    return;
  }

  try {
    console.log("Enviando mensaje a Claude:", userMessage.substring(0, 50));

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const responseText =
      response.content.find((block) => block.type === "text")?.text || "No pude generar una respuesta.";

    await ctx.reply(responseText, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error completo:", error);
    await ctx.reply(`Error: ${error.message}`);
  }
});

bot.start();
console.log("Bot iniciado. Presiona Ctrl+C para detener.");