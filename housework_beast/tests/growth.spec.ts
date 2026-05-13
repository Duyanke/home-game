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

// Helper to create and complete a task - simplified from task.spec.ts
async function createAndCompleteTask(creatorPage: Page, executorPage: Page, taskName: string, points: number): Promise<void> {
  // Creator creates task
  await creatorPage.locator('.bottom-nav .nav-item:nth-child(3)').click();
  await creatorPage.waitForTimeout(500);

  const createBtn = creatorPage.locator('.create-btn');
  await createBtn.waitFor({ state: 'visible', timeout: 5000 });
  await createBtn.click();
  await creatorPage.waitForTimeout(500);

  const taskModal = creatorPage.locator('.modal-overlay');
  await taskModal.waitFor({ state: 'visible', timeout: 5000 });
  await taskModal.locator('input[placeholder*="任务"]').fill(taskName);
  await creatorPage.waitForTimeout(200);

  const pointsInput = taskModal.locator('input[type="number"]');
  if (await pointsInput.isVisible()) {
    await pointsInput.fill(String(points));
  }

  await taskModal.locator('button:has-text("创建")').click();
  await taskModal.waitFor({ state: 'hidden', timeout: 5000 });
  console.log('Task created:', taskName);

  await creatorPage.waitForTimeout(1000);

  // Executor goes to task page and claims
  await executorPage.locator('.bottom-nav .nav-item:nth-child(3)').click();
  await executorPage.waitForTimeout(1000);

  const taskItem = executorPage.locator('.task-item').first();
  await taskItem.waitFor({ state: 'visible', timeout: 10000 });

  const claimBtn = taskItem.locator('button:has-text("领取")');
  if (await claimBtn.isVisible()) {
    await claimBtn.click();
    await executorPage.waitForTimeout(1000);
    console.log('Task claimed');
  }

  // Executor completes
  const completeBtn = executorPage.locator('.task-item button:has-text("完成")');
  if (await completeBtn.isVisible()) {
    await completeBtn.click();
    await executorPage.waitForTimeout(1000);
    console.log('Task completed');
  }

  // Creator confirms
  const confirmBtn = creatorPage.locator('.task-item button:has-text("确认")');
  if (await confirmBtn.isVisible()) {
    await confirmBtn.click();
    await executorPage.waitForTimeout(1000);
    console.log('Task confirmed');
  }
}

test.describe('Growth System', () => {
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

  test('initial skills are unlocked correctly at infant stage', async () => {
    test.setTimeout(60000);

    // Create family
    const familyCode = await createFamilyMember(creatorPage, '创建者');
    expect(familyCode.length).toBeGreaterThan(0);

    await joinFamily(executorPage, '执行者', familyCode);

    await creatorPage.waitForTimeout(3000);
    await executorPage.waitForTimeout(3000);

    // Select beast
    await selectBeast(creatorPage, 'dragon');

    await creatorPage.waitForTimeout(2000);

    // Go to beast page
    await creatorPage.locator('.bottom-nav .nav-item:nth-child(2)').click();
    await creatorPage.waitForTimeout(500);

    // Wait for skill data to sync
    await creatorPage.waitForTimeout(1000);

    // Check skill list
    const skillList = creatorPage.locator('.skill-list');
    await skillList.waitFor({ state: 'visible', timeout: 5000 });

    // Count unlocked skills (not locked)
    const unlockedSkills = skillList.locator('.skill-item:not(.locked)');
    const count = await unlockedSkills.count();
    console.log('Unlocked skills count:', count);

    // Infant stage should have at least 1 unlocked skill
    expect(count).toBeGreaterThanOrEqual(1);

    // First skill should be unlocked (风刃斩 for dragon)
    const firstSkill = skillList.locator('.skill-item').first();
    const isLocked = await firstSkill.evaluate(el => el.classList.contains('locked'));
    expect(isLocked).toBe(false);

    console.log('✅ Initial skill unlock test passed');
  });

  test('beast evolves after accumulating points', async () => {
    test.setTimeout(180000);

    // Setup
    const familyCode = await createFamilyMember(creatorPage, '创建者');
    console.log('Family code:', familyCode);
    expect(familyCode.length).toBeGreaterThan(0);

    await joinFamily(executorPage, '执行者', familyCode);
    console.log('Executor joined family');

    await creatorPage.waitForTimeout(3000);
    await executorPage.waitForTimeout(3000);

    await selectBeast(creatorPage, 'dragon');
    console.log('Creator selected dragon');

    await selectBeast(executorPage, 'tiger');
    console.log('Executor selected tiger');

    await creatorPage.waitForTimeout(2000);
    await executorPage.waitForTimeout(2000);

    // Check initial stage
    await creatorPage.locator('.bottom-nav .nav-item:nth-child(2)').click();
    await creatorPage.waitForTimeout(500);

    const skillList = creatorPage.locator('.skill-list');
    await skillList.waitFor({ state: 'visible', timeout: 5000 });

    let initialSkillCount = await skillList.locator('.skill-item:not(.locked)').count();
    console.log('Initial unlocked skills:', initialSkillCount);
    expect(initialSkillCount).toBeGreaterThanOrEqual(1);

    // Complete tasks - use higher points to reach 500 faster
    const pointsPerTask = 50;
    const tasksNeeded = 11; // 11 * 50 = 550 points (reaches 成年期)

    // Navigate to task pages first
    await creatorPage.locator('.bottom-nav .nav-item:nth-child(3)').click();
    await executorPage.locator('.bottom-nav .nav-item:nth-child(3)').click();
    await creatorPage.waitForTimeout(500);
    await executorPage.waitForTimeout(500);

    for (let i = 0; i < tasksNeeded; i++) {
      // Creator creates task
      const createBtn = creatorPage.locator('.create-btn');
      await createBtn.waitFor({ state: 'visible', timeout: 5000 });
      await createBtn.click();
      await creatorPage.waitForTimeout(500);

      const taskModal = creatorPage.locator('.modal-overlay');
      await taskModal.waitFor({ state: 'visible', timeout: 5000 });
      const taskName = `成长任务${i + 1}`;
      await taskModal.locator('input[placeholder*="任务"]').fill(taskName);

      const pointsInput = taskModal.locator('input[type="number"]');
      if (await pointsInput.isVisible()) {
        await pointsInput.fill(String(pointsPerTask));
      }

      await taskModal.locator('button:has-text("创建")').click();
      await taskModal.waitFor({ state: 'hidden', timeout: 5000 });
      await creatorPage.waitForTimeout(1000);

      // Executor claims
      const taskItemExecutor = executorPage.locator('.task-item').filter({ hasText: taskName }).first();
      await taskItemExecutor.waitFor({ state: 'visible', timeout: 10000 });

      const claimBtn = taskItemExecutor.locator('button:has-text("领取")');
      if (await claimBtn.isVisible()) {
        await claimBtn.click();
        await executorPage.waitForTimeout(500);
      }

      // Executor completes
      const completeBtn = taskItemExecutor.locator('button:has-text("完成")');
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await executorPage.waitForTimeout(500);
      }

      // Creator confirms - use specific task name filter
      const taskItemCreator = creatorPage.locator('.task-item').filter({ hasText: taskName }).first();
      const confirmBtn = taskItemCreator.locator('button:has-text("确认")');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await creatorPage.waitForTimeout(1000);
      }

      console.log(`Completed task ${i + 1}, points: ${(i + 1) * pointsPerTask}`);
    }

    // Go to executor's beast page and check evolution (executor earned the points!)
    await executorPage.locator('.bottom-nav .nav-item:nth-child(2)').click();
    await executorPage.waitForTimeout(2000); // Wait longer for skill sync

    // Wait for potential evolution effect
    const evolutionEffect = executorPage.locator('.evolution-effect');
    if (await evolutionEffect.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Evolution effect visible on executor!');
      await evolutionEffect.waitFor({ state: 'hidden', timeout: 10000 });
      await executorPage.waitForTimeout(1000); // Extra wait after animation
    }

    // Refresh beast page to ensure sync
    await executorPage.locator('.bottom-nav .nav-item:nth-child(1)').click();
    await executorPage.waitForTimeout(500);
    await executorPage.locator('.bottom-nav .nav-item:nth-child(2)').click();
    await executorPage.waitForTimeout(1000);

    // Check final skills on executor's beast page
    const executorSkillList = executorPage.locator('.skill-list');
    await executorSkillList.waitFor({ state: 'visible', timeout: 5000 });
    const finalSkillCount = await executorSkillList.locator('.skill-item:not(.locked)').count();
    console.log('Final unlocked skills on executor:', finalSkillCount);

    // Adult stage should have at least 2 unlocked skills
    expect(finalSkillCount).toBeGreaterThanOrEqual(2);

    console.log('✅ Growth evolution test completed');
  });
});