const fs = require('fs');
const path = require('path');

// Read the products data JavaScript file
const productsDataContent = fs.readFileSync('./js/products-data.js', 'utf8');

// Extract the productsData array from the file
// The file contains: const productsData = [...]
let productsData;
try {
  // Create a function context to execute the code
  const productDataFunction = new Function(productsDataContent + '; return productsData;');
  productsData = productDataFunction();
} catch (error) {
  console.error('Error loading products data:', error.message);
  process.exit(1);
}

// Create directories if they don't exist
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create SEO-friendly slug from product name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/\[used\]|\[중고\]/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100); // Limit length
}

// Extract model number from product name for SEO title
function extractModelNumber(product) {
  const nameEn = product.name_en || '';
  // Try to find a model number pattern (letters followed by numbers/hyphens)
  const match = nameEn.match(/\b([A-Z]{2,}[-]?[A-Z0-9]{2,})\b/);
  return match ? match[1] : 'Product';
}

// Create clean product name for title
function cleanProductName(name) {
  // Remove [Used], [중고], etc.
  return name
    .replace(/\[used\]|\[중고\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
}

// Read the base HTML template
const template = fs.readFileSync('./index.html', 'utf8');

// Generate product pages
function generateProductPages() {
  createDir('./products');

  console.log(`Generating pages for ${productsData.length} products...`);

  let count = 0;
  productsData.forEach(product => {
    const productId = product.id;
    const modelNumber = extractModelNumber(product);
    const cleanName = cleanProductName(product.name_en || product.name_kr || 'Product');
    const price = product.price_eur_markup || 0;
    const category = product.category_main_en || 'Products';

    // Extract manufacturer from specifications if available
    let manufacturer = 'Various';
    try {
      const specs = JSON.parse(product.specifications || '{}');
      manufacturer = specs.MAKER || specs.Manufacturer || 'Various';
    } catch (e) {
      // Use default
    }

    // Create SEO-friendly title with model number
    const pageTitle = `${modelNumber} - ${cleanName} | laon2link`;

    // Create a description
    const description = `${cleanName}. ${category} component. Price: €${price.toFixed(2)}. ${manufacturer} industrial automation part available from laon2link, Sweden.`;

    // Get first image if available
    const imageUrl = product.images && product.images[0]
      ? `https://laon2link.com/images/products/${product.images[0]}`
      : 'https://laon2link.com/images/no-image.png';

    // Create product-specific HTML
    let productHTML = template;

    // Update title with SEO-friendly format
    productHTML = productHTML.replace(
      /<title>.*?<\/title>/,
      `<title>${pageTitle}</title>`
    );

    // Update meta description
    productHTML = productHTML.replace(
      /<meta name="description" content=".*?">/,
      `<meta name="description" content="${description.substring(0, 160)}">`
    );

    // Update canonical URL using product ID
    productHTML = productHTML.replace(
      /<link rel="canonical" href=".*?">/,
      `<link rel="canonical" href="https://laon2link.com/products/${productId}.html">`
    );

    // Update Open Graph tags
    productHTML = productHTML.replace(
      /<meta property="og:title" content=".*?">/,
      `<meta property="og:title" content="${pageTitle}">`
    );

    productHTML = productHTML.replace(
      /<meta property="og:description" content=".*?">/,
      `<meta property="og:description" content="${description.substring(0, 160)}">`
    );

    productHTML = productHTML.replace(
      /<meta property="og:url" content=".*?">/,
      `<meta property="og:url" content="https://laon2link.com/products/${productId}.html">`
    );

    // Add product-specific structured data right before </head>
    const structuredData = `
    <!-- Product-specific structured data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "${cleanName.replace(/"/g, '\\"')}",
      "image": "${imageUrl}",
      "description": "${description.substring(0, 200).replace(/"/g, '\\"')}",
      "sku": "${productId}",
      "mpn": "${modelNumber}",
      "brand": {
        "@type": "Brand",
        "name": "${manufacturer}"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://laon2link.com/products/${productId}.html",
        "priceCurrency": "EUR",
        "price": "${price.toFixed(2)}",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/UsedCondition",
        "seller": {
          "@type": "Organization",
          "name": "laon2link"
        }
      }
    }
    </script>
</head>`;

    productHTML = productHTML.replace('</head>', structuredData);

    // Add script to auto-load this product
    productHTML = productHTML.replace(
      '<body>',
      `<body>\n<script>window.STATIC_PRODUCT_ID = "${productId}";</script>`
    );

    // Write the file using product ID
    const filename = `./products/${productId}.html`;
    fs.writeFileSync(filename, productHTML);

    count++;
    if (count % 100 === 0) {
      console.log(`  ✓ Generated ${count} pages...`);
    }
  });

  console.log(`✓ Generated ${count} product pages`);
}

// Generate category pages
function generateCategoryPages() {
  const categories = [
    { slug: 'plc', name: 'PLC', fullName: 'Programmable Logic Controllers' },
    { slug: 'servo-motor-driver', name: 'Servo motor/servo driver', fullName: 'Servo Motors and Drivers' },
    { slug: 'stepping-motor-driver', name: 'Stepping motor/driver/BLDC', fullName: 'Stepping Motors and BLDC Drivers' },
    { slug: 'hmi', name: 'HMI', fullName: 'Human Machine Interface' },
    { slug: 'inverter', name: 'INVERTER', fullName: 'Frequency Inverters' },
    { slug: 'sensor', name: 'SENSOR', fullName: 'Industrial Sensors' }
  ];

  categories.forEach(category => {
    createDir(`./${category.slug}`);

    let categoryHTML = template;

    const description = `${category.fullName} - Industrial automation components and ${category.name} parts from laon2link. Premium semiconductor components with competitive pricing from Sweden.`;

    // Update title
    categoryHTML = categoryHTML.replace(
      /<title>.*?<\/title>/,
      `<title>${category.fullName} - ${category.name} Components | laon2link</title>`
    );

    // Update meta description
    categoryHTML = categoryHTML.replace(
      /<meta name="description" content=".*?">/,
      `<meta name="description" content="${description}">`
    );

    // Update canonical URL
    categoryHTML = categoryHTML.replace(
      /<link rel="canonical" href=".*?">/,
      `<link rel="canonical" href="https://laon2link.com/${category.slug}/">`
    );

    // Add script to auto-load this category
    categoryHTML = categoryHTML.replace(
      '<body>',
      `<body>\n<script>window.STATIC_CATEGORY = "${category.name}"; window.STATIC_CATEGORY_LEVEL = "main";</script>`
    );

    fs.writeFileSync(`./${category.slug}/index.html`, categoryHTML);
    console.log(`✓ Generated: ${category.slug}/index.html`);
  });
}

// Generate comprehensive sitemap
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://laon2link.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;

  // Add category pages
  const categories = ['plc', 'servo-motor-driver', 'stepping-motor-driver', 'hmi', 'inverter', 'sensor'];
  categories.forEach(cat => {
    sitemap += `  <url>
    <loc>https://laon2link.com/${cat}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
  });

  console.log(`Adding ${productsData.length} products to sitemap...`);

  // Add all products using product IDs
  let count = 0;
  productsData.forEach(product => {
    const productId = product.id;

    sitemap += `  <url>
    <loc>https://laon2link.com/products/${productId}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;

    count++;
  });

  sitemap += '</urlset>';

  fs.writeFileSync('./sitemap.xml', sitemap);
  console.log(`✓ Generated sitemap.xml with ${count + categories.length + 1} URLs`);
}

// Main execution
console.log('🚀 laon2link Static Page Generator\n');
console.log('========================================\n');

try {
  console.log('Step 1: Generating product pages...');
  generateProductPages();

  console.log('\nStep 2: Generating category pages...');
  generateCategoryPages();

  console.log('\nStep 3: Generating sitemap...');
  generateSitemap();

  console.log('\n========================================');
  console.log('✅ Done! All pages generated successfully.');
  console.log('\nNext steps:');
  console.log('1. Test locally: open products/*.html files');
  console.log('2. Commit: git add .');
  console.log('3. Deploy: git push');
  console.log('4. Submit sitemap.xml to Google Search Console');
} catch (error) {
  console.error('\n❌ Error generating pages:', error.message);
  console.error(error.stack);
  process.exit(1);
}
