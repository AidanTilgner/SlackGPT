import { database, entities } from "..";
import type { ChatCompletionRequestMessageRoleEnum } from "openai";

export const checkChannelConversationExists = async (channelID: string) => {
  try {
    const conversation = await database.manager.findOne(entities.Conversation, {
      where: { channel_id: channelID },
    });
    if (!conversation) return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const addMessageToConversation = async (
  channelID: string,
  role: ChatCompletionRequestMessageRoleEnum,
  content: string
) => {
  try {
    const conversation = await database.manager.findOne(entities.Conversation, {
      where: { channel_id: channelID },
      relations: ["messages"],
    });
    if (!conversation) return false;
    const message = new entities.Message();
    message.role = role;
    message.content = content;
    message.conversation = conversation;
    await database.manager.save(message);

    conversation.messages = [
      ...(conversation.messages?.length ? conversation.messages : []),
      message,
    ];
    await database.manager.save(conversation);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const addMessageToConversationOrCreateIfNotExists = async (
  channelID: string,
  role: ChatCompletionRequestMessageRoleEnum,
  content: string
) => {
  try {
    const conversation = await database.manager.findOne(entities.Conversation, {
      where: { channel_id: channelID },
    });
    if (!conversation) {
      const newConversation = new entities.Conversation();
      newConversation.channel_id = channelID;
      await database.manager.save(newConversation);

      const added = addMessageToConversation(channelID, role, content);
      return added;
    }
    console.log("Adding new message to conversation: ", conversation);
    const added = addMessageToConversation(channelID, role, content);

    return added;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getConversationMessages = async (channelID: string) => {
  try {
    const conversation = await database.manager.findOne(entities.Conversation, {
      where: { channel_id: channelID },
      relations: ["messages"],
    });
    if (!conversation) return [];
    console.log("Conversation: ", conversation);
    console.log("Messages: ", conversation.messages);
    return conversation.messages;
  } catch (error) {
    console.error(error);
    return false;
  }
};
