import { useEffect, useState, type FormEvent } from "react";
import { desktopBridge, type TelegramStatus } from "../lib/desktop";

/**
 * Where the bot token and target chat are entered.
 *
 * Renders nothing in a browser, for the same reason the send button does: there
 * is no main process to hold the token, and the renderer must never be the place
 * it lives. Once saved, the token cannot be read back — the form shows only the
 * chat id and whether a token exists.
 */
export function TelegramSettings() {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const bridge = desktopBridge();

  useEffect(() => {
    if (bridge === null) {
      return;
    }

    let cancelled = false;

    bridge.telegram
      .status()
      .then((next) => {
        if (!cancelled) {
          setStatus(next);
          setChatId(next.configured ? next.chatId : "");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({ configured: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bridge]);

  if (bridge === null) {
    return null;
  }

  function handleToggle() {
    setOpen(!open);
    setError(null);
  }

  function handleTokenChange(event: FormEvent<HTMLInputElement>) {
    setBotToken(event.currentTarget.value);
  }

  function handleChatChange(event: FormEvent<HTMLInputElement>) {
    setChatId(event.currentTarget.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (bridge === null) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await bridge.telegram.save({ botToken, chatId });
      setStatus({ configured: true, chatId: chatId.trim() });
      // Held only as long as the form needed it.
      setBotToken("");
      setOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const configured = status?.configured === true;

  return (
    <div className="mb-4 text-xs">
      <button
        type="button"
        onClick={handleToggle}
        className="cursor-pointer uppercase tracking-wide opacity-70 hover:opacity-100"
      >
        Telegram: {configured ? `sending to ${status?.chatId}` : "not set up"}
      </button>

      {open ? (
        <form onSubmit={handleSubmit} className="mt-3 flex max-w-xl flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="uppercase tracking-wide opacity-60">
              Bot token {configured ? "(leave blank to keep the stored one)" : ""}
            </span>
            <input
              type="password"
              value={botToken}
              onChange={handleTokenChange}
              placeholder="123456789:AA..."
              className="rounded border border-border-active bg-box px-2 py-1 font-mono"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="uppercase tracking-wide opacity-60">Chat id</span>
            <input
              type="text"
              value={chatId}
              onChange={handleChatChange}
              placeholder="-1001234567890 or @channelname"
              className="rounded border border-border-active bg-box px-2 py-1 font-mono"
            />
          </label>

          {error === null ? null : <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="self-start cursor-pointer rounded border border-border-active px-3 py-1 uppercase tracking-wide hover:opacity-100"
          >
            {saving ? "Saving" : "Save"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
