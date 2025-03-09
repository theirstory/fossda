import dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local first
console.log('Loading environment variables...');
const envLocalResult = dotenv.config({ path: path.join(process.cwd(), '.env.local') });
if (envLocalResult.error) {
  console.log('No .env.local found, falling back to .env');
  const envResult = dotenv.config();
  if (envResult.error) {
    console.error('Error loading environment variables:', envResult.error);
    process.exit(1);
  }
}

// Check required variables
const requiredVars = [
  'MUX_TOKEN_ID',
  'MUX_TOKEN_SECRET',
  'WEAVIATE_API_KEY',
  'WEAVIATE_HOST',
  'GITHUB_TOKEN',
  'THEIRSTORY_EMAIL',
  'THEIRSTORY_PASSWORD',
  'THEIRSTORY_VISITOR_ID'
];

console.log('\nEnvironment Variable Status:');
let missingVars = false;

for (const varName of requiredVars) {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ ${varName} is missing`);
    missingVars = true;
  } else {
    // Show first and last 4 characters of sensitive values
    console.log(`✅ ${varName} is set (starts with: ${value.slice(0, 4)}..., ends with: ...${value.slice(-4)})`);
  }
}

if (missingVars) {
  console.error('\nSome required environment variables are missing!');
  process.exit(1);
} else {
  console.log('\nAll required environment variables are set! ✨');
} 