import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://meettime-tawny.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },    {
      url: 'https://meettime-tawny.vercel.app/event',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },    {
      url: 'https://meettime-tawny.vercel.app/how-it-works',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },    {
      url: 'https://meettime-tawny.vercel.app/privacy-policy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },    {
      url: 'https://meettime-tawny.vercel.app/terms',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    }
  ]
}
