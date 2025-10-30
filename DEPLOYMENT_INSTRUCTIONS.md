# 🚀 Firebase Deployment Instructions

## ✅ Configuration Complete!

All Firebase configuration files have been created and committed to git.

---

## 📦 What's Configured:

### Firebase Hosting
- **Public Directory:** `.` (current directory - all your files)
- **Project:** laon2link
- **Ignored Files:** Python scripts, CSV files, markdown docs, git files
- **Caching:**
  - Images: 2 hours
  - CSS/JS: 1 hour

### Firestore Database
- **Security Rules:** Configured for users, products, and orders
- **Location:** eur3 (Europe)
- **Indexes:** Empty (will add as needed)

---

## 🚀 Deploy Your Website

### Step 1: Deploy Everything

Run this command to deploy your website and Firestore rules:

```bash
firebase deploy
```

This deploys:
- ✅ Website to Firebase Hosting
- ✅ Firestore security rules
- ✅ Firestore indexes

### Step 2: Deploy Only Hosting (Faster)

If you only changed website files (HTML/CSS/JS):

```bash
firebase deploy --only hosting
```

### Step 3: Deploy Only Firestore Rules

If you only changed database rules:

```bash
firebase deploy --only firestore:rules
```

---

## 🌐 After Deployment

Your website will be available at:

**Main URL:** https://laon2link.web.app
**Alternative:** https://laon2link.firebaseapp.com

---

## ⚠️ Important: Enable Email/Password Auth

Before users can sign up, you MUST enable Email/Password authentication:

1. Go to: https://console.firebase.google.com/project/laon2link/authentication
2. Click "Sign-in method" tab
3. Enable "Email/Password"
4. Click "Save"

---

## 🧪 Test Your Deployment

After deploying:

1. **Visit your website:** https://laon2link.web.app
2. **Open browser console** (F12)
3. **Check for errors**
4. **Test authentication:**
   - Click "My Account"
   - Try to sign up with a test email
   - Should see: "Account created successfully!"

---

## 🔄 Update Workflow

When you make changes to your website:

```bash
# 1. Make your changes to HTML/CSS/JS files
# 2. Test locally (optional)
python3 -m http.server 8000

# 3. Commit to git
git add .
git commit -m "Your commit message"
git push

# 4. Deploy to Firebase
firebase deploy --only hosting
```

---

## 📊 Monitor Your Site

### Firebase Console
- **Hosting Dashboard:** https://console.firebase.google.com/project/laon2link/hosting
- **Firestore Data:** https://console.firebase.google.com/project/laon2link/firestore
- **Authentication:** https://console.firebase.google.com/project/laon2link/authentication
- **Analytics:** https://console.firebase.google.com/project/laon2link/analytics

### Deployment History
View past deployments:
```bash
firebase hosting:releases
```

### Rollback to Previous Version
If something goes wrong:
```bash
firebase hosting:channel:deploy preview
```

---

## 🔒 Firestore Security Rules Explained

Your current rules:

```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Products are read-only for everyone
match /products/{productId} {
  allow read: if true;
  allow write: if admin; // Only admins can modify
}

// Orders are private to each user
match /orders/{orderId} {
  allow read: if resource.data.userId == request.auth.uid;
  allow create: if request.resource.data.userId == request.auth.uid;
}
```

**To modify rules:**
1. Edit `firestore.rules`
2. Deploy: `firebase deploy --only firestore:rules`

---

## 🎯 Custom Domain (Optional)

To use your own domain (e.g., laonlink.com):

1. Go to: https://console.firebase.google.com/project/laon2link/hosting
2. Click "Add custom domain"
3. Follow the DNS setup instructions
4. Wait for SSL certificate (can take 24h)

---

## ❓ Troubleshooting

### "Permission denied" error
- Check Firestore rules are deployed
- Make sure user is authenticated
- Verify the user ID matches the document path

### "File not found" errors
- Check `firebase.json` public directory is set to "."
- Make sure files aren't in the ignore list
- Redeploy: `firebase deploy --only hosting`

### Images not loading
- Check image paths are relative (no leading /)
- Verify images are in `images/` directory
- Check browser console for 404 errors

### Authentication not working
- Enable Email/Password in Firebase Console
- Check browser console for Firebase errors
- Verify `js/auth.js` has correct credentials

---

## 📝 Quick Reference

```bash
# Deploy everything
firebase deploy

# Deploy only website
firebase deploy --only hosting

# Deploy only database rules
firebase deploy --only firestore:rules

# View deployment info
firebase hosting:channel:list

# Open Firebase Console
firebase open hosting

# Local testing (optional)
firebase serve
```

---

## ✅ Deployment Checklist

Before first deployment:
- ✅ Firebase project created (laon2link)
- ✅ Firebase configuration added to code
- ✅ Email/Password auth enabled
- ⬜ Test signup/login works
- ⬜ Run `firebase deploy`
- ⬜ Visit https://laon2link.web.app
- ⬜ Test all features work

---

**Ready to deploy?** Run: `firebase deploy` 🚀

**Last Updated:** 2025-10-30
