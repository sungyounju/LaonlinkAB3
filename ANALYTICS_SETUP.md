# Website Analytics Setup Guide

## Overview
This guide provides recommendations for tracking visitors and gathering statistics for your LaonLinkAB e-commerce website.

## Recommended Analytics Solutions

### 1. **Google Analytics 4 (GA4)** - Recommended for Most Use Cases

**Pros:**
- Free for most usage levels
- Comprehensive visitor tracking
- Real-time reporting
- E-commerce tracking
- Custom events and conversions
- Integration with Google Ads
- GDPR-compliant with proper setup

**Setup:**
1. Go to https://analytics.google.com/
2. Create a new GA4 property
3. Get your Measurement ID (format: G-XXXXXXXXXX)
4. Add this code to `index.html` before closing `</head>` tag:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Track E-commerce Events:**
Add this to `js/main.js` to track product views and cart additions:

```javascript
// Add after opening a product modal
function trackProductView(product) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'view_item', {
      currency: 'EUR',
      value: product.price_eur_markup,
      items: [{
        item_id: product.id,
        item_name: product.name_en,
        item_category: product.category_main_en,
        item_category2: product.category_sub_en,
        price: product.price_eur_markup,
        quantity: 1
      }]
    });
  }
}

// Add when item added to cart
function trackAddToCart(product, quantity) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'add_to_cart', {
      currency: 'EUR',
      value: product.price_eur_markup * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name_en,
        item_category: product.category_main_en,
        price: product.price_eur_markup,
        quantity: quantity
      }]
    });
  }
}
```

**What You Can Track:**
- Total visitors (daily, weekly, monthly)
- Page views
- Session duration
- Bounce rate
- Traffic sources (direct, search, social, referral)
- Geographic location of visitors
- Device types (mobile, tablet, desktop)
- Browser and OS information
- Most viewed products
- Search queries
- Cart additions (with custom events)
- Category navigation patterns

---

### 2. **Plausible Analytics** - Privacy-Focused Alternative

**Pros:**
- Privacy-friendly (no cookies, GDPR/CCPA compliant by default)
- Lightweight (< 1KB script)
- Simple, clean dashboard
- Open-source
- No impact on page load speed

**Cons:**
- Paid service ($9/month for 10k pageviews)
- Less detailed than GA4

**Setup:**
1. Sign up at https://plausible.io/
2. Add your domain
3. Add this code before closing `</head>` in `index.html`:

```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

**Custom Events:**
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.tagged-events.js"></script>

<script>
// Track cart additions
function trackPlausibleEvent(eventName, props) {
  if (typeof plausible !== 'undefined') {
    plausible(eventName, { props: props });
  }
}

// Usage:
trackPlausibleEvent('Add to Cart', { product: productName, price: price });
</script>
```

---

### 3. **Simple Analytics** - Cookie-Free Alternative

**Pros:**
- No cookies required
- GDPR/CCPA compliant
- Clean interface
- Real-time stats

**Cons:**
- Paid ($19/month)
- Simpler feature set

**Setup:**
```html
<script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
<noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" /></noscript>
```

---

### 4. **Matomo** - Self-Hosted Option

**Pros:**
- 100% data ownership
- GDPR compliant
- Extensive features
- Free (self-hosted)

**Cons:**
- Requires server setup
- More complex to maintain
- Not suitable for static hosting

---

### 5. **Umami** - Simple Self-Hosted

**Pros:**
- Open-source and free
- Privacy-focused
- Easy to deploy (Vercel, Railway, etc.)
- Modern UI

**Setup:**
1. Deploy Umami to Vercel/Railway: https://umami.is/docs/install
2. Add tracking code to your site

---

## Recommended Setup for Your Website

**For LaonLinkAB, I recommend:**

### Option A: Google Analytics 4 (Best for detailed insights)
- Free
- Most comprehensive data
- Easy to set up
- Industry standard

### Option B: Plausible (Best for privacy + simplicity)
- Privacy-friendly
- Lightweight
- Clean interface
- European-hosted

---

## Implementation Steps (Google Analytics 4)

### Step 1: Create GA4 Property
1. Go to https://analytics.google.com
2. Click "Admin" → "Create Property"
3. Enter property details
4. Get your Measurement ID (G-XXXXXXXXXX)

### Step 2: Add to index.html
Add this before `</head>`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Step 3: Add E-commerce Tracking to main.js

Add this helper function:

```javascript
// Analytics helper functions
function trackEvent(eventName, params) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params);
  }
}

function trackProductView(product) {
  trackEvent('view_item', {
    currency: 'EUR',
    value: product.price_eur_markup,
    items: [{
      item_id: product.id,
      item_name: currentLanguage === 'en' ? product.name_en : product.name_kr,
      item_category: product.category_main_en,
      item_category2: product.category_sub_en,
      price: product.price_eur_markup
    }]
  });
}

function trackAddToCart(product, quantity) {
  trackEvent('add_to_cart', {
    currency: 'EUR',
    value: product.price_eur_markup * quantity,
    items: [{
      item_id: product.id,
      item_name: currentLanguage === 'en' ? product.name_en : product.name_kr,
      item_category: product.category_main_en,
      price: product.price_eur_markup,
      quantity: quantity
    }]
  });
}

function trackSearch(searchTerm, resultsCount) {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount
  });
}

function trackCategoryView(category, level) {
  trackEvent('view_category', {
    category_name: category,
    category_level: level
  });
}
```

### Step 4: Add Tracking Calls

**In `showProductModal()` function:**
```javascript
function showProductModal(productId) {
  const product = currentProducts.find(p => p.id === productId);
  if (!product) return;

  // Track product view
  trackProductView(product);

  // ... rest of the function
}
```

**In `addToCart()` function:**
```javascript
function addToCart(productId) {
  const product = currentProducts.find(p => p.id === productId);
  if (!product) return;

  // ... existing cart logic ...

  // Track add to cart
  trackAddToCart(product, 1);

  // ... rest of the function
}
```

**In `performSearch()` function:**
```javascript
function performSearch() {
  const searchTerm = document.getElementById('searchInput').value.trim();
  // ... search logic ...

  // Track search
  trackSearch(searchTerm, filteredProducts.length);

  // ... rest of the function
}
```

**In `selectCategory()` function:**
```javascript
function selectCategory(category, level, parent = null, grandparent = null) {
  // ... existing logic ...

  // Track category view
  trackCategoryView(category, level);

  // ... rest of the function
}
```

---

## Key Metrics to Monitor

Once set up, monitor these key metrics:

### Traffic Metrics
- **Daily/Weekly/Monthly Visitors**: How many people visit
- **Page Views**: Total pages viewed
- **Session Duration**: How long visitors stay
- **Bounce Rate**: Visitors who leave immediately

### Behavior Metrics
- **Top Products**: Most viewed products
- **Top Categories**: Most popular categories
- **Search Terms**: What users search for
- **Device Breakdown**: Mobile vs desktop users

### E-commerce Metrics
- **Product Views**: Which products get attention
- **Cart Additions**: Conversion from view to cart
- **Category Performance**: Which categories drive traffic

### Acquisition Metrics
- **Traffic Sources**: Where visitors come from
  - Direct
  - Organic search
  - Paid search
  - Social media
  - Referral sites
- **Geographic Location**: Which countries visit most

---

## Privacy Considerations

### GDPR Compliance
If using Google Analytics:
1. Add a cookie consent banner
2. Anonymize IP addresses:
   ```javascript
   gtag('config', 'G-XXXXXXXXXX', {
     'anonymize_ip': true
   });
   ```
3. Add privacy policy page
4. Allow users to opt-out

### Cookie-Free Options
- Plausible
- Simple Analytics
- Umami

These don't use cookies and are automatically GDPR compliant.

---

## Dashboard Access

### Google Analytics 4
- Access: https://analytics.google.com
- Real-time: View current active users
- Reports: Pre-built reports for traffic, behavior, conversions
- Explore: Custom report builder

### Mobile App
Download Google Analytics mobile app for iOS/Android to check stats on the go.

---

## Cost Comparison

| Solution | Cost | Setup Difficulty | Features |
|----------|------|------------------|----------|
| Google Analytics 4 | Free | Easy | ⭐⭐⭐⭐⭐ |
| Plausible | $9/mo | Very Easy | ⭐⭐⭐ |
| Simple Analytics | $19/mo | Very Easy | ⭐⭐⭐ |
| Umami (self-hosted) | Free | Medium | ⭐⭐⭐ |
| Matomo (self-hosted) | Free | Hard | ⭐⭐⭐⭐⭐ |

---

## Recommendation Summary

**Start with Google Analytics 4** because:
1. It's free
2. Easy to implement
3. Provides the most comprehensive data
4. Industry standard with lots of documentation
5. No server required (perfect for static hosting)

You can always add privacy-focused alternatives later if needed.

---

## Next Steps

1. Choose an analytics solution (recommend GA4)
2. Create account and get tracking ID
3. Add tracking code to index.html
4. Add e-commerce event tracking to main.js
5. Deploy and wait 24 hours for data to populate
6. Check dashboard to see visitor statistics
7. Set up custom reports for key metrics

---

## Support

- **Google Analytics Help**: https://support.google.com/analytics
- **Plausible Docs**: https://plausible.io/docs
- **Umami Docs**: https://umami.is/docs

---

Generated for LaonLinkAB e-commerce platform
