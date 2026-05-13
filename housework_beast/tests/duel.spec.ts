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
  const beastPage = page.locator('.beast-page');
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
    await beastPage.waitFor({ state: 'visible', timeout: 10000 });
  } else if (await beastPage.isVisible()) {
    const changeBtn = page.locator('button:has-text("切换神兽")');
    if (await changeBtn.isVisible()) {
      await changeBtn.click();
      await page.waitForTimeout(300);
      await page.locator('.modal-content .confirm-btn').click();
      await page.waitForTimeout(500);
      await selectPage.waitFor({ state: 'visible', timeout: 5000 });

      const beastCard = page.locator(`.beast-card.beast-${beastType}`);
      await beastCard.waitFor({ state: 'visible', timeout: 5000 });
      await beastCard.click();
      await page.waitForTimeout(300);
      await page.locator('.confirm-btn:has-text("确认选择")').click();
      await loadingOverlay.waitFor({ state: 'hidden', timeout: 15000 });
      await beastPage.waitFor({ state: 'visible', timeout: 10000 });
    }
  }

  await page.waitForTimeout(500);
}

// Check if battle ended
async function isBattleEnded(page: Page): Promise<boolean> {
  const victoryEffect = page.locator('.victory-effect');
  const modalOverlay = page.locator('.modal-overlay');
  return await victoryEffect.isVisible() || await modalOverlay.isVisible();
}

test.describe('Duel Flow', () => {
  let challengerPage: Page;
  let defenderPage: Page;
  let challengerContext: BrowserContext;
  let defenderContext: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    challengerContext = await browser.newContext();
    defenderContext = await browser.newContext();

    challengerPage = await challengerContext.newPage();
    defenderPage = await defenderContext.newPage();

    await challengerPage.goto('http://localhost:5176');
    await defenderPage.goto('http://localhost:5176');
    await challengerPage.evaluate(() => localStorage.clear());
    await defenderPage.evaluate(() => localStorage.clear());
    await challengerPage.waitForTimeout(500);
    await defenderPage.waitForTimeout(500);
  });

  test.afterEach(async () => {
    await challengerContext.close();
    await defenderContext.close();
  });

  test('complete duel flow - invite, accept, battle', async () => {
    test.setTimeout(120000);

    // Step 1: Challenger creates family
    const familyCode = await createFamilyMember(challengerPage, '挑战者');
    console.log('Family code:', familyCode);
    expect(familyCode.length).toBeGreaterThan(0);

    // Step 2: Defender joins same family
    await joinFamily(defenderPage, '防守者', familyCode);
    console.log('Defender joined family');

    // Wait for member sync
    await challengerPage.waitForTimeout(3000);
    await defenderPage.waitForTimeout(3000);

    // Step 3: Select beasts
    await selectBeast(challengerPage, 'dragon');
    console.log('Challenger selected dragon');

    await selectBeast(defenderPage, 'tiger');
    console.log('Defender selected tiger');

    // Wait for beast sync
    await challengerPage.waitForTimeout(2000);
    await defenderPage.waitForTimeout(2000);

    // Go to home to trigger sync
    await challengerPage.locator('.bottom-nav .nav-item:nth-child(1)').click();
    await defenderPage.locator('.bottom-nav .nav-item:nth-child(1)').click();
    await challengerPage.waitForTimeout(2000);
    await defenderPage.waitForTimeout(2000);

    // Step 4: Navigate to duel page (index 4: 决斗)
    await challengerPage.locator('.bottom-nav .nav-item:nth-child(4)').click();
    await challengerPage.waitForTimeout(500);

    await defenderPage.locator('.bottom-nav .nav-item:nth-child(4)').click();
    await defenderPage.waitForTimeout(500);

    // Step 5: Challenger sends duel invite
    const defenderCard = challengerPage.locator('.opponent-card').filter({ hasText: '防守者' });
    await defenderCard.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Opponent card visible');

    const duelBtn = defenderCard.locator('button:has-text("发起决斗")');
    await duelBtn.click();
    console.log('Duel invite sent');

    await challengerPage.waitForTimeout(1000);

    // Step 6: Wait for battle redirect
    const challengerBattlePage = challengerPage.locator('.battle-page');
    await challengerBattlePage.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Challenger in battle page');

    const defenderBattlePage = defenderPage.locator('.battle-page');
    await defenderBattlePage.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Defender in battle page');

    // Step 7: Battle until end
    for (let round = 0; round < 30; round++) {
      // Check battle ended BEFORE each action
      if (await isBattleEnded(challengerPage) || await isBattleEnded(defenderPage)) {
        console.log('Battle ended at round:', round);
        break;
      }

      // Get attack buttons
      const attackBtnChallenger = challengerPage.locator('.skill-buttons button:has-text("攻击")');
      const attackBtnDefender = defenderPage.locator('.skill-buttons button:has-text("攻击")');

      // Challenger attacks if button visible and enabled
      if (await attackBtnChallenger.isVisible()) {
        try {
          if (await attackBtnChallenger.isEnabled() && !await isBattleEnded(challengerPage)) {
            await attackBtnChallenger.click({ timeout: 3000 });
            await challengerPage.waitForTimeout(500);
          }
        } catch (e) {
          // Button may be blocked by victory overlay, battle ended
          console.log('Challenger attack blocked, battle likely ended');
          break;
        }
      }

      // Check again after challenger attack
      if (await isBattleEnded(challengerPage) || await isBattleEnded(defenderPage)) {
        console.log('Battle ended after challenger attack at round:', round);
        break;
      }

      // Defender attacks
      if (await attackBtnDefender.isVisible()) {
        try {
          if (await attackBtnDefender.isEnabled() && !await isBattleEnded(defenderPage)) {
            await attackBtnDefender.click({ timeout: 3000 });
            await defenderPage.waitForTimeout(500);
          }
        } catch (e) {
          console.log('Defender attack blocked, battle likely ended');
          break;
        }
      }
    }

    // Step 8: Verify battle ended with victory overlay
    await challengerPage.waitForTimeout(1000);
    const victoryVisible = await isBattleEnded(challengerPage) || await isBattleEnded(defenderPage);
    expect(victoryVisible).toBeTruthy();

    console.log('✅ Duel flow test completed successfully');
  });
});