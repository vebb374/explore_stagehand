import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.hackerearth.com/');
  await page.getByRole('link', { name: 'Log In' }).click();
  await page.getByRole('textbox', { name: 'email@example.com' }).click();
  await page.getByRole('textbox', { name: 'email@example.com' }).fill('sumit+mac@hackerearthemail.com');
  await page.getByRole('textbox', { name: '········' }).click();
  await page.getByRole('textbox', { name: '········' }).fill('HE8ZHD');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
});