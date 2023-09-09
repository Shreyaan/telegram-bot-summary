import TelegramBot from "node-telegram-bot-api";
import { chatHistories, bot, openai, memberUsage } from ".";

const ADMIN_ID = process.env.ADMIN_ID || "491597253";
const WAIT_TIME_SECONDS = 1800/2;
const MAX_MESSAGES_TO_SUMMARIZE = 100;

export function chatgptSummary(
  chatId: number,
  msg: TelegramBot.Message,
  prompt: string
) {
  const memberId = msg.from?.id || msg.from?.username || "0";
  let minutesLeft = getMinutesUntilExpiration(memberId);

  if (memberUsage.get(memberId) !== undefined && memberId !== ADMIN_ID) {
    bot
      .sendMessage(
        chatId,
        `You have used the bot recently. you can use it again in ${minutesLeft} minutes.`
      )
      .catch(logError);
    return;
  }

  const last100Messages = chatHistories[chatId].slice(
    -MAX_MESSAGES_TO_SUMMARIZE
  );
  console.log(last100Messages);

  bot
    .sendMessage(chatId, `Summarizing ${last100Messages.length} messages`)
    .catch(logError);

  const completion = openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
      },
      {
        role: "user",
        content: prompt + last100Messages.join("\n"),
      },
    ],
    model: "gpt-3.5-turbo",
  });
  memberUsage.set(memberId, 1, WAIT_TIME_SECONDS - 1);
  completion
    .then((result) => {
      const response = result.choices[0].message?.content;
      bot
        .sendMessage(chatId, response || "Failed to generate a summary")
        .catch(logError);
    })
    .catch((error) => {
      console.log(error);
      bot.sendMessage(chatId, "Failed to generate a summary").catch(logError);
      if (memberUsage.get(memberId) !== undefined) {
        memberUsage.del(memberId);
      }
    });
}

function getMinutesUntilExpiration(memberId: string | number) {
  // Get the timestamp from memberUsage.getTtl(memberId)
  const expirationTimestamp = memberUsage.getTtl(memberId);

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

function logError(error: Error) {
  console.error("Error sending messages:", error);
}
