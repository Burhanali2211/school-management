#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting School Management System...');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.error('❌ .env file not found. Please create it with your environment variables.');
  console.log('📋 Required variables: DATABASE_URL, JWT_SECRET, CLERK keys');
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  const install = spawn('npm', ['install'], { stdio: 'inherit' });
  install.on('close', (code) => {
    if (code === 0) {
      startDev();
    } else {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startDev();
}

function startDev() {
  console.log('🔧 Starting development server...');
  const dev = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  dev.on('close', (code) => {
    console.log(`Development server exited with code ${code}`);
  });
  
  dev.on('error', (err) => {
    console.error('❌ Failed to start development server:', err);
  });
}
