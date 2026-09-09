import { Send } from "lucide-react";
import { useState } from "react";
import { desktopBridge } from "../lib/desktop";

type SendState = "idle" | "sending" | "sent" | "error";

type SendButtonProps = {
  /** The reminder body, built by whoever owns the row's context. */
  text: string;
};

/**
 * Sends one row to Telegram, through the desktop bridge.
 *
 * Renders nothing in a browser: there is no main process there, and so no way
 * to reach Telegram without putting the bot token in the bundle. A button that
 * cannot work is worse than no button.
 */
export function SendButton({ text }: SendButtonProps) {
  const [state, setState] = useState<SendState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const bridge = desktopBridge();

  if (bridge === null) {
    return null;
  }

  async function handleClick() {
    if (bridge === null || state === "sending") {
      return;
    }

    setState("sending");
    setMessage(null);

    try {
      await bridge.telegram.send(text);
      setState("sent");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Send failed.");
    }
  }

  const stateClasses =
    state === "sent"
      ? "text-green-500"
      : state === "error"
        ? "text-red-500"
        : state === "sending"
          ? "text-cyan-500 opacity-40"
          : "text-cyan-500 opacity-70 hover:opacity-100";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "sending"}
      aria-label={`Send a reminder: ${text}`}
      title={message ?? "Send a reminder to Telegram"}
      className={`mt-1 size-4 shrink-0 cursor-pointer bg-transparent transition-opacity ${stateClasses}`}
    >
      <Send className="w-3 h-3" />
    </button>
  );
}
