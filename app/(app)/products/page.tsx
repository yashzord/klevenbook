import type { Metadata } from 'next'
import Link from 'next/link'
import { TriangleAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { inr } from '@/lib/gst'
import type { Product } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/page-header'
import { ProductForm } from './product-form'

export const metadata: Metadata = { title: 'Products' }
export default async function ProductsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').order('name').returns<Product[]>()
  if (error) throw error
  const missing = data.filter((p) => !p.hsn).length

  return (
    <>
      <PageHeader title="Products" hint="What you sell. The list price fills in on documents and can be changed per line. Click a name to edit it." />
      {missing > 0 && (
        <Alert variant="warning" className="mb-6">
          <TriangleAlert />
          <AlertDescription>{missing} of {data.length} products have no HSN code. B2B invoices need at least 4 digits. Copy it from the vendor&apos;s bill.</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader><CardTitle>Add a product</CardTitle></CardHeader>
        <CardContent><ProductForm /></CardContent>
      </Card>
      <Card className="mt-6 py-0">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow><TableHead className="px-4">Name</TableHead><TableHead className="px-4">HSN</TableHead><TableHead className="hidden px-4 sm:table-cell">Unit</TableHead><TableHead className="px-4 text-right">List price</TableHead><TableHead className="px-4 text-right">GST %</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="px-4 py-3 whitespace-normal"><Link href={`/products/${p.id}`} className="font-medium text-primary hover:underline">{p.name}</Link></TableCell>
                <TableCell className="px-4">{p.hsn ?? <Badge variant="warning">Missing</Badge>}</TableCell>
                <TableCell className="hidden px-4 sm:table-cell">{p.unit}</TableCell>
                <TableCell className="px-4 text-right tabular-nums">{inr(p.price)}</TableCell>
                <TableCell className="px-4 text-right tabular-nums">{Number(p.gst_rate)}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && <TableRow><TableCell colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No products yet. Add your first one above.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
