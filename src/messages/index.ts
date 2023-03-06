import type { KnownEventFromType, SayFn, App } from "@slack/bolt";

interface Message {
  text: string | RegExp;
  callback: ({
    message,
    say,
  }: {
    message: KnownEventFromType<"message">;
    say: SayFn;
  }) => Promise<void>;
}

const messages: Message[] = [
  {
    text: ":wave:",
    callback: async ({ message, say }) => {
      if (message.subtype === undefined || message.subtype === "bot_message") {
        await say(`Hello, <@${message.user}>`);
      }
    },
  },
  {
    text: "knock knock",
    callback: async ({ say }) => {
      await say("_Who's there?_");
    },
  },
];

export default messages;

export const mapMessagesToApp = (app: App) => {
  messages.forEach((message) => {
    app.message(message.text, message.callback);
  });
};
