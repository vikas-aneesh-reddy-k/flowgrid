#!/usr/bin/env node
// Quick test to verify CI/CD setup is ready

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying CI/CD Setup...\n');

const requiredFiles = [
  'Dockerfile.frontend',
  'Dockerfile.backend',
  'docker-compose.yml',
  'Jenkinsfile',
  'nginx.conf',
  '.dockerignore',
  'jest.config.js',
  'vitest.config.ts',
  '.env.example'
];

const requiredDirs = [
  'server/tests',
  'src/tests',
  'src/utils'
];

let allGood = true;

// Check files
console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allGood = false;
});

console.log('\n📂 Checking required directories:');
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
  if (!exists) allGood = false;
});

// Check package.json scripts
console.log('\n📜 Checking package.json scripts:');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['test:unit', 'test:api', 'test:e2e', 'test:all'];
requiredScripts.forEach(script => {
  const exists = pkg.scripts && pkg.scripts[script];
  console.log(`  ${exists ? '✅' : '❌'} ${script}`);
  if (!exists) allGood = false;
});

// Check Jenkinsfile for placeholder
console.log('\n⚙️  Checking Jenkinsfile configuration:');
const jenkinsfile = fs.readFileSync('Jenkinsfile', 'utf8');
if (jenkinsfile.includes('your-dockerhub-username')) {
  console.log('  ⚠️  WARNING: Update Docker Hub username in Jenkinsfile');
  console.log('     Line 7-8: Replace "your-dockerhub-username"');
} else {
  console.log('  ✅ Docker Hub username configured');
}

console.log('\n' + '='.repeat(60));
if (allGood) {
  console.log('✅ CI/CD Setup is READY!');
  console.log('\n📋 Next Steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Update Jenkinsfile with your Docker Hub username');
  console.log('3. Follow EXECUTE_NOW.md for deployment');
} else {
  console.log('❌ Some files are missing!');
  console.log('Please check the errors above.');
}
console.log('='.repeat(60));
