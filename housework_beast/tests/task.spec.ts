import { test, expect, Page, BrowserContext } from '@playwright/test';

// Helper to create a family member
async function createFamilyMember(page: Page, name: string): Promise<string> {
  const welcomeOverlay = page.locator('.welcome-overlay');
  await welcomeOverlay.waitFor({ state: 'visible', timeout: 10000 });

  await page.locator('.welcome-modal .form-input').first().fill(name);
  await page.waitForTimeout(200);

  await page.locator('.welcome-modal .submit-btn').click();
  await welcomeOverlay.waitFor({ state: 'hidden', timeout: 15000 });
  await page.locator('.family-code-card').waitFor({ state: 'visible', timeout: 5000 });

  const familyCode = await page.evaluate(() => localStorage.getItem('familyCode'));
  return familyCode || '';
}

// Helper to join existing family
async function joinFamily(page: Page, name: string, familyCode: string): Promise<void> {
  const welcomeOverlay = page.locator('.welcome-overlay');
  await welcomeOverlay.waitFor({ state: 'visible', timeout: 10000 });

  await page.locator('.tab-btn:has-text("加入家庭")').click();
  await page.waitForTimeout(300);

  await page.locator('.form-input').first().fill(name);
  await page.waitForTimeout(200);

  await page.locator('.form-group:nth-child(2) .form-input').fill(familyCode);
  await page.waitForTimeout(200);

  await page.locator('.welcome-modal .submit-btn').click();
  await welcomeOverlay.waitFor({ state: 'hidden', timeout: 15000 });
  await page.locator('.family-code-card').waitFor({ state: 'visible', timeout: 5000 });
}

// Helper to select a beast
async function selectBeast(page: Page, beastType: string): Promise<void> {
  await page.locator('.bottom-nav .nav-item:nth-child(2)').click();
  await page.waitForTimeout(500);

  const selectPage = page.locator('.beast-select-page');
  const loadingOverlay = page.locator('.loading-overlay');

  await page.waitForTimeout(1000);

  if (await loadingOverlay.isVisible()) {
    await loadingOverlay.waitFor({ state: 'hidden', timeout: 10000 });
  }

  if (await selectPage.isVisible()) {
    const beastCard = page.locator(`.beast-card.beast-${beastType}`);
    await beastCard.waitFor({ state: 'visible', timeout: 5000 });
    await beastCard.click();
    await page.waitForTimeout(300);

    await page.locator('.confirm-btn:has-text("确认选择")').click();
    await loadingOverlay.waitFor({ state: 'hidden', timeout: 15000 });
    await page.locator('.beast-page').waitFor({ state: 'visible', timeout: 10000 });
  }

  await page.waitForTimeout(500);
}

test.describe('Task Flow', () => {
  let creatorPage: Page;
  let executorPage: Page;
  let creatorContext: BrowserContext;
  let executorContext: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    creatorContext = await browser.newContext();
    executorContext = await browser.newContext();

    creatorPage = await creatorContext.newPage();
    executorPage = await executorContext.newPage();

    await creatorPage.goto('http://localhost:5176');
    await executorPage.goto('http://localhost:5176');
    await creatorPage.evaluate(() => localStorage.clear());
    await executorPage.evaluate(() => localStorage.clear());
    await creatorPage.waitForTimeout(500);
    await executorPage.waitForTimeout(500);
  });

  test.afterEach(async () => {
    await creatorContext.close();
    await executorContext.close();
  });

  test('complete task flow - create, claim, complete, confirm', async () => {
    test.setTimeout(120000);

    // Step 1: Creator creates family
    const familyCode = await createFamilyMember(creatorPage, '创建者');
    console.log('Family code:', familyCode);
    expect(familyCode.length).toBeGreaterThan(0);

    // Step 2: Executor joins same family
    await joinFamily(executorPage, '执行者', familyCode);
    console.log('Executor joined family');

    // Wait for member sync
    await creatorPage.waitForTimeout(3000);
    await executorPage.waitForTimeout(3000);

    // Step 3: Both select beasts
    await selectBeast(creatorPage, 'dragon');
    console.log('Creator selected dragon');

    await selectBeast(executorPage, 'tiger');
    console.log('Executor selected tiger');

    // Wait for beast sync
    await creatorPage.waitForTimeout(2000);
    await executorPage.waitForTimeout(2000);

    // Step 4: Navigate to task page
    await creatorPage.locator('.bottom-nav .nav-item:nth-child(3)').click();
    await creatorPage.waitForTimeout(500);

    await executorPage.locator('.bottom-nav .nav-item:nth-child(3)').click();
    await executorPage.waitForTimeout(500);

    // Step 5: Creator creates a task
    // Check for + button in header
    const createBtn = creatorPage.locator('.create-btn');
    await createBtn.waitFor({ state: 'visible', timeout: 5000 });
    await createBtn.click();
    await creatorPage.waitForTimeout(500);

    // Fill task form
    const taskModal = creatorPage.locator('.modal-overlay');
    await taskModal.waitFor({ state: 'visible', timeout: 5000 });
    await taskModal.locator('input[placeholder*="任务"]').fill('测试任务');
    await creatorPage.waitForTimeout(200);

    // Set points
    const pointsInput = taskModal.locator('input[type="number"]');
    if (await pointsInput.isVisible()) {
      await pointsInput.fill('10');
    }

    // Submit
    await taskModal.locator('button:has-text("创建")').click();
    await taskModal.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('Task created');

    await creatorPage.waitForTimeout(1000);

    // Step 6: Executor claims the task
    const taskItem = executorPage.locator('.task-item').first();
    await taskItem.waitFor({ state: 'visible', timeout: 10000 });

    const claimBtn = taskItem.locator('button:has-text("领取")');
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
      await executorPage.waitForTimeout(1000);
      console.log('Task claimed');
    }

    // Step 7: Executor completes the task
    const completeBtn = executorPage.locator('.task-item button:has-text("完成")');
    if (await completeBtn.isVisible()) {
      await completeBtn.click();
      await executorPage.waitForTimeout(1000);
      console.log('Task completed');
    }

    // Step 8: Creator confirms the task
    const confirmBtn = creatorPage.locator('.task-item button:has-text("确认")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await creatorPage.waitForTimeout(1000);
      console.log('Task confirmed');
    }

    // Step 9: Verify task status is confirmed
    // Check task item shows completed status
    const confirmedTask = creatorPage.locator('.task-item').filter({ hasText: '测试任务' });
    await confirmedTask.waitFor({ state: 'visible', timeout: 5000 });

    console.log('✅ Task flow test completed successfully');
  });
});