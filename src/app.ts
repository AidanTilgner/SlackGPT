import {
  App,
  LogLevel,
  directMention,
  BlockAction,
  GenericMessageEvent,
} from "@slack/bolt";
import "reflect-metadata";
import { config } from "dotenv";
import { database, onInitialized, setInitializationStatus } from "./database";
import { mapMessagesToApp } from "./messages";
import {
  checkUserExistsAndAddIfNot,
  checkUserHasOpenAIApiKeyAndPromptIfNot,
} from "./middleware/users";
import {
  addOpenAIKeyToUser,
  clearAllAPIKeysForUser,
} from "./database/queries/users";
import { getChatCompletionBySlackID } from "./utils/openai";
import { getRandomThinkingText } from "./utils/text";

config();

database
  .initialize()
  .then(() => {
    setInitializationStatus(true);
    onInitialized(() => {
      console.info("Database initialized");
    }, 0);
  })
  .catch((error) => {
    console.error("[Error] Database failed to initialize");
    console.error(error);
    setInitializationStatus(false);
  });

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});

app.use(checkUserExistsAndAddIfNot);

app.action("openai_api_key", async ({ ack, body, say, client }) => {
  ack();
  if ((body as any).state.values.openai_api_key.openai_api_key.value) {
    const added = await addOpenAIKeyToUser(
      body.user.id,
      (body as any).state.values.openai_api_key.openai_api_key.value
    );

    if (added) {
      if (body.channel?.id) {
        client.chat.postEphemeral({
          text: "Successfully added your OpenAI API key!",
          channel: body.channel.id,
          user: body.user.id,
        });
        return;
      }
    }

    return;
  }
  if (body.channel?.id) {
    client.chat.postEphemeral({
      text: "There was an error adding your OpenAI API key. Please try again.",
      channel: body.channel.id,
      user: body.user.id,
    });
  }
});

app.use(checkUserHasOpenAIApiKeyAndPromptIfNot);

app.message("prompt:", async ({ message, say }) => {
  const prompt = (message as GenericMessageEvent)?.text
    ?.split("prompt:")[1]
    .trim();
  if (!prompt) {
    say("Please provide a prompt after the `prompt:` keyword");
    return;
  }
  say(getRandomThinkingText());
  const response = await getChatCompletionBySlackID(
    prompt,
    (message as GenericMessageEvent).user,
    (message as GenericMessageEvent).channel
  );
  if (response) {
    say(response);
  }
});

app.command(/(removeKeys|removekeys)/, async ({ command, client, ack }) => {
  ack();
  const removed = await clearAllAPIKeysForUser(command.user_id);

  if (removed) {
    client.chat.postEphemeral({
      text: "Successfully removed your keys!",
      channel: command.channel_id,
      user: command.user_id,
    });
  } else {
    client.chat.postEphemeral({
      text: "There was an error removing your keys. Please try again.",
      channel: command.channel_id,
      user: command.user_id,
    });
  }
});

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);

  console.info("⚡️ Bolt app is running!");
})();
