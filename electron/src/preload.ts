import { contextBridge, ipcRenderer } from "electron";

/**
 * The only channel between the renderer and main.
 *
 * Implements the DesktopBridge contract the front-end codes against
 * (front-end/src/lib/desktop.ts). Each method is enumerated explicitly: exposing
 * `ipcRenderer` wholesale would hand the renderer every channel there is.
 *
 * The bot token goes one way only. It can be saved and cleared, never read back,
 * so a compromised renderer cannot exfiltrate it.
 */

type Result<T> = { ok: true; value: T } | { ok: false; message: string };

type TelegramStatus =
  | { configured: false }
  | { configured: true; chatId: string };

/** Unwraps the envelope main returns, rethrowing the real message. */
async function unwrap<T>(pending: Promise<Result<T>>): Promise<T> {
  const result = await pending;

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.value;
}

const bridge = {
  telegram: {
    status: (): Promise<TelegramStatus> =>
      unwrap(ipcRenderer.invoke("telegram:status")),

    save: (config: { botToken: string; chatId: string }): Promise<void> =>
      unwrap(ipcRenderer.invoke("telegram:save", config)),

    clear: (): Promise<void> => unwrap(ipcRenderer.invoke("telegram:clear")),

    send: (text: string): Promise<void> =>
      unwrap(ipcRenderer.invoke("telegram:send", text)),
  },

  progress: {
    load: (): Promise<string[]> => unwrap(ipcRenderer.invoke("progress:load")),

    save: (keys: string[]): Promise<void> =>
      unwrap(ipcRenderer.invoke("progress:save", keys)),
  },
};

contextBridge.exposeInMainWorld("desktop", bridge);
