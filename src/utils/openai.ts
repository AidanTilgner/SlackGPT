import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import { getOpenAIKeyForUser } from "../database/queries/users";
import {
  addMessageToConversation,
  addMessageToConversationOrCreateIfNotExists,
  getConversationMessages,
} from "../database/queries/converations";
import { config } from "dotenv";

config();

const initialPrompt =
  process.env.INITIAL_CHATGPT_PROMPT ||
  "You are a gifted software engineer, who is great at answering questions related to all aspects of the field. For this conversation you also will want to remember that you are in a Slack channel.";

const getChatCompletion = async (
  prompt: string,
  apiKey: string,
  channelID: string
) => {
  const config = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(config);

  const added = await addMessageToConversationOrCreateIfNotExists(
    channelID,
    "user",
    prompt
  );

  if (!added) return "There was an error, please try again.";

  const previousMessages = await getConversationMessages(channelID);

  if (!previousMessages) return "There was an error, please try again.";

  const totalMessages: {
    role: ChatCompletionRequestMessageRoleEnum;
    content: string;
  }[] = [
    {
      role: "system",
      content: initialPrompt,
    },
    ...previousMessages.map((message) => ({
      role: message.role as "user" | "system",
      content: message.content,
    })),
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [...totalMessages],
  });

  const choice = response.data.choices[0];

  if (!choice.message?.content) return "There was an error, please try again.";

  addMessageToConversation(channelID, "assistant", choice.message?.content);

  return choice.message?.content;
};

export const getChatCompletionBySlackID = async (
  prompt: string,
  slackID: string,
  channelID: string
) => {
  const apiKey = await getOpenAIKeyForUser(slackID);
  if (!apiKey) return false;

  return getChatCompletion(prompt, apiKey, channelID);
};
