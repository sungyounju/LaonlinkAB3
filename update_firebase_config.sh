#!/bin/bash

# Firebase Configuration Updater for LaonLinkAB
# This script helps you easily update your Firebase credentials

echo "=========================================="
echo "  Firebase Configuration Updater"
echo "=========================================="
echo ""
echo "This script will help you update your Firebase credentials in js/auth.js"
echo ""
echo "First, get your Firebase config from:"
echo "https://console.firebase.google.com/ > Project Settings > Your apps > Web app"
echo ""
echo "=========================================="
echo ""

# Prompt for each credential
read -p "Enter your API Key: " API_KEY
read -p "Enter your Auth Domain (e.g., your-project.firebaseapp.com): " AUTH_DOMAIN
read -p "Enter your Project ID: " PROJECT_ID
read -p "Enter your Storage Bucket (e.g., your-project.appspot.com): " STORAGE_BUCKET
read -p "Enter your Messaging Sender ID: " MESSAGING_SENDER_ID
read -p "Enter your App ID: " APP_ID

echo ""
echo "=========================================="
echo "Updating js/auth.js..."

# Create a temporary file with the new configuration
cat > /tmp/firebase_config_new.txt << EOF
const firebaseConfig = {
    apiKey: "$API_KEY",
    authDomain: "$AUTH_DOMAIN",
    projectId: "$PROJECT_ID",
    storageBucket: "$STORAGE_BUCKET",
    messagingSenderId: "$MESSAGING_SENDER_ID",
    appId: "$APP_ID"
};
EOF

# Backup the original file
cp js/auth.js js/auth.js.backup

# Use sed to replace the configuration
# This is a bit tricky, so we'll use Python instead
python3 << 'PYTHON_SCRIPT'
import re

# Read the auth.js file
with open('js/auth.js', 'r') as f:
    content = f.read()

# Read the new config
with open('/tmp/firebase_config_new.txt', 'r') as f:
    new_config = f.read()

# Replace the old config with the new one
pattern = r'const firebaseConfig = \{[^}]+\};'
content = re.sub(pattern, new_config, content)

# Write back to the file
with open('js/auth.js', 'w') as f:
    f.write(content)

print("✅ Firebase configuration updated successfully!")
print("📁 Backup saved to: js/auth.js.backup")
PYTHON_SCRIPT

echo ""
echo "=========================================="
echo "✅ Done!"
echo ""
echo "Your Firebase credentials have been updated in js/auth.js"
echo "A backup of the original file was saved to js/auth.js.backup"
echo ""
echo "Next steps:"
echo "1. Make sure you've enabled Email/Password authentication in Firebase Console"
echo "2. Test your authentication by opening your website and trying to sign up"
echo ""
echo "=========================================="
