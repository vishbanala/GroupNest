# Submitting to App Store Without a Mac

Since you don't have a Mac, you'll use EAS Submit, which works entirely from your Windows computer.

## Step 1: Create App in App Store Connect (REQUIRED)

**This is the most important step!** The error you got happens because the app doesn't exist yet.

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account
3. Click **"My Apps"** → **"+"** → **"New App"**
4. Fill in:
   - **Platform:** iOS
   - **Name:** GroupNest
   - **Primary Language:** English
   - **Bundle ID:** `com.vishbanala.GroupNest` (must match exactly from your app.json)
   - **SKU:** `groupnest-001` (any unique identifier, you won't see this again)
   - **User Access:** Full Access
5. Click **"Create"**
6. **Wait 2-3 minutes** for App Store Connect to process

## Step 2: Submit Using EAS (No Mac Needed!)

Once the app is created, run:

```bash
eas submit --platform ios --profile production
```

**First time setup:**
- EAS will ask for your Apple ID credentials
- You may need to create an App Store Connect API key:
  1. Go to App Store Connect → Users and Access → Keys
  2. Click "+" to create a new key
  3. Give it a name (e.g., "EAS Submit Key")
  4. Download the `.p8` file (you can only download once!)
  5. Copy the Key ID
  6. When EAS asks, provide:
     - Key ID
     - Issuer ID (found on the Keys page)
     - Path to the `.p8` file

**After setup:**
- EAS will automatically upload your build
- It will link to your app in App Store Connect
- No Mac needed!

## Step 3: Verify Upload

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Navigate to your GroupNest app
3. Click **"TestFlight"** tab
4. You should see your build processing (takes 10-30 minutes)

## Step 4: Complete Submission

Once the build is processed:

1. Go to **"App Store"** tab in App Store Connect
2. Under **"Build"** section, click **"Select a build before you submit your app"**
3. Choose your uploaded build
4. Fill in all required information:
   - Screenshots (you can take these on your iPhone)
   - Description (use the one from APP_STORE_DESCRIPTION.txt)
   - Keywords
   - Support URL
   - Privacy Policy URL
5. Click **"Submit for Review"**

## Troubleshooting

### "Cannot read properties of undefined" Error

**This means the app doesn't exist in App Store Connect yet.**

Solution:
1. Create the app in App Store Connect (Step 1 above)
2. Wait 2-3 minutes
3. Try `eas submit` again

### "App not found" Error

Make sure:
- Bundle ID matches exactly: `com.vishbanala.GroupNest`
- App is created in App Store Connect
- You're signed in with the correct Apple Developer account

### App Store Connect API Key Issues

If EAS asks for an API key:

1. **Create the key:**
   - App Store Connect → Users and Access → Keys
   - Click "+" → App Manager or Admin role
   - Download the `.p8` file immediately (you can only download once!)

2. **Save it somewhere safe:**
   - Put it in your project folder (but don't commit to git!)
   - Or save it in a secure location

3. **Provide to EAS:**
   - Key ID (shown on the Keys page)
   - Issuer ID (shown on the Keys page)
   - Path to the `.p8` file

## Alternative: Use Cloud Mac Service (If EAS Still Fails)

If EAS submit continues to have issues, you can use a cloud Mac service:

1. **MacStadium** or **MacInCloud** (paid, ~$20-30/month)
2. **GitHub Actions** with macOS runner (free for public repos)
3. **Ask a friend with a Mac** to upload via Transporter (one-time help)

But EAS Submit should work fine once the app is created in App Store Connect!

## Summary

**You don't need a Mac!** Just:
1. ✅ Create app in App Store Connect (web-based)
2. ✅ Use `eas submit` (works on Windows)
3. ✅ Complete submission in App Store Connect (web-based)

All of this can be done from your Windows computer. The key is making sure the app exists in App Store Connect first.








