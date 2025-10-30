# Firebase Setup Instructions

## How to Get Your Firebase Credentials

### 1. Create a Firebase Project
- Go to: https://console.firebase.google.com/
- Click "Add project" or "Create a project"
- Enter project name: "LaonLinkAB"
- Continue through the setup wizard

### 2. Register Your Web App
- Click the web icon `</>` to add a web app
- Enter app nickname: "LaonLinkAB Website"
- Click "Register app"
- Copy the firebaseConfig object shown

### 3. Enable Authentication
- Go to "Authentication" in the left sidebar
- Click "Get started"
- Click "Sign-in method" tab
- Enable "Email/Password"
- Click "Save"

### 4. Update Your Code

Open `js/auth.js` and replace lines 8-14 with your actual credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",           // Replace with your actual API key
    authDomain: "your-project.firebaseapp.com",  // Replace with your auth domain
    projectId: "your-project-id",          // Replace with your project ID
    storageBucket: "your-project.appspot.com",   // Replace with your storage bucket
    messagingSenderId: "123456789012",     // Replace with your sender ID
    appId: "1:123456789012:web:abc123"     // Replace with your app ID
};
```

### 5. Test Authentication
- Open your website in a browser
- Click "My Account" in the header
- Try to sign up with a test email
- You should be able to create an account and sign in

## Security Notes

⚠️ **IMPORTANT**: Your Firebase API key is meant to be public (it's in client-side code), but you should:

1. **Set up Firebase Security Rules** to protect your data
2. **Enable App Check** for additional security (optional)
3. **Configure authorized domains** in Firebase Console

### Configure Authorized Domains
1. Go to Authentication > Settings > Authorized domains
2. Add your website domain (e.g., `yourwebsite.com`)
3. For local testing, `localhost` is already authorized

---

## Alternative: Disable Authentication Feature

If you don't want to use authentication, the website will work fine without it!
The code is already set up to gracefully handle missing Firebase credentials.

You'll see a warning in the browser console:
"⚠️ Firebase is not configured. Authentication features are disabled."

Users simply won't see the login/signup functionality.
