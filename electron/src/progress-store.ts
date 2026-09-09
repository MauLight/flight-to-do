import { app } from "electron";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Checked actions and documents, as one JSON file on the local disk.
 *
 * Nothing here is a secret, so unlike the bot token it is stored in the clear —
 * readable and repairable by hand, which for a checklist someone depends on at
 * an airport is the right trade.
 *
 * The renderer owns the shape and hands over the whole set after each toggle.
 * This module only writes bytes and never interprets a key.
 */

const FILE = "progress.json";

interface ProgressFile {
  /** Bumped only if the key format changes in a way old files cannot satisfy. */
  version: 1;
  /** The composite keys, e.g. "sub:human:1:2" and "doc:cat:5:3". */
  checked: string[];
}

function storePath(): string {
  return path.join(app.getPath("userData"), FILE);
}

/**
 * Returns the checked keys, or an empty list when there is nothing usable.
 *
 * Deliberately forgiving: a missing file is first run, and a corrupt one is
 * indistinguishable from it as far as the user can act on it. Refusing to start
 * over a bad file would strand someone mid-trip with no way back in.
 */
export async function loadProgress(): Promise<string[]> {
  try {
    const parsed: unknown = JSON.parse(await readFile(storePath(), "utf8"));

    if (typeof parsed !== "object" || parsed === null) {
      return [];
    }

    const { checked } = parsed as Partial<ProgressFile>;

    if (!Array.isArray(checked)) {
      return [];
    }

    return checked.filter((key): key is string => typeof key === "string");
  } catch {
    return [];
  }
}

/**
 * Writes to a temporary file and renames it into place. `rename` is atomic
 * within a filesystem, so a crash mid-write leaves the previous state intact
 * rather than a half-written file.
 */
export async function saveProgress(value: unknown): Promise<void> {
  if (!Array.isArray(value) || value.some((key) => typeof key !== "string")) {
    throw new Error("Progress must be a list of keys.");
  }

  const contents: ProgressFile = { version: 1, checked: value as string[] };

  const target = storePath();
  const temporary = `${target}.${process.pid}.tmp`;

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(temporary, JSON.stringify(contents, null, 2), "utf8");
  await rename(temporary, target);
}
