# Setting Up Your App Icon (Logo on Home Screen)

To see your GroupNest logo as the app icon on your phone's home screen, follow these steps:

## Step 1: Add Your Logo File

1. **Save your GroupNest logo** as a PNG file
2. **Name it exactly:** `logo.png`
3. **Place it in:** `assets/images/logo.png`

**Important Requirements:**
- **Size:** 1024x1024 pixels (square)
- **Format:** PNG with transparency
- **File name:** Must be exactly `logo.png` (case-sensitive)

## Step 2: Verify the File

Make sure the file exists at:
```
assets/images/logo.png
```

## Step 3: Rebuild the App

Since you're on Windows building for iOS, use EAS Build:

```bash
# 1. Make sure you're logged in
eas login

# 2. Build for iOS (this will take 10-20 minutes)
eas build --platform ios --profile development
```

Or for production:
```bash
eas build --platform ios --profile production
```

## Step 4: Install the New Build

After the build completes:

1. **Download the build** from the EAS dashboard
2. **Install on your iPhone:**
   - Via TestFlight (if using production profile)
   - Or direct install the `.ipa` file

3. **The logo will appear** as your app icon on the home screen!

## What Gets Updated

After rebuilding, your logo will appear:
- ✅ **App icon** on iPhone home screen
- ✅ **Splash screen** when app launches
- ✅ **App icon** in App Store (if you submit)
- ✅ **Login/signup screens** (already working)

## Quick Checklist

- [ ] Logo saved as `logo.png`
- [ ] File placed in `assets/images/logo.png`
- [ ] File is 1024x1024 pixels (or larger)
- [ ] Rebuild with `eas build --platform ios`
- [ ] Install new build on iPhone
- [ ] Logo appears on home screen! 🎉

## Troubleshooting

### "Unable to resolve asset logo.png"
- Make sure the file is exactly named `logo.png`
- Check it's in `assets/images/` folder
- Verify the file isn't corrupted

### "Icon doesn't show after rebuild"
- Make sure you installed the NEW build (not the old one)
- Delete the old app and reinstall
- Check the build completed successfully in EAS dashboard

### "Icon looks blurry"
- Use a higher resolution (1024x1024 or larger)
- Make sure it's a PNG file, not JPG
- Check the file isn't compressed too much








