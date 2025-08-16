/**
 * Test script for GitHub Integration
 * Run this script to test the GitHub integration functionality
 * 
 * Usage: node test-github-integration.js
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000'; // Adjust to your API URL
const TEST_PROJECT_ID = 'project-jzlAkxIlBYLBo3qoFaZs'; // Use your actual project ID
const TEST_USER_TOKEN = 'your-jwt-token-here'; // Replace with actual JWT token

// Test data - using your Babana project example
const testFiles = {
  "package.json": `{
  "name": "babana-landing-page",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^4.5.14"
  }
}`,
  "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Babana - Location de Moto</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <h1>Babana - Test Project</h1>
  <p>This is a test project pushed to GitHub via Lexis API</p>
  <script type="module" src="/main.js"></script>
</body>
</html>`,
  "style.css": `:root {
  --primary-color: #6a11cb;
  --secondary-color: #2575fc;
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  color: white;
}

h1 {
  text-align: center;
  font-size: 2.5em;
}`,
  "main.js": `console.log('Babana test project loaded successfully!');

document.addEventListener('DOMContentLoaded', function() {
  console.log('GitHub integration test - files pushed successfully');
});`,
  "README.md": `# Babana Landing Page - Test

This project was pushed to GitHub using the Lexis API GitHub integration.

## Features
- Vite build system
- Modern CSS with custom properties
- Responsive design
- JavaScript modules

## Generated on
${new Date().toISOString()}

## API Integration
This demonstrates the successful integration between Lexis API and GitHub for automated project deployment.`
};

async function testGitHubIntegration() {
  console.log('🚀 Starting GitHub Integration Test...\n');

  try {
    // Test 1: Get GitHub auth URL
    console.log('📋 Test 1: Getting GitHub authorization URL...');
    const authResponse = await axios.get(`${API_BASE_URL}/api/github/auth/url`, {
      headers: {
        'Authorization': `Bearer ${TEST_USER_TOKEN}`
      }
    });
    
    if (authResponse.data.success) {
      console.log('✅ Auth URL generated successfully');
      console.log('🔗 Auth URL:', authResponse.data.authUrl.substring(0, 80) + '...\n');
    } else {
      console.log('❌ Failed to generate auth URL\n');
      return;
    }

    // Test 2: Check GitHub user info (will fail if not connected)
    console.log('📋 Test 2: Checking GitHub user info...');
    try {
      const userResponse = await axios.get(`${API_BASE_URL}/api/github/user`, {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`
        }
      });
      
      if (userResponse.data.success) {
        console.log('✅ GitHub user connected:', userResponse.data.userInfo.username);
        console.log('📊 Public repos:', userResponse.data.userInfo.publicRepos);
        
        // Test 3: Push project to GitHub (only if user is connected)
        console.log('\n📋 Test 3: Pushing test project to GitHub...');
        const pushResponse = await axios.post(
          `${API_BASE_URL}/api/github/projects/${TEST_PROJECT_ID}/push`,
          {
            repositoryName: 'babana-test-project',
            description: 'Test project from Lexis API GitHub integration',
            isPrivate: false,
            commitMessage: 'Test commit from Lexis API',
            files: testFiles
          },
          {
            headers: {
              'Authorization': `Bearer ${TEST_USER_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (pushResponse.data.success) {
          console.log('✅ Project pushed successfully!');
          console.log('🔗 Repository URL:', pushResponse.data.repositoryUrl);
          console.log('📁 Files pushed:', pushResponse.data.pushedFiles.length);
          console.log('📝 Files:', pushResponse.data.pushedFiles.join(', '));
        } else {
          console.log('❌ Failed to push project:', pushResponse.data.message);
        }

        // Test 4: Get user repositories
        console.log('\n📋 Test 4: Getting user repositories...');
        const reposResponse = await axios.get(`${API_BASE_URL}/api/github/repositories`, {
          headers: {
            'Authorization': `Bearer ${TEST_USER_TOKEN}`
          }
        });

        if (reposResponse.data.success) {
          console.log('✅ Retrieved repositories successfully');
          console.log('📊 Total repositories:', reposResponse.data.repositories.length);
          console.log('📁 Recent repositories:');
          reposResponse.data.repositories.slice(0, 5).forEach(repo => {
            console.log(`   - ${repo.name} (${repo.private ? 'private' : 'public'})`);
          });
        }

      } else {
        console.log('⚠️  GitHub user not connected');
        console.log('💡 Please connect your GitHub account first using the auth URL above');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  GitHub account not connected');
        console.log('💡 Please connect your GitHub account first using the auth URL above');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   - Your JWT token is valid');
      console.log('   - The token is properly formatted');
      console.log('   - The API server is running');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Please check:');
      console.log('   - The API server is running on the correct port');
      console.log('   - The API_BASE_URL is correct');
    }
  }

  console.log('\n🏁 GitHub Integration Test Complete');
}

// Validation
if (TEST_USER_TOKEN === 'your-jwt-token-here') {
  console.log('❌ Please update TEST_USER_TOKEN with your actual JWT token');
  console.log('💡 You can get a JWT token by logging in through your API auth endpoints');
  process.exit(1);
}

// Run the test
testGitHubIntegration();
