import { chromium } from 'playwright';
import { setTimeout } from 'timers/promises';

const SCREENSHOT_DIR = 'C:/Users/rodge/projects/firmware-foundation-studios/apps/gosple/screenshots';
const URL = 'http://localhost:8099';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });

  // Collect console messages
  const consoleMsgs = [];
  const page = await context.newPage();
  page.on('console', msg => {
    consoleMsgs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    consoleMsgs.push({ type: 'pageerror', text: err.message });
  });

  // Collect network errors
  const networkErrors = [];
  page.on('requestfailed', req => {
    networkErrors.push({ url: req.url(), failure: req.failure()?.errorText });
  });

  const screenshotOpts = { timeout: 10000 };

  async function safeScreenshot(path, fullPage = false) {
    try {
      await page.screenshot({ path, fullPage, timeout: 10000 });
      console.log(`Captured: ${path.split('/').pop()}`);
    } catch (e) {
      // Try without waiting for fonts
      try {
        await page.screenshot({ path, fullPage, animations: 'disabled', timeout: 5000 });
        console.log(`Captured (no font wait): ${path.split('/').pop()}`);
      } catch (e2) {
        console.log(`FAILED to capture ${path.split('/').pop()}: ${e2.message}`);
      }
    }
  }

  console.log('--- Step 1: Navigate and capture splash screen ---');
  await page.goto(URL, { waitUntil: 'commit', timeout: 15000 });
  await setTimeout(300);
  await safeScreenshot(`${SCREENSHOT_DIR}/01-splash-screen.png`);

  // Wait for app to fully load
  console.log('--- Step 2: Wait for full load ---');
  await setTimeout(5000);
  await safeScreenshot(`${SCREENSHOT_DIR}/02-app-loaded.png`);
  await safeScreenshot(`${SCREENSHOT_DIR}/02b-app-loaded-fullpage.png`, true);

  // Check for "How to Play" modal
  console.log('--- Step 3: Check for How to Play modal ---');
  const pageContent = await page.content();
  const hasHowToPlay = pageContent.toLowerCase().includes('how to play');
  console.log(`How to Play text found in DOM: ${hasHowToPlay}`);

  if (hasHowToPlay) {
    await safeScreenshot(`${SCREENSHOT_DIR}/03-how-to-play-modal.png`);

    // Try to dismiss the modal - try various approaches
    const dismissSelectors = [
      'text="Got it"', 'text="GOT IT"', 'text="Close"', 'text="CLOSE"',
      'text="OK"', 'text="ok"', 'text="Dismiss"', 'text="DISMISS"',
      'text="X"', 'text="x"', 'text="✕"', 'text="×"',
      '[aria-label="Close"]', '[aria-label="close"]',
      '[aria-label="Dismiss"]',
    ];
    let dismissed = false;
    for (const sel of dismissSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          const visible = await el.isVisible();
          if (visible) {
            await el.click();
            console.log(`Dismissed modal with selector: ${sel}`);
            dismissed = true;
            await setTimeout(500);
            break;
          }
        }
      } catch (e) {
        // continue
      }
    }
    if (!dismissed) {
      await page.keyboard.press('Escape');
      console.log('Pressed Escape to dismiss modal');
      await setTimeout(500);
    }
    await safeScreenshot(`${SCREENSHOT_DIR}/03b-after-modal-dismiss.png`);
  }

  // Step 4: Try typing letters
  console.log('--- Step 4: Try typing letters on keyboard ---');
  const lettersToType = ['G', 'R', 'A', 'C', 'E'];

  for (const letter of lettersToType) {
    // Try on-screen keyboard first
    let clicked = false;
    try {
      // Look for exact single-letter buttons
      const buttons = await page.$$('div[role="button"], button');
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text && text.trim() === letter) {
          const visible = await btn.isVisible();
          if (visible) {
            await btn.click();
            clicked = true;
            console.log(`Clicked on-screen key: ${letter}`);
            break;
          }
        }
      }
    } catch (e) {}

    if (!clicked) {
      await page.keyboard.press(letter);
      console.log(`Pressed physical key: ${letter}`);
    }
    await setTimeout(150);
  }

  await safeScreenshot(`${SCREENSHOT_DIR}/04-typed-grace.png`);

  // Press ENTER to submit
  console.log('--- Step 4b: Press ENTER to submit guess ---');
  let enteredViaButton = false;
  try {
    const buttons = await page.$$('div[role="button"], button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.trim().toUpperCase() === 'ENTER') {
        const visible = await btn.isVisible();
        if (visible) {
          await btn.click();
          enteredViaButton = true;
          console.log('Clicked ENTER button');
          break;
        }
      }
    }
  } catch (e) {}

  if (!enteredViaButton) {
    await page.keyboard.press('Enter');
    console.log('Pressed physical Enter key');
  }

  await setTimeout(2500);
  await safeScreenshot(`${SCREENSHOT_DIR}/04b-after-enter.png`);

  // Step 5: Navigate to Stats tab
  console.log('--- Step 5: Navigate to Stats tab ---');
  let statsFound = false;
  try {
    const allElements = await page.$$('div[role="button"], button, a, [role="tab"]');
    for (const el of allElements) {
      const text = await el.textContent();
      if (text && text.trim().toLowerCase().includes('stat')) {
        const visible = await el.isVisible();
        if (visible) {
          await el.click();
          statsFound = true;
          console.log(`Clicked Stats element with text: "${text.trim()}"`);
          break;
        }
      }
    }
  } catch (e) {}

  if (!statsFound) {
    console.log('Stats tab not found via text, trying aria labels...');
    try {
      const el = await page.$('[aria-label*="Stats"], [aria-label*="stats"]');
      if (el) { await el.click(); statsFound = true; }
    } catch (e) {}
  }

  await setTimeout(1000);
  await safeScreenshot(`${SCREENSHOT_DIR}/05-stats-tab.png`);

  // Step 6: Navigate to More tab
  console.log('--- Step 6: Navigate to More tab ---');
  let moreFound = false;
  try {
    const allElements = await page.$$('div[role="button"], button, a, [role="tab"]');
    for (const el of allElements) {
      const text = await el.textContent();
      if (text && text.trim().toLowerCase() === 'more') {
        const visible = await el.isVisible();
        if (visible) {
          await el.click();
          moreFound = true;
          console.log('Clicked More tab');
          break;
        }
      }
    }
  } catch (e) {}

  if (!moreFound) {
    console.log('More tab not found via exact text, trying partial...');
    try {
      const allElements = await page.$$('div[role="button"], button, a, [role="tab"]');
      for (const el of allElements) {
        const text = await el.textContent();
        if (text && text.trim().toLowerCase().includes('more')) {
          const visible = await el.isVisible();
          if (visible) {
            await el.click();
            moreFound = true;
            console.log(`Clicked element with text: "${text.trim()}"`);
            break;
          }
        }
      }
    } catch (e) {}
  }

  await setTimeout(1000);
  await safeScreenshot(`${SCREENSHOT_DIR}/06-more-tab.png`);

  // Go back to Play tab for final check
  console.log('--- Step 7: Back to Play tab ---');
  try {
    const allElements = await page.$$('div[role="button"], button, a, [role="tab"]');
    for (const el of allElements) {
      const text = await el.textContent();
      if (text && text.trim().toLowerCase() === 'play') {
        const visible = await el.isVisible();
        if (visible) {
          await el.click();
          console.log('Clicked Play tab');
          break;
        }
      }
    }
  } catch (e) {}
  await setTimeout(500);
  await safeScreenshot(`${SCREENSHOT_DIR}/07-play-tab-final.png`);
  await safeScreenshot(`${SCREENSHOT_DIR}/07b-play-tab-final-fullpage.png`, true);

  // Step 8: Element visibility analysis
  console.log('\n--- Step 8: Element visibility analysis ---');

  const analysis = await page.evaluate(() => {
    const results = {};

    // Viewport info
    results.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      isScrollable: document.documentElement.scrollHeight > window.innerHeight,
    };

    // Find bottom-most visible elements
    const allElements = document.querySelectorAll('*');
    let bottomElements = [];
    for (const el of allElements) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 100 && rect.width > 50) {
        bottomElements.push({
          tag: el.tagName,
          text: (el.textContent || '').slice(0, 40).trim(),
          bottom: Math.round(rect.bottom),
          top: Math.round(rect.top),
          isBelowViewport: rect.bottom > window.innerHeight,
        });
      }
    }
    // Deduplicate and sort
    bottomElements.sort((a, b) => b.bottom - a.bottom);
    results.bottomElements = bottomElements.slice(0, 10);

    // Look for keyboard keys
    const buttons = document.querySelectorAll('[role="button"], button');
    const keyInfo = [];
    for (const btn of buttons) {
      const text = (btn.textContent || '').trim();
      if (text.length === 1 && /^[A-Z]$/i.test(text)) {
        const styles = window.getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        keyInfo.push({
          letter: text,
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          visible: rect.bottom <= window.innerHeight,
          bottom: Math.round(rect.bottom),
        });
      }
    }
    results.keyboardKeys = {
      total: keyInfo.length,
      sample: keyInfo.slice(0, 5),
      lastRow: keyInfo.slice(-7),
    };

    // Check for tab bar
    const navElements = document.querySelectorAll('nav, [role="tabbar"], [role="navigation"], [role="tablist"]');
    results.tabBar = {
      navElementCount: navElements.length,
    };

    // Look for tab text
    const tabTexts = [];
    for (const el of allElements) {
      const text = (el.textContent || '').trim().toLowerCase();
      if ((text === 'play' || text === 'stats' || text === 'more') && el.children.length === 0) {
        const rect = el.getBoundingClientRect();
        tabTexts.push({
          text: text,
          bottom: Math.round(rect.bottom),
          top: Math.round(rect.top),
          visible: rect.bottom <= window.innerHeight && rect.top >= 0,
        });
      }
    }
    results.tabTexts = tabTexts;

    // Game board tiles
    const tileElements = [];
    for (const el of allElements) {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      // Look for square-ish elements that could be tiles
      const w = rect.width;
      const h = rect.height;
      if (w > 30 && w < 80 && Math.abs(w - h) < 10 && styles.borderWidth && styles.borderWidth !== '0px') {
        tileElements.push({
          size: `${Math.round(w)}x${Math.round(h)}`,
          borderColor: styles.borderColor,
          backgroundColor: styles.backgroundColor,
        });
      }
    }
    results.gameTiles = {
      count: tileElements.length,
      sample: tileElements.slice(0, 5),
    };

    return results;
  });

  console.log('Analysis:', JSON.stringify(analysis, null, 2));

  // Print console messages
  console.log('\n--- Console Messages (first 30) ---');
  for (const msg of consoleMsgs.slice(0, 30)) {
    console.log(`  [${msg.type}] ${msg.text.slice(0, 200)}`);
  }
  if (consoleMsgs.length > 30) {
    console.log(`  ... and ${consoleMsgs.length - 30} more`);
  }

  // Print network errors
  console.log('\n--- Network Errors ---');
  if (networkErrors.length === 0) {
    console.log('  None');
  } else {
    for (const err of networkErrors) {
      console.log(`  ${err.url} -> ${err.failure}`);
    }
  }

  await browser.close();
  console.log('\n--- Test Complete ---');
})();
