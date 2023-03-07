import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "./entities/user";
import { ApiKey } from "./entities/apikey";
import { Conversation } from "./entities/conversation";
import { Message } from "./entities/message";
import path from "path";

config();

const dataDir = path.join(process.cwd(), "data/database.sqlite");

export const entities = { User, ApiKey, Conversation, Message };

export const database = new DataSource({
  type: "sqlite",
  database: dataDir, // todo: This should probably be an env???????? idk yet tbh
  synchronize: process.env.NODE_ENV === "development",
  entities: Object.values(entities),
});

let initialized = false;
export const setInitializationStatus = (status: boolean) => {
  initialized = status;
};

export const onInitialized = async (callback: () => void, count: number) => {
  if (count > 10) {
    console.error("Max retries exceeded");
    return;
  }
  if (initialized) {
    callback();
  } else {
    setTimeout(() => onInitialized(callback, count + 1), 1000);
  }
};
