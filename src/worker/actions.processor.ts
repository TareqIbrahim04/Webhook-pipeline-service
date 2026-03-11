import crypto from "crypto";
import { config } from "../config/env";
const { marked } = require("marked");
export async function executeAction(actionName: string, payload: any) {
  switch (actionName) {
    case "markdown_to_html":
      if (!payload.content) {
        throw new Error(
          "content field is required for markdown_to_html action"
        );
      }

      const html = marked.parse(payload.content);

      payload.html = html;
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

    case "generate_qr":
      if (!payload.url) {
        throw new Error("url field is required for generate_qr action");
      }

      payload.qrCodeUrl =
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload.url)}`;

      break;

    default:
      console.warn("Unknown action:", actionName);
  }

  return payload;
}
