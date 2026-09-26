const { MongoMemoryReplSet } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

(async () => {
  console.log('Starting MongoDB Memory Server with Replica Set...');
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  
  console.log(`MongoDB URI: ${uri}`);

  // Update .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  
  envContent = envContent.replace(/MONGODB_URI=.*/g, '');
  envContent += `\nMONGODB_URI=${uri}\n`;
  
  fs.writeFileSync(envPath, envContent.trim());
  console.log('.env updated.');

  // Start the actual backend server
  const server = spawn('node', ['src/server.js'], { stdio: 'inherit' });

  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    replSet.stop();
    process.exit(code);
  });
})();
