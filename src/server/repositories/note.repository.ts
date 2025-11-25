import type Database from "better-sqlite3";
import { getDatabase } from "../database";
import type { Note, NoteDto } from "../schemas/note.schema";

export class NotesRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  // GET LIST
  getListRepository(keyword?: string): Note[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notes
      ${keyword ? `WHERE title LIKE ?` : ""}
      ORDER BY created_at DESC
    `);

    return keyword
      ? (stmt.all(`%${keyword}%`) as Note[])
      : (stmt.all() as Note[]);
  }

  // GET BY ID
  getByIdRepository(id: number): Note | null {
    const stmt = this.db.prepare(`
      SELECT * FROM notes WHERE id = ?
    `);

    return stmt.get(id) as Note | null;
  }

  // CREATE
  createRepository(dto: NoteDto): Note {
    const stmt = this.db.prepare(`
      INSERT INTO notes (title, content)
      VALUES (?, ?)
    `);

    const info = stmt.run(dto.title, dto.content);
    return this.getByIdRepository(info.lastInsertRowid as number);
  }

  // UPDATE
  updateRepository(id: number, dto: NoteDto): Note | null {
    const stmt = this.db.prepare(`
      UPDATE notes
      SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(dto.title, dto.content, id);
    return this.getByIdRepository(id);
  }

  // DELETE
  deleteRepository(id: number): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM notes WHERE id = ?
    `);

    const info = stmt.run(id);
    return info.changes > 0;
  }
}
