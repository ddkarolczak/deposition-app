# Authentication & Master Account Setup Guide

## 🔐 Step 1: Authenticate with Convex

### Run the authentication command:
```bash
cd "/Users/dominiquekarolczak/Desktop/Cursor/Deposition Objection Project/deposition-app"
npx convex dev
```

### What happens:
1. **Browser opens** to Convex dashboard
2. **Login/Sign up** with your email
3. **Connect project** to your deployment
4. **Deploy schema** and functions automatically
5. **Start file watching** for development

### Expected output:
```
✅ Connected to deployment: energized-anteater-495
✅ Deployed schema and functions
✅ Watching for file changes...
```

## 👑 Step 2: Set Up Master Account (Unlimited Credits)

### Master Account Emails (Pre-configured):
- `dominique@yourcompany.com` (Your admin email)
- `admin@depositiontool.com` (Alternative admin)
- `demo@depositiontool.com` (Demo account)

### Option A: Sign up with Master Email
1. Go to `http://localhost:5173`
2. Click "Sign Up"
3. Use one of the master account emails above
4. Complete Clerk registration
5. **Automatic**: You'll get unlimited credits (999,999)

### Option B: Manual Master Account Setup
If you want to add more master accounts:

1. **Update the master emails** in `convex/admin.ts`:
```typescript
const MASTER_ACCOUNTS = [
  "dominique@yourcompany.com",
  "your-email@example.com",    // Add your email here
  "admin@depositiontool.com",
  "demo@depositiontool.com",
];
```

2. **Deploy the updated function**:
```bash
npx convex deploy
```

3. **Create master account** via the app or script

## 🎯 Master Account Features

### Unlimited Processing
- ✅ **999,999 credits** (effectively unlimited)
- ✅ **No billing charges** for document processing
- ✅ **10GB upload limit** (vs 3GB for regular users)
- ✅ **Unlimited team members**
- ✅ **Admin dashboard access**

### Special Powers
- 🔧 **Grant unlimited credits** to other firms
- 📊 **View system-wide stats** 
- 👥 **Manage all users and firms**
- 🛡️ **Access audit logs**

## 🧪 Testing Your Setup

### 1. Check Authentication
```bash
# This should show your deployment info
npx convex dev --once
```

### 2. Test Master Account
1. Sign up with master email
2. Upload a test document
3. Verify no credits are deducted
4. Check unlimited credits remain

### 3. Test Regular Account
1. Sign up with non-master email
2. Should get 0 credits initially
3. Upload should fail with "Insufficient credits"

## 🚨 Troubleshooting

### Authentication Issues
```bash
# Clear authentication and retry
rm -rf ~/.convex/config.json
npx convex dev
```

### Master Account Not Working
1. **Check email spelling** in `MASTER_ACCOUNTS` array
2. **Redeploy functions**: `npx convex deploy`
3. **Check browser console** for errors
4. **Verify Convex dashboard** shows functions deployed

### Credit System Issues
1. **Check firm credits** in Convex dashboard
2. **Verify master account** has 999,999 credits
3. **Check console logs** during upload
4. **Test with small file** first

## 📊 Admin Dashboard Access

### Master Account Stats
Visit your app and you'll see additional admin features:
- System-wide document processing stats
- All firms and users overview
- Credit usage analytics
- System health monitoring

### Convex Dashboard
Access detailed logs and data:
- https://dashboard.convex.dev/deployment/energized-anteater-495
- View all database tables
- Monitor function calls
- Check error logs

## 🔄 Development Workflow

### Daily Development
1. **Start Convex**: `npx convex dev` (in one terminal)
2. **Start app**: `npm run dev` (in another terminal)
3. **Make changes**: Functions auto-deploy
4. **Test features**: Use master account for unlimited testing

### Adding Features
1. Update Convex functions
2. Functions auto-deploy on save
3. Test with master account
4. Deploy to production when ready

## 🎉 You're Ready!

Once authenticated and master account is set up:
- ✅ **Unlimited document processing** for testing
- ✅ **Real-time development** with auto-deployment
- ✅ **Full admin access** to all features
- ✅ **Production-ready** billing system for regular users

Your deposition objection automation tool is ready for unlimited testing and development! 🚀