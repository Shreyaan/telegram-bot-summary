import TelegramBot from "node-telegram-bot-api";
import { chatHistories, bot, openai, memberUsage } from ".";

let adminId = process.env.ADMIN_ID || 491597253;
export function chatgptSummary(
  chatId: number,
  msg: TelegramBot.Message,
  prompt: string
) {
  let memberId = msg.from?.id || msg.from?.username || 0;
  let timeRemaining = memberUsage.getTtl(memberId) || 1800;
  if (memberUsage.get(memberId) != undefined && memberId !== adminId) {
    bot
      .sendMessage(
        chatId,
        `You have used the bot recently. Please wait for ${
          timeRemaining / 60
        } minutes before using it again.`
      )
      .catch((error) => {
        console.error("Error sending messages:", error);
      });
    return;
  }
  const last100Messages = chatHistories[chatId].slice(-100).join("\n");
  console.log(last100Messages);

  bot
    .sendMessage(
      chatId,
      `summarizing ${chatHistories[chatId].slice(-100).length} messages `
    )
    .catch((error) => {
      console.error("Error sending messages:", error);
    });
  const completion = openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown. ",
      },
      {
        role: "user",
        content: prompt + last100Messages,
      },
    ],
    model: "gpt-3.5-turbo",
  });
  completion.then((result) => {
    let response = result.choices[0].message?.content;
    bot.sendMessage(chatId, `${response}`).catch((error) => {
      console.error("Error sending messages:", error);
    });
    memberUsage.set(memberId, 1, 1799);
  });
}
