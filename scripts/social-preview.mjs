import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const logo = (await readFile('public/branding/logo.png')).toString('base64');
  const background = (await readFile('artifacts/menu-desktop.png')).toString('base64');
  const font = (
    await readFile(
      'node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2',
    )
  ).toString('base64');
  await page.setContent(
    `<style>@font-face{font-family:Title;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}body{margin:0;background:#101b1b;color:#f5ead4;font-family:Arial,sans-serif}.bg{position:absolute;inset:0;background:url(data:image/png;base64,${background}) right center/cover;opacity:.22}.shade{position:absolute;inset:0;background:linear-gradient(90deg,#101b1b 0%,#101b1bdc 45%,transparent)}main{position:absolute;inset:54px 64px;display:flex;align-items:center;gap:65px}.logo{width:220px;height:290px;object-fit:contain;background:#f5ead4;padding:14px;border-radius:5px}h1{font-family:Title,serif;font-size:98px;font-weight:500;line-height:.9;margin:0}h2{font-size:24px;letter-spacing:15px;font-weight:400;color:#d8b579;margin:20px 0 38px}p{font-family:Title,serif;font-size:31px;margin:0 0 26px}.meta{font-size:15px;letter-spacing:1.5px;color:#d8c9aa}.line{width:120px;height:1px;background:#d8b579;margin:28px 0}.foot{position:absolute;left:64px;bottom:30px;font-size:12px;letter-spacing:1.7px;color:#bdb39d}</style><div class="bg"></div><div class="shade"></div><main><img class="logo" src="data:image/png;base64,${logo}"/><div><h1>GAYONGX</h1><h2>WARISAN</h2><p>Ilmu datang bersama amanah.</p><div class="line"></div><div class="meta">MAIN DI DESKTOP & MOBILE LANDSCAPE</div></div></main><div class="foot">PENGEMBARAAN SILAT · DEMONSTRASI FIKSYEN SEJARAH</div>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'public/branding/social-preview.png' });
} finally {
  await browser.close();
}
