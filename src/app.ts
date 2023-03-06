import { App, LogLevel, directMention, BlockAction } from "@slack/bolt";
import "reflect-metadata";
import { config } from "dotenv";
import { database, onInitialized, setInitializationStatus } from "./database";
import { mapMessagesToApp } from "./messages";
import {
  checkUserExistsAndAddIfNot,
  checkUserHasOpenAIApiKeyAndPromptIfNot,
} from "./middleware/users";
import { addOpenAIKeyToUser } from "./database/queries/users";

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

mapMessagesToApp(app);

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);

  console.info("⚡️ Bolt app is running!");
})();