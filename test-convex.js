// Test script to verify Convex connection
const { exec } = require('child_process');

console.log('🔍 Testing Convex connection...');

// Check if we can connect to the deployment
exec('npx convex dev --help', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Convex CLI error:', error);
    return;
  }
  
  console.log('✅ Convex CLI is working');
  
  // Check deployment status
  exec('npx convex info', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Deployment info error:', error);
      console.log('💡 You may need to run: npx convex dev');
      return;
    }
    
    console.log('📊 Deployment info:');
    console.log(stdout);
  });
});

// Test environment variables
console.log('\n🔧 Environment variables:');
console.log('CONVEX_DEPLOYMENT:', process.env.CONVEX_DEPLOYMENT);
console.log('VITE_CONVEX_URL:', process.env.VITE_CONVEX_URL);
console.log('VITE_CONVEX_SITE_URL:', process.env.VITE_CONVEX_SITE_URL);

// Instructions
console.log('\n📋 Next steps:');
console.log('1. Run: npx convex dev');
console.log('2. Open browser when prompted');
console.log('3. Complete authentication');
console.log('4. Schema and functions will deploy automatically');
console.log('5. Then run: npm run dev');