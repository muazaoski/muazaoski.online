# Unfrog café next patch

## Objective

Make cooking, customer service and storage reliable before expanding the café economy.
Preserve café ownership, furniture IDs, existing saves, XP, recipe prices and batch sizes.

## Custom beige tooltips (5 October 2026)

- [x] Replace existing browser-native title tooltips with one delegated bubble:
  beige `#f2e7cc`, dark green `#17382e`, rounded border, subtle shadow and arrow.
  Existing tooltip copy/actions retained. Shared art/note tooltip uses the same style.
- [x] Hover delay, immediate keyboard-focus descriptions, viewport edge clamping,
  dynamic recipe/build/dev titles, reduced-motion support and safe text-only content.
  Preserve existing aria-describedby IDs and icon-only accessible names.
- [x] Hide on tap, Escape/other typing, scrolling, window blur/resize or owner removal.
  Tooltip listeners never consume gameplay/button events and run before popup back
  capture; pointer-events none. Touch taps keep their original button action.
- [x] Tooltip regression suite, all 39 café suites, controls/tongue/map, popup and
  exact 80-value shader-preset tests pass. Local WebGPU focus bubble visually checked.
  Build passes with pre-existing WebGLRenderer/chunk warnings unchanged.
- [x] Scoped client deploy: tested source/bundle hashes match VPS, homepage/bundle
  HTTP 200; production café/privacy and unauthenticated placement checks pass.
  No shader defaults, server/data/Caddy/dependencies/gameplay changes. No Git push.
- [x] Live disposable guest confirmed bubble background RGB 242/231/204 and text
  RGB 23/56/46, keyboard-focus display and tooltip + Dev Config Escape cleanup.
  No runtime errors; no account/café purchases or claims used for testing.

Files: `src/Tooltips.js`, `src/main.js`, `src/Drawing.js`, `tooltip-tests.mjs`.
Local preview fixture excluded from deployment. Jev scope review narrowed to
tooltip presentation, then cleared; deployment review resolved against explicit
live-game UI request, verified baseline and retained reversible rollback.
Live bundle: `index-BzAcWZS7.js`.
Live image: `d656a018f1ba516c062a6c809c6a47d666c45218bf8c8b0d0ee8fbecc8a80c26`.
Rollback: `/opt/apps/froggame-tooltip-backup-20261005/client.tgz` and
image tag `froggame:pre-tooltip-20261005`.
Proof: [custom tooltip live](assets/unfrog-ui/cozy-v1/custom-tooltip-live.png).

## Approved shader preset and popup back behavior (5 October 2026)

- [x] Apply all 80 values from the user's shader JSON as shipped defaults, including
  exposure .73, gamma .91, bloom .16/.62/.81, sun 4.8 and the full water tuning.
  Disabled effects keep their supplied parameter values; previous black stroke
  3.15/.33/.0087/3.34/1 is unchanged. Shader Reset uses this new preset.
- [x] Shared capture-phase back handler uses the highest visible popup z-index;
  Escape closes one layer, including when a text input is focused. Held Escape
  cannot dismiss multiple layers. Outside left-click/tap closes and consumes the
  complete pointer/mouse/touch gesture so it cannot trigger gameplay behind it.
- [x] Cover recipes/storage/sign/room-style/claim café dialogs, settings, profile,
  profile editor, friends, DMs, emotes, drawing, placement confirmation, both note
  dialogs, controls and Dev Config. Existing close methods retain preview/drawing
  cleanup. Chat back retains the draft and never sends it.
- [x] Build inventory is intentionally not outside-dismissed: tapping the floor
  places/moves furniture. Its existing Escape cancels selection then exits build.
  Mandatory login, disconnect/death/orientation screens are not bypassed.
- [x] 39 café suites plus controls/tongue/map, new 80-value preset and popup tests
  pass; build passes with existing WebGLRenderer/chunk-size warnings unchanged.
  Local browser recipe/controls Escape and outside-click checks pass, no errors.
  Found and fixed synchronous close-button callbacks swallowed by outside gesture;
  regression test and browser retest cover it.
- [x] Scoped live client deployment; tested source/bundle hashes match VPS.
  Homepage and new bundle return HTTP 200; production café/privacy/placement
  read-only checks pass. Server/data/Caddy/dependencies unchanged; no Git push.
- [x] Disposable live guest checked new grading/bloom values and retained stroke;
  Dev Config Escape, drawing textbox Escape, settings outside and Controls outside
  work. Controls outside does not also open Settings underneath. No runtime errors.
  Existing 300ms fades retained. Chat draft cancellation tested by invoking actual
  Input method; browser automation could not focus the game surface for Enter,
  so chat is not claimed as live-browser verified. No purchases/claims/account edits.
- [x] Jev requested stronger completion evidence. Added integration regression
  executing the actual main.js registry and testing all 14 close callbacks, plus
  real Input.cancelChat draft/blur/sync behavior. All pass; final Jev review accepted.

Live bundle: `index-DIhySSyN.js`.
Live image: `dcf5362b385a4b64acd182895197b354726f8d22443b07363a7aa4bddc8ecc0b`.
Rollback: `/opt/apps/froggame-shader-preset-popup-backup-20261005/client.tgz`
and image tag `froggame:pre-shader-preset-popup-20261005`.
Full original archive also retained. Backup/extraction needed existing VPS sudo
permissions; failed attempts did not restart the running service.
Client files: `src/Config.js`, `src/main.js`, `src/Input.js`, new `src/PopupDismiss.js`.
Tests: `shader-preset-tests.mjs`, `popup-dismiss-tests.mjs`; two old expected visual
default assertions updated. Local QA fixture excluded from deployment.
Jev chose the scoped route; deployment review resolved against explicit live
implementation scope, verified baseline and retained rollback.
Proof: [live preset](assets/unfrog-ui/cozy-v1/shader-preset-live.png).

## Approved stroke, world-anchored rain and shader controls (5 October 2026)

- [x] Keep the user's exact stroke preset as shipped defaults: enabled, black,
  width **3.15 CSS px**, opacity **1**, depth gap **.33**, distance scale **.0087**,
  softness **3.34**, slope rejection **1**. Stroke Reset now returns this preset.
  Existing explicit browser-local stroke overrides remain supported.
- [x] Rain no longer translates all drops with the frog. Deterministic world-space
  positions recycle only at the 36-unit field boundary; keep 160 instances,
  timing/weather, roof masking and underwater hiding unchanged.
- [x] Replace only shader/rendering GUI blocks with **Shaders / Rendering** near
  the top of Dev Config. 80 controls in 13 collapsed groups, explanatory tooltips,
  double-click label reset, reset per group, shader-only reset and Copy shader JSON.
  Gameplay, movement, physics, camera, poser and economy settings remain untouched.
  Shader adjustments are live session tuning, not automatically persisted.
- [x] Fix dead chromatic aberration, film-grain and sepia settings by wiring their
  actual TSL effects. Gamma and split-tone strength now work; DOF parameters bind
  Config as well as live uniforms; bloom threshold supports HDR values above 1.
  Bloom spread, AO radius/thickness/samples/mix, RGB/dot angles and existing FX
  controls update actual pass/uniform nodes. Numeric initialization preserves 0.
- [x] Day/night-safe base light controls/colors, sky tint and fog ranges are read
  by the cycle rather than overwritten. Fog cannot invert. Per-map shadow bias,
  normal offset and coverage survive transitions. Remove the misleading shadow
  Blur Radius control: the current PCFSoft filter does not use shadow.radius.
- [x] Expand existing water tuning with real roughness/metalness nodes, wave-normal
  strength and grazing sky sheen. No geometry/swimming changes or reflection pass.
  Other effective visual defaults retained; bloomRadius now starts at the formerly
  effective 0 spread. Optional color/noise/blur effects remain off by default.
- [x] All 39 café suites plus controls/tongue/map and Vite build passed. New suite
  accounts for every rendering control using the real TSL graph/pass nodes and
  tests lighting/fog updates, shadow transitions, water, zero values, reset/export.
- [x] Local WebGPU browser visually checked grain, chromatic, sepia, exposure/gamma
  and reset with no errors. A real physics walk moved the frog ~2.34 units: **147
  of 160 drops remained fixed**, remaining 13 recycled by 36 units at boundaries
  (float32 tolerance). Roof/underwater behavior also covered by regression tests.
- [x] Scoped deployment: all source and exact bundle hashes match tested local
  output; homepage and bundle HTTP 200. Production café/privacy and unauthenticated
  placement checks passed. Server/data/dependencies/Caddy/portfolio unchanged.
- [x] Fresh disposable production guest confirmed exact stroke values, Alt+V,
  the new detailed grading panel, live exposure/gamma and group reset. Teleported
  to Frogstead to compile the café graph; no shader/runtime errors observed.
  No café was claimed or purchased and the user's account was not used.
- [x] Additional production check: GTAO off/on, radius/thickness/samples/mix and
  group reset; sun shadows off/on and reset. No shader errors. Jev's initial
  completion uncertainty was followed by these direct checks; final review accepted.

Client files: `src/Config.js`, `src/World.js`, `src/EnvironmentCycle.js`,
`src/WaterMaterial.js`, `src/ShaderSettings.js`, `src/main.js`.
Tests: new `cafe-shader-settings-tests.mjs`, updated environment, model-outline,
outline-settings and contact-depth suites. Local QA fixture excluded from deploy.
No Git push. Jev's protected-temp rank-file lookup could not run; exact file/code
inspection was used. Its scope review was narrowed to requested visual settings,
then cleared; external deployment review was resolved against scope and rollback.

Live bundle: `index-ZCyD3pDM.js`.
Live image: `69903e4a3bf4cb387dbc5e14d8357072335ada04600af1274b1a06b82c5654ca`.
Rollback: `/opt/apps/froggame-shader-revamp-backup-20261005/original.tgz` and
image tag `froggame:pre-shader-revamp-20261005`.

Proof: [Rendering controls](assets/unfrog-ui/cozy-v1/shader-settings-revamp.png),
[rain after walking](assets/unfrog-ui/cozy-v1/rain-world-anchor.png),
[production shadow controls](assets/unfrog-ui/cozy-v1/shader-settings-live.png).
Use Alt+V or Settings → Dev Config; collapse Model Stroke to see rendering groups.
Copy shader JSON to request a shared/default preset. Strong FX, larger AO sample
counts, wide shadows or extreme thresholds can hurt readability/performance;
isolated GPU/mobile performance is not benchmarked. Existing build warnings remain.

## Model stroke tuning / dev access (5 October 2026)

- [x] Settings → **Dev Config · Alt+V** opens the existing panel, with the new
  **Model Stroke / Outline** folder first and expanded. Close button and Alt+V
  stay synchronized; early/held shortcuts are guarded and held game inputs are
  released on opening. The panel starts hidden and draws above the game HUD.
- [x] Live controls: enabled, stroke color, thickness (.25–5 CSS px), opacity
  (0–1), minimum depth gap (.005–1), distance threshold (0–.02), softness
  (1.01–4), slope rejection (0–1). Tooltips explain the effects/tradeoffs.
  Numeric/color uniforms update directly, without recompiling the graph.
- [x] Save persists only validated outline keys in this browser's localStorage;
  it is explicit, not automatic or shared/server-side. Reset restores shipped
  defaults and clears the saved stroke preset. Copy exports only stroke JSON.
  Malformed/unavailable storage and denied clipboard access are handled safely.
- [x] Original appearance defaults retained: black, 1.5px, full opacity, .06
  minimum gap, .003 distance scale, 1.8 softness, full slope rejection. No
  gameplay/server/save/economy/dependency changes. Existing dev folders retained.
- [x] All 38 café suites plus controls/tongue/map and Vite build passed. Local
  WebGPU café showed thick red contours after live edits, restored saved values
  after reload, and reset correctly; no shader/runtime errors observed.
- [x] Deployed source/bundle hashes match local files; homepage and exact bundle
  HTTP 200. Read-only café/privacy and unauthenticated placement checks passed.
  A disposable live guest verified Settings access, live thickness/opacity edits,
  Close and Alt+V reopening; user account/progress was not used.

Changed: `src/Config.js`, `src/World.js`, `src/ModelOutline.js`, `src/main.js`,
`src/OutlineSettings.js`, `index.html`; regression suites
`cafe-model-outline-tests.mjs` and `cafe-outline-settings-tests.mjs`.
Local QA fixture changes excluded from deployment. No Git push.

Live bundle: `index-9tyJk_og.js`.
Live image: `7e1f7336f0656acf78f92a0f5e6105c6f4698dadbbc456426854a7954fb1f013`.
Rollback: `/opt/apps/froggame-stroke-config-backup-20261005/original.tgz` and
image tag `froggame:pre-stroke-config-20261005`.
Jev's external-action review was resolved against explicit requested scope and
the verified baseline/backup; it did not authorize broader changes.

Proof: [Café controls](assets/unfrog-ui/cozy-v1/model-stroke-config.png),
[live dev panel](assets/unfrog-ui/cozy-v1/model-stroke-config-live.png).
The live proof shows an unsaved 2.5px / .65 opacity experiment, not new defaults.
Lower depth thresholds or slope rejection can reveal floor/road artifacts; thicker
strokes can merge fine details. Tune width/opacity first. Browser-local presets
will not follow the account across devices. Existing build warnings unchanged.

## Cartoon model contours (5 October 2026)

- [x] Black depth-silhouette contours shared by arena and café render graphs.
  Width 1.5 CSS pixels with renderer pixel-ratio compensation; FXAA follows the
  contour composite. Reuse scene depth with four neighbor taps, no duplicated
  meshes or additional scene rendering passes.
- [x] Reject continuous depth slopes and clear sky. Preserve scene color/alpha,
  café AO, lighting, water materials, geometry, UI and gameplay. This is a
  screen-space depth contour, not triangle wireframe or texture-edge Sobel.
- [x] All 37 café suites, controls/tongue/map tests and Vite build passed. Local
  WebGPU browser checks covered day/night NPCs, zoom, faded build originals,
  placement state and arena/water; no shader errors observed.
- [x] Deployed source and bundle hashes match tested local files. Public homepage
  references `index-Bfc3Zf83.js`; homepage/bundle HTTP 200. Read-only production
  café snapshot/privacy and unauthenticated placement checks passed.
- [x] Fresh live browser loaded the exact bundle, rendered outlined arena models
  and water with a temporary guest, and logged no runtime errors. User's account
  was not used; the temporary tab was closed after inspection.

Changed client files: `src/World.js`, `src/Config.js`, `src/ModelOutline.js`.
Regression: `cafe-model-outline-tests.mjs`. Development mirror remains
`C:\Users\USER\AppData\Local\Temp\unfrog-reel`; local QA fixture excluded from deploy.
No server/save/economy/portfolio/dependency changes or Git push.

Live image: `fbe05400ffe06b042e69a1f71004c032b51f975a0d9aa675ef72b91bb1e27526`.
Rollback archive: `/opt/apps/froggame-outline-backup-20261005/original.tgz`;
previous image tag: `froggame:pre-outline-20261005`.

Proof: [Day](assets/unfrog-ui/cozy-v1/model-outline-day.png),
[night](assets/unfrog-ui/cozy-v1/model-outline-night.png),
[arena](assets/unfrog-ui/cozy-v1/model-outline-arena.png),
[live guest](assets/unfrog-ui/cozy-v1/model-outline-live.png).
Depth-only contours deliberately skip coplanar texture boundaries; very small or
shallow features can have lighter/interrupted contours at distant zoom. Transparent
objects follow the existing depth-write behavior. Four taps bound the added work,
but isolated GPU/mobile performance has not been benchmarked. Existing build
warnings are unchanged. Jev's external-action review was resolved by direct scope,
rollback and deployment checks; it did not grant additional authority.
Jev's first completion check requested stronger evidence; fresh live bundle/render
verification was added. Hardware performance and shallow-edge limitations remain
documented rather than claimed resolved.
Jev's final check accepted the strengthened evidence.

## Café lighting consistency and contact depth (3 October 2026)

- [x] Real GTAO plus depth-aware denoise, using the installed Three.js r181 API.
  Half-resolution, 16 samples, .65 radius and .5 mix. Reconstruct normals from depth
  without overriding existing material outputs with MRT.
- [x] Separate café/base post-processing graphs: AO and denoise are excluded in
  the arena and when GTAO is disabled. Graph changes only on mode transitions.
- [x] Player and NPC materials share café-only highlight compression and matte
  roughness response. Preserve original palette, textures, emissive properties,
  geometry and animations; restore original shading response outside Frogstead.
- [x] Café lamps: intensity 32 -> 18, range 10 -> 12, same warm color and inverse-square
  falloff. No new per-lamp shadow maps. Café directional shadow coverage 34 -> 18,
  bias -.01 -> -.0005 and normal bias .0644 -> .035; arena settings restored on exit.
- [x] All 36 café suites, controls/tongue/map tests and Vite build passed. Browser
  fixture checked daytime, night, pale NPCs/wallpaper, lamp visibility, rain and
  arena roundtrip. Clean corrected shader produced no console errors.
- [x] Preview A/B at 1280x720: AO on 24.685 ms/frame versus off 23.932 ms/frame,
  about 3% slower over 240 frames. This is requestAnimationFrame cadence with other
  game tabs open, not an isolated GPU benchmark or a guarantee for mobile hardware.
- [x] Live homepage and new bundle HTTP 200; four deployed source hashes match.
  Read-only production snapshot/privacy and unauthenticated placement checks passed.

Live bundle: `index-BuCQnQXa.js`. Rollback:
`/opt/apps/froggame-contact-depth-backup-20261003/original.tgz`; image:
`froggame:pre-contact-depth-20261003`.

Proof: [Day](assets/unfrog-ui/cozy-v1/contact-depth-day.png),
[rainy night](assets/unfrog-ui/cozy-v1/contact-depth-night.png).
Jev requested manual review rather than automatic acceptance. Direct review used
rendered proofs, passing deterministic tests, clean shader logs and matched live
hashes. First shader/map changes and lamp-visibility toggles can pause during GPU
compilation; lower-end device performance remains unverified. Existing build warnings
unchanged. No save/economy/server/UI/portfolio changes, dependencies or Git push.

Next proposed art pass: improve furniture silhouettes and bevels, then refine wall
patterns/material separation. Not included here; this release is the lighting/depth
foundation, not a complete art-style overhaul.

## Reference-style recipe Cook button (3 October 2026)

- [x] Glossy gold pill, inset highlight, amber bottom edge, restrained glow and
  steaming pot vector; bold white `Cook – N Gold` uses each recipe's actual cost.
- [x] Keep compact four-column menu, original card click handler, keyboard focus,
  muted disabled reasons, active countdown and progress. No nested buttons.
- [x] No recipe economics, server logic, saves, materials or dependencies changed.
- [x] All 35 café test suites and production build passed. Browser checked free and
  paid actions, insufficient gold, click-to-preparation, active countdown/progress
  and no console errors. Existing build warnings remain unchanged.
- [x] Live homepage/bundle HTTP 200, source hashes match, public snapshot/privacy
  and read-only placement endpoint checks passed. No Git push.

Live bundle: `index-CVFuAFxO.js`. Rollback archive:
`/opt/apps/froggame-cook-button-backup-20261003/original.tgz`; image:
`froggame:pre-cook-button-20261003`.

Visual proof: [Gold Cook pills](assets/unfrog-ui/cozy-v1/recipe-gold-cook.png).
Jev's advisory verification requested review without identifying a concrete defect;
manual review used the screenshot, successful click/prep, countdown state, 35 passing
suites and matching deployed hashes to confirm this scoped patch.

## Research-led material/lighting polish (3 October 2026)

### Research and decisions

- [Three.js color management](https://threejs.org/manual/pages/color-management.html):
  lighting operates in linear space, color textures use sRGB and data maps do not.
  Existing automatic hex/CSS conversions and renderer ACES pipeline retained; no
  manual gamma conversions or pre-tone-map saturation boost added.
- [PBR materials](https://threejs.org/docs/pages/MeshStandardMaterial.html): roughness
  differentiates surfaces, while metalness describes actual metal. Previously cafe
  surfaces all used .9 roughness. This pass uses paint .78, wood .72, ceramic .42,
  fabric .98 and metal .32/.65 metalness; user-selected colors remain unchanged.
- [TSL](https://threejs.org/docs/pages/TSL.html): bounded orientation-based facet tint
  and subtle object-local procedural wood grain implemented using installed r181
  exports. No downloaded textures or dependencies. Existing cafe highlight compression
  stays in place to avoid reintroducing the earlier glow problem.
- [Hemisphere lighting](https://threejs.org/docs/pages/HemisphereLight.html): balance
  sky/ground fill against the directional light. Global ambient .65 -> .45 and hemi
  1.4 -> 1.1; sun, day/night/weather interpolation, lamps and water shader preserved.
- [Official WebGPU AO example](https://threejs.org/examples/webgpu_postprocessing_ao.html):
  real screen-space AO is a possible later quality tier, not enabled in this patch.
  Instead use one cheap procedural soft grounding plane under each solid cafe item.
  This is contact shading, not physically accurate AO or a shadow-casting lamp.

### Implemented and verified

- [x] Surface finishes, mild warm/cool face separation, subtle wood grain and soft
  furniture grounding. Grounding follows moved furniture, is removed when stored,
  excludes tiles/wall decor and never participates in physics or picking. Existing
  recipe prices, saves, wall cutaways, customization and highlight protection retained.
- [x] 35 cafe suites, controls/tongue/map tests and Vite build pass. New regression
  tests cover profile roughness/metalness, palette preservation, opaque defaults,
  contact-shading creation/movement/disposal and no collision/interaction side effects.
- [x] Browser compiled shaders with no errors: clear day, clear night, rainy night,
  arena and cafe. Lamp remains readable at night. Proof screenshots:
  `docs/assets/unfrog-ui/cozy-v1/material-polish-day.png` and `material-polish-night.png`.
  No device-wide FPS benchmark or phone GPU pass; no performance improvement claimed.
- [x] Final homepage/bundle HTTP 200, correct new bundle, both source hashes matched;
  read-only production snapshot/privacy and unauthenticated placement checks pass.
  Running image `fb20dbf66e58`. Final client-only deployment verified.
  Jev advisory requested higher-confidence review without identifying a concrete
  failing check; direct code review, tests, browser compilation and live checks are
  the release evidence. Visual taste still needs user review.
  Bundle `index-CZaRq8yz.js`; only CafeSystem.js, Config.js and built assets deployed.
  Rollback `/opt/apps/froggame-material-polish-backup-20261003/original.tgz`, image
  `froggame:pre-material-polish-20261003`. No server/catalogue/proxy changes or Git push.

### Remaining art limitations

This is a focused shading pass, not an AAA art overhaul. Primitive furniture retains
its sharp box geometry. Bevelled asset silhouettes, authored texture sets, environment
reflections and a measured optional AO tier are separate future work. Shader polish
alone cannot substitute for better models and consistent art direction.

## Decor expansion: floor tiles and wall pack (3 October 2026)

- [x] Ten new shop/owned items, with real model thumbnails and existing coin purchase,
  move/rotate/store/reuse, private inventory and saved placement workflows:

  | Item | Coins | Looks | Limit |
  | --- | ---: | ---: | ---: |
  | Cream 1x1 tile | 4 | 0 | 208 |
  | Mint 1x1 tile | 4 | 0 | 208 |
  | Checker 1x1 tile | 6 | 0 | 208 |
  | Woven cafe rug | 45 | 3 | 4 |
  | Free Wi-Fi sign | 35 | 2 | 4 |
  | Animated frog TV | 180 | 6 | 2 |
  | Frog portrait poster | 30 | 2 | 6 |
  | Coffee poster | 30 | 2 | 6 |
  | Wall clock | 60 | 3 | 2 |
  | Chalk menu board | 55 | 3 | 4 |

- [x] Floor layer allows furniture on top and adjacent 1x1 pieces; overlapping floor
  pieces rejected. Tiles give zero looks to avoid tip farming with cheap floor pieces.
  Wall items snap to inward-facing edges; R changes the target wall. Entrance mounting,
  off-wall placement and overlapping wall decor rejected authoritatively. These layers
  do not create physical obstacles or interfere with chef/customer navigation.
- [x] Wall decorations follow cutaway visibility during play; build mode keeps all
  wall decorations visible so they can be selected and moved. TV has a looping silent procedural
  frog/ticker animation; clock hands show server-synchronized real time. No external
  stream, Wi-Fi networking, TV sound, custom poster upload or new dependencies.
- [x] Dedicated regression suite covers all ten models, purchase/placement/looks,
  movement/store/reload, adjacent tiles, floor-under-furniture, mounting/door validation,
  overlap rejection and unchanged routes. Existing cafe regression suites retained.
- [x] All 34 cafe suites plus controls/tongue/map tests and Vite build pass. Browser
  models, Owned selection, floor/wall instructions and TV animation verified; TV scale
  and ticker changed across observations, no console errors. QA fixture never deployed.
  Screenshot: `docs/assets/unfrog-ui/cozy-v1/cafe-decor-pack.png`.
- [x] Deployed catalogue to both client/server copies, CafeSystem.js, cafe.js,
  server-cafe-navigation.cjs and built assets. Final bundle: `index-DXLas2Ji.js`.
  Final homepage/bundle HTTP 200, live schema/privacy and unauthenticated placement
  checks pass; final source hashes matched. Existing saves are preserved, with no
  production test purchases. Running image: `5eba5837cf8a`.
  Rollback source/data archive: `/opt/apps/froggame-decor-pack-backup-20261003/original.tgz`;
  image `froggame:pre-decor-pack-20261003`. No dependencies, proxy changes or Git push.
  Jev advisory confidence was insufficient for automatic completion; direct regression,
  browser and live evidence retained for manual review.

## Completed hotfix: recipe stat alignment (3 October 2026)

- [x] Clock and servings plate now use bounded inline vectors rather than font
  glyphs with inconsistent visual metrics. XP/coin icon boxes and all five text labels
  have explicit centered line boxes. Compact popup and four-column layout unchanged.
- [x] Browser measured identical icon/text center positions (zero difference) and
  matching left edges across all five rows. Screenshot includes servings and XP:
  `docs/assets/unfrog-ui/cozy-v1/recipe-stat-alignment.png`.
- [x] Recipe card/scroll tests and Vite build pass; added vector/label regression checks.
  Client-only bundle `index-89s0yyhN.js`, no stats/economy/save changes.
  Rollback: `/opt/apps/froggame-recipe-stats-backup-20261003/original.tgz` and
  `froggame:pre-recipe-stats-20261003`.

## Completed UI adjustment: compact recipe window (3 October 2026)

- [x] Desktop recipe window reduced about 30% in width and height, centered with more
  cafe visible. Maximum 1008 by 728px; viewport-relative bounds also shrink by 30%.
  Four columns/pagination retained, with vertical scrolling rather than tiny text.
  Extra heading space keeps stats aligned when names wrap. Mobile sizing unchanged.
- [x] Browser at 1280 by 720: popup 862 by 482px, four columns, zero horizontal
  overflow; whole-food previews retained. Recipe card/scroll tests and Vite build pass.
  Screenshot: `docs/assets/unfrog-ui/cozy-v1/recipe-compact-window.png`.
- [x] Client-only bundle `index-D_fmMRvL.js`; no gameplay/save/catalogue changes.
  Live homepage/bundle HTTP 200, deployed source hash matched, production read-only
  schema/privacy check passed.
  Rollback: `/opt/apps/froggame-recipe-size-backup-20261003/original.tgz` and
  `froggame:pre-recipe-size-20261003`.

## Completed hotfix: whole-food previews (3 October 2026)

- [x] Fixed recipe image overflow: preview is now a positioned frame with explicit
  inset image bounds and object-fit contain, rather than percentage grid-item sizing.
  The entire dish stays visible at the compact desktop height; 4-by-2 layout unchanged.
- [x] Browser verified all 12 thumbnails loaded and inside their frames across both
  pages. Visual check shows whole noodle bowl/skewers/bao/mushrooms. All 33 cafe suites
  and Vite build pass; added sizing regression assertions. Gameplay/catalogue unchanged.
- [x] Client-only release: `src/CafeUI.js` and built assets, bundle `index-BUjmHCw6.js`.
  Live homepage/bundle HTTP 200, deployed source hash matched; read-only production
  schema/privacy check passed. Jev verification retained alongside direct evidence.
  Rollback: `/opt/apps/froggame-recipe-fit-backup-20261003/original.tgz` and
  `froggame:pre-recipe-fit-20261003`. Screenshot:
  `docs/assets/unfrog-ui/cozy-v1/recipe-full-food.png`.

## Completed hotfix: aligned 4-by-2 recipe pages (3 October 2026)

- [x] Top-align card content instead of native button vertical centering. Consistent
  heading/rating columns, icon/stat rows, description space and cooking footers.
- [x] Desktop widths at least 1000px use four columns and eight recipes per page.
  Next/Previous exposes the remaining four recipes; filters reset to page one.
  Smaller screens retain two columns, or one column at 620px and below.
- [x] Full-HD browser verification: eight cards in exactly two rows, matching title
  and stat positions across each row, and no vertical overflow. Short-height desktop
  layouts remain scrollable. At 390px there is no horizontal overflow. Pagination,
  filter resets and all existing scroll-retention tests pass; no browser errors.
  Screenshot: `docs/assets/unfrog-ui/cozy-v1/recipe-four-by-two.png`.
- [x] All 33 cafe suites, controls/tongue/map tests and Vite build pass. Live homepage
  and `/assets/index-qdHN2qDX.js` return HTTP 200; deployed source hashes match.
  Read-only live schema/privacy and placement checks pass. Server and recipe catalogue
  hashes unchanged; no economy, account or save changes. No Git push.
- [x] Deployed only CafeUI.js, CafeSystem.js and built assets. Running image:
  `sha256:a32e04684b8ee4a632875e1c076805b2b94c188ae6927d2d3e0b95dae74907e2`.
  Rollback: `/opt/apps/froggame-recipe-grid-backup-20261003/original.tgz`,
  image `froggame:pre-recipe-grid-20261003`.
  Jev advisory requested escalation due to confidence, without identifying a concrete
  failure; deterministic tests, browser measurements and live checks support release.
  Full phone touch gameplay remains unverified.

## Completed UI patch 3: reference-inspired recipe cards (3 October 2026)

- [x] Implemented supplied dark/gold reference: charcoal rounded card, framed amber
  3D food preview, large white name, gold star rating, five vertical icon/stat rows,
  muted description and separated cooking footer. Existing food models/thumbnails
  reused. Prices, servings, cook/prep durations, XP and unlock levels unchanged.
- [x] Only the active dish displays countdown and gold progress. Other recipes show
  Stove busy, not duplicated active-recipe timers. Walking/prep/cook/ready and legacy
  job states handled; progress clamped 0–100 and accessible. Stock count remains visible.
- [x] Filters and Back button stay outside the scrolling card grid. Existing snapshot
  caching/scroll restoration retained; locked cards still reveal only Café level over
  blurred previews. Narrow screens use one column. Serving-stock, build and other
  menus are not restyled by this recipe-only patch.
- [x] 33 café suites plus controls/tongue/map and build pass. Existing thumbnail-export
  and bundle-size warnings remain. Browser verified full-HD desktop, 720px-height
  scroll/footer behavior and 390px single-column bounds with no horizontal overflow.
  Preview cook action starts preparation; reopening updates active countdown/progress
  without resetting scroll. No browser errors. Full phone touch gameplay unverified.
  Screenshot: `docs/assets/unfrog-ui/cozy-v1/recipe-reference-desktop.png`.
  Local QA fixture/preset not deployed and did not touch real account saves.
- [x] Live homepage and `/assets/index-DFeboU74.js` HTTP 200; read-only multiplayer
  snapshot and placement checks pass. Deployed source hashes match local files;
  server/catalogue hashes unchanged. Only CafeUI.js, CafeSystem.js and dist deployed.
  Image: `sha256:669a9b017a55c1178c9e9103defaadaf972f29cda0b826941bc8fe26175e36ae`.
  Rollback: `/opt/apps/froggame-recipe-ui-backup-20261003/original.tgz`,
  image `froggame:pre-recipe-ui-20261003`.
  Jev advisory escalated confidence without identifying a concrete failure. Direct
  screenshot/tests/live-health evidence is retained; user visual review and actual
  phone gameplay are separate from the verified checks above.

## Completed hotfix: HUD selection and social-button auth (3 October 2026)

- [x] HUD/dock/social/menu chrome no longer allows text selection; generated icons
  remain nondraggable. Editable sign/build fields retain text selection; chat and
  profile inputs are not disabled. Browser computed styles and sign interaction pass.
- [x] Fixed authentication startup race in `src/main.js`: DOMContentLoaded used to
  attach a getter only when the asynchronous game object already existed; later
  initialization could also replace it. Both social buttons read the absent flag as
  false. Existing auth state now lives at module scope and game initialization exposes
  a live getter. No server authorization changes or guest-access bypass.
- [x] 32 café suites, controls/tongue/map and production build pass. Added actual-source
  handler tests for Profile cached/fresh server responses, Friends opening and request
  events, guest guards and login before/after renderer initialization. Browser has no
  errors; screenshot: `docs/assets/unfrog-ui/cozy-v1/hud-selection-fix.png`.
  Authenticated panel paths tested with mocks; manual signed-in production clicks
  still require user confirmation. No real account edited or friend request sent.
- [x] Live homepage/new `/assets/index-B7w324ew.js` HTTP 200. Production read-only
  multiplayer/placement checks pass; deployed source hashes match, server and recipes
  unchanged. Image: `sha256:700c08aafb3d2f8c9f54e58e331d18d08b2a058f5395cdc9f0855f8588d3264a`.
  Rollback: `/opt/apps/froggame-social-selection-backup-20261003/original.tgz`,
  image `froggame:pre-social-selection-20261003`.
  Jev completion advisory escalated uncertainty; deterministic tests and live health
  are verified, but the signed-in manual check above is not claimed complete.

## Completed UI patch 2: dedicated generated image icons (3 October 2026)

- [x] Generated 13 separate transparent icons using the built-in image generator:
  café, build, sign, shop, open, settings, music, profile, friends, emotes,
  collect, plus and minus. Consistent rounded toy-3D mint/forest/gold style.
  Contact sheet inspected for matching palette, lighting and readable silhouettes.
- [x] High-resolution originals, style bible and full subject prompt set preserved
  in `docs/assets/unfrog-ui/cozy-v1/`. `optimize-icons.ps1` produces 128px RGBA
  runtime PNGs without redrawing the generated artwork. Total runtime size 229,478 bytes.
  Source-of-truth style: [STYLE-PROMPTS.md](assets/unfrog-ui/cozy-v1/STYLE-PROMPTS.md).
- [x] Existing button labels/actions remain intact. Closed state desaturates the
  door icon; muted music desaturates and adds a slash, retaining accessible state.
  Replaced HUD SVGs/emoji artwork only; no economy, recipes or save migrations.
- [x] 31 café suites including all 13 PNG dimension/alpha/size checks pass.
  Controls/tongue/map checks and production build pass. Existing thumbnail-export
  and large-bundle warnings remain. Desktop preview: all 14 visible image instances
  load correctly; no browser errors. 390px DOM bounds fit a 255px dock, no broken images.
  Full portrait/touch gameplay remains unverified; existing rotate overlay appears
  in portrait. Preview fixture replicas are not deployed.
  Screenshot: `docs/assets/unfrog-ui/cozy-v1/in-game-desktop.png`.
- [x] Live `/assets/index-B-SbYHfx.js` and all 13 `/ui-icons/cozy-v1/*.png` return
  HTTP 200; images have image/png content type and deployed SHA256s match locally.
  Read-only multiplayer snapshot/placement checks pass, server/recipe SHA unchanged.
  Image: `sha256:dff5992823d5438924b205723c71108d795fcbeb6b72a5e44b4f73db96f77d1b`.
  Rollback: `/opt/apps/froggame-cafe-image-icons-backup-20261003/original.tgz`,
  `cafes-before.json`, image `froggame:pre-cafe-image-icons-20261003`.
  Jev reviewed scoped deployment; final advisory requested stronger verification
  without a concrete failure. Direct image, browser, test and live-health evidence
  support this graphics-only release; it does not complete the remaining UI roadmap.

## Completed UI patch 1: compact café HUD (3 October 2026)

- [x] Separate 228px wallet/level/XP card from bottom café-action dock. Next unlock
  and looks breakdown move into the keyboard-accessible progress dropdown.
  Zoom is a side rail; nearby table collection is a contextual button above the dock.
- [x] Café mode hides arena level and mouse-look toggle. Settings/music/social
  buttons use matching rounded 1.8px SVG line icons; notifications remain intact.
  Music/mute updates retain vector icons and accessible mute state.
  Players panel and travel/help controls match café styling.
  Chat history is anchored below stats; the typing field clears the action dock.
- [x] Desktop and 390px-wide browser layouts checked. Narrow-screen weather is
  below stats, not overlapping collection. Touch-control-visible layouts reserve
  thumb-control space and hide café-inapplicable tongue/kick/dive buttons; actual
  phone touch gameplay remains unverified. Arena visibility restores on map exit.
- [x] Existing action handlers, recipe scroll/filter/locked cards, build inventory
  and 36px collapsed rail preserved. Browser build/collapse/finish checks pass.
  Enter/Space on summary/buttons/links no longer also toggles chat; gameplay Enter
  still opens chat. The issue was found in preview and fixed, not ignored.
- [x] 31 café suites plus controls/tongue/map pass; build passes with pre-existing
  thumbnail-export and bundle-size warnings. Screenshots:
  D:/Exports/Unfrog/cafe-ui-desktop-qa.png and cafe-ui-narrow-qa.png.
  Preview uses local-only replicas of shared HUD anchors; fixtures not deployed.
- [x] Live homepage and `/assets/index-BM2HRusa.js` HTTP 200; production read-only
  multiplayer snapshot and placement checks pass. Server and recipe hashes unchanged.
  Deployed CafeUI.js, CafeSystem.js, main.js music hookup, Input.js keyboard guard
  and dist only; no economy/save migration or player-account writes.
  Image: `sha256:3ad1a972a63df9cc3d50f1151d488de3d6104cb5c78896d31c47ee94506defe9`.
  Jev allowed local scope and reviewed deployment; final advisory requested more
  verification even after live health evidence. Deterministic tests/screenshots
  support this staged HUD release, not completion of the entire UI roadmap.
  Rollback: `/opt/apps/froggame-cafe-ui-backup-20261003/original.tgz`,
  `cafes-before.json`, image `froggame:pre-cafe-ui-20261003`.

### Remaining UI work (not shipped in patch 1)

- [ ] Shop/build panel visual hierarchy; recipe reference redesign and grid shipped above.
- [ ] Move sign editing into Build while preserving direct sign interaction.
- [ ] Compact expandable players panel, mode-specific controls help and remaining
  arena-only indicators. Authentication/drawing editor are outside this patch.
- [ ] Actual phone touch-control testing, expanded menus and responsive focus QA.

## Completed patch: solid café walls and stronger lamps (3 October 2026)

- [x] Fixed glassy/sorting artifacts: café surfaces now render opaque by default.
  Wallpaper, wall/floor colors and highlight compression are preserved.
- [x] Café collision meshes no longer enter arena camera-occlusion fade targets.
  Walls, stove, cashier and placed furniture remain solid behind the frog. Physics
  and interaction blocking remain intact; inside roof/near-wall visibility cutaway
  still works. Build ghosts remain 85% visible; moving originals retain 50% fade
  and return to their original opaque material on cancel/finish.
- [x] Lamps/lanterns: warm point-light intensity 18 → 32, reach 7 → 10 units.
  Lights follow furniture movement, disappear on storage and never spawn in previews.
  No expensive per-lamp shadow maps; existing highlight compression prevents bloom washout.
- [x] 30 café suites plus controls/tongue/map and production build pass. Regression
  checks cover opacity, fade-target exclusion, build transparency and lamp settings.
  Browser exterior/interior checks show solid walls and local warm lighting, with
  no console errors. Proof: D:/Exports/Unfrog/cafe-solid-walls-lamps-qa.png and
  cafe-solid-exterior-qa.png. Local fixtures were not deployed.
- [x] Deployed only src/CafeSystem.js and dist. Homepage and
  `/assets/index-B8FiwJ5T.js` HTTP 200; live multiplayer snapshot/placement checks pass.
  Server and recipes unchanged; no save migrations or player-account writes.
  Jev local-change gate allowed; external-deploy review addressed with scope and
  rollback. Final advisory verification was inconclusive; direct regression tests,
  screenshot inspection and deployed source/health checks support completion.
  Running image: `sha256:09c95c25775b0682c669cc60ec71a4fc1fb64b0ef85a9c1cdc86a0c5efe91e1f`.
  Rollback: `/opt/apps/froggame-cafe-solid-walls-backup-20261003/original.tgz`,
  `cafes-before.json`, image `froggame:pre-cafe-solid-walls-20261003`.

## Completed patch: locked recipes and world environment (3 October 2026)

- [x] Locked recipe cards show blurred artwork and only `Locked · Café Lv.X`.
  Name, price, description, XP and cooking status are hidden until unlocked.
  Existing recipe filtering and stable scroll updates are preserved.
- [x] Shared wall-clock 12-minute day/night loop: smooth sunrise/sunset, readable
  moonlit nights, moving sun direction, sky gradient, ambient light and fog.
  Unlit Frogstead outdoor surfaces receive a night tint; café lamps remain warm.
- [x] Clear, cloudy and rain alternate every 3 minutes with 20-second blending.
  Fixed pool of 160 instanced rain streaks, hidden below café roofs and underwater.
  Rain renders after transparent neighborhood surfaces, while retaining depth tests.
  Weather is visual only: no economy changes, audio, wet surfaces or server save fields.
  Clients derive the cycle from their clock; clock skew can slightly offset clients.
- [x] 30 café suites plus controls/tongue/map pass; environment tests cover clock
  continuity, weather bounds, roof shielding, underwater masking, lighting and rain
  render order. Production build passes with existing thumbnail-export/size warnings.
- [x] Browser fixtures verify locked Lv.6 cards, readable night lighting and outdoor
  rain. Proof: D:/Exports/Unfrog/cafe-locked-recipes-qa.png and cafe-weather-qa.png.
  Local preview controls and fixtures were not deployed.
- [x] Live bundle `/assets/index-C4_T8aSd.js` and homepage HTTP 200; read-only
  multiplayer café snapshot and unauthenticated placement checks pass. Only
  `src/CafeSystem.js`, `src/World.js`, new `src/EnvironmentCycle.js` and dist changed.
  Server logic and both recipe catalog hashes remain identical to previous release.
  Save comparison: no cafés lost and no wallet, ownership, level, furniture or
  inventory changes. Active service continued to update stock, cooking, customers,
  served count, tips, XP and arrival timing; the save is not byte-identical.
  Running image: `sha256:df1d213efe5177ee540b881db810bbae41f472829ac84129166e8de30f7eda49`.
- [x] Jev deployment review addressed with explicit scope, baseline checks and backup;
  final outcome verification accepted. No player-account mutations used for testing.
  Rollback: `/opt/apps/froggame-cafe-environment-backup-20261003/original.tgz`,
  `cafes-before.json`, image `froggame:pre-cafe-environment-20261003`.

## Completed patch: cooking gold and batch balance (3 October 2026)

Gold uses the existing café coin wallet; there is no second currency.

| Recipe | Gold per batch | Servings |
| --- | ---: | ---: |
| Fly toast | 0 | 6 |
| Lily Crunch Salad | 18 | 10 |
| Pond soup | 45 | 20 |
| Mosquito Skewers | 30 | 50 |
| Swamp Shroom Grill | 40 | 10 |
| Lotus Bao | 65 | 12 |
| Dragonfly Noodles | 90 | 12 |
| Pond Pocket Dumplings | 130 | 15 |
| Reed Rice Rolls | 160 | 15 |
| Firefly Curry | 260 | 20 |
| Bog Berry Tart | 280 | 20 |
| King Frog Burger | 330 | 20 |

- [x] Approved catalogue costs/yields applied. Customer payouts, XP per serving,
  cook/prep times, stars, unlock levels and 100-serving storage unchanged.
  More servings naturally means more total XP when customers take the whole batch.
  Free toast prevents zero-wallet cooking lockout.
- [x] Server validates ownership/proximity, dish/level, idle stove, capacity and
  approach before checking funds and deducting authoritative cookCost. Job, wallet
  and receipt are committed atomically; failed saves do not publish changes.
- [x] Updated client supplies cookId and retains it after timeout. Server retains
  last 32 accepted IDs privately; repeats (including after completion/reload) do not
  charge/start another job. Different dish with reused ID rejects. Duplicated success
  reports already saved, not a misleading new cooking animation.
  Legacy clients without IDs retain busy-stove protection, but not delayed ID dedup;
  refresh to get updated client. No permanent unlimited receipt history.
- [x] Existing jobs retain their saved yield/deadline; missing legacy yield remains
  3. No retroactive charges. Saved jobs record cookCost for accepted new batches.
- [x] Menu separates gold per batch from customer coins per serving, displays new
  servings, disables unaffordable recipes and shows exact gold shortfall.
- [x] 29 café suites plus controls/tongue/map pass. Cost tests cover all 12 recipes,
  insufficient/exact funds, spoofed cost, disk failure, busy/dedup/restart/late retry,
  private receipts, legacy jobs and client timeout retry identity. Existing test
  expectations updated for approved yields and funded paid-recipe fixtures.
- [x] Browser fixture: wallet 44 allows toast/salad/skewers/shrooms; soup disabled
  with Need 1 more gold. Correct costs/yields visible; zero console errors.
  Screenshot: D:/Exports/Unfrog/cafe-cook-costs-qa.png. Fixture not deployed.
- [x] Live public snapshot/privacy and read-only placement checks pass. Homepage
  and bundle HTTP 200; matching client/server and both recipe hashes; image running.
  Loaded-container catalogue assertions pass. Post-release save comparison:
  wallet, XP, stock, cooking, furniture and inventory unchanged; only customers,
  visits and scheduling changed during normal simulation. No production QA spending.
- Bundle: `/assets/index-BYvt4gi5.js`.
- Image: `sha256:e1cf539e3cfcdb81f1f2b0874ae91aa0c4a2857b7346dce054a75c496e9497ee`.
- Client SHA256: `b81ce7b2c64e82ce9e35fd4437ba67fbb32d54c71f823e6996287ef40d3a6a7e`.
- Server SHA256: `ad9e47cb35b2e93ccadf0078add120006ad150a611993010c67526738e401cbf`.
- Recipes SHA256: `79b40da954081d1987718e481c4080cb1b89e008dd8a992f1c291cc9b1762c5d`.
- Rollback: `/opt/apps/froggame-cafe-cook-costs-backup-20261003/original.tgz`,
  `cafes-before.json`, image `froggame:pre-cafe-cook-costs-20261003`.
  Restore code/image first, not data over later player progress.
- Only src/CafeSystem.js, server/cafe.js, root/server cafe-recipes.json and dist
  deployed. No dependency/schema migration or unrelated changes. Existing renderer,
  large-bundle and compose-version warnings remain.
- Jev returned escalate, not an automatic pass. Manual review relies on the
  deterministic charging/rollback/retry tests, browser affordability QA, exact
  live hashes and save comparisons above. Retain the stated legacy-client and
  bounded-receipt limitations; authenticated production cooking remains untested.

## Completed patch: furniture variety (3 October 2026)

| Item | Coins | Looks | Footprint | Owned limit |
| --- | ---: | ---: | --- | ---: |
| Round café table | 85 | 3 | 2 × 2 | 2 |
| Café stool | 20 | 1 | 1 × 1 | 8 |
| Cushioned chair | 40 | 2 | 1.2 × 1.4 | 8 |
| Flower pot | 40 | 4 | 1 × 1 | 2 |
| Bookshelf | 90 | 5 | 2 × 0.8 | 2 |
| Lantern lamp | 70 | 4 | 0.8 × 0.8 | 1 |

- [x] Six distinct code-native 3D models, actual-model thumbnails and existing
  shop/Owned/category integration. No dependencies or free inventory grants.
  Original seven item values, starter IDs and recipe/progression values unchanged.
- [x] Variant role checks extend existing table/chair/lamp behavior: four mixed
  chairs/stools around the round table, per-chair reservations and route validation,
  table coin collection and full floor-to-top collision. Lantern has a bounded
  warm PointLight; previews/thumbnails never create lights.
- [x] Buying charges authoritative catalogue price; placed looks count toward
  existing tip rule. Move/rotate/store/reuse retain existing ownership rules.
- [x] 28 café suites plus controls/tongue/map pass. Expansion tests cover purchases,
  move/store/reload, placed looks, four mixed-seat routes, round collider, coin
  collection/no double payment, reservation/store guards, lamp and shop cards.
- [x] Browser fixture confirms models and thumbnails; fresh console has zero errors.
  Fixed variant-only table fallback found during QA; bookshelf books face outward.
  Fixture is local only and not deployed. Screenshot:
  D:/Exports/Unfrog/cafe-furniture-expansion-qa.png.
- [x] Live socket/privacy/read-only placement checks pass, homepage/current bundle
  HTTP 200, source and both catalogue copies match local hashes; container running.
  Save is NOT byte-identical: only customer/visit/scheduling fields changed during
  active simulation. Wallet, XP, served count, furniture and inventory were unchanged
  in the post-release comparison. No production test purchases or account mutations.
- Existing World.js renderer-export, bundle-size and compose-version warnings remain.
- Jev final verification was inconclusive (low confidence), not an automatic pass.
  Direct running-container assertions additionally confirm 13 catalogue types,
  five unchanged starters and four mixed variant seats at a round table. Completion
  rests on deterministic tests, source hashes, browser QA and these live checks.
  Authenticated production purchasing is left for the player; no coins spent by QA.
- Bundle: `/assets/index-Gtbsg-7i.js`.
- Running image: `sha256:3bcf026475b6180ca2f4a1990fbf0e716a0357ab2887ccfe6771ee45e8d837d0`.
- Client SHA256: `c33cb7188920048d1c3e5b40272f5234406d0e571a579c06708aa4142d9cef60`.
- Server SHA256: `6dc0125e0e63171b8e7e8dd59665b07b08b47a6b047eca230e9c14ac9ff79067`.
- Catalogue SHA256: `ef9f9305d98a88617932d12a18db6b56cc1af4d7438a9acc60886f6d16eadd34`.
- Scoped deployment: src/CafeSystem.js, server/cafe.js, root/server cafe-layout.json,
  dist. Navigation implementation unchanged; it reads the expanded catalogue.
- Rollback: `/opt/apps/froggame-cafe-furniture-backup-20261003/original.tgz`,
  `cafes-before.json`, image `froggame:pre-cafe-furniture-20261003`.
  Restore code/image first; don't restore data over subsequent player progress.

## Completed patch: one-line build sidebar (2 October 2026)

- [x] Collapse header button turns inventory into a single vertical left sidebar
  (36px desktop / 32px narrow screens). Click Build · Expand to restore.
- [x] Build stays active: ghost, grid, selection, rotation, category and inventory
  scroll survive collapse and snapshot updates. R/Esc retain existing behavior.
  Finish building remains a separate action; no server or economy changes.
- [x] 27 café suites plus controls/tongue/map pass; Vite build succeeds with the
  existing World.js export and large-chunk warnings. Browser fixture confirms
  hidden inventory/footer, 36px strip, 310px restored panel, retained stove selection,
  and no console errors. Visual proof: D:/Exports/Unfrog/cafe-build-minimized-qa.png.
- [x] Deployed bundle: `/assets/index-DHIqKc9p.js`; homepage and bundle HTTP 200.
  Production snapshot and unauthenticated read-only placement checks pass.
  Server hash unchanged; café save byte-identical to pre-release backup.
- Client SHA256: `18f39c8fb6d0cb57754510ebbb5605c2635a35fb9740398b2f957d70a9a79042`.
- Running image: `sha256:00bedc8924918fc4f0b7a368b5108278b5a40e80a1c6b93859379d7067267b28`.
- Rollback: `/opt/apps/froggame-cafe-build-minimize-backup-20261002/original.tgz`,
  `cafes-before.json`, image `froggame:pre-cafe-build-minimize-20261002`.

## Completed patch: audited build feedback (2 October 2026)

Audit first: previews, half-transparent original furniture, cancel restoration,
free moving/store/reuse, R/Esc controls, shop/owned categories, looks/footprints and
scroll restoration were already implemented. Preserve them rather than rebuilding.

- [x] Selected-item footer shows name, rotation, looks, rotated footprint in tiles,
  and whether it is a free move or placement from owned inventory.
- [x] Immediate reasons for out-of-floor, blocked doorway and overlap (named item).
  Reserved chairs/tables, waiting customers at serving table and stove preparation
  are caught before placement. Store warns/disables for reservation/prep or table coins.
- [x] Read-only `cafePlacementPreview` validates a cloned layout using the exact
  existing server placement/route checks. Return before commit/broadcast; no inventory
  reservation, save changes or duplicate browser pathfinding.
- [x] Neutral footprint while checking; green only after server confirmation, red
  with actual rejection reason. Debounce 250ms, one in-flight request, server 200ms
  per-socket rate limit, refresh after 1s, expire confirmation after 1.5s. Ignore stale
  replies after changing/cancelling selection; timeout/disconnect cannot approve.
- [x] Real placement still revalidates: preflight approval cannot override a later
  customer movement, layout change or permission change. Click floor to place remains
  the existing interaction; no new Place button or purchase mechanics.
- [x] All 26 café suites plus controls/tongue/map pass. New tests prove previews
  cannot write state/files or broadcast, preserve route/ownership guards, and handle
  stale replies/expiry. Browser visual fixture confirms details, overlap reason and
  neutral-to-ready state; zero console errors. Fixture approvals are mocked; actual
  authoritative validation is covered separately by server tests.
- [x] Production socket snapshot and new read-only endpoint checks pass. Guest
  previews reject without exposing state. Homepage/current bundle HTTP 200, deployed
  hashes match local, container running; café save identical to pre-deploy backup.

Release: `/assets/index-DpCafaki.js`; running image
`sha256:6fc3c05fa6f65f5c554b4cccd4c15f9d767a1fb934b045b198efd6c50c22ffd4`.
Rollback: `/opt/apps/froggame-cafe-placement-feedback-backup-20261002/original.tgz`,
`cafes-before.json`, image `froggame:pre-cafe-placement-feedback-20261002`.
Only `src/CafeSystem.js`, `server/cafe.js` and built `dist` deployed. No dependencies,
save migration, economy/recipe/route-policy changes, portfolio changes or Git push.
Existing renderer-export, bundle-size and compose-version warnings remain unrelated.

No additional patch started. Audit any next target before planning it; economy
balancing remains a separate later pass.

## Completed patch: customer presentation (2 October 2026)

- [x] Reuse each customer's food/plate model while carrying it from serving table
  to reserved chair. Show it only after authoritative pickup; old saved seating
  phases without the pickup flag remain compatible. Explicit false pickup stays hidden.
- [x] Short 0.4-second plate set-down animation at the customer's own table edge.
  Keep separate plates for multiple chairs sharing a table; props follow rerouted
  customers and existing plot rotation. Stationary route segments retain facing.
- [x] Bite-timed mouth/pose movement and crumb bursts; food visibly shrinks as the
  meal progresses. Hide/reset props on departure and map changes; existing cleanup
  removes plate geometry/materials and NPC bodies.
- [x] Dish-specific pickup/eating reactions, late-meal last-bite reaction, repeated
  brief eating bubbles, and waiting reactions that distinguish cooking from an
  empty kitchen. Keep colour-matched frog portraits and white outlined text.
- [x] All 25 café suites plus controls, tongue and map regressions pass. Browser
  fixture confirms carried soup bowl, matching portrait and service dialogue;
  no console errors. Build succeeds with unrelated pre-existing renderer/bundle warnings.
- [x] Client hash matches production; homepage and current bundle HTTP 200;
  live socket validation passes (12 recipes, four chairs, private wallet/inventory).
  Server file hash unchanged; café save matches pre-deploy backup byte-for-byte.

Release: `/assets/index-CdC4tLdb.js`; running image
`sha256:7a02686fadde2dc846121d1d203ed083bb2d2be454aacabda498a111eba8d230`.
Rollback: `/opt/apps/froggame-cafe-customer-presentation-backup-20261002/original.tgz`,
`cafes-before.json`, image `froggame:pre-cafe-customer-presentation-20261002`.
Only `src/CafeSystem.js` and built `dist` deployed; tests/preview fixtures remain local.
No server, recipe, XP, payment, route, save-schema, dependency or portfolio changes.
This is procedural prop/body animation, not a new rigged hand-grab animation.

Its audited build-feedback follow-up is completed above. Existing shop/owned
interactions were preserved; economy balancing stays a separate later pass.

## Completed patch: cooking feedback and stock popup (2 October 2026)

- [x] Click your serving table to open a compact stock view: dish name, remaining
  servings, servings per batch, shared capacity and free spaces. Same dishes still
  stack; unchanged snapshots preserve popup DOM and scroll position.
- [x] Owner-only batch notice, e.g. `+20 Pond soup added to serving table`, sent
  after successful server save. No notice while storage is full, on failed saves,
  on reconnect, or on repeat ticks. Connected sessions of the owner receive it.
- [x] Cooking rejection and finished-batch hold show the exact additional spaces
  required. Example: 98 stored + 10 salad needs 8 more spaces, not 10.
- [x] All 24 café suites plus controls, tongue and map tests pass; production build
  succeeds. Existing renderer-export and bundle-size warnings remain unrelated.
- [x] Browser fixture: real serving-table click opens stock; 21 soup + 2 toast shows
  23/100 and 77 free. Completion toast and 98/100 held-batch feedback verified;
  no browser console errors. Preview fixtures/tests were not deployed.
- [x] Production socket snapshot passes with 12 recipe slots and four existing
  chairs; private wallet/inventory filtering intact. Source hashes match local,
  homepage and current bundle HTTP 200, container running. Café save matches
  its pre-deploy backup byte-for-byte.

Release: `/assets/index-Cl-gxFiY.js`; running image
`sha256:f0e81a577a026715f7b032cfb567e50e353ca243c31be569c17469e6578485d9`.
Rollback: `/opt/apps/froggame-cafe-stock-feedback-backup-20261002/original.tgz`,
`cafes-before.json`, image `froggame:pre-cafe-stock-feedback-20261002`.
Only `src/CafeSystem.js`, `server/cafe.js` and built `dist` deployed. No dependencies,
recipe/economy changes, save migrations, portfolio edits or Git push.

Jev narrowed/reviewed the task; its Temp-directory scan was refused and its final
quality assessment had low confidence. Completion was manually verified using
the direct tests, browser interaction, deployed hashes and live service checks.

Its customer-presentation follow-up is completed above. Furniture polish and economy
balancing remain separate later passes.

## Verified: repeat batches stack (2 October 2026)

Same-dish stacking already exists in the deployed server: completion adds the batch
to `stock[dish]`; the serving table uses one tray and a total count per dish.
Added regression coverage for two consecutive batches and reloads:
soup 20 + 20 = 40, salad 10 + 10 = 20, skewers 50 + 50 = 100.
The shared 100-serving storage cap still applies, including other dishes.
No production code or deployment needed for this request.

## Completed patch: recipe-specific batch sizes (2 October 2026)

- [x] Soup 20 servings, Lily Crunch Salad 10, Mosquito Skewers 50; other recipes 3.
- [x] Skewers price 2 coins per serving, down from 9. Existing timers, XP per
  serving, tiers and unlocks unchanged. More servings yield more total pickup XP.
- [x] Shared storage 100 servings; require space for the entire chosen batch.
  Hold completed batches if storage fills; never drop or partially overflow food.
- [x] Save batch size on new cooking jobs. Existing jobs without it still yield 3.
- [x] Recipe UI and cooking feedback show actual yield and 100-serving storage.
- [x] All 23 café suites pass: yields, per-serving rewards, capacity boundaries,
  reloads, full-storage hold, legacy jobs and duplicate-completion prevention.
  Browser verifies 20/10/50 serving labels, 2-coin skewers and storage /100.
- [x] Rollback backup, intended client/server/catalogue deployment, matching hashes
  including server catalogue copies; public socket check and homepage/bundle HTTP 200.

Release: `/assets/index-CGmzJWRK.js`; running image
`sha256:a6f899e4af6e2aee7c83bf0b8962931cb1849f83969f223bab2204958e7d1a88`.
Rollback: `/opt/apps/froggame-cafe-batches-backup-20261002/original.tgz`
and image `froggame:pre-cafe-batches-20261002`. No save reset or migration.

## Completed patch: stove access and recipe scroll (2 October 2026)

- [x] Reproduce rejected physical stove boundary in the moved-stove layout.
- [x] Chef routes use real solid footprints instead of decorative overhangs,
  with 0.02-unit contact/network tolerance. Keep NPC routing and proximity guards.
- [x] Preserve unchanged recipe DOM across snapshots; restore scroll on stock,
  unlock or category rebuilds. Continue refreshing cooking status/button guards.
- [x] 22 café suites pass, including actual server cooking at the previous rejected
  collider boundary. Browser recipe-grid scroll stays at 1438 through repeated
  one-second snapshots; stock/unlock rebuild retention covered by regression tests.
- [x] Backup and deploy intended client plus server navigation only. Public socket
  validation passes, source hashes match, homepage/current bundle HTTP 200.

Release: `/assets/index-BXNc9vjG.js`; running image
`sha256:0782a47c83bef5fc4d5529b8955efea17c6b2bb4142687d5548e37f1779f6bb3`.
Rollback: `/opt/apps/froggame-cafe-access-backup-20261002/original.tgz`
and image `froggame:pre-cafe-access-20261002`. No save migration, recipe/economy
changes or weaker distance/ownership guards. Blocked routes still require a clear
working space beside the stove.

## Completed patch: customer bubble portraits (2 October 2026)

- [x] Reuse the player-list frog SVG beside customer dialogue, matching NPC colour.
- [x] Share the existing vector helper; keep player-list sizing and white header icon.
- [x] Update dialogue in a separate text span, preserving icon and outlined text.
- [x] All 21 café test suites pass; browser confirms side-by-side portrait and
  outlined dialogue with no console errors. Inner flex row survives CSS2DRenderer
  visibility changes; previews/tests are not deployed.
- [x] Back up and deploy only client source plus built `dist`; live source hashes
  match, public socket validation passes, homepage/current bundle HTTP 200.

Release: `/assets/index-C71TSpun.js`; running image
`sha256:fa3da0d276bd139ac87882f42ef4f221c4f69f14ad2179ff3d7eb3c9a36376f8`.
Rollback: `/opt/apps/froggame-cafe-portraits-backup-20261002/original.tgz`
and image `froggame:pre-cafe-portraits-20261002`. No server/economy/save changes.

## Completed patch: café brightness and working lamps (2 October 2026)

- [x] Verify live source and trace brightness: lit café materials receive strong
  scene lighting; furniture lamps previously had no actual light source.
- [x] Café-only highlight compression before bloom; preserve palette, wallpaper,
  shadows and build transparency. Leave arena lighting/post effects unchanged.
- [x] Warm bounded point light on placed lamps, following moves and disappearing
  when stored. No lights in catalogue thumbnails or placement ghosts.
- [x] All 20 café suites plus controls, tongue and map tests pass. Browser
  rendering has no console errors; daylight surfaces and isolated lamp light
  visually checked. Evening lighting toggle exists only in the local QA fixture.
- [x] Deploy only `src/CafeSystem.js` and built `dist`; public socket check and
  homepage/new bundle HTTP 200. Source hash matches production. Save differences
  are limited to customer/visits/arrival timing; furniture/inventory/coins/XP unchanged.

Release: `/assets/index-DKEIld5A.js`; running image
`sha256:0250566c8fa5a4f76fe91addd4566412dd1d21fa2ac2cbcd353935fd2c566de7`.
Rollback: `/opt/apps/froggame-cafe-lighting-backup-20261002/original.tgz`
and image `froggame:pre-cafe-lighting-20261002`. Lamps use bounded lights without
individual shadow maps to keep multiple cafés inexpensive. Existing unrelated
build warnings (thumbnail WebGL export and bundle size) remain unchanged.

## Completed patch: café personality and room customization

Authorized 1 October 2026. Recipe stars are catalogue tiers, not review scores.
Existing recipes stay at 0.5–1.5 stars; the display caps at 5 in half-star increments.
Unlock levels, prices, cooking times and XP remain unchanged.

- [x] Disable new tongue shots inside café interiors; cancel in-flight tongues on entry.
  Outside Frogstead and arena controls remain available.
- [x] Food star badges and category filters: 0.5★ starters (toast, soup, salad),
  1★ skewers/shrooms/bao/noodles, 1.5★ dumplings/rice/curry/tart/burger.
- [x] Build → Room style: free validated wall/floor colours and plain/striped/panel
  wallpaper, saved per café. Preserve the previous default colours for old saves.
- [x] Replace unlit café materials with rough lit node materials, calibrated colour
  gain and furniture shadows. Use existing lighting; no global arena shader changes.
- [x] Saved Open/Closed HUD toggle. Closed blocks arrivals; paying diners finish.
  Waiting guests depart without inventing tips or XP.
- [x] Empty-shelf visitors wait at the serving table for 12–30 seconds, react to hunger,
  take a reserved serving if food appears, or leave disappointed when patience expires.
- [x] Random reachable seats, food preferences, reaction variation and 2–18-second
  arrival gaps. Persist deadlines; no offline/away café farming, no infinite crowds.
- [x] Preserve reservation/pickup accounting, exact-once XP/payments, old saves,
  ownership and atomic writes. Safe builds preserve waiting patience; moving the
  serving table is blocked while guests wait there.
- [x] Final regressions, browser desktop/mobile checks, build and targeted deployment.
- [x] Verify live hashes/API/privacy, preserve user save and record rollback.

Released 1 October 2026. Bundle `index-DEeP6jVe.js`; image `cde40cb910ea`.
All 20 café suites and controls/tongue/map regressions passed. Browser verified room
style saving, Open/Closed state, star filtering and hungry bubbles with no console
errors. At 390 × 844, menus fit and had no horizontal overflow. Deployed hashes
matched; homepage/bundle returned 200 and live public snapshot checks passed.
Production save matched its pre-deploy backup byte-for-byte at verification.

Rollback: `/opt/apps/froggame-cafe-hospitality-backup-20261001`, image
`froggame:pre-cafe-hospitality-20261001`. Deployed only `src/CafeSystem.js`,
`src/Frog.js`, `src/main.js`, `server/cafe.js`, `server/server-cafe-navigation.cjs`,
recipe catalogue (root/server copies) and built assets. No QA fixtures, new dependencies,
proxy/portfolio changes, account purchases or Git push.

Deliberate limits: guests still reserve a reachable chair before entering (capacity
matches seating); there is no outdoor queue yet. Wallpaper uses three procedural
styles, not uploaded images. Stars are cosmetic categories, not income multipliers.
Arrival simulation still requires the owner in Frogstead; existing visitors can finish.

## Completed patch: cooking and service reliability

- [x] Find a reachable working position beside the stove; walk there before preparing.
- [x] Show approach, preparation, cooking and finished/waiting states distinctly.
- [x] Improve preparation with ingredient/tool motion and ignition feedback.
- [x] Keep accepted cooking deadlines durable; old jobs keep their saved deadlines.
- [x] Derive customer travel times from route lengths, not fixed timers.
- [x] Reserve food without deducting it until pickup; reserve individual chairs.
- [x] Preserve four usable chairs around one table and separate plate positions.
- [x] Reject moves/removals of occupied seats/tables; reroute other affected trips safely.
- [x] Reject layouts that strand active customers rather than publish broken routes.
- [x] Keep completed batches at the stove when the 12-serving storage is full.
- [x] Transfer waiting batches automatically when enough space opens; never discard food.
- [x] Clearly show storage usage and the waiting batch state in the recipe menu.
- [x] Test restart, disconnect, old saves, full storage, moving furniture and duplicate awards.
- [x] Build, visually verify, back up production, deploy only intended files, verify live.

## Follow-up roadmap (not part of this implementation)

### Customer personality

Varied colours/accessories, occasional contextual reactions, carrying dishes, chewing,
crumbs and coin-drop feedback. Preserve existing customer reactions and collection bounce text.

### Progression and balancing

Show next recipe unlock, level-up feedback and décor tip breakdown. Balance meaningful
time/income/XP choices without changing the grind merely to add waiting.

### Furniture shop — shipped

Separate Shop and Owned inventory. Show prices, footprints and looks points; purchases
add owned items, placing consumes inventory and storing returns it. Begin with the existing
furniture catalogue; keep functional upgrades distinct from décor bonuses.

### Controls and HUD

Compact icons, selected-object Move/Rotate/Store/Cancel controls, visible placement ghosts,
light grids, usable zoom and smaller-screen checks. Prevent café interactions firing attacks.

### Save and multiplayer verification

Server-validation of purchases, XP and ownership; protect other players' cafés; reconnect
tests through all phases; old-save compatibility and longer-running customer simulations.

## Completed patch: progression feedback and cooking fix

Authorized 1 October 2026 after the furniture shop release. Recipe locks, XP bar and
tip total already work; this patch clarifies the next goal and rewards without
rebalancing. Also fixes the reported cooking failure before adding feedback.

1. **Next unlock:** show the next locked recipe level, all recipes unlocking at that
   level and XP remaining to the next level. Show an explicit all-recipes-unlocked
   state when appropriate. Read the existing recipe catalogue.
2. **Level-up feedback:** brief toast/animation naming newly unlocked recipes. Trigger
   only on a verified level increase, not initial load or reconnect. Handle multiple
   levels gained in one update without duplicate celebrations.
3. **Looks breakdown:** compact expandable view showing placed furniture counts,
   looks subtotal per type, current bonus and points needed for the next tip tier.
   Stored inventory contributes zero; show when the bonus cap is reached.
4. **Recipe menu clarity:** surface the next unlock near the existing recipe cards;
   preserve locked cards, descriptions and current cook-time/XP information.
5. **Verification:** tests for level boundaries, simultaneous unlocks, reconnect,
   all-recipes-unlocked, tip cap and store/re-place score changes. Check desktop and
   small-screen layout, then back up and deploy only this patch if authorized.

Preserve XP on food pickup, the 1,000 XP base pool plus 500 per level, recipe prices,
cook times, furniture prices, existing saves and five looks per bonus tip with its cap.
No new models, dependencies, pop-up tutorials or automatic purchases.

After this: customer presentation (carry dishes and clearer service feedback), then
a focused reconnect/multiplayer soak test. Inspect existing reactions/chewing first;
do not rebuild features that already exist.

### Implementation and verification

- [x] Reproduced live "Clear a working spot beside your stove" failure using the
  user's moved stove/cashier layout. Chef pathfinding used NPC padding (0.65) despite
  the player having a 0.5-radius sphere. Valid close-to-stove starts were rejected.
- [x] Chef-only routes now use physical sphere clearance, including rounded box
  corners; NPC safety padding stays unchanged. Starts inside solid furniture still fail.
- [x] HUD and recipe menu show the next unlock and remaining XP; all-unlocked state.
- [x] Brief level-up banner, multi-level unlocks, silent initial load/reconnect and
  duplicate update suppression. Expandable placed-only looks/tip breakdown.
- [x] Recipe cards explain blocked cooking (connection, death, saving, proximity,
  storage and level). Exit build mode before opening cooking; no economy changes.
- [x] Café regression suites plus controls/tongue/map tests passed; real-layout
  server cooking regression passed. Browser fixture cooking click, unlock banner and
  looks popover verified; mobile had no horizontal overflow; no console errors.
- [x] Verify final live deployment, file hashes, public snapshot and save preservation.

Released 1 October 2026. Live bundle: `index-CC9Dz1OZ.js`; running image:
`6fba20fc4105`. Homepage and bundle returned HTTP 200; deployed hashes matched the
tested source. Public snapshot checks passed and café saves matched the pre-deploy
backup byte-for-byte. No test cooking or purchases were performed on the user's
production account; cooking was verified against a copied real layout and local UI.

Rollback prepared: `/opt/apps/froggame-cafe-feedback-backup-20261001` and
`froggame:pre-cafe-feedback-20261001`. Only `src/CafeSystem.js`,
`server/server-cafe-navigation.cjs` and built assets are deployed; QA fixtures excluded.

## Explicit exclusions

No staff, farming, deliveries, additional maps, dependencies, Caddy changes or unrelated
portfolio work. No Git push requested. Record implemented results and limitations below.

## Verification and release

Released 1 October 2026. Live bundle: `index-Dwhesl0G.js`.

- Changed game files: `src/CafeSystem.js`, `src/CafePreparation.js`,
  `server/cafe.js`, `server/server-cafe-navigation.cjs` and built client assets.
- Development mirror: `C:\Users\USER\AppData\Local\Temp\unfrog-reel`.
- Production: `/opt/apps/froggame`, container `froggame`.
- Source/deployment hashes matched; homepage and new bundle returned HTTP 200.
- Production snapshot passed: 12 recipe slots, four existing chairs, valid XP/looks/tips,
  furniture and wallet privacy. Saved café data matched its pre-deploy backup byte-for-byte.
- Café suites cover approach/prep, full-storage restart and exactly-once transfer,
  occupied furniture, blocked layout rollback, continuous rerouting, per-route timings,
  pickup XP, payments, old saves, models, build controls and camera. Control/tongue/map
  regression checks also passed. Local browser checks showed auto-walk/prep, storage
  count and finished batch waiting; no browser console errors were observed.
- Rollback source/save: `/opt/apps/froggame-cafe-reliability-backup-20261001`.
- Rollback image: `froggame:pre-cafe-reliability-20261001`.
- No dependency, economy, account, proxy or portfolio changes; no Git push.

### Intentional behaviour and remaining limits

Cooking still requires being near your own stove. The short automatic approach finds a
reachable side, not a whole-café click-to-walk system. An accepted batch persists even
if the chef disconnects or leaves; there is no cancel/refund action. Preparation remains
a procedural first-pass animation, not a custom rigged cinematic.

Furniture editing is temporarily blocked during approach/prep; occupied chairs and
tables must wait until their customers leave. Other safe layout changes reroute active
customers from their current positions. Builds do not add new customers while active.

A waiting batch occupies the stove until three storage spaces open, then transfers on
the next server tick. Existing reservations/seating/plate behaviour was preserved and
retested. Customer queueing/complaints, carried dishes and economy rebalance remain
follow-ups. The furniture shop shipped separately below.

## Completed follow-up: furniture shop and owned inventory

Authorized after the reliability release. No stove upgrades or new furniture models in
this pass; use the existing table, chair, plant and lamp catalogue.

- [x] Authoritative prices: table 60, chair 15, plant 30 and lamp 45 coins.
- [x] Separate Shop and Owned views with HUD shortcut, model thumbnails, prices,
  footprints, looks, stored counts and ownership limits.
- [x] Buying adds one stored item; placing consumes one; moving is free; storing
  returns one without refund or a second purchase.
- [x] Preserve existing placed furniture and wallet/XP. Old unused free extras become
  shop items; starter stations/table/chair remain protected from removal.
- [x] Keep inventory and purchase receipts private to the owner; validate proximity,
  price, balance and maximum owned counts on the server.
- [x] Persist purchases atomically; duplicate purchase receipts do not charge twice.
- [x] Regression tests for failed saves, reload, migration, blocked placement, storage,
  reuse, UI affordability and limits. Existing café suites pass.
- [x] Browser purchase/place/store/re-place check; build and publish exact changes.
- [x] Verify deployed hashes, API schema, public inventory privacy and existing saves.

Released 1 October 2026. Live bundle: `index-v6bcuWHE.js`.

- All 20 café suites passed. Browser fixture: 189 → 159 coins after buying a plant;
  place/store/re-place kept 159 coins, with looks 9 → 12 → 9 → 12. No console errors.
- Homepage and bundle returned HTTP 200; deployed source hashes matched local files.
- Live public snapshot passed, including private inventory/receipts, 12 recipes and
  four existing dining chairs. Saved café data matched the pre-deploy backup byte-for-byte.
- Rollback: `/opt/apps/froggame-cafe-shop-backup-20261001`; image
  `froggame:pre-cafe-shop-20261001`. New running image: `53a8f5aa1249`.
- Only café shop source, catalogue and client build deployed. No preview fixtures,
  account purchases, dependencies, proxy changes or Git push.
