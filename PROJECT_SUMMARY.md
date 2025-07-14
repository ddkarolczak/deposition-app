# Deposition Objection Automation - Project Summary

## 🎯 Project Overview

This is a specialized legal SaaS application that automatically detects and analyzes objections in deposition transcripts using AI. The application helps attorneys save hours of manual work by processing PDF and Word documents to identify objections, categorize them, and generate comprehensive reports.

## 🏗️ Architecture

### Frontend
- **React Router v7** with SSR
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **Clerk** for authentication
- **TypeScript** for type safety

### Backend
- **Convex** for database and serverless functions
- **OpenAI GPT-4** for AI-powered objection detection
- **Polar.sh** for subscription billing
- **Real-time** job processing and progress tracking

## 📊 Database Schema

### Core Tables
- **firms** - Law firm organizations with credit management
- **users** - User accounts with role-based access (admin/member)
- **documents** - Uploaded deposition transcripts with metadata
- **jobs** - Background processing jobs with progress tracking
- **objections** - Detected objections with detailed analysis
- **billingRecords** - Credit usage and billing history
- **auditLogs** - Security and compliance logging
- **invitations** - Team member invitation system

## 🔐 Security Features

- **Multi-tenant architecture** with firm-level data isolation
- **Role-based access control** (admin/member permissions)
- **Audit logging** for all user actions
- **Secure file uploads** with type validation
- **Data encryption** at rest and in transit

## 💰 Billing System

- **Credit-based pricing**: $100 per document, $200 for files > 50MB
- **Polar.sh integration** for subscription management
- **Automatic credit deduction** after processing
- **Usage tracking** and billing records

## 🚀 Key Features

### Document Processing
- **Chunked uploads** supporting files up to 3GB
- **AI-powered objection detection** using OpenAI GPT-4
- **Real-time progress tracking** with WebSocket updates
- **Metadata extraction** (case title, deponent, attorneys)

### Objection Analysis
- **Category classification** (Relevance, Leading, Foundation, etc.)
- **Sequence pattern detection** (Q-O-A, Q-O-Q-A, Q-O-No Answer)
- **Attorney identification** and normalization
- **Confidence scoring** for each detection

### Report Generation
- **Interactive HTML reports** with virtualized rendering
- **CSV exports** (Designation and Sync formats)
- **Print-friendly** formatting
- **Filter and search** capabilities

## 📁 Project Structure

```
deposition-app/
├── app/                           # React Router app
│   ├── components/
│   │   ├── dashboard/            # Dashboard components
│   │   ├── ui/                   # UI components (shadcn/ui)
│   │   └── upload/               # File upload components
│   └── routes/
│       └── dashboard/            # Protected dashboard routes
├── convex/                       # Convex backend functions
│   ├── schema.ts                 # Database schema
│   ├── documents.ts              # Document management
│   ├── firms.ts                  # Firm operations
│   ├── jobs.ts                   # Job processing
│   ├── processing.ts             # AI processing pipeline
│   └── uploads.ts                # File upload handling
└── public/                       # Static assets
```

## 🔧 Environment Variables

### Required API Keys
```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://vital-camel-59.clerk.accounts.dev

# Convex Database (get from npx convex dev)
CONVEX_DEPLOYMENT=
VITE_CONVEX_URL=
VITE_CONVEX_SITE_URL=

# OpenAI API
OPENAI_API_KEY=sk-proj-...

# Polar.sh Billing
POLAR_ACCESS_TOKEN=polar_oat_...

# Development
FRONTEND_URL=http://localhost:3000
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Convex
```bash
npx convex dev
```
This will prompt you to:
- Create/login to Convex account
- Create a new project
- Get your deployment URL and credentials

### 3. Configure Environment
Add the Convex variables to your `.env.local` file.

### 4. Run Development Server
```bash
npm run dev
```

### 5. Access Application
Visit `http://localhost:3000`

## 🎯 User Flow

1. **Sign Up/Login** - Create account and firm
2. **Upload Documents** - Drag & drop PDF/DOCX files
3. **Processing** - AI analyzes documents for objections
4. **Review Results** - Interactive report with detected objections
5. **Export** - Download CSV files for further analysis

## 🛠️ Current Status

### ✅ Completed Features
- Multi-tenant architecture with firm isolation
- File upload system with chunked uploads
- AI-powered objection detection pipeline
- Progress tracking and job management
- Security and audit logging
- Basic UI components and navigation
- Database schema and Convex functions

### 🚧 In Progress
- Real-time processing updates
- Interactive objection report viewer
- CSV export functionality
- Team management features

### 📋 Next Steps
1. Complete Convex setup and test authentication
2. Implement real-time progress tracking
3. Build interactive objection report viewer
4. Add CSV export functionality
5. Implement team management and invitations
6. Deploy to Vercel

## 🔗 External Services

- **Convex**: Database and serverless functions
- **Clerk**: Authentication and user management
- **OpenAI**: AI-powered objection detection
- **Polar.sh**: Subscription billing
- **Vercel**: Deployment and hosting

## 📞 Support

For any issues during setup:
1. Check all environment variables are correctly set
2. Ensure Convex deployment is active
3. Verify API keys have proper permissions
4. Check network connectivity for external services

## 🎉 Conclusion

This application provides a comprehensive solution for legal professionals to automate deposition objection analysis. The architecture is designed for scalability, security, and ease of use, with proper multi-tenancy and billing systems in place.