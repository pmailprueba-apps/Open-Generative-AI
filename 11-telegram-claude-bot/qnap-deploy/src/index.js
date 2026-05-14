const { Bot } = require("grammy");
const Anthropic = require("@anthropic-ai/sdk").default || require("@anthropic-ai/sdk");

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

console.log("Bot iniciando...");

bot.on("message", async (ctx) => {
  const userMessage = ctx.message.text;
  if (!userMessage) {
    await ctx.reply("Solo proceso mensajes de texto.");
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
console.log("Bot iniciado!");
