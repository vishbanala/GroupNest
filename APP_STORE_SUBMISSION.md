# App Store Submission Guide for GroupNest

This guide will walk you through submitting your iOS app to the App Store.

## Prerequisites

1. **Apple Developer Account** - You mentioned you already have one ✅
2. **EAS Build Account** - Free tier works for testing, but you'll need a paid plan for production builds
3. **App Store Connect Access** - Part of your Apple Developer account

## Step 1: Configure EAS Build for Production

First, let's make sure your `eas.json` is set up for App Store builds:

```json
{
  "build": {
    "production": {
      "ios": {
        "buildConfiguration": "Release"
      }
    },
    "preview": {
      "ios": {
        "simulator": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

## Step 2: Build Your App for App Store

Run this command to build your app for the App Store:

```bash
eas build --platform ios --profile production
```

This will:
- Build your app in the cloud
- Create an `.ipa` file ready for App Store submission
- Take about 15-30 minutes

**Note:** You'll need to:
- Sign in to EAS: `eas login`
- Configure your Apple credentials when prompted

## Step 3: Set Up App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform:** iOS
   - **Name:** GroupNest
   - **Primary Language:** English
   - **Bundle ID:** `com.vishbanala.GroupNest` (must match your app.json)
   - **SKU:** A unique identifier (e.g., `groupnest-001`)
   - **User Access:** Full Access

## Step 4: Prepare App Store Listing

In App Store Connect, you'll need to provide:

### App Information
- **Name:** GroupNest
- **Subtitle:** (Optional) A private space for friends
- **Category:** 
  - Primary: Social Networking
  - Secondary: (Optional) Productivity
- **Privacy Policy URL:** (Required) You'll need to host a privacy policy
- **Support URL:** (Required) Your website or support email

### App Preview & Screenshots
You'll need:
- **iPhone 6.7" Display** (iPhone 14 Pro Max, 15 Pro Max):
  - At least 1 screenshot (up to 10)
  - Optional: App Preview video (30 seconds max)
- **iPhone 6.5" Display** (iPhone 11 Pro Max, XS Max):
  - At least 1 screenshot
- **iPhone 5.5" Display** (iPhone 8 Plus):
  - At least 1 screenshot

**Screenshot Requirements:**
- PNG or JPEG format
- No transparency
- Specific sizes (see Apple's guidelines)
- No device frames, status bars, or placeholders

### App Description
Write a compelling description (up to 4,000 characters):

```
GroupNest - Private Spaces for Friends

Keep lists, plans, and photos all in one clean app with your closest friends.

KEY FEATURES:
• Private Groups - Create invite-only spaces with custom names, icons, and themes
• Shared Lists - Collaborate on lists with tags, photos, links, and completion tracking
• Categories - Organize lists into categories like Food, Travel, Activities, and more
• Photo Feed - Share memories with reactions, captions, and list organization
• Voting System - Let friends vote on list items to make group decisions
• Comments & Discussions - Keep conversations organized around lists and items

Perfect for:
• Planning trips with friends
• Sharing restaurant recommendations
• Tracking group goals
• Organizing activities
• Keeping memories together

Privacy-focused and designed for small groups of close friends.
```

### Keywords
Add relevant keywords (up to 100 characters, comma-separated):
```
groups, lists, friends, planning, photos, shared, private, collaboration
```

### Support Information
- **Marketing URL:** (Optional) Your website
- **Promotional Text:** (Optional) Up to 170 characters for special promotions
- **Support URL:** Required - Your support page or email
- **Privacy Policy URL:** Required - Must be a live URL

## Step 5: Submit Your Build

### Option A: Using EAS Submit (Recommended)

After your build completes, submit directly:

```bash
eas submit --platform ios --profile production
```

This will:
- Upload your build to App Store Connect
- Link it to your app listing
- Handle all the technical details

### Option B: Manual Upload via Transporter

1. Download **Transporter** app from Mac App Store (or use Xcode on Mac)
2. Export your `.ipa` file from EAS Build
3. Open Transporter → **Deliver Your App**
4. Drag and drop your `.ipa` file
5. Sign in with your Apple ID
6. Click **Deliver**

## Step 6: Complete App Store Connect Submission

1. In App Store Connect, go to your app
2. Click **"TestFlight"** tab to see your uploaded build
3. Once processing completes (usually 10-30 minutes), go to **"App Store"** tab
4. Under **"Build"**, select your build
5. Fill in all required information:
   - Screenshots
   - Description
   - Keywords
   - Support URL
   - Privacy Policy URL
   - App Review Information
6. Answer **Export Compliance** questions
7. Click **"Submit for Review"**

## Step 7: App Review Information

You'll need to provide:
- **Contact Information:** Your email and phone
- **Demo Account:** (If your app requires login)
  - Create a test account in Supabase
  - Provide credentials for reviewers
- **Notes:** Any special instructions for reviewers

Example notes:
```
This app requires a Supabase account to function. 
Please use the following test account:
Email: reviewer@test.com
Password: TestPassword123

The app allows users to create private groups and share lists/photos with friends.
```

## Step 8: Wait for Review

- **Initial Review:** Usually 24-48 hours
- **Re-submission:** If rejected, fixes typically reviewed in 24 hours
- You'll receive email notifications about status changes

## Important Notes

### Privacy Policy
You **must** have a privacy policy URL. It should cover:
- What data you collect (user accounts, photos, lists)
- How you use it (stored in Supabase)
- Third-party services (Supabase)
- User rights (data deletion, etc.)

You can host this on:
- GitHub Pages (free)
- Your own website
- Privacy policy generators

### App Store Review Guidelines
Make sure your app follows:
- No crashes or bugs
- All features work as described
- Proper error handling
- Clear user interface
- Privacy policy accessible

### Common Rejection Reasons
- Missing privacy policy
- App crashes during review
- Incomplete functionality
- Misleading descriptions
- Missing required information

## Quick Command Reference

```bash
# Login to EAS
eas login

# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production

# Check build status
eas build:list

# View build details
eas build:view [BUILD_ID]
```

## Need Help?

- **EAS Documentation:** https://docs.expo.dev/build/introduction/
- **App Store Connect Help:** https://help.apple.com/app-store-connect/
- **Apple Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/

Good luck with your submission! 🚀








