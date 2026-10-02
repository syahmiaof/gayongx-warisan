import { test, expect, type Page } from '@playwright/test';
type Snapshot = {
  scene?: string;
  chapter?: string;
  trainingStep: number;
  clock: number;
  paused: boolean;
  dead: boolean;
  talking: boolean;
  player: {
    x: number;
    y: number;
    health: number;
    combo: number;
    pose: string;
    counters: Record<string, number>;
  };
  enemies: { x: number; health: number; state: string; windup: number; elapsed: number }[];
  events: Record<string, number>;
};
const state = (p: Page) =>
  p.evaluate(() => (window as any).__WARISAN__.snapshot()) as Promise<Snapshot>;
async function hold(p: Page, key: string, ms: number) {
  await p.keyboard.down(key);
  await p.waitForTimeout(ms);
  await p.keyboard.up(key);
}
async function start(p: Page) {
  await p.goto('/');
  await p.getByRole('button', { name: 'Mula permainan' }).click();
  for (let i = 0; i < 3; i++) {
    await p.waitForTimeout(430);
    await p.keyboard.press('Enter');
  }
  await expect.poll(async () => (await state(p)).chapter).toBe('village');
}
async function dialogs(p: Page) {
  for (let i = 0; i < 8 && (await state(p)).talking; i++) {
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
  }
}
async function approach(p: Page, target: number) {
  let s = await state(p);
  const distance = target - s.player.x;
  if (Math.abs(distance) > 10)
    await hold(p, distance > 0 ? 'd' : 'a', (Math.abs(distance) / 175) * 1000);
  s = await state(p);
  const e = s.enemies.find((e) => e.health > 0);
  if (e) await hold(p, e.x > s.player.x ? 'd' : 'a', 40);
}
async function fight(p: Page, chapter: string) {
  for (let i = 0; i < 110; i++) {
    const s = await state(p);
    expect(s.enemies.filter((e) => e.state === 'ATTACK').length).toBeLessThanOrEqual(1);
    if (s.chapter !== chapter || s.talking) return;
    if (s.dead) throw new Error('Player defeated in combat smoke test');
    const e = s.enemies
      .filter((e) => e.health > 0)
      .sort((a, b) => Math.abs(a.x - s.player.x) - Math.abs(b.x - s.player.x))[0];
    if (!e) {
      await p.waitForTimeout(150);
      continue;
    }
    const gap = e.x - s.player.x;
    if (Math.abs(gap) > 78)
      await hold(p, gap > 0 ? 'd' : 'a', Math.min(260, ((Math.abs(gap) - 70) / 175) * 1000));
    else {
      await hold(p, gap > 0 ? 'd' : 'a', 20);
      await p.keyboard.press(e.health <= 21 ? 'f' : i % 4 === 0 ? 'k' : 'j');
      await p.waitForTimeout(i % 4 === 0 ? 720 : 380);
    }
  }
  throw new Error(`Combat did not finish: ${JSON.stringify(await state(p))}`);
}
test('menu, full narrative, every lesson, encounters, ending and return', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'GAYONGX WARISAN' })).toBeVisible();
  await page.screenshot({ path: 'test-results/menu-desktop.png' });
  await page.getByRole('button', { name: 'Kawalan' }).click();
  await expect(page.getByText('Serangan berat · pecah blok')).toBeVisible();
  await page.getByRole('button', { name: 'Kembali' }).click();
  await page.getByRole('button', { name: 'Tentang projek' }).click();
  await expect(page.getByText(/Arif, penceroboh/)).toBeVisible();
  await page.getByRole('button', { name: 'Kembali' }).click();
  await start(page);
  const x = (await state(page)).player.x;
  await hold(page, 'd', 550);
  expect((await state(page)).player.x).toBeGreaterThan(x + 65);
  await page.keyboard.down('Space');
  await page.waitForTimeout(180);
  expect((await state(page)).player.y).toBeLessThan(550);
  await page.keyboard.up('Space');
  await page.waitForTimeout(800);
  await page.keyboard.press('Escape');
  const clock = (await state(page)).clock;
  await page.waitForTimeout(400);
  expect((await state(page)).clock).toBe(clock);
  await page.getByRole('button', { name: 'Kawalan', exact: true }).click();
  await page.getByRole('button', { name: 'Kembali' }).click();
  await page.getByRole('button', { name: 'Sambung', exact: true }).click();
  expect((await state(page)).paused).toBe(false);
  await page.keyboard.down('Shift');
  await page.keyboard.down('d');
  await expect
    .poll(async () => (await state(page)).player.x, { intervals: [40] })
    .toBeGreaterThan(1590);
  await page.keyboard.up('d');
  await page.keyboard.up('Shift');
  await page.keyboard.press('e');
  await expect.poll(async () => (await state(page)).talking).toBe(true);
  await dialogs(page);
  await expect.poll(async () => (await state(page)).chapter).toBe('training');
  await page.screenshot({ path: 'test-results/training-desktop.png' });
  // Training uses actual keyboard inputs, including the telegraphed parry/dodge timing.
  await approach(page, (await state(page)).enemies[0].x - 45);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('j');
    await page.waitForTimeout(420);
  }
  await expect.poll(async () => (await state(page)).trainingStep).toBe(1);
  expect((await state(page)).trainingStep, JSON.stringify(await state(page))).toBe(1);
  await approach(page, (await state(page)).enemies[0].x - 55);
  await page.keyboard.press('k');
  await expect.poll(async () => (await state(page)).trainingStep).toBe(2);
  await page.waitForTimeout(550);
  await page.keyboard.down('l');
  await expect.poll(async () => (await state(page)).trainingStep, { timeout: 12000 }).toBe(3);
  await page.keyboard.up('l');
  await expect
    .poll(
      async () => {
        const e = (await state(page)).enemies[0];
        return e.state === 'ATTACK' && e.elapsed > e.windup - 145 && e.elapsed < e.windup - 35;
      },
      { intervals: [20], timeout: 15000 },
    )
    .toBe(true);
  await page.keyboard.down('l');
  await expect.poll(async () => (await state(page)).trainingStep).toBe(4);
  await page.keyboard.up('l');
  await expect
    .poll(
      async () => {
        const e = (await state(page)).enemies[0];
        return e.state === 'ATTACK' && e.elapsed > e.windup - 180 && e.elapsed < e.windup - 50;
      },
      { intervals: [20], timeout: 15000 },
    )
    .toBe(true);
  await page.keyboard.press('q');
  await expect.poll(async () => (await state(page)).trainingStep).toBe(5);
  await page.waitForTimeout(350);
  const s = await state(page),
    enemy = s.enemies[0];
  await approach(page, enemy.x + (s.player.x > enemy.x ? 55 : -55));
  await hold(page, (await state(page)).player.x > enemy.x ? 'a' : 'd', 20);
  await page.keyboard.press('f');
  await expect.poll(async () => (await state(page)).trainingStep).toBe(6);
  await page.waitForTimeout(850);
  await dialogs(page);
  expect((await state(page)).chapter).toBe('jetty');
  await page.keyboard.down('Shift');
  await page.keyboard.down('d');
  await expect
    .poll(async () => (await state(page)).chapter, { intervals: [100], timeout: 15000 })
    .toBe('combat');
  await page.keyboard.up('d');
  await page.keyboard.up('Shift');
  await page.screenshot({ path: 'test-results/combat-desktop.png' });
  await fight(page, 'combat');
  await dialogs(page);
  await expect.poll(async () => (await state(page)).chapter).toBe('final');
  await fight(page, 'final');
  await dialogs(page);
  await expect.poll(async () => (await state(page)).scene).toBe('Ending');
  await page.screenshot({ path: 'test-results/ending-desktop.png' });
  await page.waitForTimeout(550);
  await page.keyboard.press('Enter');
  await expect(page.getByText('BERSAMBUNG…', { exact: true })).toBeVisible();
  await page.waitForTimeout(550);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Mula permainan' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('laptop fit, pause restart, debug routes and defeat recovery', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await start(page);
  await page.keyboard.press('F1');
  await expect(page.locator('#debug')).toBeVisible();
  await page.keyboard.press('3');
  await expect.poll(async () => (await state(page)).chapter).toBe('combat');
  await page.screenshot({ path: 'test-results/combat-laptop.png' });
  const box = await page.locator('canvas').boundingBox();
  expect(box!.width).toBeLessThanOrEqual(1366);
  expect(box!.height).toBeLessThanOrEqual(768);
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  await hold(page, 'd', 250);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Mula semula bab' }).click();
  await expect.poll(async () => (await state(page)).player.health).toBe(100);
  expect((await state(page)).chapter).toBe('combat');
  // Let real AI defeat the player; no health mutation or forced defeat.
  await expect.poll(async () => (await state(page)).dead, { timeout: 50000 }).toBe(true);
  await page.getByRole('button', { name: 'Cuba semula bab' }).click();
  await expect.poll(async () => (await state(page)).player.health).toBe(100);
  expect((await state(page)).dead).toBe(false);
  await page.keyboard.press('4');
  await expect.poll(async () => (await state(page)).scene).toBe('Ending');
});
