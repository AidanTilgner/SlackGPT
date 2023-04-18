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

    const openAIKey = user.api_keys.find((key) => key.type === "openai");
    if (!openAIKey) return false;

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const addOpenAIKeyToUser = async (
  slackID: string,
  key: string,
  type: string,
  noDuplication: boolean
) => {
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
    newAPIKey.type = type;
    await database.manager.save(newAPIKey);

    if (noDuplication) {
      user.api_keys = user.api_keys.filter((k) => k.type !== type);
    }

    user.api_keys = [...user.api_keys, newAPIKey];
    await database.manager.save(user);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getOpenAIKeyForUser = async (slackID: string) => {
  try {
    const user = await database.manager.findOne(entities.User, {
      where: { slack_id: slackID },
      relations: ["api_keys"],
    });
    if (!user) return false;

    const openAIKey = user.api_keys.find((key) => key.type === "openai");
    if (!openAIKey) return false;

    return openAIKey.key;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const clearAllAPIKeysForUser = async (slackID: string) => {
  try {
    const user = await database.manager.findOne(entities.User, {
      where: { slack_id: slackID },
      relations: ["api_keys"],
    });
    if (!user) return false;

    await database.manager.remove(user.api_keys);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const markApiKeyEncounteredError = async (
  slackID: string,
  type: string,
  error: string
) => {
  try {
    const user = await database.manager.findOne(entities.User, {
      where: {
        slack_id: slackID,
      },
      relations: ["api_keys"],
    });
    if (!user) return false;

    const apiKey = user.api_keys.find((k) => k.type === type);
    if (!apiKey) return false;

    apiKey.encounteredError = error;

    await database.manager.save(apiKey);

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const checkUserApiKeyHasEncounteredError = async (
  slackID: string,
  type: string
) => {
  try {
    const user = await database.manager.findOne(entities.User, {
      where: {
        slack_id: slackID,
      },
      relations: ["api_keys"],
    });
    if (!user) return false;

    const apiKey = user.api_keys.find((k) => k.type === type);

    console.log("Checking api key: ", apiKey);
    if (!apiKey) return false;
    if (!apiKey.encounteredError) return false;

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
