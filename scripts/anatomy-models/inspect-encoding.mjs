// Inspect how the Patient mesh POSITION is stored (Draco? quantized? sparse?)
// so we know whether positions can be decoded in pure Node for lip-band
// measurement, or whether Blender is required.
import { readFileSync } from 'node:fs';

function readGlbJson(path) {
  const buf = readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  return JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
}

for (const path of process.argv.slice(2)) {
  const json = readGlbJson(path);
  console.log(`\n=== ${path} ===`);
  console.log('extensionsUsed:', JSON.stringify(json.extensionsUsed ?? []));
  console.log('extensionsRequired:', JSON.stringify(json.extensionsRequired ?? []));
  const mesh = (json.meshes ?? []).find(m => m.name === 'Patient');
  const prim = mesh?.primitives?.[0];
  if (!prim) { console.log('  no Patient mesh/prim'); continue; }
  console.log('  prim.extensions:', JSON.stringify(prim.extensions ?? {}));
  const posIdx = prim.attributes.POSITION;
  const acc = json.accessors[posIdx];
  console.log('  POSITION accessor:', JSON.stringify({ ...acc, min: undefined, max: undefined, min_: acc.min, max_: acc.max }));
  // Buffer view info if present
  if (acc.bufferView !== undefined) {
    const bv = json.bufferViews[acc.bufferView];
    console.log('  bufferView:', JSON.stringify(bv));
  } else {
    console.log('  POSITION accessor has NO bufferView (Draco/sparse signature)');
  }
  console.log('  prim.attributes:', JSON.stringify(prim.attributes));
  console.log('  target0 POSITION accessor idx:', prim.targets?.[0]?.POSITION);
}
