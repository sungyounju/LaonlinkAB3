#!/usr/bin/env python3
"""
Firebase Configuration Updater for LaonLinkAB
This script helps you easily update your Firebase credentials
"""

import re
import shutil
from datetime import datetime

def main():
    print("=" * 50)
    print("  Firebase Configuration Updater")
    print("=" * 50)
    print()
    print("This script will help you update Firebase credentials in js/auth.js")
    print()
    print("Get your Firebase config from:")
    print("https://console.firebase.google.com/")
    print("  > Project Settings > Your apps > Web app")
    print()
    print("=" * 50)
    print()

    # Prompt for credentials
    print("Enter your Firebase credentials:")
    print("(You can paste the entire firebaseConfig object from Firebase Console)")
    print()

    api_key = input("API Key: ").strip()
    auth_domain = input("Auth Domain (e.g., project.firebaseapp.com): ").strip()
    project_id = input("Project ID: ").strip()
    storage_bucket = input("Storage Bucket (e.g., project.appspot.com): ").strip()
    messaging_sender_id = input("Messaging Sender ID: ").strip()
    app_id = input("App ID: ").strip()

    # Validate inputs
    if not all([api_key, auth_domain, project_id, storage_bucket, messaging_sender_id, app_id]):
        print("\n❌ Error: All fields are required!")
        return

    print()
    print("=" * 50)
    print("Updating js/auth.js...")
    print()

    try:
        # Read the original file
        with open('js/auth.js', 'r', encoding='utf-8') as f:
            content = f.read()

        # Backup the original file
        backup_name = f'js/auth.js.backup.{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        shutil.copy2('js/auth.js', backup_name)
        print(f"📁 Backup created: {backup_name}")

        # Create the new configuration
        new_config = f'''const firebaseConfig = {{
    apiKey: "{api_key}",
    authDomain: "{auth_domain}",
    projectId: "{project_id}",
    storageBucket: "{storage_bucket}",
    messagingSenderId: "{messaging_sender_id}",
    appId: "{app_id}"
}};'''

        # Replace the old configuration
        pattern = r'const firebaseConfig = \{[^}]+\};'
        content = re.sub(pattern, new_config, content, flags=re.DOTALL)

        # Write back to the file
        with open('js/auth.js', 'w', encoding='utf-8') as f:
            f.write(content)

        print("✅ Firebase configuration updated successfully!")
        print()
        print("=" * 50)
        print("✅ Done!")
        print()
        print("Next steps:")
        print("1. Enable Email/Password authentication in Firebase Console:")
        print("   Authentication > Sign-in method > Email/Password > Enable")
        print()
        print("2. Configure authorized domains:")
        print("   Authentication > Settings > Authorized domains")
        print("   Add your website domain")
        print()
        print("3. Test your authentication:")
        print("   Open your website and try to sign up with a test email")
        print()
        print("=" * 50)

    except FileNotFoundError:
        print("❌ Error: js/auth.js not found!")
        print("Make sure you're running this script from the project root directory.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
