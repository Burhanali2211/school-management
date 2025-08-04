const { spawn } = require('child_process');
const { execSync } = require('child_process');

console.log('🚀 Starting School Management System...\n');

// Start the development server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true
});

let serverReady = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Check if server is ready
  if (output.includes('Ready') || output.includes('started server')) {
    serverReady = true;
    console.log('\n✅ Server is ready! Running tests...\n');
    
    // Wait a bit for server to fully start
    setTimeout(() => {
      try {
        execSync('node test-unified-login.js', { stdio: 'inherit' });
        console.log('\n✅ Tests completed! Shutting down server...\n');
        server.kill();
        process.exit(0);
      } catch (error) {
        console.error('\n❌ Tests failed:', error.message);
        server.kill();
        process.exit(1);
      }
    }, 3000);
  }
});

server.stderr.on('data', (data) => {
  console.error('Server Error:', data.toString());
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\nServer process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit(0);
});

// Timeout after 30 seconds
setTimeout(() => {
  if (!serverReady) {
    console.log('\n⏰ Timeout: Server did not start within 30 seconds');
    server.kill();
    process.exit(1);
  }
}, 30000); 