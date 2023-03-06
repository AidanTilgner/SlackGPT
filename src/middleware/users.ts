import { database, entities } from "../database";
import {
  checkUserExistsBySlackID,
  addUserBySlackID,
  checkUserForOpenAIAPIKey,
} from "../database/queries/users";

export async function checkUserExistsAndAddIfNot({ payload, next }: any) {
  const slackID = payload.user;

  const exists = await checkUserExistsBySlackID(slackID);

  if (!exists) {
    const added = await addUserBySlackID(slackID);
    if (!added) {
      console.error("Failed to add user");
      return;
    }
  }

  next();
}

export const checkUserHasOpenAIApiKeyAndPromptIfNot = async ({
  payload,
  client,
  event,
  next,
}: any) => {
  if (!event || event.type !== "message") {
    next();
    return;
  }
  const slackID = payload.user;

  const has = await checkUserForOpenAIAPIKey(slackID);

  if (!has) {
    client.chat.postEphemeral({
      text: "Looks like you don't have an OpenAI api key! Create one at https://platform.openai.com/account/api-keys, and then paste it below.",
      channel: event.channel,
      user: event.user,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Looks like you're missing an OpenAI API key! Create one at https://platform.openai.com/account/api-keys, and then paste it below.",
          },
        },
        {
          type: "input",
          block_id: "openai_api_key",
          dispatch_action: true,
          label: {
            type: "plain_text",
            text: "Enter an API key",
          },
          element: {
            type: "plain_text_input",
            action_id: "openai_api_key",
            placeholder: {
              type: "plain_text",
              text: "Enter your key here...",
            },
          },
        },
      ],
    });

    return;
  }

  next();
};
