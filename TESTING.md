# Verification record

## Mobile release update

Final release checks: mobile scenario passed (30.0 s); complete desktop narrative passed (44.7 s); laptop pause/retry scenario passed (19.2 s). These were run separately while diagnosing timing overhead. TypeScript check and npm audit both passed; audit reported zero vulnerabilities. Continuous trace screenshots are now disabled to avoid instrumenting the 190 ms parry window with expensive image capture.

Touch verification on 3 October 2026 passed in Chromium mobile emulation at **844 × 390** and **390 × 844**. The test used real browser touch events (including simultaneous pointers), with no keyboard shortcuts or health mutation. It covered new game, touch movement plus jump, release/cancel cleanup, portrait auto-pause, landscape recovery, canvas refitting after rotation, Meor dialogue, all six training lessons (combo, heavy, block, parry, dodge and finisher), travel to the jetty, attack input and return to menu. The supplied logo and social-preview image both returned HTTP 200 locally.

The rotation test caught and fixed a stale Phaser canvas size: a ResizeObserver now refreshes the canvas after its parent changes size. Mobile screenshots were inspected in `artifacts/mobile-menu.png`, `artifacts/mobile-portrait.png` and `artifacts/mobile-combat.png`.

This verifies mobile browser emulation, not a physical Android/iPhone device or Safari. The original desktop verification record below describes the first release; cloud release checks are recorded in RELEASE.md.

Verified on **3 October 2026**, Windows, Node **24.13.0**, Chromium through Playwright. Tests ran against this workspace, with actual browser keyboard and pointer events. The screenshots were opened and visually inspected.

| Check                                     | Result                                                |
| ----------------------------------------- | ----------------------------------------------------- |
| `npm install`                             | Passed; lockfile included                             |
| `npm run dev -- --port 5173 --strictPort` | Passed; development server serves playable game       |
| `npm test`                                | **7 / 7 passed**                                      |
| `npm run test:e2e`                        | **2 / 2 passed**, final run approximately 1.3 minutes |
| `npm run build`                           | Passed TypeScript checking and production bundling    |
| `npm audit`                               | **0 vulnerabilities**                                 |
| Production preview at port 4173           | Passed                                                |
| `node tests/production-smoke.mjs`         | Passed; no browser errors or failing asset responses  |
| Runtime external requests                 | **0** in production smoke test                        |
| Development debug API in production       | Absent                                                |

## Browser coverage

The full narrative test begins at the main menu, passes through the intro and disclaimer, and walks the real route. It does not use scene shortcuts, modify player health or force victory. It tests:

- Main menu, controls and project information.
- New game, movement, running and airborne jump position.
- Pause freezes the simulation clock; controls can open from pause and return.
- Meor dialogue and objective transition into training.
- A three-hit combo, heavy hit, held block, timed parry, timed dodge and finisher, all performed using actual keyboard inputs.
- Training completion, alarm dialogue and travel to the jetty.
- Three intruders and the final encounter, enemy damage and defeat.
- At most one enemy in ATTACK during sampled combat states.
- Closing dialogue, ending cinematic and return to the main menu.
- No JavaScript page errors throughout the playthrough.

The second browser test checks **1366 × 768** layout bounds, F1 diagnostics, development scene shortcuts, pause/restart, a real AI-caused player defeat, retry and restored health.

The production smoke test separately checks **1920 × 1080** and **1366 × 768**, local asset loading, absence of the development API, mute, intro, new game, pause, the reduced-motion setting, Escape from the controls overlay, movement input and return to menu.

## Combat unit cases

Reach and facing boundaries; jump-height misses; exact 190 ms parry cutoff; dodge priority; attacks from behind; heavy attack versus guard/parry; combo expiry and cycling; finisher health threshold; regular enemy damage budget.

## Fixes found through verification

- Replaced frame-sensitive `JustDown` polling with a keydown latch so short taps survive between frames.
- Corrected cinematic timer initialization to prevent scene age from skipping intro pages.
- Chose Canvas rendering and disabled smoothed delta to avoid software WebGL slowdown in the test browser.
- Constrained the training partner to the practice area and reduced practice knockback so repeated attempts cannot push it out of reach.
- Relaxed combo timing to permit short distance adjustments.
- Fixed pause-controls restoration and Escape from the controls overlay.
- Reset checkpoint attack recovery and scene timers during transitions/restarts.
- Moved enemy guard entry into its state machine so occasional blocking is reachable.

## Evidence

- `artifacts/menu-desktop.png`: production menu at 1920 × 1080.
- `artifacts/gameplay-laptop.png`: production gameplay at 1366 × 768.
- `test-results/training-desktop.png`: real tutorial state.
- `test-results/combat-desktop.png`: jetty encounter.
- `test-results/ending-desktop.png`: ending reached by completing the game.

## Limits of verification

- Chromium on this Windows machine was exercised; Safari, Firefox, real phones and gamepads were not tested.
- Audio initialization and mute controls were exercised, but no subjective speaker/headphone listening review is claimed.
- The automated route skips reading time. It is not evidence of a 5–10 minute human playthrough; pacing still needs testing with first-time players.
- Production output is ready for a static Vercel deployment; no cloud deployment was performed.
- Vite emits an expected warning for the bundled Phaser engine (about **1.21 MB raw / 332 KB gzip**). The separate game-code chunk is about **45 KB raw / 16 KB gzip**. Build exits successfully.
- Visual inspection found readable menus, a correctly fitted canvas and no blocking HUD/dialogue overflow in the tested viewports. Art and animation remain intentionally procedural and simple.
