"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatHistories = exports.openai = exports.bot = exports.memberUsage = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const openai_1 = __importDefault(require("openai"));
const node_cache_1 = __importDefault(require("node-cache"));
const chatgptSummary_1 = require("./chatgptSummary");
exports.memberUsage = new node_cache_1.default({
    // checkperiod: 20,
    deleteOnExpire: true,
});
require("dotenv").config();
const token = process.env.BOT_TOKEN || "";
exports.openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
if (process.env.NODE_ENV === "production") {
    exports.bot = new node_telegram_bot_api_1.default(token);
    exports.bot.setWebHook(process.env.URL + token);
    console.log("Bot is running in production mode.");
}
else {
    exports.bot = new node_telegram_bot_api_1.default(token, { polling: true });
    console.log("Bot is running in development mode with polling.");
}
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Parse the JSON body of incoming requests.
app.use(body_parser_1.default.json());
exports.chatHistories = {};
exports.bot.on("message", (msg) => {
    var _a, _b;
    const chatId = msg.chat.id;
    // Ensure there is an array for the chat history.
    if (!exports.chatHistories[chatId]) {
        exports.chatHistories[chatId] = [];
    }
    if (msg.text == undefined) {
        return;
    }
    // Add the message to the chat history.
    exports.chatHistories[chatId].push(`${((_a = msg.from) === null || _a === void 0 ? void 0 : _a.first_name) || ((_b = msg.from) === null || _b === void 0 ? void 0 : _b.username)}: ${msg.text}`);
    // Keep only the last 100 messages.
    if (exports.chatHistories[chatId].length > 100) {
        exports.chatHistories[chatId].shift(); // Remove the oldest message.
    }
    // Check if the "/100msgs" command is received.
    if (msg.text === "/100msgs" ||
        msg.text === "/100msgs@gptsummarizebot" ||
        msg.text === "/tldrmsgs" ||
        msg.text === "/tldrmsgs@gptsummarizebot") {
        (0, chatgptSummary_1.chatgptSummary)(chatId, msg, `your name is gptsummarizebot . your job is to tldr this chat.

    give tldr / summary in 7 to 10 bullet points.

    
    here is the chat log. please give short tldr/summary of conversation -
     \n`);
    }
    if (msg.text === "/list100" ||
        msg.text === "/list100@gptsummarizebot" ||
        msg.text === "/list100msgs" ||
        msg.text === "/list100msgs@gptsummarizebot") {
        exports.bot
            .sendMessage(chatId, `log of messages i have:\n${exports.chatHistories[chatId]
            .slice(-100)
            .join("\n")}`)
            .catch((error) => {
            console.error("Error sending messages:", error);
        });
    }
    if (msg.text === "/tldrmembers" ||
        msg.text === "/tldrmembers@gptsummarizebot") {
        (0, chatgptSummary_1.chatgptSummary)(chatId, msg, `your name is gptsummarizebot . your job is to give tldr / summary of every member in 5 to 10 words. here is the chat log. - \n 
      `);
    }
    if (msg.text === "/help" || msg.text === "/help@gptsummarizebot") {
        exports.bot
            .sendMessage(chatId, `commands:
  /100msgs - give tldr of last 100 messages
  /list100 - list last 100 messages
  /tldrmember - give tldr of every member in 5 to 10 words
  /help - list commands
  `)
            .catch((error) => {
            console.error("Error sending messages:", error);
        });
    }
});
app.listen(port, () => {
    console.log(`Express server is running on port ${port}`);
});
app.post("/" + token, (req, res) => {
    exports.bot.processUpdate(req.body);
    res.sendStatus(200);
    // console.log("Received webhook update:", req.body);
});
