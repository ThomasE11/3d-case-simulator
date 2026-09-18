// Check whether morph-target POSITION deltas (the viseme_open target) are
// Draco-compressed too, or stored as plain buffers we can read in Node. The
// viseme_open delta is non-zero only at the mouth, so if readable it reveals
// each mesh's lip band without decoding the full Draco position buffer.
import { readFileSync } from 'node:fs';

function readGlbJson(path) {
  const buf = readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  return JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
}

for (const path of process.argv.slice(2)) {
  const json = readGlbJson(path);
  const mesh = (json.meshes ?? []).find(m => m.name === 'Patient');
  const prim = mesh?.primitives?.[0];
  const names = mesh?.extras?.targetNames ?? [];
  const visemeIdx = names.findIndex(n => /viseme_open/i.test(n));
  console.log(`\n=== ${path} ===  viseme_open target index: ${visemeIdx}`);
  if (visemeIdx < 0) continue;
  const target = prim.targets?.[visemeIdx];
  const tPosIdx = target?.POSITION;
  console.log('  target POSITION accessor idx:', tPosIdx);
  const acc = json.accessors[tPosIdx];
  if (!acc) { console.log('  (no target POSITION accessor)'); continue; }
  console.log('  accessor:', JSON.stringify(acc));
  if (acc.bufferView !== undefined) {
    const bv = json.bufferViews[acc.bufferView];
    console.log('  bufferView:', JSON.stringify(bv), ' target byteLength:', bv?.byteLength);
  }
}
