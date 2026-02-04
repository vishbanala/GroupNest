# Submitting Without App Store Connect API Key

If you don't see the "Keys" tab, you might not have Admin/Account Holder access, or we can use alternative methods.

## Option 1: Check Your Role

The "Keys" tab is only visible to:
- **Account Holder**
- **Admin** users

If you're an **App Manager** or lower role, you won't see it.

**To check your role:**
1. App Store Connect → Users and Access
2. Look at your user account
3. Check your role

**To get access:**
- Ask the Account Holder to create the API key for you
- Or ask them to upgrade your role to Admin

## Option 2: Use Apple ID Authentication Instead

EAS can use your Apple ID directly instead of API key:

1. **Run submit command:**
   ```bash
   eas submit --platform ios --profile production
   ```

2. **When prompted, choose:**
   - "Use Apple ID authentication" (or similar option)
   - Enter your Apple ID email
   - Enter your password
   - If you have 2FA, you'll need an app-specific password

3. **Create App-Specific Password (if 2FA enabled):**
   - Go to [appleid.apple.com](https://appleid.apple.com)
   - Sign in → Security → App-Specific Passwords
   - Click "+" to generate new password
   - Name it: "EAS Submit"
   - Copy the password (you'll use this instead of your regular password)

## Option 3: Specify App ID in eas.json

If you know your App Store Connect App ID, we can specify it explicitly:

1. **Find your App ID:**
   - Go to your app in App Store Connect
   - Look at the URL: `https://appstoreconnect.apple.com/apps/[APP_ID]/...`
   - The number is your App ID (e.g., `1234567890`)

2. **Update eas.json** (I can do this for you if you provide the App ID)

3. **Try submit again**

## Option 4: Manual Upload (No API Key Needed)

Since you don't have a Mac, here are options:

### A. Use Cloud Mac Service (One-Time)
- **MacStadium** or **MacInCloud** (~$20-30/month)
- Download your `.ipa` from expo.dev
- Upload via Transporter app
- Cancel after one month

### B. Ask Someone with Mac
- Download `.ipa` from expo.dev
- Send to friend/colleague
- They upload via Transporter (takes 2 minutes)

### C. Use GitHub Actions (If you have repo)
- Set up macOS runner
- Upload via command line tools

## Option 5: Try Submit with Verbose Logging

Get more details about the error:

```bash
eas submit --platform ios --profile production --verbose
```

This will show exactly what's failing and might give us more clues.

## Most Likely Solution:

**Try Option 2** - Use Apple ID authentication when running `eas submit`. EAS will prompt you for credentials and should work without needing API keys.

If that doesn't work, **Option 4** (manual upload) is the most reliable method.








