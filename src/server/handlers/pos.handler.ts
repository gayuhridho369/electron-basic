import { ipcMain } from 'electron'
import type { PosDto } from '../schemas/pos.schema'
import { PosService } from '../services/pos.service'

export function registerPosHandlers() {
  const posService = new PosService()

  ipcMain.handle('pos:getList', async () => {
    return await posService.getListService()
  })

  ipcMain.handle('pos:create', async (_, dto: PosDto[]) => {
    return await posService.createService(dto)
  })
}
