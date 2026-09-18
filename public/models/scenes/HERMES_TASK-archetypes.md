# Hermes coding-agent task (create on Mac mini)

**Board:** `~/.hermes/kanban/boards/paramedic-studio`  
**Assignee:** coding-agent  
**Model:** `ds/deepseek-v4-pro` @ `custom:9router`  
**Workdir:** `~/Projects/app`  
**Branch:** `feat/case-dynamics-bidirectional`

## Title
Integrate Higgsfield archetype GLBs + trauma-008 dispatch art + bay UI polish

## Body
Continue ParaMedic Studio 3D realism after executor handoff (2026-09-18 GST):

1. Sync / cherry-pick wiring from box clone if not already on Mac:
   - `public/models/scenes/y2-007-od-bedroom.glb` (+ assets.json)
   - `public/models/scenes/trauma-008-roadside-mvc.glb` (+ assets.json)
   - `public/models/scenes/bathroom-fall.glb` (+ assets.json)
   - `src/components/Body3DModel/Environment/sceneRegistry.ts`
   - `src/components/Body3DModel/Environment/ArchetypeSceneDressing.tsx`
   - updates to `sceneProfile.ts`, `SceneVariant.tsx`, `Body3DModel/index.tsx`, tests

2. Verify bay: y2-007 loads bedroom bed dressing; trauma-008 shows catalog sedan; resp-001 villa unchanged.

3. Fix trauma-008 SceneSurvey image (female pelvic trauma, externally rotated left leg) via cheap Higgsfield `generate_image` with get_cost:true first — replace `public/scene-assets/pedestrian-road-night.png` or case-specific path.

4. Bay UI polish per REALISM_EXECUTION_DIRECTIVE — do not cover mannequin controls.

5. Deploy preview to Vercel alias `app-three-gamma-88` when milestone lands; comment SHA + URL on this card.

## Higgsfield projectIds
- villa resp-001: `35130cd0-bfc0-4096-a4e3-19f7f7945918` rev 3
- bedroom y2-007: `e322ce53-08ff-4171-a05d-f1d50d2324f1` rev 3
- roadside trauma-008: `362542eb-eed5-422d-99e4-e3a58f0377c8` rev 3
- bathroom fall: `80420c68-cfc6-48a0-b5f3-02638c0c5d4a` rev 2
