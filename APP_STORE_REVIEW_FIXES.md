# App Store Review Fixes

This document summarizes the fixes applied to address the App Store review rejection issues.

## Issues Addressed

### 1. ✅ Sign Up Crash (Guideline 2.1 - Performance - App Completeness)

**Problem:** The app crashed when tapping on Sign Up button.

**Root Cause:** Missing import for the `Logo` component in `app/auth/signup.tsx`. The component was being used but not imported.

**Fix Applied:**
- Added missing import: `import { Logo } from '@/components/logo';` to `app/auth/signup.tsx`
- Improved error handling in `lib/database.ts` `signUp` function to gracefully handle database insertion errors

**Files Modified:**
- `app/auth/signup.tsx` - Added Logo import
- `lib/database.ts` - Enhanced error handling for user record creation

**Testing:**
- Test the Sign Up flow on a physical iOS device (iPhone 13 mini or similar)
- Verify that the app no longer crashes when tapping Sign Up
- Test with various scenarios (valid inputs, invalid inputs, network errors)

---

### 2. ⚠️ Demo Account Credentials (Guideline 2.1 - Information Needed)

**Problem:** Apple reviewers cannot sign in with provided credentials:
- Username: VishBanala
- Password: Expo$101

**Action Required:**
You need to create a demo account in your Supabase project. See `DEMO_ACCOUNT_SETUP.md` for detailed instructions.

**Quick Steps:**
1. Go to Supabase Dashboard → Authentication → Users
2. Create a new user with:
   - Email: `vishbanala@demo.groupnest.app` (or similar)
   - Password: `Expo$101`
   - ✅ **Check "Auto Confirm User"** (critical!)
3. Create corresponding record in `users` table (see `DEMO_ACCOUNT_SETUP.md`)
4. Update App Store Connect with the email and password

**Important:** The account must be **auto-confirmed** so reviewers don't need to verify email.

---

### 3. ⚠️ Placeholder Text in Screenshots (Guideline 2.1 - Performance - App Completeness)

**Problem:** Screenshots contain placeholder texts.

**Note:** This refers to the App Store screenshots you submitted, not the code. The placeholder text in input fields (like "Enter your email") is normal and acceptable.

**Action Required:**
1. Review your App Store screenshots
2. Ensure all screenshots show:
   - Real content (not "Lorem ipsum" or "Sample text")
   - Actual app functionality
   - No placeholder/dummy data visible
3. Replace any screenshots that contain placeholder text with real screenshots

**Code Review:**
- All input field placeholders are appropriate ("Enter your email", "Enter your password", etc.)
- Empty states show proper messages ("No groups yet", "No lists yet", etc.)
- No hardcoded placeholder text displayed as actual content

**Screenshot Checklist:**
- [ ] Login screen - shows actual login form (placeholders in inputs are OK)
- [ ] Groups screen - shows real groups or proper empty state
- [ ] Lists screen - shows real lists or proper empty state
- [ ] Photos screen - shows real photos or proper empty state
- [ ] No "Lorem ipsum" or "Sample text" visible
- [ ] No placeholder images or dummy data

---

## Next Steps

### 1. Test the Sign Up Fix
```bash
# Build and test on iOS device
eas build --platform ios --profile preview
# Or use development build
npx expo run:ios
```

### 2. Set Up Demo Account
Follow the instructions in `DEMO_ACCOUNT_SETUP.md` to create the demo account.

### 3. Update App Store Connect
1. Go to App Store Connect → Your App → App Store tab
2. Scroll to "App Review Information"
3. Update demo account credentials
4. Add notes explaining the demo account setup

### 4. Update Screenshots
1. Take new screenshots showing real content
2. Replace any screenshots with placeholder text
3. Ensure all screenshots meet Apple's requirements

### 5. Rebuild and Resubmit
```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

---

## Testing Checklist

Before resubmitting, test:

- [ ] Sign Up flow works without crashing
- [ ] Demo account can sign in successfully
- [ ] All app features are accessible with demo account
- [ ] No placeholder text visible in actual app screens
- [ ] App works on iOS 26.1 (or latest iOS version)
- [ ] App works on iPhone 13 mini (or similar device)

---

## Additional Notes

### Error Handling Improvements
The `signUp` function now handles errors more gracefully:
- If user record insertion fails, it logs the error but doesn't crash
- If user already exists, it attempts to update the record
- Auth user creation still succeeds even if user record creation fails

### Demo Account Best Practices
- Use a dedicated email (not your personal email)
- Keep password simple but secure
- Auto-confirm the account to bypass email verification
- Pre-populate with sample data if helpful for reviewers
- Document credentials clearly in App Store Connect

---

## Support

If you encounter issues:
1. Check `DEMO_ACCOUNT_SETUP.md` for demo account setup
2. Verify Supabase configuration in `lib/supabase.ts`
3. Test on a physical iOS device before resubmitting
4. Review Apple's App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

