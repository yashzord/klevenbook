import type { MetadataRoute } from 'next'
// Private business tool: nothing here is for search engines.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } }
}
