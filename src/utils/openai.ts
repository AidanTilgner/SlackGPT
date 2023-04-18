import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import {
  getOpenAIKeyForUser,
  markApiKeyEncounteredError,
} from "../database/queries/users";
import {
  addMessageToConversation,
  addMessageToConversationOrCreateIfNotExists,
  getConversationMessages,
} from "../database/queries/converations";
import { config } from "dotenv";
import gpt_config from "../config/gpt_config.json";

config();

export const getInitialPrompt = () => {
  const { personality, knowledge, works_for } = gpt_config;

  const mappedTopics = knowledge.topics.map((t) => t).join(", ");
  const mappedContext = knowledge.context.map((t) => t).join(", ");
  const mappedServices = works_for.services
    .map((s) => {
      return `${s.name}: ${s.description}`;
    })
    .join("\n-");
  const mappedProducts = works_for.products
    .map((s) => {
      return `${s.name}: ${s.description}`;
    })
    .join("\n-");

  return `
    Your name is ${personality.name}, you are ${personality.description}.

    You work for ${works_for.business_name}, which is ${works_for.business_description}.
    ${works_for.business_name} uses the tagline ${works_for.business_tagline}.

    The services they provide are:
    - ${mappedServices}

    And the products they provide are:
    - ${mappedProducts}

    Some topics you know about are: ${mappedTopics}.
    Here is some added context for your chats: ${mappedContext}.
  `;
};

const getChatCompletion = async (
  prompt: string,
  apiKey: string,
  channelID: string,
  slackID: string
) => {
  try {
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

    const lastNPreviousMessages = previousMessages.slice(0, 5);

    const totalMessages: {
      role: ChatCompletionRequestMessageRoleEnum;
      content: string;
    }[] = [
      {
        role: "system",
        content: getInitialPrompt(),
      },
      ...lastNPreviousMessages.map((message) => ({
        role: message.role as "user" | "system",
        content: message.content,
      })),
    ];

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [...totalMessages],
    });

    const choice = response.data.choices[0];

    if (!choice.message?.content)
      return "There was an error, please try again.";

    addMessageToConversation(channelID, "assistant", choice.message?.content);

    return choice.message?.content;
  } catch (err) {
    console.error(err);
    markApiKeyEncounteredError(slackID, "openai", "API key error");
    return "Something went wrong connecting to openai, please try again. If the problem persists, contact an administrator.";
  }
};

export const getChatCompletionBySlackID = async (
  prompt: string,
  slackID: string,
  channelID: string
) => {
  try {
    const apiKey = await getOpenAIKeyForUser(slackID);
    if (!apiKey) return false;

    return getChatCompletion(prompt, apiKey, channelID, slackID);
  } catch (err) {
    console.error(err);
    return "Something went wrong with this chat. Please try again.";
  }
};
