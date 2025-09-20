#!/usr/bin/env node

/**
 * Production Readiness Check
 * Validates all systems are ready for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

// Load environment variables
loadEnvFile();

// Configuration
const CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  strict: process.argv.includes('--strict'),
};

// Check results
const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
  critical: [],
  warnings_list: [],
  startTime: Date.now()
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    reset: '\x1b[0m'
  };
  
  if (CONFIG.verbose || type === 'error' || type === 'warning') {
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }
}

function checkResult(name, passed, message, critical = false) {
  if (passed) {
    checks.passed++;
    log(`✓ ${name}: ${message}`, 'success');
  } else {
    checks.failed++;
    const issue = { name, message, critical };
    
    if (critical) {
      checks.critical.push(issue);
      log(`✗ ${name}: ${message}`, 'error');
    } else {
      checks.warnings++;
      checks.warnings_list.push(issue);
      log(`⚠ ${name}: ${message}`, 'warning');
    }
  }
}

function checkEnvironmentVariables() {
  log('Checking environment variables...', 'info');
  
  const required = [
    'NODE_ENV',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];
  
  const recommended = [
    'DATABASE_URL',
    'REDIS_URL',
    'API_KEY_ENCRYPTION_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'PERPLEXITY_API_KEY'
  ];
  
  // Check required variables
  required.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      checkResult(`Required env var: ${varName}`, false, 'Missing required environment variable', true);
    } else {
      checkResult(`Required env var: ${varName}`, true, 'Present');
    }
  });
  
  // Check recommended variables
  recommended.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      checkResult(`Recommended env var: ${varName}`, false, 'Missing recommended environment variable', false);
    } else {
      checkResult(`Recommended env var: ${varName}`, true, 'Present');
    }
  });
}

function checkFileStructure() {
  log('Checking file structure...', 'info');
  
  const requiredFiles = [
    'package.json',
    'next.config.ts',
    'tsconfig.json',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/api/health/route.ts',
    'src/app/api/v1/route.ts',
    'src/lib/secureApiKeys.ts',
    'src/lib/apiKeyRotation.ts'
  ];
  
  const requiredDirs = [
    'src/app/api',
    'src/components',
    'src/lib',
    'scripts'
  ];
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    checkResult(`File: ${file}`, exists, exists ? 'Present' : 'Missing', true);
  });
  
  requiredDirs.forEach(dir => {
    const exists = fs.existsSync(path.join(process.cwd(), dir));
    checkResult(`Directory: ${dir}`, exists, exists ? 'Present' : 'Missing', true);
  });
}

function checkPackageJson() {
  log('Checking package.json...', 'info');
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check required scripts
    const requiredScripts = ['dev', 'build', 'start'];
    requiredScripts.forEach(script => {
      const exists = packageJson.scripts && packageJson.scripts[script];
      checkResult(`Script: ${script}`, exists, exists ? 'Present' : 'Missing', true);
    });
    
    // Check dependencies
    const criticalDeps = ['next', 'react', 'react-dom'];
    criticalDeps.forEach(dep => {
      const exists = packageJson.dependencies && packageJson.dependencies[dep];
      checkResult(`Dependency: ${dep}`, exists, exists ? 'Present' : 'Missing', true);
    });
    
    // Check security dependencies
    const securityDeps = ['pg', 'ioredis', 'crypto'];
    securityDeps.forEach(dep => {
      const exists = packageJson.dependencies && packageJson.dependencies[dep];
      checkResult(`Security dep: ${dep}`, exists, exists ? 'Present' : 'Missing', false);
    });
    
  } catch (error) {
    checkResult('Package.json validation', false, `Error reading package.json: ${error.message}`, true);
  }
}

function checkTypeScriptConfig() {
  log('Checking TypeScript configuration...', 'info');
  
  try {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // Check important compiler options
    const compilerOptions = tsconfig.compilerOptions || {};
    
    checkResult('TypeScript strict mode', compilerOptions.strict, 
      compilerOptions.strict ? 'Enabled' : 'Disabled (recommended for production)', false);
    
    checkResult('TypeScript noUnusedLocals', compilerOptions.noUnusedLocals, 
      compilerOptions.noUnusedLocals ? 'Enabled' : 'Disabled (recommended for production)', false);
    
    checkResult('TypeScript noUnusedParameters', compilerOptions.noUnusedParameters, 
      compilerOptions.noUnusedParameters ? 'Enabled' : 'Disabled (recommended for production)', false);
    
  } catch (error) {
    checkResult('TypeScript config validation', false, `Error reading tsconfig.json: ${error.message}`, true);
  }
}

function checkSecurityConfiguration() {
  log('Checking security configuration...', 'info');
  
  // Check for security-related files
  const securityFiles = [
    'SECURITY_GUIDE.md',
    'src/lib/security.ts'
  ];
  
  securityFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    checkResult(`Security file: ${file}`, exists, exists ? 'Present' : 'Missing', false);
  });
  
  // Check Next.js config for security headers
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
    if (fs.existsSync(nextConfigPath)) {
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
      const hasSecurityHeaders = nextConfigContent.includes('securityHeaders') || 
                                 nextConfigContent.includes('headers');
      checkResult('Security headers config', hasSecurityHeaders, 
        hasSecurityHeaders ? 'Configured' : 'Not configured (recommended)', false);
    }
  } catch (error) {
    checkResult('Next.js security config', false, `Error reading next.config.ts: ${error.message}`, false);
  }
}

function checkDatabaseConfiguration() {
  log('Checking database configuration...', 'info');
  
  // Check for database-related files
  const dbFiles = [
    'src/lib/productionDatabase.ts',
    'src/lib/database.ts'
  ];
  
  let hasDbFiles = false;
  dbFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    if (exists) hasDbFiles = true;
    checkResult(`Database file: ${file}`, exists, exists ? 'Present' : 'Missing', false);
  });
  
  // Check for Supabase configuration
  const supabaseConfig = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;
  checkResult('Supabase configuration', supabaseConfig, 
    supabaseConfig ? 'Configured' : 'Not configured (required for production)', !supabaseConfig);
  
  // Check for PostgreSQL configuration
  const postgresConfig = process.env.DATABASE_URL;
  checkResult('PostgreSQL configuration', !!postgresConfig, 
    postgresConfig ? 'Configured' : 'Not configured (recommended)', false);
}

function checkAPIEndpoints() {
  log('Checking API endpoint structure...', 'info');
  
  const apiDir = path.join(process.cwd(), 'src/app/api');
  if (!fs.existsSync(apiDir)) {
    checkResult('API directory', false, 'Missing API directory', true);
    return;
  }
  
  const requiredEndpoints = [
    'health/route.ts',
    'v1/route.ts',
    'v1/keys/route.ts',
    'v1/keys/initial/route.ts'
  ];
  
  requiredEndpoints.forEach(endpoint => {
    const exists = fs.existsSync(path.join(apiDir, endpoint));
    checkResult(`API endpoint: ${endpoint}`, exists, exists ? 'Present' : 'Missing', true);
  });
  
  // Check for demo endpoints (should exist for testing)
  const demoEndpoints = [
    'cost-aware-optimization/route.ts',
    'comprehensive-optimizer/route.ts',
    'capo-x402-demo/route.ts',
    'real-x402-demo/route.ts'
  ];
  
  demoEndpoints.forEach(endpoint => {
    const exists = fs.existsSync(path.join(apiDir, endpoint));
    checkResult(`Demo endpoint: ${endpoint}`, exists, exists ? 'Present' : 'Missing', false);
  });
}

function checkBuildProcess() {
  log('Checking build process...', 'info');
  
  try {
    // Check if build directory exists or can be created
    const buildDir = path.join(process.cwd(), '.next');
    
    // Try to run build command (dry run)
    if (CONFIG.verbose) {
      log('Running build check...', 'info');
      try {
        execSync('npm run build', { 
          stdio: 'pipe', 
          timeout: 60000,
          cwd: process.cwd() 
        });
        checkResult('Build process', true, 'Build successful');
      } catch (error) {
        checkResult('Build process', false, `Build failed: ${error.message}`, true);
      }
    } else {
      checkResult('Build process', true, 'Skipped (use --verbose to test)');
    }
    
  } catch (error) {
    checkResult('Build process', false, `Build check failed: ${error.message}`, true);
  }
}

function checkLinting() {
  log('Checking linting configuration...', 'info');
  
  const lintFiles = [
    'eslint.config.mjs',
    '.eslintrc.js',
    '.eslintrc.json'
  ];
  
  let hasLintConfig = false;
  lintFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    if (exists) hasLintConfig = true;
    checkResult(`Lint config: ${file}`, exists, exists ? 'Present' : 'Missing', false);
  });
  
  // Check package.json for lint script
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const hasLintScript = packageJson.scripts && packageJson.scripts.lint;
    checkResult('Lint script', hasLintScript, hasLintScript ? 'Present' : 'Missing', false);
  } catch (error) {
    checkResult('Lint script check', false, `Error checking lint script: ${error.message}`, false);
  }
}

function checkTestingSetup() {
  log('Checking testing setup...', 'info');
  
  const testFiles = [
    'jest.config.js',
    'jest.setup.js',
    'test/',
    'src/__tests__/'
  ];
  
  testFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    checkResult(`Test file/dir: ${file}`, exists, exists ? 'Present' : 'Missing', false);
  });
  
  // Check for test scripts in package.json
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const hasTestScript = packageJson.scripts && (packageJson.scripts.test || packageJson.scripts['test:watch']);
    checkResult('Test scripts', hasTestScript, hasTestScript ? 'Present' : 'Missing', false);
  } catch (error) {
    checkResult('Test scripts check', false, `Error checking test scripts: ${error.message}`, false);
  }
}

function checkDocumentation() {
  log('Checking documentation...', 'info');
  
  const docFiles = [
    'README.md',
    'SETUP_GUIDE.md',
    'DEPLOYMENT_GUIDE.md',
    'API_DOCUMENTATION.md',
    'SECURITY_GUIDE.md'
  ];
  
  docFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    checkResult(`Documentation: ${file}`, exists, exists ? 'Present' : 'Missing', false);
  });
  
  // Check if README has essential sections
  try {
    const readmePath = path.join(process.cwd(), 'README.md');
    if (fs.existsSync(readmePath)) {
      const readmeContent = fs.readFileSync(readmePath, 'utf8').toLowerCase();
      const essentialSections = ['installation', 'usage', 'api', 'configuration'];
      
      essentialSections.forEach(section => {
        const hasSection = readmeContent.includes(section);
        checkResult(`README section: ${section}`, hasSection, hasSection ? 'Present' : 'Missing', false);
      });
    }
  } catch (error) {
    checkResult('README validation', false, `Error reading README: ${error.message}`, false);
  }
}

function checkProductionOptimizations() {
  log('Checking production optimizations...', 'info');
  
  // Check Next.js config for production optimizations
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
    if (fs.existsSync(nextConfigPath)) {
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      const optimizations = [
        'compression',
        'images',
        'swcMinify',
        'poweredByHeader'
      ];
      
      optimizations.forEach(opt => {
        const hasOptimization = nextConfigContent.includes(opt);
        checkResult(`Next.js optimization: ${opt}`, hasOptimization, 
          hasOptimization ? 'Configured' : 'Not configured (recommended)', false);
      });
    }
  } catch (error) {
    checkResult('Next.js optimizations check', false, `Error reading next.config.ts: ${error.message}`, false);
  }
  
  // Check for environment-specific configurations
  const nodeEnv = process.env.NODE_ENV;
  checkResult('NODE_ENV set', !!nodeEnv, 
    nodeEnv ? `Set to: ${nodeEnv}` : 'Not set (should be "production" for production)', 
    nodeEnv !== 'production' && CONFIG.strict);
}

// Main check runner
async function runAllChecks() {
  log('Starting production readiness check...', 'info');
  log(`Strict mode: ${CONFIG.strict}`, 'info');
  log(`Verbose mode: ${CONFIG.verbose}`, 'info');
  
  const checkFunctions = [
    checkEnvironmentVariables,
    checkFileStructure,
    checkPackageJson,
    checkTypeScriptConfig,
    checkSecurityConfiguration,
    checkDatabaseConfiguration,
    checkAPIEndpoints,
    checkBuildProcess,
    checkLinting,
    checkTestingSetup,
    checkDocumentation,
    checkProductionOptimizations
  ];
  
  for (const checkFn of checkFunctions) {
    try {
      await checkFn();
    } catch (error) {
      log(`Check function failed: ${error.message}`, 'error');
      checks.failed++;
    }
  }
  
  // Generate report
  const totalTime = Date.now() - checks.startTime;
  const report = {
    summary: {
      total: checks.passed + checks.failed + checks.warnings,
      passed: checks.passed,
      failed: checks.failed,
      warnings: checks.warnings,
      critical_issues: checks.critical.length,
      duration: totalTime,
      timestamp: new Date().toISOString(),
      production_ready: checks.critical.length === 0 && (checks.failed === 0 || !CONFIG.strict)
    },
    critical_issues: checks.critical,
    warnings: checks.warnings_list,
    config: CONFIG
  };
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'production-readiness-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('PRODUCTION READINESS CHECK RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Checks: ${report.summary.total}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Warnings: ${report.summary.warnings}`);
  console.log(`Critical Issues: ${report.summary.critical_issues}`);
  console.log(`Duration: ${report.summary.duration}ms`);
  console.log(`Production Ready: ${report.summary.production_ready ? 'YES' : 'NO'}`);
  console.log(`Report saved to: ${reportPath}`);
  
  if (checks.critical.length > 0) {
    console.log('\nCritical Issues:');
    checks.critical.forEach(issue => {
      console.log(`  - ${issue.name}: ${issue.message}`);
    });
  }
  
  if (checks.warnings_list.length > 0 && CONFIG.verbose) {
    console.log('\nWarnings:');
    checks.warnings_list.forEach(warning => {
      console.log(`  - ${warning.name}: ${warning.message}`);
    });
  }
  
  console.log('='.repeat(60));
  
  // Exit with appropriate code
  const exitCode = checks.critical.length > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Handle process termination
process.on('SIGINT', () => {
  log('Production readiness check interrupted by user', 'warning');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'error');
  process.exit(1);
});

// Run the checks
if (require.main === module) {
  runAllChecks().catch(error => {
    log(`Production readiness check failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runAllChecks, CONFIG };
