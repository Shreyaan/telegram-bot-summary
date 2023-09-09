"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const openai_1 = __importDefault(require("openai"));
require("dotenv").config();
const token = "6075811153:AAG3PiG4FnMQVoYFonRaoqsAvE1LUKZGXeo"; // Replace with your bot token
let bot;
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
if (process.env.NODE_ENV === "production") {
    bot = new node_telegram_bot_api_1.default(token);
    bot.setWebHook(process.env.URL + token);
    console.log("Bot is running in production mode.");
}
else {
    bot = new node_telegram_bot_api_1.default(token, { polling: true });
    console.log("Bot is running in development mode with polling.");
}
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Parse the JSON body of incoming requests.
app.use(body_parser_1.default.json());
const chatHistories = {};
bot.on("message", (msg) => {
    var _a, _b;
    const chatId = msg.chat.id;
    // Ensure there is an array for the chat history.
    if (!chatHistories[chatId]) {
        chatHistories[chatId] = [];
    }
    if (msg.text == undefined) {
        return;
    }
    // Add the message to the chat history.
    chatHistories[chatId].push(`${((_a = msg.from) === null || _a === void 0 ? void 0 : _a.username) || ((_b = msg.from) === null || _b === void 0 ? void 0 : _b.first_name)}: ${msg.text}`);
    // Keep only the last 100 messages.
    if (chatHistories[chatId].length > 100) {
        chatHistories[chatId].shift(); // Remove the oldest message.
    }
    // Check if the "/100msgs" command is received.
    if (msg.text === "/100msgs" ||
        msg.text === "/100msgs@gptsummarizebot" ||
        msg.text === "/tldrmsgs" ||
        msg.text === "/tldrmsgs@gptsummarizebot") {
        const last100Messages = chatHistories[chatId].slice(-100).join("\n");
        console.log(last100Messages);
        bot
            .sendMessage(chatId, `summarizing ${chatHistories[chatId].slice(-100).length} messages `)
            .catch((error) => {
            console.error("Error sending messages:", error);
        });
        const completion = openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown. ",
                },
                {
                    role: "user",
                    content: `your name is gptsummarizebot . your job is to tldr this chat. the tldr/ summary should be concise. you should ignore bot commands and undefined messages. keep it concise and short.

            
            here is the chat log. please give short tldr/summary of conversation -
             \n` + last100Messages,
                },
            ],
            model: "gpt-3.5-turbo",
        });
        completion.then((result) => {
            var _a;
            let response = (_a = result.choices[0].message) === null || _a === void 0 ? void 0 : _a.content;
            bot.sendMessage(chatId, `${response}`).catch((error) => {
                console.error("Error sending messages:", error);
            });
        });
    }
    if (msg.text === "/list100" ||
        msg.text === "/list100@gptsummarizebot" ||
        msg.text === "/list100msgs" ||
        msg.text === "/list100msgs@gptsummarizebot") {
        bot
            .sendMessage(chatId, `log of messages i have:\n${chatHistories[chatId]
            .slice(-100)
            .join("\n")}`)
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
