# Convex Setup Instructions

## Your Convex Instance Information

### Development Environment
- **Deployment URL**: https://energized-anteater-495.convex.cloud
- **HTTP Actions URL**: https://energized-anteater-495.convex.site
- **Deploy Key**: dev:energized-anteater-495|eyJ2MiI6IjMwMjkyYzRmOGUwOTRkMTE5MjUyZDgyYjFiNjA0YTYzIn0=

### Production Environment
- **Deployment URL**: https://small-impala-340.convex.cloud
- **HTTP Actions URL**: https://small-impala-340.convex.site
- **Deploy Key**: prod:small-impala-340|eyJ2MiI6IjgxYWUwNTUwMGYwYzRiNWZhYmMyMjExNWVmZWRkZWZlIn0=

## Setup Steps

### 1. Authenticate with Convex
```bash
cd "/Users/dominiquekarolczak/Desktop/Cursor/Deposition Objection Project/deposition-app"
npx convex dev
```

This will:
- Authenticate your CLI with Convex
- Deploy the schema and functions
- Set up file watching for development

### 2. Deploy Schema and Functions
Once authenticated, the schema and functions will be automatically deployed. You should see:
- Database tables created (firms, users, documents, jobs, objections, etc.)
- All Convex functions deployed
- Real-time sync enabled

### 3. Verify Deployment
Check your Convex dashboard at:
https://dashboard.convex.dev/deployment/energized-anteater-495

You should see:
- ✅ All database tables
- ✅ All functions deployed
- ✅ No errors in the logs

## Environment Variables (Already Set)

Your `.env.local` file is already configured with:
```env
CONVEX_DEPLOYMENT=dev:energized-anteater-495
VITE_CONVEX_URL=https://energized-anteater-495.convex.cloud
VITE_CONVEX_SITE_URL=https://energized-anteater-495.convex.site
```

## Database Schema

The following tables will be created:
- **firms** - Law firm organizations
- **users** - User accounts with firm associations
- **documents** - Uploaded deposition transcripts
- **jobs** - Background processing jobs
- **objections** - Detected objections with metadata
- **billingRecords** - Credit usage tracking
- **auditLogs** - Security logging
- **invitations** - Team member invitations
- **subscriptions** - Billing subscriptions
- **webhookEvents** - Payment webhooks

## Functions Deployed

### Queries (Read Data)
- `firms.getFirmByUser` - Get user's firm
- `documents.getDocuments` - List documents
- `jobs.getJobs` - List processing jobs
- `uploads.getUploadProgress` - Track upload progress

### Mutations (Write Data)
- `firms.createFirm` - Create new firm
- `uploads.completeUpload` - Process uploaded files
- `jobs.updateJobStatus` - Update job progress
- `processing.saveObjection` - Save detected objections

### Actions (External API Calls)
- `processing.processDocument` - AI-powered objection detection

## After Setup

Once authenticated and deployed, you can:

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Access Application**:
   Visit `http://localhost:3000`

3. **Test Features**:
   - Sign up/login with Clerk
   - Upload a PDF/DOCX document
   - Watch AI processing in real-time
   - View detected objections

## Production Deployment

For production, update your environment variables to use the production instance:
```env
CONVEX_DEPLOYMENT=prod:small-impala-340
VITE_CONVEX_URL=https://small-impala-340.convex.cloud
VITE_CONVEX_SITE_URL=https://small-impala-340.convex.site
```

## Troubleshooting

### Common Issues:
1. **Authentication Error**: Run `npx convex dev` to authenticate
2. **Schema Errors**: Check `convex/schema.ts` for syntax issues
3. **Function Errors**: Check function syntax in `convex/` directory
4. **Network Issues**: Verify internet connection and firewall settings

### Support:
- Convex Dashboard: https://dashboard.convex.dev
- Documentation: https://docs.convex.dev
- Discord: https://discord.gg/convex