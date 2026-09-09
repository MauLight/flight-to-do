import { app, BrowserWindow } from "electron";
import path from "node:path";

import { serveRenderer } from "./static-server.js";
import type { StaticServer } from "./static-server.js";
import { registerIpc } from "./ipc.js";

/**
 * Electron shell for the flight to-do.
 *
 * The renderer is the Vite build, served over http://127.0.0.1 rather than
 * file:// — for the origin, not the transport. An opaque origin would cost the
 * renderer localStorage, which is where progress will live.
 */

/**
 * Pin the name before anything asks for a path.
 *
 * `app.getName()` otherwise falls back to package.json's `name`, which differs
 * from the product name and differs again between dev and packaged — three
 * possible userData directories, and stored data that seems to vanish when you
 * switch. Setting it once keeps the data directory the same everywhere.
 */
app.setName("Flight To-Do");

/** Where the built renderer lives, packaged or not. */
function rendererRoot(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "renderer")
    : // dist/main.js -> electron/ -> repo root -> front-end/dist
      path.join(__dirname, "..", "..", "front-end", "dist");
}

let mainWindow: BrowserWindow | null = null;
let renderer: StaticServer | null = null;
/** Whatever the window is showing — the dev server or the static build. */
let rendererUrl: string | null = null;

function createWindow(url: string): void {
  rendererUrl = url;

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#000000",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // The renderer is treated as untrusted: no Node, isolated context, and
      // sandboxed. Everything privileged goes through preload's bridge.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Avoids the white flash before the first paint, which against this app's
  // black background is especially ugly.
  mainWindow.once("ready-to-show", () => mainWindow?.show());

  // In dev this almost always means the Vite dev server is not up yet; say so
  // rather than leaving a blank window.
  mainWindow.webContents.on(
    "did-fail-load",
    (_event, code, description): void => {
      console.error(
        `Renderer failed to load ${url} (${code} ${description})` +
          (process.env.RENDERER_URL ? " — is `npm run dev:renderer` running?" : ""),
      );
    },
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  void mainWindow.loadURL(url);
}

/**
 * With RENDERER_URL set (`npm run dev:desktop`) the window loads the Vite dev
 * server instead of the static build, so edits hot-reload in place. Still an
 * http://localhost origin, so everything else behaves identically — the only
 * difference is who serves the assets.
 *
 * The variable is per-invocation, so `npm start` always gets the static build.
 */
async function start(): Promise<void> {
  registerIpc();

  const devUrl = process.env.RENDERER_URL;

  if (devUrl !== undefined && devUrl !== "") {
    console.log(`Loading renderer from ${devUrl} (dev)`);
    createWindow(devUrl);
    return;
  }

  renderer = await serveRenderer(rendererRoot());
  createWindow(renderer.url);
}

void app.whenReady().then(async () => {
  await start();

  // macOS: clicking the dock icon with no windows open reopens one.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && rendererUrl !== null) {
      createWindow(rendererUrl);
    }
  });
});

app.on("window-all-closed", () => {
  // macOS apps normally stay alive with no windows; this one has nothing to do
  // without a window, so it exits everywhere.
  app.quit();
});

app.on("before-quit", () => {
  void renderer?.close();
});
