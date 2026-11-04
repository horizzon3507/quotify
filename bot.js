import "dotenv/config";
import { HttpService, MemoryStore, Yuzuha } from "yuzuha";
import { Client, Events } from "yuzuha/sdk";
import { generateQuote, quoteInit } from "./quote.js";
import { fontCheck } from "./font.js";

const TOKEN = process.env.FLUXER_BOT_TOKEN;
if (!TOKEN) {
  console.error("FLUXER_BOT_TOKEN is not set.");
  process.exit(1);
}

const API_URL = process.env.FLUXER_API_URL;

await fontCheck();
await quoteInit();

const clientOptions = { waitForGuilds: true };
const client = !API_URL
  ? undefined
  : await Client.fromDiscovery(API_URL.toString(), clientOptions);

const http = new HttpService({ allowPrivate: true });
const bot = new Yuzuha({
  name: "quotify",
  ...(client ? { client } : { clientOptions }),
  store: new MemoryStore(),
  scheduler: false,
  http,
  onError: (err) => console.error("Client error:", err),
});

bot.once(Events.Ready, () =>
  console.log(`quotify online in ${bot.client.guilds.size} guilds`),
);

bot.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.content) return;

  const botMentioned =
    message.mentions?.users?.has(bot.client.user.id) ||
    message.content.includes(`<@${bot.client.user.id}>`);
  if (!botMentioned) return;

  if (!message.referencedMessage) {
    await message.reply(
      "Reply to a message and ping me to turn it into a quote card!",
    );
    return;
  }

  const ref = message.referencedMessage;
  if (!ref.content) {
    await message.reply("That message has no text to quote.");
    return;
  }

  const text =
    ref.content.length > 500 ? ref.content.slice(0, 497) + "..." : ref.content;
  const targetUser = ref.author;
  const discriminator =
    targetUser.discriminator && targetUser.discriminator !== "0"
      ? `#${targetUser.discriminator}`
      : "";

  try {
    const botUser = bot.client.user;
    const botDiscriminator =
      botUser.discriminator && botUser.discriminator !== "0"
        ? `#${botUser.discriminator}`
        : "";
    const image = await generateQuote({
      text,
      tag: `${targetUser.username}${discriminator}`,
      avatarUrl: targetUser.displayAvatarURL({ size: 512 }),
      botTag: `${botUser.username}${botDiscriminator}`,
      http,
      signal: bot.signal,
    });
    await message.reply({
      files: [{ name: "quote.png", data: Buffer.from(image.data) }],
    });
  } catch (err) {
    console.error("Quote generation failed:", err);
    await message.reply("Something went wrong generating the quote.");
  }
});

process.once("SIGINT", () => void bot.destroy());
process.once("SIGTERM", () => void bot.destroy());

await bot.login(TOKEN);
