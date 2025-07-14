# Setup Instructions for Deposition Objection Automation

## 1. Convex Setup

You need to set up Convex manually since it requires interactive input. Follow these steps:

### Step 1: Initialize Convex
```bash
cd /Users/dominiquekarolczak/Desktop/Cursor/Deposition\ Objection\ Project/deposition-app
npx convex dev
```

When prompted:
- **Login**: If you don't have a Convex account, create one at https://convex.dev
- **Project name**: Choose a name like "deposition-objection-tool"
- **Team**: Select your team or create a new one

### Step 2: Update Environment Variables
After running `npx convex dev`, you'll get output like:
```
✅ Convex functions ready! Point your browser to:
https://dashboard.convex.dev/deployment/{your-deployment-id}

Add these environment variables to your .env.local:
CONVEX_DEPLOYMENT=your-deployment-id
VITE_CONVEX_URL=https://your-deployment-id.convex.cloud
```

Copy these values and update your `.env.local` file.

## 2. Authentication Setup (Clerk + Convex)

The authentication is configured to work with Convex. The integration should work automatically once both services are set up.

## 3. Database Schema

The Convex schema is already configured in `convex/schema.ts` with all the tables needed for the deposition tool:
- `firms` - Law firm organizations
- `users` - User accounts linked to firms
- `documents` - Uploaded deposition transcripts
- `jobs` - Processing jobs for AI analysis
- `objections` - Detected objections and their metadata
- `billingRecords` - Credit usage tracking
- `auditLogs` - Security and compliance logging
- `invitations` - Team member invitations

## 4. Development Server

After setting up Convex, run the development server:
```bash
npm run dev
```

This will start:
- React Router development server at http://localhost:3000
- Convex functions will be automatically deployed and running

## 5. Testing the Application

1. **Sign Up**: Create a new account (this will automatically create a firm)
2. **Upload**: Try uploading a PDF or DOCX deposition transcript
3. **Processing**: Watch the AI processing pipeline work
4. **Review**: View detected objections and export reports

## 6. Deployment to Vercel

When ready to deploy:
```bash
npm run build
npx vercel --prod
```

Make sure to set all environment variables in your Vercel project settings.

## 7. Polar.sh Billing Setup

The Polar.sh integration is configured for subscription billing. You'll need to:
1. Set up products and pricing in your Polar.sh dashboard
2. Configure webhooks to point to your deployed app
3. Test the subscription flow

## Current Status

✅ **Implemented:**
- Multi-tenant architecture with firm isolation
- File upload system with chunked uploads
- AI-powered objection detection pipeline
- Progress tracking and job status
- Security and audit logging
- Basic UI components and navigation

🚧 **Next Steps:**
- Interactive objection report viewer
- CSV export functionality
- Team management features
- Advanced billing integration

## Support

If you encounter any issues, check:
1. All environment variables are set correctly
2. Convex deployment is active
3. API keys have proper permissions
4. Network connectivity for external services