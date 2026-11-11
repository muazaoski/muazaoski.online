# Unfrog café v2 — Blender prototype, 14 October 2026

Cozy low-poly shell: jade standing-seam roof, opaque cream walls, deep-green
wainscoting, oak trim, cream/green awning, recessed window inserts, brass handle
and terracotta planters. Existing game's floor remains 14 × 16; entrance 3.2 wide.

- `cafe-v2.blend`: editable source assembly in **Unfrog Cafe v2** collection.
  Original Cube, Camera and Light are preserved. Preview root is offset to X=24.
- `cafe-shell-v2.glb`: render-only shell, origin zero, glTF Y-up; front is +Z.
  40 mesh/material batches, 5,000 triangles, 311,432 bytes. No camera/lights,
  stage, text branding, stove, tables, chairs or user-scene objects are exported.
- `cafe-exterior.png` / `cafe-interior.png`: Blender-rendered previews. Furniture,
  pendant lights and title lettering are separate preview assets, not game inventory.
- `build_cafe.py`, `preview_cafe.py`, `export_cafe.py`: authoring scripts for an empty
  source scene. Build/export guard against overwriting existing named deliverables.
- `validate_cafe.mjs`: `node docs/assets/unfrog-models/cafe-v2/validate_cafe.mjs`.

## Game integration — shipped 14 October 2026

The renderer adapter now attaches the shell
to plot position/rotation and uses node `extras.logical_part` for Floor, Back,
Left, Right, Front, Door Frame, Roof Cutaway and Sign. Hide the roof and camera-facing
walls using the existing café cutaway logic; retain the existing physics/door route,
inventory furniture, recipe/stove actions and ownership saves.

`Sign_Paint_Surface` has `extras.customizable_sign=true` and full-front-face UVs.
Bind the current sign canvas there. Update the render materials from current saved
wall/floor customization; keep node materials compatible with existing highlight,
outline and environment settings. Window inserts are opaque stylized panes, not
transparent walls. The shell shipped in `index-dnCjtMHQ.js`; existing furniture,
colliders and saved customizations remain intact. The canvas sign uses glTF's
flipY=false UV convention. Async failures retain the procedural shell.

## Blender-inspired lighting follow-up

The source preview uses EEVEE, AgX and three large area lights. The game keeps its
existing ACES/outline renderer and matches the neutral cream/sage palette rather
than claiming pixel-identical Blender rendering. Actual WebGPU preview:
`game-lighting-interior.png` (isolated local fixture, existing game furniture).

Found an orange directional light embedded in the arena GLB at intensity 20.49,
plus four point lights. They illuminated Frogstead too. Imported arena lights now
hide only in the neighborhood map and restore their original visibility in arena.
Café key/fill ratios are neutralized; day/night/weather and lamp lighting remain.
Café materials retain authored albedo, without extra warm facet tint or a second
material-level highlight curve. All 80 Config defaults and the user's stroke remain.

11 available regression suites and production build pass. Existing thumbnail
WebGLRenderer export and large-bundle warnings remain unrelated. Lighting client
deployment verification is recorded in `docs/unfrog-next-patch.md`.

## Verification

Inspected exterior and cutaway renders; fixed coplanar wall-trim surfaces.
GLB validator verifies one scene/root, no preview offsets/objects, all modular parts,
opaque materials, UV sign, normals, exact 14×16 floor, triangle/material budgets.
Initial exporter default included every Blender scene; corrected using its inspected
`use_active_scene` property and verified the final asset is shell-only.
Round-trip imported the final GLB into an isolated QA scene: 40 meshes, root at
zero, rendered `cafe-shell-roundtrip.png` and visually checked the actual export.
Blank sign is intentional: the existing player-customized canvas supplies its text.
Temporary round-trip scene removed after verification; final source reopened/framed
in Material Preview. Jev's automatic completion confidence remained uncertain;
main-agent review of both renders, actual GLB round-trip and deterministic validator
confirmed the model-authoring deliverable. The later adapter integration was tested
with the actual GLTF loader, saved wallpaper/sign fixture and public asset hashes.
Blender's automatic `.blend1` source backup is retained. No paid generation used.
