import * as fs from "node:fs";
import * as path from "node:path";

import Database from "better-sqlite3";
import { app } from "electron";

let db: Database.Database | null = null;

export function initDatabase() {
  let dbPath: string;

  // If the app is packaged, use the userData directory
  if (app.isPackaged) {
    dbPath = path.join(app.getPath("userData"), "electron-basic.db");
  } else {
    // If the app is not packaged, use the src/server/database directory
    const dbDir = path.join(app.getAppPath(), "src", "server", "database");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, "electron-basic.db");
  }

  console.log("[Database] Initializing at:", dbPath);

  db = new Database(dbPath);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Create table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index for faster searching on title
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notes_title 
    ON notes(title)
  `);

  console.log("[Database] Initialized successfully");

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("[Database] not initialized, something went wrong");
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    console.log("[Database] has been closed");
    db = null;
  }
}
