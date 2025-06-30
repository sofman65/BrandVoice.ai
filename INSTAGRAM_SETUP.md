# Instagram Graph API Setup Guide

## Overview
This guide will help you set up a proper Instagram Graph API token for BrandVoice.ai.

## Step 1: Create a Meta Developer Account
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Sign up or log in

## Step 2: Create a Meta App
1. Go to [My Apps](https://developers.facebook.com/apps/)
2. Click "Create App"
3. Select "Consumer" as the app type
4. Fill in your app details and click "Create App"

## Step 3: Add Instagram Graph API
1. From your app dashboard, click "Add Products" in the left sidebar
2. Find "Instagram Graph API" and click "Set Up"

## Step 4: Configure Basic Display API
1. Set up "Instagram Basic Display"
2. Add a Valid OAuth Redirect URI (e.g., https://localhost:3000/auth/callback)
3. Add a Privacy Policy URL (can be a placeholder for development)
4. Save changes

## Step 5: Add Instagram Test User
1. In the left sidebar, go to "Roles" > "Roles"
2. Under "Instagram Testers," click "Add Instagram Testers"
3. Enter your Instagram username and click "Submit"
4. Log into your Instagram account and accept the tester invitation

## Step 6: Generate Access Token
1. Go to the "Instagram Basic Display" section
2. Click "Generate Token" next to your Instagram Test User
3. Log in with your Instagram account and authorize
4. Copy the generated token (it will look like: IGQWRPa3BFdUZAeS1CUVpkbDZASN1pkYnNSaGZAYV...)

## Step 7: Update Your .env File
Replace your current META_ACCESS_TOKEN with the new token:

```
META_ACCESS_TOKEN=your_new_token_here
```

## Important Notes
- User tokens from the Basic Display API typically expire after 60 days
- For a production app, you'll need to implement token refresh logic
- Only public content from your tester account will be accessible during development

## Troubleshooting
If you see "Invalid OAuth access token" errors:
1. Verify the token hasn't expired
2. Ensure you're using a token from the Basic Display API, not a Facebook token
3. Make sure the Instagram account is added as a tester to your app
