# GAYONGX: WARISAN

A complete, self-contained 2D silat action-adventure demo built with **Phaser 3, TypeScript, Vite and HTML5 Canvas**. A fictional villager, Arif, explores a coastal kampung, trains with a dramatized portrayal of Meor Abdul Rahman, and protects the jetty from unnamed intruders.

## Run locally

Use Node.js **22.12 or newer** and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173). Play with a desktop/laptop keyboard or mobile touch controls in landscape. Sound starts after the first click. No account, backend, database, runtime CDN, API key or external service is needed.

```bash
npm run build
npm run preview
```

Production output is `dist/`. Deploy the folder to any static host. For Vercel, import this directory, choose Vite, use `npm run build` and output directory `dist`; `vercel.json` supplies these settings. The repository is connected to Vercel for deployment. See RELEASE.md for verified URLs and release details.

## Controls

| Key                      | Action                                                 |
| ------------------------ | ------------------------------------------------------ |
| A / D                    | Move left / right                                      |
| Shift                    | Run                                                    |
| Space                    | Jump, including during combat                          |
| J                        | Light attack; chain three hits                         |
| K                        | Heavy attack; breaks enemy guard                       |
| Hold L                   | Block attacks from the direction you face              |
| Tap L just before impact | Parry; 190 ms window                                   |
| Q                        | Dodge in the facing direction; 310 ms invulnerability  |
| F                        | Takedown when a nearby enemy is at or below 30% health |
| E                        | Talk / continue dialogue                               |
| Enter                    | Continue dialogue or cinematic                         |
| Escape                   | Pause / resume                                         |

Read the **SERANGAN** telegraph. It changes to **TANGKIS!** in the final parry window. Training does not take away health. The pause menu includes sound and reduced-motion settings. Changing tabs automatically pauses gameplay.

## Complete gameplay flow

1. Main menu → 1942 opening → Pulau Sudong reveal → historical-fiction disclaimer.
2. Walk or run through the kampung. Talk to villagers with E. Find Meor at the eastern end.
3. Six guided lessons: three-hit light combo, heavy attack, held block, timed parry, timed dodge, controlled takedown.
4. A fisherman raises the alarm. Travel east to the jetty.
5. Defeat three intruders. A single attack token prevents synchronized enemy attacks.
6. Defeat the stronger final intruder. Health is restored at each combat checkpoint.
7. Closing mentor dialogue → sea pan → 17 February 1942 narrative date → GAYONGX: WARISAN → BERSAMBUNG → main menu.

The design targets a **5–10 minute first visit**, including reading and learning. Experienced players and automated runs are much faster; this is not a measured playtime guarantee.

## Systems and architecture

```text
src/
  main.ts                    application and recoverable startup errors
  game/Game.ts               Phaser configuration; Canvas renderer
  scenes/                    boot, menu, intro, gameplay, ending
  entities/                  articulated player, enemies, NPCs
  systems/rules.ts           pure damage / guard / reach / combo rules
  systems/CombatSystem.ts    hit resolution, particles, shake, hit stop
  systems/Input.ts           frame-independent tap latch and held keys
  systems/AudioSystem.ts     ocean noise and procedural sound cues
  data/story.ts              Malay dialogue, disclaimer, tutorial content
  world/Art.ts               original generated canvas textures
  world/World.ts             parallax scenery and atmospheric animation
  ui/Interface.ts            semantic DOM menu, HUD, dialogue and pause UI
  style.css                  fitted interface and local font styling
tests/
  unit/                      combat boundary cases
  e2e/                       real browser keyboard-driven playthroughs
```

Village, training and encounters share one continuous gameplay scene with typed chapter states. This preserves the world and camera between chapters and avoids duplicating the combat loop. Player attacks are separate windup/active/recovery phases with input buffering; enemy states are IDLE, PATROL, CHASE, ATTACK, BLOCK, HIT and DEFEATED.

The default Canvas renderer is intentional: the art uses no shaders, and Canvas performs better in software-rendered browsers than a WebGL fallback. The game draws at 1280 × 720 and uses Phaser FIT scaling with aspect ratio preserved. Small simulation steps are capped to avoid huge jumps after a stalled frame; auto-pause handles lost window focus.

## Development tools

Only in `npm run dev`, F1 toggles diagnostics. Keys 1 / 2 / 3 / 4 open village / training / combat / ending. A development-only `window.__WARISAN__` provides the Phaser instance and a read-only snapshot function for tests. These hooks and shortcuts are removed by the production build.

```bash
npm test
npx playwright install chromium
npm run test:e2e
```

The browser suite drives actual keys through intro, movement, jump, dialogue, all six training lessons, both encounters and ending; it also covers laptop fitting, pause, checkpoint restart, defeat and recovery. Failure screenshots are written to `test-results/`. Continuous trace screenshots are disabled because they distort timing-sensitive parry tests. See `TESTING.md` for the recorded verification and limits.

## Art, audio and historical framing

All scenery and characters are original procedural drawings. No downloaded character sprites or copyrighted soundtrack are used. Cormorant Garamond and Manrope are bundled from Fontsource under the SIL Open Font License; copies of the font licenses are in `LICENSES/`. Phaser is MIT licensed; its license is included there too. Synthesized cues support ocean/wind ambience, footsteps, impacts, block, parry, UI and gong-style transitions. There is no spoken dialogue or recorded music.

> Permainan ini ialah demonstrasi fiksyen yang diinspirasikan oleh sejarah dan warisan Silat Seni Gayong. Beberapa watak, dialog dan peristiwa telah didramatisasikan untuk tujuan permainan.

Arif, the encounters, the mentor dialogue and the exact scenario are fictional. The date shown in the ending is a narrative frame, not a verified account of these events. The supplied `logo pssgm.png` is used unchanged in the menu, favicon and social preview at the project owner’s request. Its inclusion does not claim official endorsement.

## Known scope limits

- One short, linear chapter; no save persistence, branching narrative or multiplayer.
- Keyboard and mobile landscape touch controls are supported. Gamepad mapping is not implemented.
- Stylized procedural characters and simple locomotion, not motion-captured silat instruction.
- Menus use semantic buttons and visible focus; the action canvas is not fully playable with a screen reader.
- Font and engine files are local. First installation requires npm access; gameplay does not.
- The Phaser engine is the main download cost; production compression is approximately 350 KB for JavaScript. No CDN is required.

Reference used for scene/scaling setup: [official Phaser scenes](https://docs.phaser.io/phaser/concepts/scenes) and [Scale Manager](https://docs.phaser.io/phaser/concepts/scale-manager).

## Mobile and link previews

Rotate a phone to landscape. Left/right touch buttons run automatically. All combat actions, jump and interaction have touch buttons; movement and jump can be held simultaneously. Tangkis supports holding to block and tapping just before impact to parry. When touch movement stops, the player automatically faces a nearby opponent. Portrait rotation pauses gameplay and shows a rotate prompt. Resume from the pause menu after rotating back.

The share card is `public/branding/social-preview.png` (1200 × 630). Regenerate with `node scripts/social-preview.mjs`. Open Graph and Twitter metadata are present in the HTML before JavaScript runs. Vercel’s production-domain environment variable supplies absolute image/canonical URLs; `SITE_URL` can override that for another static host. Messaging apps may cache a previously fetched preview.
