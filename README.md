<div align="center">
  <h1>GAYONGX: WARISAN</h1>
  <p><strong>A 2D Silat Action-Adventure Game Built with Phaser 3 & TypeScript</strong></p>
  <p>
    <a href="https://gamegayongx-warisan.syahmiaof.my"><img src="https://img.shields.io/badge/Play-Live%20Demo-101713?style=for-the-badge&logoColor=60E1B5&labelColor=101713" alt="Play Game" /></a>
    <a href="https://github.com/syahmiaof/gayongx-warisan"><img src="https://img.shields.io/badge/Source-GitHub-101713?style=for-the-badge&logo=github&logoColor=60E1B5&labelColor=101713" alt="GitHub" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-101713?style=for-the-badge&logoColor=60E1B5&labelColor=101713" alt="License" /></a>
    <a href="https://syahmiaof.my"><img src="https://img.shields.io/badge/Author-syahmiaof-101713?style=for-the-badge&logo=vercel&logoColor=60E1B5&labelColor=101713" alt="Author" /></a>
  </p>
</div>

![GAYONGX Warisan game](https://raw.githubusercontent.com/syahmiaof/syahmiaof/main/public/images/game-gayongx-warisan.png)

A self-contained Phaser 3, TypeScript, Vite and HTML5 Canvas demo. A fictional villager, Arif, explores a coastal kampung, trains with a dramatized portrayal of Meor Abdul Rahman and protects the jetty from unnamed intruders.

> Historical dramatization. Dialogue, characters and events are presented as interactive fiction rather than documentary evidence.

## Play

Desktop uses A/D, Shift, Space, J, K, L, Q, F, E, Enter and Escape. Mobile uses landscape touch controls. Sound begins after the first interaction. The pause menu includes sound and reduced-motion preferences.

## Chapter 1 Flow

1. 1942 opening and Pulau Sudong reveal.
2. Kampung exploration and optional villager conversations.
3. Six combat lessons covering combo, heavy attack, block, parry, dodge and takedown.
4. Jetty encounter with guarded enemies.
5. Closing mentor dialogue and chapter ending.

## Run

Use Node.js 22.12 or newer.

```bash
npm install
npm run dev
npm run build
npm run preview
```

No account, backend, database, API key or external runtime service is required.

## Architecture

- Phaser scenes manage boot, menu, story, gameplay and ending.
- Typed rules separate damage, guard, reach and combo logic.
- Combat uses windup, active and recovery phases with input buffering.
- Semantic DOM handles menus, HUD, dialogue and pause UI.
- Canvas rendering supports the generated 2D art without a WebGL dependency.
- Phaser FIT scaling preserves the 1280 × 720 game aspect ratio.

## Status

Chapter 1 proof of concept. The complete gameplay loop is functional; later chapters and wider GayongX integration remain future work.

## Verification and Release

The repository includes unit rules, browser playthroughs and release documentation. See `RELEASE.md` and `TESTING.md` for the deployment record and test procedures.

```bash
npm test          # Run Vitest test suite
npm run typecheck # Validate TypeScript types
npm run build     # Production Vite build
```

## Builder

[Muhammad Syahmi](https://syahmiaof.my)
