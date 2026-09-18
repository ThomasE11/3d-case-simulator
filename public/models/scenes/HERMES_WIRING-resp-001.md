# Hermes wiring brief — resp-001 Al Ain villa (Jutsu rev 6)

## Drop-in GLB
- Source (box): `/workspace/jutsu-villa/resp-001-villa-dressing-rev7.glb` (642720 bytes)
- Target (Mac): `~/Projects/app/public/models/scenes/resp-001-villa-dressing.glb`
- Project: https://higgsfield.ai/3d-jutsu/35130cd0-bfc0-4096-a4e3-19f7f7945918 revision 6

## Semantic empties / custom props (for app grounding — anti bed-float)
| Name | Role | Approx Blender loc (Z-up, m) |
|------|------|------------------------------|
| PatientRestAnchor | primary patient rest (sofa cushion top) | (-1.1, 0.52, 0.91) |
| PatientRestChaiseAnchor | alt rest on chaise | (-3.0, -0.55, 0.91) |
| KitStagingAnchor | EMS kit surface on side table | (~3.6, -0.4, 0.565) |
| FirstAidFindAnchor | find-equipment target | (~4.2, 3.2, 0.67) |

Meshes tagged `ps_role` / `ps_case=resp-001`: `Sofa cushion 1`, `Chaise cushion`, `side_table`, `first_aid_cabinet`.

## Suggested Hermes coding-agent card work
1. Replace/update `public/models/scenes/resp-001-villa-dressing.glb` with rev7 export.
2. Wire patient spawn / seat height to `PatientRestAnchor` (or cushion top_z=0.91) to kill bed-float.
3. Wire find-equipment highlight to `FirstAidFindAnchor` / `first_aid_cabinet`.
4. Commit on `feat/case-dynamics-bidirectional`, push, Vercel preview (not student-workbook).
5. Model: `ds/deepseek-v4-pro` via `custom:9router`.

## Secondary: local Blender MCP :9876
Still needed for DeepSeek Harness workhorse (`uvx blender-mcp==1.8.0`). Addon listen on 127.0.0.1:9876 — not verified this run (executor Shell was box-bound, no ListMachines).
