#!/usr/bin/env node
// Load environment variables from .env file for RentFlow
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Read .env file and parse it
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Get the command from arguments
const command = process.argv.slice(2).join(' ');

// Execute the command with the loaded environment, overriding any existing DATABASE_URL
const { execSync } = require('child_process');
try {
  execSync(command, {
    stdio: 'inherit',
    env: { ...process.env, ...envConfig }  // envConfig overrides process.env
  });
} catch (error) {
  process.exit(error.status || 1);
}
