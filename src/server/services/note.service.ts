import { ZodError } from 'zod'
import { NotesRepository } from '../repositories/note.repository'
import type { ApiResponse } from '../schemas/main.schema'
import type { Note, NoteDto } from '../schemas/note.schema'
import { NoteSchema } from '../schemas/note.schema'

export class NotesService {
  private repository: NotesRepository

  constructor() {
    this.repository = new NotesRepository()
  }

  // GET LIST
  async getListService(keyword?: string): Promise<ApiResponse<Note[]>> {
    try {
      const notes = this.repository.getListRepository(keyword)

      console.log(`[Notes Service] Retrieved ${notes.length} notes`)

      return { success: true, data: notes }
    } catch (error) {
      console.error('[Notes Service] GetList error:', error)

      return {
        success: false,
        error: (error as Error).message,
        data: [],
      }
    }
  }

  // GET BY ID
  async getByIdService(id: number): Promise<ApiResponse<Note>> {
    try {
      const note = this.repository.getByIdRepository(id)

      if (!note) {
        console.error(`[Notes Service] Note with ID ${id} not found`)

        return {
          success: false,
          error: `Note with ID ${id} not found`,
        }
      }

      console.log('[Notes Service] Retrieved note:', note.id)

      return { success: true, data: note }
    } catch (error) {
      console.error('[Notes Service] GetById error:', error)

      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  // CREATE
  async createService(dto: NoteDto): Promise<ApiResponse<Note>> {
    try {
      const validatedData = NoteSchema.parse(dto)
      const note = this.repository.createRepository(validatedData)

      console.log('[Notes Service] Created note:', note.id)

      return { success: true, data: note }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('[Notes Service] Validation error:', error.issues)

        return {
          success: false,
          error: 'Validation failed',
          issues: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        }
      }

      console.error('[Notes Service] Create error:', error)

      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  // UPDATE
  async updateService(id: number, dto: NoteDto): Promise<ApiResponse<Note>> {
    try {
      const validatedData = NoteSchema.parse(dto)
      const existingNote = this.repository.getByIdRepository(id)

      if (!existingNote) {
        console.error(`[Notes Service] Note with ID ${id} not found`)

        return {
          success: false,
          error: `Note with ID ${id} not found`,
        }
      }

      const note = this.repository.updateRepository(id, validatedData)

      if (!note) {
        console.error(`[Notes Service] Failed to update note with ID ${id}`)

        return {
          success: false,
          error: 'Failed to update note',
        }
      }

      console.log('[Notes Service] Updated note:', id)

      return { success: true, data: note }
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('[Notes Service] Validation error:', error.issues)

        return {
          success: false,
          error: 'Validation failed',
          issues: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        }
      }

      console.error('[Notes Service] Update error:', error)

      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  // DELETE
  async deleteService(id: number): Promise<ApiResponse<void>> {
    try {
      const existingNote = this.repository.getByIdRepository(id)

      if (!existingNote) {
        console.error(`[Notes Service] Note with ID ${id} not found`)

        return {
          success: false,
          error: `Note with ID ${id} not found`,
        }
      }

      const deleted = this.repository.deleteRepository(id)

      if (!deleted) {
        console.error(`[Notes Service] Failed to delete note with ID ${id}`)

        return {
          success: false,
          error: 'Failed to delete note',
        }
      }

      console.log('[Notes Service] Deleted note:', id)

      return { success: true }
    } catch (error) {
      console.error('[Notes Service] Delete error:', error)

      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }
}
