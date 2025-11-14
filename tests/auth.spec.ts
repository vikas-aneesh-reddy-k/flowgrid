import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page elements', async ({ page }) => {
    // Check if all form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Sign in')).toBeVisible();
    await expect(page.locator('text=Sign up')).toBeVisible();
    await expect(page.locator('h1')).toContainText('FloGrid');
  });

  test('should fill demo credentials when button is clicked', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const demoButton = page.locator('button:has-text("Fill Demo Credentials")');
    
    // Click demo credentials button
    await demoButton.click();
    
    // Check if fields are filled
    await expect(emailInput).toHaveValue('admin@flowgrid.com');
    await expect(passwordInput).toHaveValue('admin123');
  });

  test('should show/hide password when toggle button is clicked', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    const toggleButton = page.locator('button[type="button"]').first();
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button
    await toggleButton.click();
    
    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should navigate to signup page', async ({ page }) => {
    // Click sign up link
    await page.click('text=Sign up');
    
    // Should navigate to signup page
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('h3:has-text("Create account")')).toBeVisible();
  });

  test('should have working form inputs', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[id="password"]');
    
    // Test email input
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    // Test password input
    await passwordInput.fill('testpassword');
    await expect(passwordInput).toHaveValue('testpassword');
  });

  test('should have remember me checkbox', async ({ page }) => {
    const rememberCheckbox = page.locator('input[type="checkbox"]');
    await expect(rememberCheckbox).toBeVisible();
    
    // Test checkbox functionality
    await rememberCheckbox.click();
    await expect(rememberCheckbox).toBeChecked();
  });
});

test.describe('Sign Up Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should display signup form elements', async ({ page }) => {
    // Check if all form elements are present
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="company"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('h3')).toContainText('Create account');
  });

  test('should show password requirements', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    
    // Type a weak password
    await passwordInput.fill('weak');
    
    // Should show password requirements
    await expect(page.locator('text=At least 8 characters')).toBeVisible();
    await expect(page.locator('text=One uppercase letter')).toBeVisible();
    await expect(page.locator('text=One lowercase letter')).toBeVisible();
    await expect(page.locator('text=One number')).toBeVisible();
  });

  test('should have working form inputs', async ({ page }) => {
    // Test first name input
    await page.fill('input[name="firstName"]', 'John');
    await expect(page.locator('input[name="firstName"]')).toHaveValue('John');
    
    // Test last name input
    await page.fill('input[name="lastName"]', 'Doe');
    await expect(page.locator('input[name="lastName"]')).toHaveValue('Doe');
    
    // Test email input
    await page.fill('input[name="email"]', 'john@example.com');
    await expect(page.locator('input[name="email"]')).toHaveValue('john@example.com');
    
    // Test company input
    await page.fill('input[name="company"]', 'Test Company');
    await expect(page.locator('input[name="company"]')).toHaveValue('Test Company');
    
    // Test password input
    await page.fill('input[name="password"]', 'Password123');
    await expect(page.locator('input[name="password"]')).toHaveValue('Password123');
    
    // Test confirm password input
    await page.fill('input[name="confirmPassword"]', 'Password123');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('Password123');
  });

  test('should have working password toggle buttons', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    
    // Test password toggle
    const passwordToggle = page.locator('button[type="button"]').nth(0);
    await passwordToggle.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await passwordToggle.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Test confirm password toggle
    const confirmPasswordToggle = page.locator('button[type="button"]').nth(1);
    await confirmPasswordToggle.click();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    await confirmPasswordToggle.click();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('should have working terms checkbox', async ({ page }) => {
    const termsCheckbox = page.locator('input[type="checkbox"]');
    await expect(termsCheckbox).toBeVisible();
    
    // Test checkbox functionality
    await termsCheckbox.click();
    await expect(termsCheckbox).toBeChecked();
    
    await termsCheckbox.click();
    await expect(termsCheckbox).not.toBeChecked();
  });

  test('should navigate to login page', async ({ page }) => {
    // Click sign in link
    await page.click('text=Sign in');
    
    // Should navigate to login page
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });
});
