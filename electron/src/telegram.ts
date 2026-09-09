import { loadConfig } from "./telegram-store.js";

/**
 * Posting a reminder to the configured chat.
 *
 * Runs in main so the token never reaches the renderer. Telegram's Bot API is
 * free and unauthenticated beyond the token in the URL, so the token is the
 * whole secret — anything holding it can post as the bot.
 */

/** Telegram rejects anything longer; truncate rather than fail a send. */
const MAX_LENGTH = 4096;

/** Telegram is not reachable offline, and a hung request should not hang the UI. */
const TIMEOUT_MS = 15_000;

export async function sendReminder(text: unknown): Promise<void> {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error("Nothing to send.");
  }

  const config = await loadConfig();

  if (config === null) {
    throw new Error("No Telegram bot is set up yet. Add a bot token and chat id first.");
  }

  const body = text.trim().slice(0, MAX_LENGTH);
  const response = await fetch(
    `https://api.telegram.org/bot${config.botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // HTML rather than MarkdownV2: the plan text is full of parentheses,
      // dashes, periods and slashes that MarkdownV2 treats as syntax and would
      // reject unescaped. HTML needs only &, < and > escaped, which the
      // renderer does when it assembles the message.
      body: JSON.stringify({
        chat_id: config.chatId,
        text: body,
        parse_mode: "HTML",
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );

  if (response.ok) {
    return;
  }

  // Telegram puts the real reason in the body, not the status. A 400 saying
  // "chat not found" and a 401 saying the token is revoked are different
  // problems, and the status alone cannot tell them apart.
  const detail = await readDescription(response);

  throw new Error(
    detail === null
      ? `Telegram refused the message (${response.status}).`
      : `Telegram refused the message: ${detail}`,
  );
}

async function readDescription(response: Response): Promise<string | null> {
  try {
    const parsed: unknown = await response.json();

    if (typeof parsed === "object" && parsed !== null) {
      const { description } = parsed as Partial<Record<string, unknown>>;

      if (typeof description === "string" && description !== "") {
        return description;
      }
    }
  } catch {
    // Non-JSON body; the status is all we have.
  }

  return null;
}
