import { z } from "zod";

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const NoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),

  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content must be less than 1000 characters")
    .trim(),
});

export type NoteDto = z.infer<typeof NoteSchema>;
