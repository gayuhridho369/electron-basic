import { contextBridge, ipcRenderer } from 'electron'
import type { ApiResponse } from './server/schemas/main.schema'
import type { Note, NoteDto } from './server/schemas/note.schema'
import type { Pos, PosDto } from './server/schemas/pos.schema'

const notesAPI = {
  getList: (keyword?: string): Promise<ApiResponse<Note[]>> =>
    ipcRenderer.invoke('notes:getList', keyword),

  getById: (id: number): Promise<ApiResponse<Note>> =>
    ipcRenderer.invoke('notes:getById', id),

  create: (dto: NoteDto): Promise<ApiResponse<Note>> =>
    ipcRenderer.invoke('notes:create', dto),

  update: (id: number, dto: NoteDto): Promise<ApiResponse<Note>> =>
    ipcRenderer.invoke('notes:update', id, dto),

  delete: (id: number): Promise<ApiResponse<void>> =>
    ipcRenderer.invoke('notes:delete', id),
}

const posAPI = {
  getList: (): Promise<
    ApiResponse<{ transaction_id: string; items: Pos[] }[]>
  > => ipcRenderer.invoke('pos:getList'),

  create: (dto: PosDto[]): Promise<ApiResponse<string>> =>
    ipcRenderer.invoke('pos:create', dto),
}

contextBridge.exposeInMainWorld('notesAPI', notesAPI)
contextBridge.exposeInMainWorld('posAPI', posAPI)
declare global {
  interface Window {
    notesAPI: typeof notesAPI
    posAPI: typeof posAPI
  }
}
