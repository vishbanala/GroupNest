# Fix Expo Go Showing Wrong Project

## Quick Fix Steps:

### 1. Stop All Metro Bundlers
First, make sure no other Expo projects are running:
- Close all terminal windows running `expo start` or `npx expo start`
- Check Task Manager (Windows) for any Node.js processes and kill them if needed

### 2. Clear Expo Go Cache on Your Phone
**On iPhone:**
- Shake your device (or press Cmd+D in simulator)
- Tap "Reload" or "Clear cache and reload"

**On Android:**
- Shake your device (or press Cmd+M / Ctrl+M)
- Tap "Reload" or "Clear cache and reload"

**Or manually:**
- Close Expo Go completely (swipe it away from recent apps)
- Reopen Expo Go
- Make sure you're on the "Home" screen, not a previously opened project

### 3. Restart Expo Dev Server
In your GroupNest project directory:
```bash
# Stop the current server (Ctrl+C if running)
# Then start fresh:
npx expo start --clear
```

The `--clear` flag clears the Metro bundler cache.

### 4. Scan the QR Code Again
- Make sure you're scanning the QR code from the NEW terminal window
- The terminal should show "GroupNest" in the output
- If using tunnel mode, make sure you're using the correct URL

### 5. Alternative: Use Tunnel Mode
If you're on the same network, try tunnel mode:
```bash
npx expo start --tunnel
```

This creates a unique URL that's less likely to conflict with other projects.

### 6. Check the Terminal Output
When you run `npx expo start`, you should see:
```
Metro waiting on exp://...
```

Make sure it says "GroupNest" somewhere in the output, not "rutgers-knightlife" or another project name.

### 7. Nuclear Option: Reinstall Expo Go
If nothing works:
- Delete Expo Go from your phone
- Reinstall it from the App Store / Play Store
- Scan the QR code again







