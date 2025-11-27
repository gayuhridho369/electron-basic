import {
  type UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Note, NoteDto } from '../server/schemas/note.schema'

export const NOTE_QUERY_KEY = {
  GET_LIST: 'notes',
  GET_BY_ID: 'note',
}

export function useGetListNote(keyword?: string) {
  return useQuery({
    queryKey: [NOTE_QUERY_KEY.GET_LIST, keyword],
    queryFn: async () => {
      const result = await window.notesAPI.getList(keyword)

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch notes')
      }

      return result.data
    },
  })
}

export function useGetByIdNote(id: number | null) {
  return useQuery({
    queryKey: [NOTE_QUERY_KEY.GET_BY_ID, id],
    queryFn: async () => {
      const result = await window.notesAPI.getById(id)

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch note')
      }

      return result.data
    },
    enabled: id !== null,
  })
}

export function useCreateNote(
  options?: UseMutationOptions<Note, Error, { dto: NoteDto }>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ dto }: { dto: NoteDto }) => {
      const result = await window.notesAPI.create(dto)

      if (!result.success) {
        if (result.issues && result.issues.length > 0) {
          const errorMessages = result.issues
            .map((err) => `${err.field}: ${err.message}`)
            .join(', ')
          throw new Error(errorMessages)
        }

        throw new Error(result.error || 'Failed to create note')
      }

      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTE_QUERY_KEY.GET_LIST] })
      toast.success('Note created successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    ...options,
  })
}

export function useUpdateNote(
  options?: UseMutationOptions<Note, Error, { id: number; dto: NoteDto }>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: NoteDto }) => {
      const result = await window.notesAPI.update(id, dto)

      if (!result.success) {
        if (result.issues && result.issues.length > 0) {
          const errorMessages = result.issues
            .map((err) => `${err.field}: ${err.message}`)
            .join(', ')
          throw new Error(errorMessages)
        }

        throw new Error(result.error || 'Failed to update note')
      }

      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTE_QUERY_KEY.GET_LIST] })
      toast.success('Note updated successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    ...options,
  })
}

export function useDeleteNote(
  options?: UseMutationOptions<void, Error, { id: number }>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const result = await window.notesAPI.delete(id)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete note')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTE_QUERY_KEY.GET_LIST] })
      toast.success('Note deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    ...options,
  })
}
