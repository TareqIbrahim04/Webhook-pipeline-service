import crypto from "crypto";
import { config } from "../config/env";

export async function executeAction(actionName: string, payload: any) {
  switch (actionName) {
    case "uppercase":
      if (payload.message) {
        payload.message = payload.message.toUpperCase();
      }
      break;

    case "add_timestamp":
      payload.processedAt = new Date().toISOString();
      break;

    case "shorten_url":
      if (!payload.url) {
        throw new Error("url field is required for shorten_url action");
      }

      const hash = crypto
        .createHash("md5")
        .update(payload.url)
        .digest("hex")
        .slice(0, 6);

      payload.shortCode = hash;
      payload.shortUrl = `http://localhost:${config.port}/s/${hash}`;
      break;

    default:
      console.warn("Unknown action:", actionName);
  }

  return payload;
}
