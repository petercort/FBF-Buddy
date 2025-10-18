#!/usr/bin/env node

/**
 * Security Monitoring Script for validator.js CVE-2025-56200
 * 
 * This script checks if a patched version of validator.js is available
 * and reports the current status of the known vulnerability.
 * 
 * Run: node .github/scripts/check-validator-security.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const VULNERABLE_VERSION = '13.15.15';
const CVE_ID = 'CVE-2025-56200';
const GHSA_ID = 'GHSA-9965-vmph-33xx';

async function checkValidatorVersion() {
  console.log('🔍 Checking validator.js security status...\n');
  
  try {
    // Check latest available version
    const { stdout } = await execAsync('npm view validator version');
    const latestVersion = stdout.trim();
    
    console.log(`Current vulnerable version: ${VULNERABLE_VERSION}`);
    console.log(`Latest available version:   ${latestVersion}\n`);
    
    if (latestVersion === VULNERABLE_VERSION) {
      console.log('⚠️  Status: VULNERABLE');
      console.log(`   No patched version available yet for ${CVE_ID}`);
      console.log(`   GitHub Advisory: https://github.com/advisories/${GHSA_ID}`);
      console.log(`   CVE Details: https://www.cvedetails.com/cve/${CVE_ID}/\n`);
      console.log('✅ Mitigation: Application does not directly use validator.js');
      console.log('   Risk Level: LOW (transitive dependency only)\n');
      console.log('📋 Action: Continue monitoring for updates');
      return 1; // Exit code 1 to indicate vulnerability still present
    } else {
      console.log('✅ Status: PATCH AVAILABLE!');
      console.log(`   A new version (${latestVersion}) is available!`);
      console.log(`   Update steps:`);
      console.log(`   1. Check Sequelize changelog for validator.js update`);
      console.log(`   2. Update Sequelize version in package.json`);
      console.log(`   3. Run 'npm install' in root and service directories`);
      console.log(`   4. Run 'npm audit' to verify vulnerability is resolved`);
      console.log(`   5. Update SECURITY.md to mark vulnerability as resolved\n`);
      return 0; // Exit code 0 to indicate patch available
    }
  } catch (error) {
    console.error('❌ Error checking validator.js version:', error.message);
    return 2; // Exit code 2 for errors
  }
}

// Run the check
checkValidatorVersion().then(code => process.exit(code));
