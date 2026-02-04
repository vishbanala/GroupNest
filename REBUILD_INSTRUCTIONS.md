# How to Rebuild the App After Adding Logo

## Step 1: Add the Logo File

1. Save your GroupNest logo as `logo.png`
2. Place it in: `assets/images/logo.png`

## Step 2: Rebuild Using EAS Build (Recommended for iOS)

Since you're on Windows building for iOS, use EAS Build:

```bash
# 1. Make sure you're logged in to EAS
eas login

# 2. Build for iOS (development build)
eas build --platform ios --profile development

# OR build for production
eas build --platform ios --profile production
```

This will:
- Upload your code to Expo's servers
- Build the iOS app in the cloud
- Give you a download link or install it via TestFlight

**Build time:** Usually 10-20 minutes

## Step 3: Install the New Build

After the build completes:

1. **If using development build:**
   - Download the `.ipa` file from the EAS dashboard
   - Install it on your device using TestFlight or direct install

2. **If using TestFlight:**
   - The build will automatically be uploaded to TestFlight
   - Install from the TestFlight app on your iPhone

## Alternative: Quick Test (If you have the app already installed)

If you already have a development build installed and just want to see the logo on login/signup screens:

1. **Start the dev server:**
   ```bash
   npx expo start --dev-client
   ```

2. **Reload the app** - The logo should appear on login/signup screens immediately (no rebuild needed for those screens)

3. **For app icon changes**, you'll need a full rebuild

## What Requires a Rebuild vs. What Doesn't

### ✅ No Rebuild Needed (Hot Reload Works):
- Logo on login/signup screens
- Most UI changes
- JavaScript code changes

### ❌ Rebuild Required:
- App icon changes
- Splash screen changes
- Native module changes
- New dependencies

## Quick Commands Reference

```bash
# Development build (for testing)
eas build --platform ios --profile development

# Production build (for App Store)
eas build --platform ios --profile production

# Check build status
eas build:list

# View build details
eas build:view
```

## Troubleshooting

### "Logo not showing"
- Make sure `logo.png` is in `assets/images/`
- Check the file name is exactly `logo.png` (case-sensitive)
- Clear cache: `npx expo start --clear`

### "Build failed"
- Check EAS dashboard for error details
- Make sure you're logged in: `eas login`
- Verify your Apple Developer account is linked








