import { z } from 'zod'

export interface Pos {
  id: number
  transaction_id: string
  barcode: string
  product_name: string
  price: number
  quantity: number
  total: number
  created_at: string
  updated_at: string
}

export const PosSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required').trim(),
  product_name: z.string().min(1, 'Product name is required').trim(),
  price: z.number().min(1, 'Price is required'),
  quantity: z.number().min(1, 'Quantity is required'),
  total: z.number().min(1, 'Total is required'),
})

export type PosDto = z.infer<typeof PosSchema>
