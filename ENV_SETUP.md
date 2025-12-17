# Environment Variables Setup Guide

## Error: "We can't find that Stack. Please try again." (Error Code 109)

This error means your Contentstack API Key is invalid or not configured correctly.

## Step-by-Step Fix

### 1. Create `.env` File

Create a `.env` file in the root directory of your project (same level as `package.json`):

```bash
# In your terminal, from project root:
touch .env
```

### 2. Get Your Contentstack Credentials

1. **Log in to Contentstack:**
   - Go to https://app.contentstack.com/
   - Sign in with your account

2. **Get API Key:**
   - Go to **Settings** → **Stack**
   - Copy the **API Key** (it looks like: `blt1234567890abcdef`)

3. **Get Delivery Token:**
   - Go to **Settings** → **Tokens**
   - Find or create a **Delivery Token**
   - Copy the token value (it looks like: `cs1234567890abcdef1234567890abcdef`)

4. **Check Environment:**
   - Usually `production` or `development`
   - You can see available environments in **Settings** → **Environments**

### 3. Add Credentials to `.env` File

Open `.env` file and add:

```env
REACT_APP_CONTENTSTACK_API_KEY=blt1234567890abcdef
REACT_APP_CONTENTSTACK_DELIVERY_TOKEN=cs1234567890abcdef1234567890abcdef
REACT_APP_CONTENTSTACK_ENVIRONMENT=production
```

**Important:**
- Replace the example values with your actual credentials
- Do NOT use quotes around the values
- Do NOT add spaces around the `=` sign
- Make sure there are no trailing spaces

### 4. Verify `.env` File Location

Your `.env` file should be in:
```
kritika-demo/
├── .env          ← HERE
├── package.json
├── src/
└── ...
```

### 5. Restart Development Server

After creating/updating `.env`:
1. **Stop** the current server (Ctrl+C)
2. **Start** it again:
   ```bash
   npm start
   ```

**Note:** React apps only read `.env` files when they start. You must restart after changes.

### 6. Verify Configuration

Check the browser console (F12) for:
```
📦 Contentstack Configuration: {
  apiKey: "blt1234...",
  deliveryToken: "cs1234...",
  environment: "production",
  region: "US"
}
```

If you see "NOT SET", the environment variables aren't loading.

## Common Issues

### Issue 1: `.env` file not being read

**Symptoms:**
- Console shows "NOT SET" for credentials
- Error persists after adding `.env`

**Solutions:**
1. Make sure `.env` is in the project root (not in `src/`)
2. Restart the development server
3. Check file name is exactly `.env` (not `.env.local` or `.env.example`)
4. Verify no syntax errors in `.env` file

### Issue 2: Wrong API Key Format

**Correct Format:**
- API Key: Starts with `blt` (e.g., `blt1234567890abcdef`)
- Delivery Token: Starts with `cs` (e.g., `cs1234567890abcdef1234567890abcdef`)

**If your API Key looks different:**
- Make sure you're copying the **API Key**, not the Stack ID
- Check you're in the correct stack/workspace

### Issue 3: Wrong Environment Name

**Check available environments:**
1. Go to Contentstack → **Settings** → **Environments**
2. See the exact environment names (usually `production`, `development`, `staging`)
3. Use the exact name (case-sensitive) in `.env`

### Issue 4: Delivery Token Not Created

**Create Delivery Token:**
1. Go to **Settings** → **Tokens**
2. Click **+ New Token**
3. Select **Delivery Token**
4. Choose environment (usually `production`)
5. Click **Generate**
6. Copy the token immediately (you won't see it again)

### Issue 5: Stack Not Found

**Possible causes:**
1. Wrong API Key (from different stack)
2. API Key expired or revoked
3. Wrong region (US vs EU vs Azure)

**Check:**
- Verify you're using the API Key from the correct stack
- Check if your stack is in a different region (EU, Azure)
- Update region in `src/config/contentstack.js` if needed

## Testing Your Configuration

### Quick Test:

1. **Check console on app start:**
   - Should show Contentstack configuration (with masked values)
   - Should NOT show warnings about missing credentials

2. **Navigate to Documentation page:**
   - Go to `http://localhost:3000/documentation`
   - Check browser console for errors
   - Should see "Documentation fetch result" log

3. **If still getting error:**
   - Check browser console for exact error message
   - Verify credentials in Contentstack dashboard
   - Try creating a new Delivery Token

## Security Notes

⚠️ **Never commit `.env` file to Git:**
- `.env` is already in `.gitignore`
- Never share your API keys publicly
- Use different tokens for development/production

## Example `.env` File

```env
# Contentstack Configuration
REACT_APP_CONTENTSTACK_API_KEY=blt1234567890abcdef
REACT_APP_CONTENTSTACK_DELIVERY_TOKEN=cs1234567890abcdef1234567890abcdef
REACT_APP_CONTENTSTACK_ENVIRONMENT=production

# Optional: Webhook URLs (if you have a backend)
# REACT_APP_WEBHOOK_URL=http://localhost:3001/api/webhooks/feedback
# REACT_APP_ANALYTICS_WEBHOOK_URL=http://localhost:3001/api/webhooks/analytics
```

## Still Having Issues?

1. **Double-check:**
   - API Key format (starts with `blt`)
   - Delivery Token format (starts with `cs`)
   - Environment name (exact match, case-sensitive)
   - `.env` file location (project root)

2. **Try:**
   - Creating a new Delivery Token
   - Using a different environment (e.g., `development`)
   - Checking Contentstack dashboard for stack status

3. **Get Help:**
   - Check Contentstack documentation: https://www.contentstack.com/docs
   - Review error message in browser console
   - Verify stack is active in Contentstack dashboard

