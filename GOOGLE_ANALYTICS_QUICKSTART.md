# Google Analytics Setup - Quick Start Guide

## ✅ Analytics Code Already Added!

I've already added all the Google Analytics tracking code to your website. You just need to get your Measurement ID and update one file.

---

## Step 1: Create Your Google Analytics Account (2 minutes)

1. **Go to Google Analytics:**
   Visit: https://analytics.google.com

2. **Sign in** with your Google account

3. **Create a new property:**
   - Click **"Start measuring"** or **"Admin"** → **"Create Property"**
   - Enter these details:
     - **Property name:** LaonLinkAB
     - **Time zone:** Sweden
     - **Currency:** EUR (Euro)
   - Click **"Next"**

4. **Fill in business information:**
   - **Industry:** Industrial/Manufacturing
   - **Business size:** Small
   - **Usage:** Track website traffic
   - Click **"Create"**

5. **Get your Measurement ID:**
   - You'll see a screen with your **Measurement ID**
   - It looks like: `G-XXXXXXXXXX` (e.g., `G-ABC123DEF4`)
   - **Copy this ID** - you'll need it next!

---

## Step 2: Add Your Measurement ID (30 seconds)

1. **Open the file:** `index.html`

2. **Find these two lines** (near the top, around line 13 and 20):
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_MEASUREMENT_ID"></script>
   ```
   and
   ```javascript
   gtag('config', 'YOUR_MEASUREMENT_ID', {
   ```

3. **Replace both instances** of `YOUR_MEASUREMENT_ID` with your actual ID:
   ```html
   <!-- Before: -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_MEASUREMENT_ID"></script>

   <!-- After (example): -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
   ```

4. **Save the file**

---

## Step 3: Deploy Your Website

Deploy the updated `index.html` file to your hosting (GitHub Pages, Netlify, etc.)

---

## Step 4: Verify It's Working (5 minutes)

1. **Visit your live website** (not localhost - must be the actual deployed site)

2. **Go back to Google Analytics** (https://analytics.google.com)

3. **Click "Reports" → "Realtime"**
   - You should see yourself as a visitor!
   - Click around your site - you'll see the pages change in real-time

4. **If you see yourself - it's working!** 🎉

---

## What Gets Tracked Automatically

I've set up tracking for:

✅ **Page views** - Every page someone visits
✅ **Product views** - When someone opens a product modal
✅ **Add to cart** - When someone adds a product to cart
✅ **Search queries** - What people search for (with result counts)
✅ **Category views** - Which categories people browse
✅ **User location** - What countries visitors come from
✅ **Device types** - Mobile, tablet, or desktop
✅ **Traffic sources** - How people find your site

---

## Privacy Settings (Already Configured)

Your analytics is set up with privacy in mind:

- ✅ **IP anonymization enabled** - Visitor IPs are anonymized
- ✅ **No personalized ads** - Google Signals disabled
- ✅ **GDPR-friendly** - Respects user privacy

**The dashboard is PRIVATE** - only you (and people you invite) can see the statistics.

---

## How to View Your Statistics

### Dashboard Access:
- Visit: https://analytics.google.com
- Sign in with your Google account
- Select your "LaonLinkAB" property

### Key Reports:

1. **Realtime Report**
   - See current active users
   - What pages they're on right now
   - Live product views

2. **Traffic Overview** (Reports → Life cycle → Acquisition)
   - Total visitors (daily/weekly/monthly)
   - New vs returning visitors
   - Where visitors come from (Google, direct, social)

3. **User Behavior** (Reports → Engagement)
   - Most viewed pages
   - Session duration
   - Bounce rate

4. **Events** (Reports → Engagement → Events)
   - **view_item** - Product views
   - **add_to_cart** - Cart additions
   - **search** - Search queries
   - **view_category** - Category browsing

5. **Geographic Data** (Reports → User → Demographic details)
   - Countries your visitors are from
   - Cities

6. **Tech Details** (Reports → Tech)
   - Devices (mobile vs desktop)
   - Browsers
   - Operating systems

### Mobile App:
Download the **Google Analytics** app for iOS or Android to check stats on your phone!

---

## Example Queries You Can Answer:

- "How many people visited my site this week?"
- "Which products are most popular?"
- "What do people search for?"
- "Are most visitors on mobile or desktop?"
- "Which country do most visitors come from?"
- "How many people added items to cart today?"

---

## Troubleshooting

### Not seeing data?
1. Make sure you replaced **both** instances of `YOUR_MEASUREMENT_ID`
2. Visit your **live website** (not localhost)
3. Wait 5-10 minutes for data to appear
4. Check the browser console for errors (F12 → Console)

### Still not working?
Check if ad blockers or privacy extensions are blocking Google Analytics (they often do). Try in an incognito window or different browser.

---

## Next Steps After Setup

1. Wait **24-48 hours** for meaningful data to accumulate
2. Check your dashboard regularly to understand visitor patterns
3. Use insights to improve your site:
   - See which products are popular
   - Understand what people search for
   - Optimize for mobile if most visitors use phones

---

## Files That Were Modified

✅ `index.html` - Google Analytics code added (lines 10-25)
✅ `js/main.js` - Tracking functions added (lines 4-54)
✅ `js/main.js` - Tracking calls added to:
   - Product views (line 691)
   - Cart additions (line 828)
   - Search (line 510)
   - Category navigation (line 430)

---

## Summary Checklist

- [ ] Created Google Analytics account
- [ ] Got Measurement ID (G-XXXXXXXXXX)
- [ ] Replaced `YOUR_MEASUREMENT_ID` in `index.html` (2 places)
- [ ] Deployed website
- [ ] Verified in Realtime report

**That's it! You're done.** 🎉

Your website is now tracking visitor data privately and securely. Only you can access the analytics dashboard.

---

Need help? Check the full guide in `ANALYTICS_SETUP.md` or visit: https://support.google.com/analytics
