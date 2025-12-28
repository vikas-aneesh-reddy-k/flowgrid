// Test setup and utilities for CI/CD pipeline
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class TestRunner {
    constructor() {
        this.results = {
            frontend: { passed: 0, failed: 0, total: 0 },
            backend: { passed: 0, failed: 0, total: 0 },
            e2e: { passed: 0, failed: 0, total: 0 }
        };
    }

    // Run frontend unit tests
    async runFrontendTests() {
        console.log('🧪 Running frontend unit tests...');
        try {
            const output = execSync('npm run test:unit', { 
                encoding: 'utf8',
                cwd: process.cwd()
            });
            
            this.parseFrontendResults(output);
            console.log('✅ Frontend tests completed');
            return true;
        } catch (error) {
            console.error('❌ Frontend tests failed:', error.message);
            this.results.frontend.failed = 1;
            return false;
        }
    }

    // Run backend tests
    async runBackendTests() {
        console.log('🧪 Running backend tests...');
        try {
            const output = execSync('npm test', { 
                encoding: 'utf8',
                cwd: path.join(process.cwd(), 'server')
            });
            
            this.parseBackendResults(output);
            console.log('✅ Backend tests completed');
            return true;
        } catch (error) {
            console.error('❌ Backend tests failed:', error.message);
            this.results.backend.failed = 1;
            return false;
        }
    }

    // Run end-to-end tests
    async runE2ETests() {
        console.log('🧪 Running end-to-end tests...');
        try {
            // Install Playwright browsers if needed
            execSync('npx playwright install', { 
                encoding: 'utf8',
                stdio: 'inherit'
            });

            const output = execSync('npm run test:e2e', { 
                encoding: 'utf8',
                cwd: process.cwd()
            });
            
            this.parseE2EResults(output);
            console.log('✅ E2E tests completed');
            return true;
        } catch (error) {
            console.error('❌ E2E tests failed:', error.message);
            this.results.e2e.failed = 1;
            return false;
        }
    }

    // Parse frontend test results
    parseFrontendResults(output) {
        const lines = output.split('\n');
        for (const line of lines) {
            if (line.includes('Tests:')) {
                const match = line.match(/(\d+) passed.*?(\d+) total/);
                if (match) {
                    this.results.frontend.passed = parseInt(match[1]);
                    this.results.frontend.total = parseInt(match[2]);
                    this.results.frontend.failed = this.results.frontend.total - this.results.frontend.passed;
                }
            }
        }
    }

    // Parse backend test results
    parseBackendResults(output) {
        const lines = output.split('\n');
        for (const line of lines) {
            if (line.includes('Tests:')) {
                const match = line.match(/(\d+) passed.*?(\d+) total/);
                if (match) {
                    this.results.backend.passed = parseInt(match[1]);
                    this.results.backend.total = parseInt(match[2]);
                    this.results.backend.failed = this.results.backend.total - this.results.backend.passed;
                }
            }
        }
    }

    // Parse E2E test results
    parseE2EResults(output) {
        const lines = output.split('\n');
        for (const line of lines) {
            if (line.includes('passed') && line.includes('failed')) {
                const passedMatch = line.match(/(\d+) passed/);
                const failedMatch = line.match(/(\d+) failed/);
                
                if (passedMatch) this.results.e2e.passed = parseInt(passedMatch[1]);
                if (failedMatch) this.results.e2e.failed = parseInt(failedMatch[1]);
                
                this.results.e2e.total = this.results.e2e.passed + this.results.e2e.failed;
            }
        }
    }

    // Generate test report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: 0,
                totalPassed: 0,
                totalFailed: 0,
                success: true
            },
            details: this.results
        };

        // Calculate totals
        Object.values(this.results).forEach(result => {
            report.summary.totalTests += result.total;
            report.summary.totalPassed += result.passed;
            report.summary.totalFailed += result.failed;
        });

        report.summary.success = report.summary.totalFailed === 0;

        // Write report to file
        fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
        
        // Generate JUnit XML for Jenkins
        this.generateJUnitXML(report);

        return report;
    }

    // Generate JUnit XML format for Jenkins
    generateJUnitXML(report) {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="FlowGrid Tests" tests="${report.summary.totalTests}" failures="${report.summary.totalFailed}" time="0">
    <testsuite name="Frontend Tests" tests="${this.results.frontend.total}" failures="${this.results.frontend.failed}" time="0">
        ${this.generateTestCases('frontend')}
    </testsuite>
    <testsuite name="Backend Tests" tests="${this.results.backend.total}" failures="${this.results.backend.failed}" time="0">
        ${this.generateTestCases('backend')}
    </testsuite>
    <testsuite name="E2E Tests" tests="${this.results.e2e.total}" failures="${this.results.e2e.failed}" time="0">
        ${this.generateTestCases('e2e')}
    </testsuite>
</testsuites>`;

        fs.writeFileSync('test-results.xml', xml);
    }

    // Generate test cases for JUnit XML
    generateTestCases(type) {
        const result = this.results[type];
        let cases = '';
        
        for (let i = 0; i < result.passed; i++) {
            cases += `        <testcase name="${type}-test-${i + 1}" classname="${type}" time="0"/>\n`;
        }
        
        for (let i = 0; i < result.failed; i++) {
            cases += `        <testcase name="${type}-test-${result.passed + i + 1}" classname="${type}" time="0">
            <failure message="Test failed" type="AssertionError">Test case failed</failure>
        </testcase>\n`;
        }
        
        return cases;
    }

    // Print summary
    printSummary() {
        console.log('\n📊 Test Results Summary');
        console.log('========================');
        console.log(`Frontend: ${this.results.frontend.passed}/${this.results.frontend.total} passed`);
        console.log(`Backend:  ${this.results.backend.passed}/${this.results.backend.total} passed`);
        console.log(`E2E:      ${this.results.e2e.passed}/${this.results.e2e.total} passed`);
        
        const totalPassed = this.results.frontend.passed + this.results.backend.passed + this.results.e2e.passed;
        const totalTests = this.results.frontend.total + this.results.backend.total + this.results.e2e.total;
        const totalFailed = totalTests - totalPassed;
        
        console.log(`\nTotal:    ${totalPassed}/${totalTests} passed`);
        
        if (totalFailed === 0) {
            console.log('✅ All tests passed!');
        } else {
            console.log(`❌ ${totalFailed} tests failed`);
        }
    }
}

// Main execution
async function runAllTests() {
    const runner = new TestRunner();
    
    console.log('🚀 Starting test suite...\n');
    
    const frontendSuccess = await runner.runFrontendTests();
    const backendSuccess = await runner.runBackendTests();
    const e2eSuccess = await runner.runE2ETests();
    
    const report = runner.generateReport();
    runner.printSummary();
    
    const allSuccess = frontendSuccess && backendSuccess && e2eSuccess;
    
    if (allSuccess) {
        console.log('\n🎉 All test suites completed successfully!');
        process.exit(0);
    } else {
        console.log('\n💥 Some tests failed. Check the logs above.');
        process.exit(1);
    }
}

// Export for use in other scripts
export { TestRunner };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(error => {
        console.error('Test runner failed:', error);
        process.exit(1);
    });
}