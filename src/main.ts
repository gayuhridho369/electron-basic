import path from "node:path";
import { app, BrowserWindow, dialog } from "electron";
import started from "electron-squirrel-startup";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

import { initDatabase } from "./server/database";
import { registerNotesHandlers } from "./server/handlers/note.handler";
import { registerPosHandlers } from "./server/handlers/pos.handler";

// ------------------------------
// Electron Squirrel (Windows)
// ------------------------------
if (started) {
  app.quit();
}

// ------------------------------
// Auto-updater Logger
// ------------------------------
log.transports.file.level = "info";
autoUpdater.logger = log;

// ------------------------------
// Create Main Window
// ------------------------------
let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
      )
    );
  }
};

// ------------------------------
// Auto Update Logic
// ------------------------------
const setupAutoUpdater = () => {
  // Check updates AFTER app is ready
  autoUpdater.checkForUpdates();

  // When update is found
  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info);
    dialog.showMessageBox({
      type: "info",
      title: "Update Available",
      message: `A new version (${info.version}) is available. Download now?`,
      buttons: ["Download", "Later"],
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  // Download progress
  autoUpdater.on("download-progress", (progress) => {
    log.info(`Download progress: ${progress.percent.toFixed(2)}%`);
    mainWindow?.webContents.send("update-progress", progress.percent);
  });

  // When update is downloaded
  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded:", info);
    dialog.showMessageBox({
      type: "info",
      title: "Update Ready",
      message: "Update downloaded. Restart app to install now?",
      buttons: ["Restart", "Later"],
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // Update errors
  autoUpdater.on("error", (err) => {
    log.error("Auto-updater error:", err);
  });
};

// ------------------------------
// App Ready
// ------------------------------
app.on("ready", async () => {
  // Initialize database
  initDatabase();

  // Register IPC handlers
  registerNotesHandlers();
  registerPosHandlers();

  // Create main window
  createWindow();

  // Setup auto-updater after window is ready
  setupAutoUpdater();
});

// ------------------------------
// App Lifecycle
// ------------------------------
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
