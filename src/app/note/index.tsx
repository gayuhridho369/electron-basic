import { useEffect, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateNote,
  useDeleteNote,
  useGetByIdNote,
  useGetListNote,
  useUpdateNote,
} from '@/hooks/use-note'
import { NoteSchema } from '@/server/schemas/note.schema'
import { useForm } from '@tanstack/react-form'
import { LoaderCircle, Pencil, PlusCircle, Search, Trash2 } from 'lucide-react'
import { useDebounceValue } from 'usehooks-ts'

export default function NotePage() {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [debouncedSearchKeyword] = useDebounceValue(searchKeyword, 500)

  const [modalForm, setModalForm] = useState({
    open: false,
    id: null,
  })

  const { data: dataNotes, isLoading: isLoadingNotes } = useGetListNote(
    debouncedSearchKeyword,
  )
  const { data: dataNote, isLoading: isLoadingNote } = useGetByIdNote(
    modalForm.id,
  )

  const { mutateAsync: createNote, isPending: isCreatingNote } = useCreateNote()
  const { mutateAsync: updateNote, isPending: isUpdatingNote } = useUpdateNote()
  const { mutateAsync: deleteNote, isPending: isDeletingNote } = useDeleteNote()

  const isEditing = !!modalForm.id

  console.log(isEditing)

  const form = useForm({
    defaultValues: {
      title: '',
      content: '',
    },
    validators: {
      onChange: NoteSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing) {
          await updateNote({ id: dataNote?.id, dto: value }).then(() => {
            form.reset()
            setModalForm({ open: false, id: null })
          })
        } else {
          await createNote({ dto: value }).then(() => {
            form.reset()
            setModalForm({ open: false, id: null })
          })
        }
      } catch (error) {
        console.error('Form submission error:', error)
      }
    },
  })

  useEffect(() => {
    if (modalForm.open) form.reset()

    if (dataNote && isEditing) {
      form.setFieldValue('title', dataNote.title)
      form.setFieldValue('content', dataNote.content)
    }
  }, [dataNote, form.setFieldValue, isEditing, form.reset, modalForm.open])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Notes</h1>

        <div className="flex items-center gap-2">
          <InputGroup>
            <InputGroupInput
              placeholder="Search..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          <Dialog
            open={modalForm.open}
            onOpenChange={(open) => {
              setModalForm({ open, id: null })
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle /> Create New Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? 'Edit Note' : 'Create New Note'}
                </DialogTitle>
              </DialogHeader>
              <form
                id="note-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
              >
                <FieldGroup>
                  <form.Field
                    name="title"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                          <Input
                            placeholder="Title"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            disabled={isLoadingNote}
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name="content"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Content</FieldLabel>
                          <InputGroup>
                            <Textarea
                              placeholder="Content"
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              className="min-h-36 resize-none"
                              disabled={isLoadingNote}
                            />
                          </InputGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  />
                </FieldGroup>
              </form>

              <DialogFooter>
                <Button
                  variant="outline"
                  disabled={isLoadingNote || isCreatingNote || isUpdatingNote}
                  onClick={() => setModalForm({ open: false, id: null })}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="note-form"
                  disabled={isLoadingNote || isCreatingNote || isUpdatingNote}
                >
                  {isEditing ? 'Update Note' : 'Save Note'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoadingNotes ? (
        <LoaderCircle className="animate-spin size-10 mx-auto my-10" />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {dataNotes?.map((note) => (
            <Card key={note.id}>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{note.title}</CardTitle>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => {
                      setModalForm({ open: true, id: note.id })
                    }}
                  >
                    <Pencil />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon-sm">
                        <Trash2 />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this note?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          disabled={isDeletingNote}
                          onClick={() =>
                            setModalForm({ open: false, id: null })
                          }
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={isDeletingNote}
                          onClick={() => {
                            deleteNote({ id: note.id }).then(() => {
                              setModalForm({ open: false, id: null })
                            })
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>

              <CardContent>
                <p>{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
