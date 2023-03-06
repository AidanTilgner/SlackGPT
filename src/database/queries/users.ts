import { database, entities } from "../index";

export const checkUserExists = async (id: number) => {
  try {
    const user = await database.manager.findOne(entities.User, {
      where: { id },
    });
    if (!user) return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const checkUserExistsBySlackID = async (slackID: string) => {
  try {
    const user = await database.manager.findOne(entities.User, {
      where: { slack_id: slackID },
    });
    if (!user) return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const addUserBySlackID = async (slackID: string) => {
  try {
    const user = new entities.User();
    user.slack_id = slackID;
    await database.manager.save(user);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const checkUserForOpenAIAPIKey = async (slackID: string) => {
  try {
    const user = await database.manager.findOne(entities.User, {
      where: { slack_id: slackID },
      relations: ["api_keys"],
    });
    if (!user) return false;
    console.log("Api keys: ", user.api_keys);

    const openAIKey = user.api_keys.find((key) => key.type === "openai");
    if (!openAIKey) return false;

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const addOpenAIKeyToUser = async (slackID: string, key: string) => {
  try {
    if (!key) return false;
    if (!(key.length > 45)) return false;

    const user = await database.manager.findOne(entities.User, {
      where: { slack_id: slackID },
      relations: ["api_keys"],
    });
    if (!user) return false;

    const newAPIKey = new entities.ApiKey();
    newAPIKey.key = key;
    newAPIKey.type = "openai";
    await database.manager.save(newAPIKey);

    user.api_keys = [...user.api_keys, newAPIKey];
    await database.manager.save(user);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
