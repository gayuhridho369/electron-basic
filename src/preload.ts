import { contextBridge, ipcRenderer } from "electron";
import type { ApiResponse } from "./server/schemas/main.schema";
import type { Note, NoteDto } from "./server/schemas/note.schema";

const notesAPI = {
  getList: (keyword?: string): Promise<ApiResponse<Note[]>> =>
    ipcRenderer.invoke("notes:getList", keyword),

  getById: (id: number): Promise<ApiResponse<Note>> =>
    ipcRenderer.invoke("notes:getById", id),

  create: (dto: NoteDto): Promise<ApiResponse<Note>> =>
    ipcRenderer.invoke("notes:create", dto),

  update: (id: number, dto: NoteDto): Promise<ApiResponse<Note>> =>
    ipcRenderer.invoke("notes:update", id, dto),

  delete: (id: number): Promise<ApiResponse<void>> =>
    ipcRenderer.invoke("notes:delete", id),
};

contextBridge.exposeInMainWorld("notesAPI", notesAPI);

declare global {
  interface Window {
    notesAPI: typeof notesAPI;
  }
}
