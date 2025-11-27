import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldSet } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCreatePos } from '@/hooks/use-pos'
import { PosSchema } from '@/server/schemas/pos.schema'
import { useForm } from '@tanstack/react-form'
import {
  DollarSignIcon,
  Plus,
  RefreshCcw,
  ShoppingCart,
  XIcon,
} from 'lucide-react'
import { Toaster } from 'sonner'
import { z } from 'zod'

export default function App() {
  const [grandTotal, setGrandTotal] = useState<number>(0)

  const { mutateAsync: createPos, isPending: isCreatingPos } = useCreatePos()

  const form = useForm({
    defaultValues: {
      items: [
        {
          barcode: '',
          product_name: '',
          price: 0,
          quantity: 1,
          total: 0,
        },
      ],
    },
    validators: {
      onSubmit: z.object({
        items: PosSchema.array().min(1, 'Add at least one product.'),
      }),
    },
    onSubmit: async ({ value }) => {
      await createPos(value.items).then(() => {
        form.reset()
        setGrandTotal(0)
      })
    },
  })

  return (
    <>
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Point of Sales
            </CardTitle>
            <CardDescription>
              Add products to create a transaction
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form
              id="form-pos"
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <form.Field name="items" mode="array">
                {(field) => {
                  const handleAddNewRowAndFocus = () => {
                    const newIndex = field.state.value.length
                    field.pushValue({
                      barcode: '',
                      product_name: '',
                      price: 0,
                      quantity: 1,
                      total: 0,
                    })
                    requestAnimationFrame(() => {
                      const el = document.getElementById(
                        `barcode-${newIndex}`,
                      ) as HTMLInputElement | null
                      el?.focus()
                    })
                  }

                  return (
                    <FieldSet
                      className="gap-4"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) {
                          e.preventDefault()
                          handleAddNewRowAndFocus()
                        }
                      }}
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">#</TableHead>
                            <TableHead>Barcode</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead className="w-[100px]">QTY</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {field.state.value.map((_, index) => {
                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {index + 1}
                                </TableCell>

                                <TableCell>
                                  <form.Field
                                    name={`items[${index}].barcode`}
                                    children={(subField) => {
                                      const isSubFieldInvalid =
                                        subField.state.meta.isTouched &&
                                        !subField.state.meta.isValid
                                      return (
                                        <div>
                                          <InputGroup>
                                            <InputGroupInput
                                              id={`barcode-${index}`}
                                              name={subField.name}
                                              value={subField.state.value}
                                              onChange={(e) =>
                                                subField.handleChange(
                                                  e.target.value,
                                                )
                                              }
                                              aria-invalid={isSubFieldInvalid}
                                              placeholder="1234567890"
                                              autoFocus
                                            />
                                          </InputGroup>
                                        </div>
                                      )
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  <form.Field
                                    name={`items[${index}].product_name`}
                                    children={(subField) => {
                                      const isSubFieldInvalid =
                                        subField.state.meta.isTouched &&
                                        !subField.state.meta.isValid
                                      return (
                                        <div>
                                          <InputGroup>
                                            <InputGroupInput
                                              id={`product_name-${index}`}
                                              name={subField.name}
                                              value={subField.state.value}
                                              onChange={(e) =>
                                                subField.handleChange(
                                                  e.target.value,
                                                )
                                              }
                                              aria-invalid={isSubFieldInvalid}
                                              placeholder="Product name"
                                            />
                                          </InputGroup>
                                        </div>
                                      )
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  <form.Field
                                    name={`items[${index}].quantity`}
                                    children={(subField) => {
                                      const isSubFieldInvalid =
                                        subField.state.meta.isTouched &&
                                        !subField.state.meta.isValid
                                      return (
                                        <div>
                                          <InputGroup>
                                            <InputGroupInput
                                              id={`quantity-${index}`}
                                              name={subField.name}
                                              type="number"
                                              min="1"
                                              value={subField.state.value || ''}
                                              onChange={(e) =>
                                                subField.handleChange(
                                                  parseFloat(e.target.value) ||
                                                    0,
                                                )
                                              }
                                              onBlur={(e) => {
                                                const quantity =
                                                  parseFloat(e.target.value) ||
                                                  0
                                                const price =
                                                  form.state.values.items[index]
                                                    .price || 0
                                                form.setFieldValue(
                                                  `items[${index}].total`,
                                                  quantity * price,
                                                )
                                                const grandTotal =
                                                  form.state.values.items.reduce(
                                                    (sum, item) =>
                                                      sum + item.total,
                                                    0,
                                                  )
                                                setGrandTotal(grandTotal)
                                                subField.handleBlur()
                                              }}
                                              aria-invalid={isSubFieldInvalid}
                                              placeholder="1"
                                            />
                                          </InputGroup>
                                        </div>
                                      )
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  <form.Field
                                    name={`items[${index}].price`}
                                    children={(subField) => {
                                      const isSubFieldInvalid =
                                        subField.state.meta.isTouched &&
                                        !subField.state.meta.isValid
                                      return (
                                        <div>
                                          <InputGroup>
                                            <InputGroupAddon align="inline-start">
                                              <span className="text-sm text-muted-foreground">
                                                Rp
                                              </span>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                              id={`price-${index}`}
                                              name={subField.name}
                                              type="number"
                                              min="0"
                                              value={subField.state.value || ''}
                                              onChange={(e) =>
                                                subField.handleChange(
                                                  parseFloat(e.target.value) ||
                                                    0,
                                                )
                                              }
                                              onBlur={(e) => {
                                                const price =
                                                  parseFloat(e.target.value) ||
                                                  0
                                                const quantity =
                                                  form.state.values.items[index]
                                                    .quantity || 0
                                                form.setFieldValue(
                                                  `items[${index}].total`,
                                                  quantity * price,
                                                )
                                                const grandTotal =
                                                  form.state.values.items.reduce(
                                                    (sum, item) =>
                                                      sum + item.total,
                                                    0,
                                                  )
                                                setGrandTotal(grandTotal)
                                                subField.handleBlur()
                                              }}
                                              aria-invalid={isSubFieldInvalid}
                                              placeholder="0"
                                            />
                                          </InputGroup>
                                        </div>
                                      )
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  <form.Field
                                    name={`items[${index}].total`}
                                    children={(subField) => {
                                      const isSubFieldInvalid =
                                        subField.state.meta.isTouched &&
                                        !subField.state.meta.isValid
                                      return (
                                        <div>
                                          <InputGroup>
                                            <InputGroupAddon align="inline-start">
                                              <span className="text-sm text-muted-foreground">
                                                Rp
                                              </span>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                              id={`total-${index}`}
                                              name={subField.name}
                                              type="number"
                                              min="0"
                                              value={subField.state.value || ''}
                                              aria-invalid={isSubFieldInvalid}
                                              disabled
                                              placeholder="0"
                                            />
                                          </InputGroup>
                                        </div>
                                      )
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  {field.state.value.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => field.removeValue(index)}
                                      aria-label={`Remove item ${index + 1}`}
                                    >
                                      <XIcon className="w-4 h-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-right font-bold"
                            >
                              Grand Total
                            </TableCell>
                            <TableCell className="font-bold text-lg">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                              }).format(grandTotal)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>

                      <div className="flex justify-between items-center pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddNewRowAndFocus}
                          className="w-full"
                        >
                          <Plus />
                          Add More
                        </Button>
                      </div>
                    </FieldSet>
                  )
                }}
              </form.Field>
            </form>
          </CardContent>

          <CardFooter className="border-t">
            <div className="flex justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setGrandTotal(0)
                }}
                disabled={isCreatingPos}
              >
                <RefreshCcw /> Reset
              </Button>
              <Button
                type="submit"
                form="form-pos"
                size="lg"
                disabled={isCreatingPos}
              >
                <DollarSignIcon className="w-4 h-4 mr-2" />
                Complete Transaction
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Toaster />
    </>
  )
}
