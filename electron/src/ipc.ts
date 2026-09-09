import { ipcMain } from "electron";

import { loadProgress, saveProgress } from "./progress-store.js";
import { sendReminder } from "./telegram.js";
import { clearConfig, loadConfig, saveConfig } from "./telegram-store.js";

/**
 * Every channel the renderer can reach.
 *
 * Enumerated here and mirrored one-to-one in preload. The renderer never sees
 * `ipcRenderer` itself, so this list is the whole attack surface.
 */
export const CHANNELS = {
  telegramStatus: "telegram:status",
  telegramSave: "telegram:save",
  telegramClear: "telegram:clear",
  telegramSend: "telegram:send",
  progressLoad: "progress:load",
  progressSave: "progress:save",
} as const;

export type Result<T> = { ok: true; value: T } | { ok: false; message: string };

/**
 * Failures are returned, not thrown.
 *
 * An `ipcMain.handle` rejection reaches the renderer wrapped in "Error invoking
 * remote method ...", which buries the part the user needs to read — Telegram's
 * own "chat not found" or "unauthorized". An envelope keeps the message intact.
 */
async function attempt<T>(run: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await run() };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }
}

export function registerIpc(): void {
  // Never a getter for the token itself — only whether there is one. The
  // renderer has no reason to hold it, so the bridge gives it no way to. The
  // chat id comes back because the settings form shows it.
  ipcMain.handle(CHANNELS.telegramStatus, () =>
    attempt(async () => {
      const config = await loadConfig();

      return config === null
        ? { configured: false as const }
        : { configured: true as const, chatId: config.chatId };
    }),
  );

  ipcMain.handle(CHANNELS.telegramSave, (_event, value: unknown) =>
    attempt(() => saveConfig(value)),
  );

  ipcMain.handle(CHANNELS.telegramClear, () => attempt(() => clearConfig()));

  ipcMain.handle(CHANNELS.telegramSend, (_event, text: unknown) =>
    attempt(() => sendReminder(text)),
  );

  ipcMain.handle(CHANNELS.progressLoad, () => attempt(() => loadProgress()));
  ipcMain.handle(CHANNELS.progressSave, (_event, keys: unknown) =>
    attempt(() => saveProgress(keys)),
  );
}
