#!/usr/bin/env node

/**
 * Database Validation Script
 * Prevents accidental operations on wrong database
 */

const fs = require('fs');
const path = require('path');

// CRITICAL: The ONLY allowed database for RentFlow
const ALLOWED_DATABASE = 'ep-cold-base-adwtjphb';
const FORBIDDEN_DATABASE = 'ep-long-pine-ahrrg95e';

function validateDatabase() {
  try {
    // Read .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('❌ ERROR: .env.local not found');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);

    if (!dbUrlMatch) {
      console.error('❌ ERROR: DATABASE_URL not found in .env.local');
      process.exit(1);
    }

    const databaseUrl = dbUrlMatch[1];

    // Check for forbidden database
    if (databaseUrl.includes(FORBIDDEN_DATABASE)) {
      console.error('\n🚨🚨🚨 CRITICAL ERROR 🚨🚨🚨');
      console.error(`DATABASE_URL points to FORBIDDEN database: ${FORBIDDEN_DATABASE}`);
      console.error('This database belongs to a DIFFERENT application!');
      console.error('Operation BLOCKED to prevent data loss.');
      console.error('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n');
      process.exit(1);
    }

    // Check for correct database
    if (!databaseUrl.includes(ALLOWED_DATABASE)) {
      console.error('\n⚠️  WARNING: DATABASE_URL does not point to the expected RentFlow database');
      console.error(`Expected: ${ALLOWED_DATABASE}`);
      console.error(`Current: ${databaseUrl}`);
      console.error('\nPlease verify your database configuration.\n');
      process.exit(1);
    }

    console.log('✅ Database validation passed: Connected to correct RentFlow database');
    console.log(`   Database: ${ALLOWED_DATABASE}\n`);
    process.exit(0);

  } catch (error) {
    console.error('❌ ERROR validating database:', error.message);
    process.exit(1);
  }
}

validateDatabase();
