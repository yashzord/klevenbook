import type { MetadataRoute } from 'next'
// Lets the app be added to a phone's home screen. https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KlevenBook',
    short_name: 'KlevenBook',
    description: 'Invoices, quotations, challans and payments for Kleven Care',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f8fb',
    theme_color: '#0f2a52',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  }
}
