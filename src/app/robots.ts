import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/dashboard', '/admin/booking', '/admin/data', '/admin/users'],
    },
    sitemap: 'https://bumimintarsih.my.id/sitemap.xml',
  }
}
