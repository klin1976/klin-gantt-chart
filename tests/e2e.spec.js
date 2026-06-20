import { test, expect } from '@playwright/test';

test.describe('Klin Gantt Chart', () => {
  test('has title and chart container', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to render the header
    await page.waitForSelector('header', { state: 'visible' });

    // Expect the page title to contain some text (e.g. from state)
    // By default it might be '專案名稱' or similar. We can check if title is not empty.
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Wait for the main app container
    const appContainer = page.locator('div.flex.flex-col.h-screen');
    await expect(appContainer).toBeVisible();

    // The header should contain the project title input
    const titleInput = page.locator('input[placeholder="專案名稱"]');
    await expect(titleInput).toBeVisible();

    // The header should contain the subtitle input
    const subtitleInput = page.locator('input[placeholder="專案描述"]');
    await expect(subtitleInput).toBeVisible();

    // Check that Add Task button exists (using the Plus icon or bg-indigo-600 class)
    const addButton = page.locator('button.bg-indigo-600');
    await expect(addButton).toBeVisible();
    
    // Click the Add Task button to open the modal
    await addButton.click();

    // Verify that the task modal opens (we can look for some form fields or modal background)
    // The task modal might have a save/cancel button
    const modalContent = page.locator('div.bg-\\[\\#1f2937\\]').last(); // Just testing if some modal container appears
    await expect(modalContent).toBeVisible();
  });
});
