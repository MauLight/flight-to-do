/**
 * The desktop bridge, as the renderer sees it.
 *
 * Mirrors what electron/src/preload.ts exposes. The two are separate packages
 * with no shared types, so this contract is duplicated on purpose — change one
 * and the other has to follow.
 *
 * In a browser there is no main process and so no bridge. Everything here has to
 * cope with `null`: the plan boards work offline and unaided, and only the
 * Telegram send needs the shell.
 */

export type TelegramStatus =
  | { configured: false }
  | { configured: true; chatId: string };

export interface DesktopBridge {
  telegram: {
    status: () => Promise<TelegramStatus>;
    save: (config: { botToken: string; chatId: string }) => Promise<void>;
    clear: () => Promise<void>;
    send: (text: string) => Promise<void>;
  };
  progress: {
    load: () => Promise<string[]>;
    save: (keys: string[]) => Promise<void>;
  };
}

declare global {
  interface Window {
    desktop?: DesktopBridge;
  }
}

/** The bridge, or null when running in a browser rather than the shell. */
export function desktopBridge(): DesktopBridge | null {
  return typeof window === "undefined" ? null : (window.desktop ?? null);
}

export function isDesktop(): boolean {
  return desktopBridge() !== null;
}
