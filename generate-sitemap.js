#!/usr/bin/env node

/**
 * Generate sitemap.xml for laon2link SPA
 * Uses query parameters for SPA routing: ?category=slug&product=id
 */

const fs = require('fs');
const path = require('path');

// Read products data
const productsDataPath = path.join(__dirname, 'js', 'products-data.js');
let productsData = [];

try {
    const fileContent = fs.readFileSync(productsDataPath, 'utf8');
    // Extract the productsData array using a simple regex
    const match = fileContent.match(/const productsData = (\[[\s\S]*?\]);/);
    if (match && match[1]) {
        productsData = eval(match[1]);
    }
} catch (error) {
    console.error('Error reading products data:', error.message);
    process.exit(1);
}

// Get unique categories (from category_main_en field)
const categories = new Set();
productsData.forEach(product => {
    if (product.category_main_en && product.category_main_en.trim()) {
        categories.add(product.category_main_en.trim());
    }
});

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Start building sitemap XML
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://laon2link.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

`;

// Add category pages (using query parameters)
const categoryArray = Array.from(categories).sort();
categoryArray.forEach(category => {
    const categorySlug = encodeURIComponent(category);
    sitemap += `  <!-- Category: ${category} -->
  <url>
    <loc>https://laon2link.com/?category=${categorySlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

`;
});

// Add product pages (using query parameters)
sitemap += `  <!-- Individual Products -->\n`;
productsData.forEach(product => {
    if (product.id) {
        sitemap += `  <url>
    <loc>https://laon2link.com/?product=${product.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }
});

sitemap += `</urlset>
`;

// Write sitemap to file
const sitemapPath = path.join(__dirname, 'sitemap.xml');
try {
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📊 Stats:`);
    console.log(`   - Homepage: 1`);
    console.log(`   - Categories: ${categoryArray.length}`);
    console.log(`   - Products: ${productsData.length}`);
    console.log(`   - Total URLs: ${1 + categoryArray.length + productsData.length}`);
    console.log(`📁 Location: ${sitemapPath}`);
} catch (error) {
    console.error('❌ Error writing sitemap:', error.message);
    process.exit(1);
}
