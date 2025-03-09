import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface TheirStoryAuthResponse {
  token: string;
  full_name: string;
  user_id: string;
  role: string;
  email: string;
  user_details: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    organizations: Array<{
      id: number;
      name: string;
      subdomain: string;
    }>;
  };
}

if (!process.env.THEIRSTORY_EMAIL || !process.env.THEIRSTORY_PASSWORD || !process.env.THEIRSTORY_VISITOR_ID) {
  throw new Error('Missing TheirStory credentials in environment variables');
}

const CREDENTIALS = {
  email: process.env.THEIRSTORY_EMAIL,
  password: process.env.THEIRSTORY_PASSWORD,
  visitorId: process.env.THEIRSTORY_VISITOR_ID
};

async function authenticate(): Promise<TheirStoryAuthResponse> {
  try {
    const response = await fetch('https://node.theirstory.io/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify(CREDENTIALS)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as TheirStoryAuthResponse;
    
    // Save token to a file for other scripts to use
    await fs.writeFile(
      path.join(process.cwd(), '.auth-token'),
      data.token,
      'utf-8'
    );

    console.log('Successfully authenticated and saved token!');
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  authenticate().catch(console.error);
}

export { authenticate }; 