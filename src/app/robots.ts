import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/',
      disallow: '/api/' },
    sitemap: 'https://meettime-tawny.vercel.app/sitemap.xml',
  }
}
