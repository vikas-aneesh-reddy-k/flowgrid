# Authentication UI Testing with Playwright

This directory contains focused UI tests for the FloGrid ERP authentication pages using Playwright.

## Test Structure

### Test Files

- **`auth.spec.ts`** - Authentication page tests (login and signup pages only)

### Test Categories

1. **Login Page Tests**
   - Form elements visibility
   - Demo credentials functionality
   - Password toggle functionality
   - Form input validation
   - Navigation to signup page
   - Remember me checkbox

2. **Sign Up Page Tests**
   - Form elements visibility
   - Password requirements display
   - Form input validation
   - Password toggle functionality
   - Terms checkbox functionality
   - Navigation to login page

## Running Tests

### Local Development

```bash
# Install Playwright browsers
npm run test:install

# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run authentication tests only
npm run test:auth

# Debug tests
npm run test:debug

# View test report
npm run test:report
```

### CI/CD Pipeline

Tests are automatically run in the CI/CD pipeline on:
- Push to main/develop branches
- Pull requests
- Daily scheduled runs

The pipeline tests against:
- Chromium (desktop)

## Test Configuration

### Playwright Config (`playwright.config.ts`)

- **Base URL**: `http://localhost:8081`
- **Browsers**: Chromium (desktop only)
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

### Test Reports

- **HTML Report**: `playwright-report/index.html`
- **JUnit XML**: `test-results/junit.xml`
- **JSON Results**: `test-results/results.json`

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Feature Name', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
  });

  test('should test specific functionality', async ({ page }) => {
    // Test implementation
  });
});
```

### Using Test Helpers

```typescript
// Login helper
await helpers.login('email@example.com', 'password');

// Navigation helper
await helpers.navigateToModule('CRM');

// Screenshot helper
await helpers.takeScreenshot('feature-name.png');

// Accessibility helper
await helpers.checkAccessibility();
```

### Best Practices

1. **Use Page Object Model**: Create reusable page objects for complex pages
2. **Test User Journeys**: Focus on complete user workflows
3. **Assert Early**: Check conditions as soon as possible
4. **Clean State**: Clear localStorage and reset state between tests
5. **Wait for Elements**: Use proper waiting strategies
6. **Test Accessibility**: Ensure all interactive elements are accessible

## Debugging Tests

### Local Debugging

```bash
# Run specific test in debug mode
npx playwright test tests/auth.spec.ts --debug

# Run with browser dev tools
npx playwright test --headed --debug
```

### CI Debugging

- Check test artifacts in GitHub Actions
- Download and view screenshots/videos
- Review HTML reports
- Check console logs

## Test Data

### Demo Credentials

- **Email**: Any valid email format
- **Password**: Any non-empty password
- **Demo Button**: Fills `admin@flogrid.com` / `password123`

### Test Users

Tests use mock authentication with localStorage persistence.

## Continuous Integration

### GitHub Actions

- **Workflow**: `.github/workflows/ui-tests.yml`
- **Triggers**: Push, PR, Daily schedule
- **Matrix**: Multiple browsers
- **Artifacts**: Reports, screenshots, videos

### Jenkins

- **Pipeline**: `Jenkinsfile`
- **Stage**: UI Tests
- **Reports**: HTML report publishing
- **Artifacts**: Test results archiving

## Maintenance

### Updating Tests

1. Update selectors when UI changes
2. Add new test cases for new features
3. Update visual regression screenshots
4. Maintain test data consistency

### Performance

- Tests run in parallel by default
- Use `test.describe.serial()` for sequential tests
- Optimize wait strategies
- Clean up test data

## Troubleshooting

### Common Issues

1. **Flaky Tests**: Add proper waits, use `waitForLoadState`
2. **Selector Issues**: Use data-testid attributes
3. **Timing Issues**: Increase timeouts, use `waitFor`
4. **Browser Issues**: Update Playwright, check browser versions

### Getting Help

- Check Playwright documentation
- Review test reports and artifacts
- Use debug mode for investigation
- Check CI/CD logs for environment issues
