import { app, safeStorage } from "electron";
import { readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";

/**
 * The bot token and target chat, encrypted at rest by the OS keychain.
 *
 * The only place either is persisted. Neither travels over the bridge during a
 * send — main reads them here and calls Telegram itself — so the renderer holds
 * the token only while the settings form is open, and never once it is saved.
 *
 * This is also why the token is not bundled: anyone with the .dmg could read a
 * baked-in one straight out of the asar.
 */

/** Ciphertext, so the extension should not suggest anything readable. */
const FILE = "telegram.bin";

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

function storePath(): string {
  return path.join(app.getPath("userData"), FILE);
}

function assertEncryption(): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error(
      "This system's secure storage is unavailable, so the bot token can't be saved safely.",
    );
  }
}

/**
 * Returns the stored config, or null when there is none.
 *
 * Deliberately forgiving: a missing file, a failed decrypt (keychain reset, or
 * the file copied to another machine) and corrupt contents all mean "not
 * configured", which is a first-run state rather than an error.
 */
export async function loadConfig(): Promise<TelegramConfig | null> {
  try {
    const encrypted = await readFile(storePath());
    const parsed: unknown = JSON.parse(safeStorage.decryptString(encrypted));

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const { botToken, chatId } = parsed as Partial<TelegramConfig>;

    if (typeof botToken !== "string" || typeof chatId !== "string") {
      return null;
    }

    if (botToken.trim() === "" || chatId.trim() === "") {
      return null;
    }

    return { botToken: botToken.trim(), chatId: chatId.trim() };
  } catch {
    return null;
  }
}

/**
 * Shape check only, not a liveness check.
 *
 * A bot token is `<bot id>:<secret>`; a chat is either a numeric id — negative
 * for groups, which is easy to mistype as positive — or an @username. Whether
 * the bot can actually post there is answered by the first send, not here.
 */
function validate(value: unknown): TelegramConfig {
  if (typeof value !== "object" || value === null) {
    throw new Error("A bot token and a chat id are required.");
  }

  const { botToken, chatId } = value as Partial<Record<string, unknown>>;

  if (typeof botToken !== "string" || !/^\d+:[A-Za-z0-9_-]{20,}$/.test(botToken.trim())) {
    throw new Error(
      "That doesn't look like a bot token. BotFather issues them as digits, a colon, then a long secret.",
    );
  }

  if (typeof chatId !== "string" || !/^(-?\d+|@[A-Za-z0-9_]{4,})$/.test(chatId.trim())) {
    throw new Error(
      "A chat id is either a number — negative for groups — or an @username.",
    );
  }

  return { botToken: botToken.trim(), chatId: chatId.trim() };
}

export async function saveConfig(value: unknown): Promise<void> {
  const config = validate(value);

  assertEncryption();

  await writeFile(storePath(), safeStorage.encryptString(JSON.stringify(config)), {
    mode: 0o600,
  });
}

export async function clearConfig(): Promise<void> {
  await rm(storePath(), { force: true });
}
