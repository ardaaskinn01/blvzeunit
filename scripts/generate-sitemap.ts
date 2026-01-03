import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Anon Key is missing in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DOMAIN = 'https://blvzeunit.com';

const staticRoutes = [
    '/',
    '/categories',
    '/search',
    '/account',
    '/contact',
    '/about',
    '/privacy-policy',
    '/refund-policy',
    '/shipping-policy',
    '/terms-of-service',
    '/legal-notice',
];

async function generateSitemap() {
    console.log('🔄 Generating sitemap...');

    try {
        // 1. Fetch Categories
        const { data: categories, error: categoryError } = await supabase
            .from('categories') // Assuming table name is 'categories' - adjust if needed (e.g., 'collections')
            .select('slug');

        if (categoryError) {
            console.warn('⚠️ Could not fetch categories:', categoryError.message);
        }

        // 2. Fetch Products
        const { data: products, error: productError } = await supabase
            .from('products')
            .select('slug, created_at');

        if (productError) {
            console.warn('⚠️ Could not fetch products:', productError.message);
        }

        // 3. Build XML
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add Static Routes
        staticRoutes.forEach((route) => {
            sitemap += `
  <url>
    <loc>${DOMAIN}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
        });

        // Add Categories
        if (categories) {
            categories.forEach((cat) => {
                sitemap += `
  <url>
    <loc>${DOMAIN}/categories/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
            });
        }

        // Add Products
        if (products) {
            products.forEach((prod) => {
                const lastMod = prod.created_at ? new Date(prod.created_at).toISOString() : new Date().toISOString();
                sitemap += `
  <url>
    <loc>${DOMAIN}/products/${prod.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
            });
        }

        sitemap += `
</urlset>`;

        // 4. Write to file
        const publicDir = join(process.cwd(), 'public');
        writeFileSync(join(publicDir, 'sitemap.xml'), sitemap);

        console.log('✅ Sitemap generated successfully at public/sitemap.xml');
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
