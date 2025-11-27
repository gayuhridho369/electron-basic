import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useGetListPos } from '@/hooks/use-pos'
import { ShoppingCart } from 'lucide-react'

export default function PosHistory() {
  const { data, isLoading, error } = useGetListPos()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data?.data.map((item) => (
        <Card key={item.transaction_id} className="h-max gap-0">
          <CardHeader className="border-b border-dashed pb-2!">
            <CardTitle>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-4">
                  <h1 className="inline-flex items-center gap-2 font-semibold">
                    <ShoppingCart className="size-4" /> {item.transaction_id}
                  </h1>
                  <span className="text-sm font-normal">
                    Grans Total: Rp.{' '}
                    {item.items.reduce((acc, curr) => acc + curr.total, 0)}
                  </span>
                </div>
                <p className="font-normal text-sm">{item.items.length} items</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm text-muted-foreground text-medium py-2 flex justify-end">
                  <div className="inline-flex items-center gap-2">
                    View Items
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.items.map((posItem) => (
                        <TableRow key={posItem.id}>
                          <TableCell>{posItem.product_name}</TableCell>
                          <TableCell className="text-right">
                            {posItem.price}
                          </TableCell>
                          <TableCell className="text-right">
                            {posItem.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {posItem.total}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
