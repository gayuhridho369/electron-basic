import { PosRepository } from "../repositories/pos.repository";
import type { ApiResponse } from "../schemas/main.schema";
import type { Pos, PosDto } from "../schemas/pos.schema";
import { PosSchema } from "../schemas/pos.schema";

export class PosService {
  private repository: PosRepository;

  constructor() {
    this.repository = new PosRepository();
  }

  // GET LIST
  async getListService(): Promise<
    ApiResponse<{ transaction_id: string; items: Pos[] }[]>
  > {
    try {
      const pos = this.repository.getListRepository();

      console.log("[Pos Service] Retrieved", pos.length, "transactions");

      return { success: true, data: pos };
    } catch (error) {
      console.error("[Pos Service] GetList error:", error);

      return {
        success: false,
        error: (error as Error).message,
        data: [],
      };
    }
  }

  // CREATE
  async createService(dto: PosDto[]): Promise<ApiResponse<string>> {
    try {
      const validatedData = PosSchema.array().parse(dto);
      const transactionId = this.repository.createRepository(validatedData);

      console.log("[Pos Service] Created pos:", transactionId);

      return { success: true, data: transactionId };
    } catch (error) {
      console.error("[Pos Service] Create error:", error);

      return { success: false, error: (error as Error).message };
    }
  }
}
