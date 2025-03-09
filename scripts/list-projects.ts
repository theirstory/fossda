import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface Project {
  _id: string;
  name: string;
  description?: string;
  projectBackgroundUrl?: string;
  stories?: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

async function listProjects(organizationCode: string) {
  try {
    // Read the auth token
    let token;
    try {
      token = await fs.readFile(path.join(process.cwd(), '.auth-token'), 'utf-8');
    } catch (error) {
      console.error('Auth token not found. Please run the auth script first.');
      throw new Error('Missing auth token');
    }

    const response = await fetch(`https://node.theirstory.io/organization/${organizationCode}/projects`, {
      method: 'GET',
      headers: {
        'Authorization': token.trim(),
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const projects = await response.json() as Project[];
    
    console.log(`Projects in organization ${organizationCode}:`);
    projects.forEach(project => {
      console.log(`\n- ${project.name} (ID: ${project._id})`);
      if (project.description) {
        console.log(`  Description: ${project.description}`);
      }
      if (project.stories && project.stories.length > 0) {
        console.log('  Stories:');
        project.stories.forEach(story => {
          console.log(`    * ${story.title} (ID: ${story.id})`);
        });
      }
    });

    return projects;
  } catch (error) {
    console.error('Error listing projects:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  listProjects('oss30').catch(console.error);
}

export { listProjects }; 