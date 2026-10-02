import { test, expect, type Page } from '@playwright/test';
test.use({
  viewport: { width: 844, height: 390 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
  trace: 'off',
});
const snapshot = (p: Page) => p.evaluate(() => (window as any).__WARISAN__.snapshot());

test('mobile touch, multitouch, rotation, training mechanics and sharing assets', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const cdp = await context.newCDPSession(page);
  const touches = new Map<number, { x: number; y: number; id: number }>();
  const positions = new Map<string, { x: number; y: number }>();
  const down = async (label: string, id = 1) => {
    if (!positions.has(label)) {
      const box = await page.getByRole('button', { name: label, exact: true }).boundingBox();
      expect(box).not.toBeNull();
      positions.set(label, { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 });
    }
    touches.set(id, { id, ...positions.get(label)! });
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [...touches.values()],
    });
  };
  const up = async (id = 1) => {
    touches.delete(id);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [...touches.values()],
    });
  };
  const tap = async (label: string) => {
    await down(label);
    await page.waitForTimeout(50);
    await up();
  };
  const walkTo = async (x: number) => {
    const start = (await snapshot(page)).player.x,
      right = x > start;
    if (Math.abs(x - start) < 8) return;
    await down(right ? 'Lari kanan' : 'Lari kiri');
    await expect
      .poll(
        async () => {
          const s = await snapshot(page);
          return right ? s.player.x >= x : s.player.x <= x;
        },
        { intervals: [20], timeout: 12000 },
      )
      .toBe(true);
    await up();
  };
  const nearEnemy = async () => {
    const s = await snapshot(page);
    if (Math.abs(s.enemies[0].x - s.player.x) > 65) await walkTo(s.enemies[0].x - 60);
  };
  const nextDialog = async () => {
    for (let i = 0; i < 8 && (await snapshot(page)).talking; i++) {
      await page.getByRole('button', { name: /Sambung/ }).tap();
      await page.waitForTimeout(150);
    }
  };
  await page.goto('/');
  await expect(page.getByAltText('Logo PSSGM').first()).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'artifacts/mobile-menu.png' });
  await page.getByRole('button', { name: 'Mula permainan' }).tap();
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(450);
    await page.locator('#next').tap();
  }
  await expect(page.getByRole('button', { name: 'Lari kanan' })).toBeVisible();
  const initial = (await snapshot(page)).player.x;
  await down('Lari kanan', 1);
  await down('Lompat', 2);
  await page.waitForTimeout(190);
  let s = await snapshot(page);
  expect(s.player.x).toBeGreaterThan(initial + 30);
  expect(s.player.y).toBeLessThan(550);
  await up(2);
  await up(1);
  await page.waitForTimeout(650);
  const stopped = (await snapshot(page)).player.x;
  await page.waitForTimeout(200);
  expect((await snapshot(page)).player.x).toBeCloseTo(stopped, 0);
  await down('Lari kanan');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  touches.clear();
  await page.waitForTimeout(100);
  const canceled = (await snapshot(page)).player.x;
  await page.waitForTimeout(200);
  expect((await snapshot(page)).player.x).toBeCloseTo(canceled, 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#rotate-prompt')).toBeVisible();
  await page.screenshot({ path: 'artifacts/mobile-portrait.png' });
  expect((await snapshot(page)).paused).toBe(true);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect
    .poll(async () => {
      const canvas = await page.locator('canvas').boundingBox();
      const frame = await page.locator('#app').boundingBox();
      return Math.abs(canvas!.width - frame!.width);
    })
    .toBeLessThan(2);
  await page.getByRole('button', { name: 'Sambung', exact: true }).tap();
  await walkTo(1590);
  await tap('Interaksi');
  await expect.poll(async () => (await snapshot(page)).talking).toBe(true);
  await nextDialog();
  await expect.poll(async () => (await snapshot(page)).chapter).toBe('training');
  for (const label of [
    'Serangan ringan',
    'Serangan berat',
    'Blok atau tangkis',
    'Elak',
    'Jatuhan',
  ]) {
    const box = await page.getByRole('button', { name: label, exact: true }).boundingBox();
    positions.set(label, { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 });
  }
  await nearEnemy();
  for (let i = 0; i < 3; i++) {
    await tap('Serangan ringan');
    await page.waitForTimeout(370);
  }
  await expect.poll(async () => (await snapshot(page)).trainingStep).toBe(1);
  await nearEnemy();
  await tap('Serangan berat');
  await expect.poll(async () => (await snapshot(page)).trainingStep).toBe(2);
  await page.waitForTimeout(550);
  await down('Blok atau tangkis');
  await expect.poll(async () => (await snapshot(page)).trainingStep).toBe(3);
  await up();
  await expect
    .poll(
      async () => {
        const e = (await snapshot(page)).enemies[0];
        return e.state === 'ATTACK' && e.elapsed > e.windup - 155 && e.elapsed < e.windup - 50;
      },
      { intervals: [15] },
    )
    .toBe(true);
  await down('Blok atau tangkis');
  await expect.poll(async () => (await snapshot(page)).trainingStep).toBe(4);
  await up();
  await expect
    .poll(
      async () => {
        const e = (await snapshot(page)).enemies[0];
        return e.state === 'ATTACK' && e.elapsed > e.windup - 180 && e.elapsed < e.windup - 60;
      },
      { intervals: [15] },
    )
    .toBe(true);
  await tap('Elak');
  await expect.poll(async () => (await snapshot(page)).trainingStep).toBe(5);
  await page.waitForTimeout(400);
  await nearEnemy();
  await tap('Jatuhan');
  await expect.poll(async () => (await snapshot(page)).trainingStep).toBe(6);
  await page.waitForTimeout(850);
  await nextDialog();
  expect((await snapshot(page)).chapter).toBe('jetty');
  await walkTo(3320);
  await expect.poll(async () => (await snapshot(page)).chapter).toBe('combat');
  await page.screenshot({ path: 'artifacts/mobile-combat.png' });
  const count = (await snapshot(page)).player.counters.light;
  await tap('Serangan ringan');
  await expect
    .poll(async () => (await snapshot(page)).player.counters.light)
    .toBeGreaterThan(count);
  await page.getByRole('button', { name: 'Jeda permainan' }).tap();
  await page.getByRole('button', { name: 'Menu utama', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'Mula permainan' })).toBeVisible();
  expect((await page.request.get('/branding/logo.png')).status()).toBe(200);
  expect((await page.request.get('/branding/social-preview.png')).status()).toBe(200);
  expect(errors).toEqual([]);
});
