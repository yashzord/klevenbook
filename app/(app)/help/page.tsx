import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'

const sections = [
  {
    title: 'The three documents',
    body: [
      ['Quotation', 'A price offer you send before the customer orders. Nothing is owed yet. When they say yes, open the quotation and press "Make invoice from this quotation". The lines copy across.'],
      ['Invoice', 'The tax document for a sale. Each line carries its own GST rate, charged as IGST. Keep customer GSTINs correct: they print on every invoice.'],
      ['Delivery challan', 'Travels with the goods. It lists quantities and batch or serial numbers but no prices. Open the invoice and press "Make delivery challan" so the lines match.'],
    ],
  },
  {
    title: 'Numbers never skip',
    body: [
      ['Serial numbers', 'Every document gets the next number in its series, for example KC-INV-2026-0007. GST rules want these consecutive, so documents cannot be deleted.'],
      ['Forgot your password', 'On the sign-in page press Forgot your password. A link arrives by email, works once, and lets you set a new one.'],
      ['Made a mistake?', 'Open the document and press Edit. Change anything and save; the number, share link and payments stay the same.'],
      ['Cancelling', 'If a document should not exist at all, press "Cancel this …". It keeps its number, gets a red Cancelled stamp with your reason, and stays in the list.'],
      ['Dates', 'Under every date you pick, the full date is written out, for example Friday, 5 September 2026. If it says a different month than you meant, fix it before saving.'],
      ['New financial year', 'In Settings, change each prefix (for example KC-INV-2027-) and set Next back to 1.'],
    ],
  },
  {
    title: 'Getting paid',
    body: [
      ['Getting paid from the PDF', 'Fill in your bank and UPI details in Settings once. Every invoice then prints a How to pay box and a Pay by date.'],
      ['Record a payment', 'Open the invoice. Below it, enter the amount received, the date and how it was paid. Part payments are fine; add each one as it comes.'],
      ['Who owes you', 'The Outstanding page lists every customer who owes you, with each unpaid invoice underneath. Switch to Vendors to see what you owe. It prints.'],
      ['Wrong entry', 'Remove the payment from the invoice page and add it again. Payments have no serial number, so this is safe.'],
    ],
  },
  {
    title: 'Buying from vendors',
    body: [
      ['Vendors', 'Who you buy from, with their GSTIN and bank details, so paying them needs no second lookup.'],
      ['Purchase bills', 'When a vendor bill arrives, enter it under Purchases with the vendor\'s own bill number and the rates on their bill. Nothing prefills, because your list price is a selling price.'],
      ['Paying vendors', 'Record what you paid on the bill, the same way as customer payments. Home shows what you still owe.'],
      ['For your CA', 'On the Purchases page, download the CSV for the month. It is the input tax credit side of GST.'],
    ],
  },
  {
    title: 'Printing and sending',
    body: [
      ['WhatsApp', 'On any document press "Send on WhatsApp". WhatsApp opens with a message and a private link to the document, addressed to the customer\'s number. They can view and print it without logging in.'],
      ['PDF', 'On any document press "Print or save as PDF". In the print window choose "Save as PDF" as the printer.'],
      ['For your CA', 'On the Invoices page, pick a from and to date and press "Download CSV". It opens in Excel and has every invoice with taxable value and tax split, ready for GSTR-1.'],
    ],
  },
  {
    title: 'Products and customers',
    body: [
      ['List price', 'The price on a product fills in automatically on a new document. You can still change it on any line.'],
      ['Editing', 'Click a name in the Products or Customers list to change it. Documents already made keep what was on them at the time.'],
      ['Deleting', 'Only possible if the product or customer is not on any document. For a customer or vendor that is, press Hide: it leaves the pickers but old documents keep it.'],
    ],
  },
]

export const metadata: Metadata = { title: 'Help' }
export default function HelpPage() {
  return (
    <>
      <PageHeader title="How KlevenBook works" hint={<>Five minutes of reading covers everything. Start with the checklist on <Link href="/" className="text-primary underline-offset-4 hover:underline">Home</Link>. For how the app looks and why, see the <Link href="/design-system" className="text-primary underline-offset-4 hover:underline">design system</Link>.</>} />
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title}>
            <CardHeader><CardTitle>{s.title}</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-4">
                {s.body.map(([term, text]) => (
                  <div key={term}><dt className="font-medium">{term}</dt><dd className="mt-0.5 text-muted-foreground">{text}</dd></div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
