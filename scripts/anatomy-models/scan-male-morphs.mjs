// Minimal GLB inspector (no gltf-transform dependency): read the JSON chunk
// and report each mesh's name + morph target names. GLB layout:
//   bytes 0-11   header (magic 0x46546C67, version, total length)
//   chunk 0      JSON (type 0x4E4F534A)
//   chunk 1      BIN  (type 0x004E4942)
import { readFileSync } from 'node:fs';

function readGlbJson(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error(`not a GLB: ${path}`);
  // total length
  // chunk 0 is always JSON
  const jsonLen = buf.readUInt32LE(12);
  const jsonType = buf.readUInt32LE(16);
  if (jsonType !== 0x4e4f534a) throw new Error(`chunk0 not JSON: ${path}`);
  const json = buf.toString('utf8', 20, 20 + jsonLen);
  return JSON.parse(json);
}

const paths = process.argv.slice(2);

for (const path of paths) {
  const gltf = readGlbJson(path);
  console.log(`\n=== ${path} ===`);
  const meshes = gltf.meshes ?? [];
  for (const mesh of meshes) {
    const meshName = mesh.name || '(unnamed)';
    const targetNames = mesh.extras?.targetNames ?? [];
    const primTargets = mesh.primitives?.[0]?.targets ?? [];
    const hasViseme = targetNames.some(n => /viseme_open/i.test(n));
    console.log(
      `  mesh "${meshName}" — ${primTargets.length} morph targets${hasViseme ? '  [HAS viseme_open]' : ''}`,
    );
    if (targetNames.length > 0) {
      console.log(`    targetNames: ${targetNames.join(', ')}`);
    }
  }
  const names = new Set(meshes.map(m => m.name || '(unnamed)'));
  console.log(`  distinct mesh names: ${[...names].join(', ')}`);
}
