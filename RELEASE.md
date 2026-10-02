# GAYONGX: WARISAN release

- GitHub: https://github.com/syahmiaof/gayongx-warisan (private).
- Vercel project: `gayongx-warisan`, team `syahmiaofs-projects`.
- Assigned production domain: https://gayongx-warisan.vercel.app.
- Framework: Vite, Phaser 3, TypeScript, static HTML5 Canvas.
- Mobile: landscape touch controls, simultaneous movement/jump, timed block/parry, dodge, finisher and NPC interaction. Portrait rotation pauses gameplay. Nearby opponents are automatically faced when touch movement stops.
- Branding: supplied logo is used in the menu, favicon and original 1200 × 630 social preview composition. Open Graph/Twitter metadata is emitted in static HTML with absolute URLs.
- Privacy: repository source is private. The deployed game is public; no credentials, backend or user data collection are required.

## Verification scope

Unit combat rules and desktop narrative tests live under `tests/`. Mobile emulation exercises the actual touch UI through all training mechanics and the jetty transition. Real-device Safari and Android hardware performance are not yet measured. Share metadata can be checked in page source; individual messaging clients may cache previews.

The Vercel build emits a large-engine-chunk advisory for Phaser; it does not fail the build. The game and asset files are served locally by the deployment, with no paid services.
