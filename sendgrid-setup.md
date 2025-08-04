# SendGrid Setup Guide

## Step 1: Get a SendGrid API Key

1. **Sign up for SendGrid:**
   - Go to [https://sendgrid.com/](https://sendgrid.com/)
   - Create a free account (100 emails/day free)

2. **Create an API Key:**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Choose "Restricted Access" → "Mail Send"
   - Copy the API key

## Step 2: Configure Your Environment

### For Local Development:
Create a `.env` file in your project root:
```
SENDGRID_API_KEY=your_actual_api_key_here
NODE_ENV=development
PORT=5000
```

### For Azure Deployment:
Add the environment variable in Azure App Service:
1. Go to Azure Portal → Your App Service
2. Configuration → Application settings
3. Add: `SENDGRID_API_KEY` = `your_actual_api_key_here`

## Step 3: Verify Your Sender Email

**Important:** You need to verify your sender email address in SendGrid:

1. **For testing:** Verify your personal email address
   - Go to SendGrid → Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Add your email and verify it

2. **For production:** Verify your domain (recommended)
   - Go to SendGrid → Settings → Sender Authentication
   - Click "Authenticate Your Domain"
   - Follow the DNS setup instructions

## Step 4: Update the From Email

In `server.js`, update the `from` email address:
```javascript
const msg = {
  to: 'paulandrewfarrow@gmail.com',
  from: 'your-verified-email@yourdomain.com', // Use your verified email
  subject: 'Message from Dave\'s Running Club website',
  // ... rest of the message
};
```

## Step 5: Test the Integration

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Test the contact form:**
   - Fill out the contact form on your website
   - Submit and check if you receive the email

3. **Check server logs:**
   - Look for "📧 SendGrid configured" message
   - Check for any error messages

## Troubleshooting

### Common Issues:

1. **"Email service not configured"**
   - Make sure `SENDGRID_API_KEY` is set in your environment

2. **"Unauthorized" error**
   - Check that your API key is correct
   - Ensure you have "Mail Send" permissions

3. **"From address not verified"**
   - Verify your sender email in SendGrid
   - Use a verified email address in the `from` field

4. **Emails going to spam**
   - Verify your domain in SendGrid
   - Use a professional domain email address

## Security Notes

- **Never commit your API key** to version control
- **Use environment variables** for all sensitive data
- **Restrict API key permissions** to only what's needed
- **Monitor your SendGrid usage** to avoid unexpected charges

## Next Steps

Once SendGrid is working:
1. Deploy to Azure with the environment variable set
2. Test the contact form in production
3. Consider setting up email templates for better formatting
4. Add email notifications for new runs (optional) 