import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface Organization {
  _id: string;
  organization_name: string;
  organizational_code: string;
  backgroundUrl?: string;
}

interface OrganizationsResponse {
  organizations: Organization[];
}

async function listOrganizations() {
  try {
    // Read the auth token
    let token;
    try {
      token = await fs.readFile(path.join(process.cwd(), '.auth-token'), 'utf-8');
    } catch (error) {
      console.error('Auth token not found. Please run the auth script first.');
      throw new Error('Missing auth token');
    }

    const response = await fetch('https://node.theirstory.io/organization', {
      method: 'GET',
      headers: {
        'Authorization': token.trim(),
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as OrganizationsResponse;
    
    console.log('Available Organizations:');
    data.organizations.forEach(org => {
      console.log(`- ${org.organization_name} (Code: ${org.organizational_code})`);
    });

    return data.organizations;
  } catch (error) {
    console.error('Error listing organizations:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  listOrganizations().catch(console.error);
}

export { listOrganizations }; 