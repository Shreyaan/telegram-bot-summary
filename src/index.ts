import TelegramBot from "node-telegram-bot-api";
import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import NodeCache from "node-cache";
import { chatgptSummary } from "./chatgptSummary";
export const memberUsage = new NodeCache({
  // checkperiod: 20,
  deleteOnExpire: true,
});

require("dotenv").config();

const token = process.env.BOT_TOKEN || "";
export let bot: TelegramBot;

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (process.env.NODE_ENV === "production") {
  bot = new TelegramBot(token);
  bot.setWebHook(process.env.URL + token);
  console.log("Bot is running in production mode.");
} else {
  bot = new TelegramBot(token, { polling: true });
  console.log("Bot is running in development mode with polling.");
}

const app = express();
const port = process.env.PORT || 3000;

// Parse the JSON body of incoming requests.
app.use(bodyParser.json());

export const chatHistories: { [chatId: number]: string[] } = {};

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // Ensure there is an array for the chat history.
  if (!chatHistories[chatId]) {
    chatHistories[chatId] = [];
  }
  if (msg.text == undefined) {
    return;
  }
  // Add the message to the chat history.
  chatHistories[chatId].push(
    `${msg.from?.first_name || msg.from?.username}: ${msg.text}`
  );

  // Keep only the last 100 messages.
  if (chatHistories[chatId].length > 100) {
    chatHistories[chatId].shift(); // Remove the oldest message.
  }

  // Check if the "/100msgs" command is received.
  if (
    msg.text === "/100msgs" ||
    msg.text === "/100msgs@gptsummarizebot" ||
    msg.text === "/tldrmsgs" ||
    msg.text === "/tldrmsgs@gptsummarizebot"
  ) {
    chatgptSummary(
      chatId,
      msg,
      `your name is gptsummarizebot . your job is to tldr this chat.

    give tldr / summary in 7 to 10 bullet points.

    
    here is the chat log. please give short tldr/summary of conversation -
     \n`
    );
  }
  if (
    msg.text === "/list100" ||
    msg.text === "/list100@gptsummarizebot" ||
    msg.text === "/list100msgs" ||
    msg.text === "/list100msgs@gptsummarizebot"
  ) {
    bot
      .sendMessage(
        chatId,
        `log of messages i have:\n${chatHistories[chatId]
          .slice(-100)
          .join("\n")}`
      )
      .catch((error) => {
        console.error("Error sending messages:", error);
      });
  }

  if (
    msg.text === "/tldrmembers" ||
    msg.text === "/tldrmembers@gptsummarizebot"
  ) {
    chatgptSummary(
      chatId,
      msg,
      `your name is gptsummarizebot . your job is to give tldr / summary of every member in 5 to 10 words. here is the chat log. - \n 
      `
    );
  }

  if (msg.text === "/help" || msg.text === "/help@gptsummarizebot") {
    bot
      .sendMessage(
        chatId,
        `commands:
  /100msgs - give tldr of last 100 messages
  /list100 - list last 100 messages
  /tldrmember - give tldr of every member in 5 to 10 words
  /help - list commands
  `
      )
      .catch((error) => {
        console.error("Error sending messages:", error);
      });
  }
});
app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});

app.post("/" + token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
  // console.log("Received webhook update:", req.body);
});
