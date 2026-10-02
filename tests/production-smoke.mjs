import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

// Run after `npm run build` and `npm run preview -- --port 4173`.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
const externalRequests = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
});
page.on('request', (request) => {
  const url = new URL(request.url());
  if (url.protocol.startsWith('http') && url.hostname !== '127.0.0.1') {
    externalRequests.push(url.href);
  }
});
try {
  await mkdir('artifacts', { recursive: true });
  await page.goto('http://127.0.0.1:4173');
  await expect(page.getByRole('button', { name: 'Mula permainan' })).toBeVisible();
  expect(await page.evaluate(() => '__WARISAN__' in window)).toBe(false);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: 'artifacts/menu-desktop.png' });
  await page.getByRole('button', { name: 'Bunyi: hidup' }).click();
  await expect(page.getByRole('button', { name: 'Bunyi: tutup' })).toBeVisible();
  await page.getByRole('button', { name: 'Mula permainan' }).click();
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(600);
    await page.keyboard.press('Enter');
  }
  await expect(page.locator('#objective')).toHaveText('Temui Meor di hujung kampung →');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Tarik nafas.' })).toBeVisible();
  await page.getByRole('button', { name: 'Gerakan: penuh' }).click();
  await expect(page.getByRole('button', { name: 'Gerakan: dikurangkan' })).toBeVisible();
  await page.getByRole('button', { name: 'Kawalan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Kuasai langkah.' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Kuasai langkah.' })).toHaveCount(0);
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.keyboard.down('d');
  await page.waitForTimeout(1700);
  await page.keyboard.up('d');
  await page.screenshot({ path: 'artifacts/gameplay-laptop.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Menu utama', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mula permainan' })).toBeVisible();
  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
  console.log(
    JSON.stringify(
      {
        production: 'PASS',
        desktop: '1920x1080',
        laptop: '1366x768',
        errors,
        externalRequests,
        debugExposed: false,
        checked: [
          'menu',
          'mute',
          'intro',
          'new game',
          'pause',
          'reduced motion setting',
          'controls',
          'Escape from controls',
          'movement input',
          'return to menu',
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
