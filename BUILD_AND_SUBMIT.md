# How to Build and Submit Your App to the App Store

## Step 1: Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

## Step 2: Login to EAS

```bash
eas login
```

This will prompt you to:
- Create an Expo account (if you don't have one)
- Or sign in with your existing account

## Step 3: Build Your App for Production

Run this command to build your iOS app for the App Store:

```bash
eas build --platform ios --profile production
```

**What happens:**
- EAS will ask you to configure your Apple credentials
- You'll need to provide:
  - Your Apple ID (the email associated with your Apple Developer account)
  - Your Apple Team ID (found in [Apple Developer Portal](https://developer.apple.com/account))
  - App-specific password (if you have 2FA enabled)
- The build will run in the cloud (takes 15-30 minutes)
- You'll get a download link when it's done

**Note:** The first time, EAS will help you set up:
- Distribution certificate
- Provisioning profile
- App Store Connect API key (optional but recommended)

## Step 4: Check Build Status

While building, you can check status:

```bash
eas build:list
```

Or view a specific build:

```bash
eas build:view [BUILD_ID]
```

## Step 5: Submit to App Store Connect

Once your build completes successfully, submit it:

### Option A: Automatic Submit (Recommended)

```bash
eas submit --platform ios --profile production
```

This will:
- Upload your build to App Store Connect
- Link it to your app (if already created)
- Handle all the technical details

**First time setup:**
- You'll need to provide your Apple ID credentials
- EAS will help configure App Store Connect API access

### Option B: Manual Submit via Transporter

1. **Download your build:**
   - Go to [expo.dev](https://expo.dev)
   - Navigate to your project
   - Click on the completed build
   - Download the `.ipa` file

2. **Use Transporter app:**
   - Download **Transporter** from Mac App Store (requires macOS)
   - Or use Xcode → Window → Organizer → Archives
   - Drag and drop your `.ipa` file
   - Sign in with your Apple ID
   - Click **Deliver**

## Step 6: Link Build in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app
3. Go to **"TestFlight"** tab
4. Wait for build processing (10-30 minutes)
5. Once processed, go to **"App Store"** tab
6. Under **"Build"** section, click **"Select a build before you submit your app"**
7. Choose your uploaded build
8. Complete all required information (screenshots, description, etc.)
9. Click **"Submit for Review"**

## Troubleshooting

### "No Apple credentials configured"

Run:
```bash
eas credentials
```

This will help you set up:
- Distribution certificate
- Provisioning profile
- App Store Connect API key

### "Build failed"

Check the build logs:
```bash
eas build:view [BUILD_ID]
```

Common issues:
- Missing permissions in `app.json`
- Invalid bundle identifier
- Missing Apple Developer account setup

### "Submit failed"

Make sure:
- Your app is created in App Store Connect
- Bundle ID matches (`com.vishbanala.GroupNest`)
- You have the correct permissions in App Store Connect

## Quick Reference Commands

```bash
# Login
eas login

# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production

# Check builds
eas build:list

# View build details
eas build:view [BUILD_ID]

# Configure credentials
eas credentials

# Check project status
eas project:info
```

## What You'll Need

1. **Apple Developer Account** ✅ (You have this)
2. **Expo Account** (Free tier works)
3. **App Store Connect App** (Create at appstoreconnect.apple.com)
4. **Privacy Policy URL** (Required for submission)
5. **App Screenshots** (Required for submission)

## Timeline

- **Build time:** 15-30 minutes
- **Processing in App Store Connect:** 10-30 minutes
- **App Review:** 24-48 hours (usually)

## Next Steps After Submission

1. Wait for App Review (you'll get email notifications)
2. If approved, your app goes live automatically
3. If rejected, fix issues and resubmit

Good luck! 🚀








