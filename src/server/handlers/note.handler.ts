import { ipcMain } from 'electron'
import type { NoteDto } from '../schemas/note.schema'
import { NotesService } from '../services/note.service'

export function registerNotesHandlers() {
  const notesService = new NotesService()

  ipcMain.handle('notes:getList', async (_, keyword?: string) => {
    return await notesService.getListService(keyword)
  })

  ipcMain.handle('notes:getById', async (_, id: number) => {
    return await notesService.getByIdService(id)
  })

  ipcMain.handle('notes:create', async (_, dto: NoteDto) => {
    return await notesService.createService(dto)
  })

  ipcMain.handle('notes:update', async (_, id: number, dto: NoteDto) => {
    return await notesService.updateService(id, dto)
  })

  ipcMain.handle('notes:delete', async (_, id: number) => {
    return await notesService.deleteService(id)
  })

  console.log('[Note Handler] has been registered ✓')
}
