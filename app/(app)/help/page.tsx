import Link from 'next/link'

const sections = [
  {
    title: 'The three documents',
    body: [
      ['Quotation', 'A price offer you send before the customer orders. Nothing is owed yet. When they say yes, open the quotation and press "Make invoice from this quotation". The lines copy across.'],
      ['Invoice', 'The tax document for a sale. Each line carries its own GST rate. If the customer is in Telangana the tax splits into CGST and SGST; anywhere else it is IGST. This is worked out from the customer\'s GSTIN, so keep GSTINs correct.'],
      ['Delivery challan', 'Travels with the goods. It lists quantities and batch or serial numbers but no prices. Open the invoice and press "Make delivery challan" so the lines match.'],
    ],
  },
  {
    title: 'Numbers never skip',
    body: [
      ['Serial numbers', 'Every document gets the next number in its series, for example KC-INV-2026-0007. GST rules want these consecutive, so documents cannot be deleted.'],
      ['Made a mistake?', 'Open the document and press "Cancel this …". It keeps its number, gets a red Cancelled stamp with your reason, and stays in the list. Then make a fresh one.'],
      ['New financial year', 'In Settings, change each prefix (for example KC-INV-2027-) and set Next back to 1.'],
    ],
  },
  {
    title: 'Printing and sending',
    body: [
      ['PDF', 'On any document press "Print or save as PDF". In the print window choose "Save as PDF" as the printer.'],
      ['For your CA', 'On the Invoices page, pick a from and to date and press "Download CSV". It opens in Excel and has every invoice with taxable value and tax split, ready for GSTR-1.'],
    ],
  },
  {
    title: 'Products and customers',
    body: [
      ['List price', 'The price on a product fills in automatically on a new document. You can still change it on any line.'],
      ['Editing', 'Click a name in the Products or Customers list to change it. Documents already made keep what was on them at the time.'],
      ['Deleting', 'Only possible if the product or customer is not on any document. Otherwise rename it instead.'],
    ],
  },
]

export default function HelpPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">How KlevenBook works</h1>
      <p className="mb-6 text-sm text-ink-soft">Five minutes of reading covers everything. Start with the checklist on <Link href="/" className="text-brand hover:underline">Home</Link>.</p>
      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((s) => (
          <section key={s.title} className="rounded-lg border border-line bg-paper p-5">
            <h2 className="mb-3 font-semibold">{s.title}</h2>
            <dl className="space-y-3 text-sm">
              {s.body.map(([term, text]) => (
                <div key={term}><dt className="font-medium">{term}</dt><dd className="text-ink-soft">{text}</dd></div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </>
  )
}
