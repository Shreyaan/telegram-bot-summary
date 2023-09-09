"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatgptSummary = void 0;
const _1 = require(".");
const ADMIN_ID = process.env.ADMIN_ID || "491597253";
const WAIT_TIME_SECONDS = 1800 / 2;
const MAX_MESSAGES_TO_SUMMARIZE = 100;
function chatgptSummary(chatId, msg, prompt) {
    var _a, _b;
    const memberId = ((_a = msg.from) === null || _a === void 0 ? void 0 : _a.id) || ((_b = msg.from) === null || _b === void 0 ? void 0 : _b.username) || "0";
    let minutesLeft = getMinutesUntilExpiration(memberId);
    if (_1.memberUsage.get(memberId) !== undefined && memberId !== ADMIN_ID) {
        _1.bot
            .sendMessage(chatId, `You have used the bot recently. you can use it again in ${minutesLeft} minutes.`)
            .catch(logError);
        return;
    }
    const last100Messages = _1.chatHistories[chatId].slice(-MAX_MESSAGES_TO_SUMMARIZE);
    console.log(last100Messages);
    _1.bot
        .sendMessage(chatId, `Summarizing ${last100Messages.length} messages`)
        .catch(logError);
    const completion = _1.openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
            },
            {
                role: "user",
                content: prompt + last100Messages.join("\n"),
            },
        ],
        model: "gpt-3.5-turbo",
    });
    _1.memberUsage.set(memberId, 1, WAIT_TIME_SECONDS - 1);
    completion
        .then((result) => {
        var _a;
        const response = (_a = result.choices[0].message) === null || _a === void 0 ? void 0 : _a.content;
        _1.bot
            .sendMessage(chatId, response || "Failed to generate a summary")
            .catch(logError);
    })
        .catch((error) => {
        console.log(error);
        _1.bot.sendMessage(chatId, "Failed to generate a summary").catch(logError);
        if (_1.memberUsage.get(memberId) !== undefined) {
            _1.memberUsage.del(memberId);
        }
    });
}
exports.chatgptSummary = chatgptSummary;
function getMinutesUntilExpiration(memberId) {
    // Get the timestamp from memberUsage.getTtl(memberId)
    const expirationTimestamp = _1.memberUsage.getTtl(memberId);
    // If expirationTimestamp is undefined, assume 30 minutes left
    if (expirationTimestamp === undefined) {
        return WAIT_TIME_SECONDS / 60;
    }
    // Calculate the current timestamp in milliseconds
    const currentTimestamp = Date.now();
    // Calculate the remaining time in milliseconds
    const remainingTime = expirationTimestamp - currentTimestamp;
    // Convert remaining time to minutes
    const minutesLeft = Math.floor(remainingTime / (1000 * 60));
    return minutesLeft;
}
function logError(error) {
    console.error("Error sending messages:", error);
}
