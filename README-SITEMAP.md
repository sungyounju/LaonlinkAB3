# Sitemap Generation Guide

## Overview
This project uses a custom sitemap generator that creates `sitemap.xml` based on the products in `js/products-data.js`.

## Why Custom Sitemap?
This is a Single Page Application (SPA) that uses query parameters for routing:
- Homepage: `https://laon2link.com/`
- Categories: `https://laon2link.com/?category=CategoryName`
- Products: `https://laon2link.com/?product=1234`

Standard sitemap generators don't work well with SPAs, so we built a custom one.

## How to Regenerate Sitemap

Whenever you update products data, regenerate the sitemap:

```bash
node generate-sitemap.js
```

This will:
1. Read all products from `js/products-data.js`
2. Extract unique categories
3. Generate `sitemap.xml` with:
   - Homepage (1 URL)
   - All categories (39 URLs)
   - All products (3,912 URLs)
   - **Total: 3,952 URLs**

## Current Sitemap Stats
- **Homepage:** 1 URL
- **Categories:** 39 URLs
- **Products:** 3,912 URLs
- **Total:** 3,952 URLs
- **Last Updated:** 2025-11-04

## Sitemap URL Format
All URLs use query parameters for SPA routing:
```
https://laon2link.com/?category=PLC
https://laon2link.com/?product=1002
```

## Google Search Console
After regenerating:
1. Commit and push changes
2. Go to [Google Search Console](https://search.google.com/search-console)
3. Navigate to Sitemaps section
4. Submit or resubmit: `https://laon2link.com/sitemap.xml`

## Server Configuration
The sitemap is served with proper headers via:
- **Firebase:** See `firebase.json` - sets `Content-Type: application/xml`
- **Netlify:** See `netlify.toml` - sets proper headers and caching

## robots.txt
The `robots.txt` file automatically points to the sitemap:
```
Sitemap: https://laon2link.com/sitemap.xml
```

## Validation
Test your sitemap:
1. **XML Validation:** https://www.xml-sitemaps.com/validate-xml-sitemap.html
2. **Google Test:** https://search.google.com/search-console (Sitemaps section)
3. **Manual Check:** Visit https://laon2link.com/sitemap.xml in browser

## Troubleshooting

### "Couldn't fetch" error in Google Search Console
- **Fixed!** The old sitemap used URLs like `/products/1002.html` which don't exist
- The new sitemap uses `?product=1002` which correctly routes through the SPA
- After deploying, wait 24-48 hours for Google to recrawl

### Sitemap too large (>50MB or >50,000 URLs)
Current size is well under limits (3,952 URLs), but if you exceed 50,000:
1. Split into multiple sitemaps
2. Create a sitemap index file
3. Update `robots.txt` to point to the index

## Files Modified
- ✅ `sitemap.xml` - Generated sitemap with correct URLs
- ✅ `generate-sitemap.js` - Sitemap generator script
- ✅ `firebase.json` - Added headers for sitemap
- ✅ `netlify.toml` - Added headers for sitemap
- ✅ `robots.txt` - Already points to sitemap (no changes needed)
