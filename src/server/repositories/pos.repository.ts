import type Database from "better-sqlite3";
import { getDatabase } from "../database";
import type { Pos, PosDto } from "../schemas/pos.schema";

export class PosRepository {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  // GET LIST
  getListRepository(): { transaction_id: string; items: Pos[] }[] {
    const stmt = this.db.prepare(`
      SELECT * FROM pos
      ORDER BY transaction_id DESC, created_at DESC
    `);

    const rows = stmt.all() as Pos[];
    const grouped = new Map<string, Pos[]>();

    for (const row of rows) {
      const current = grouped.get(row.transaction_id);
      if (current) {
        current.push(row);
      } else {
        grouped.set(row.transaction_id, [row]);
      }
    }

    return Array.from(grouped.entries()).map(([transaction_id, items]) => ({
      transaction_id,
      items,
    }));
  }

  // CREATE
  createRepository(dto: PosDto[]): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `TRX-${dateStr}-`;

    const lastStmt = this.db.prepare(`
      SELECT transaction_id FROM pos
      WHERE transaction_id LIKE ?
      ORDER BY transaction_id DESC
      LIMIT 1
    `);

    const lastTransaction = lastStmt.get(`${prefix}%`) as
      | { transaction_id: string }
      | undefined;

    let sequence = 1;
    if (lastTransaction) {
      const lastSeq = parseInt(
        lastTransaction.transaction_id.slice(prefix.length),
        10
      );
      sequence = lastSeq + 1;
    }

    const transaction_id = `${prefix}${sequence.toString().padStart(4, "0")}`;

    const stmt = this.db.prepare(`
      INSERT INTO pos (transaction_id, barcode, product_name, price, quantity, total)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((items: PosDto[]) => {
      for (const item of items) {
        stmt.run(
          transaction_id,
          item.barcode,
          item.product_name,
          item.price,
          item.quantity,
          item.total
        );
      }
    });

    insertMany(dto);

    return transaction_id;
  }
}
