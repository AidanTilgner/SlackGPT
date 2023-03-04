// Require the Bolt package (github.com/slackapi/bolt)
import { config } from "dotenv";
import bolt from "@slack/bolt";
const { App } = bolt;

config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// All the room in the world for your code

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
