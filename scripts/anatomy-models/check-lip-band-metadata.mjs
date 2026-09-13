// Metadata-only mouth-band check: the POSITION accessor's min/max are stored
// in the JSON even for Draco-compressed meshes, so we can read crown/feet Y
// without decoding. Reports whether the adult-male lip band (Y 1.536–1.5585)
// falls inside each mesh's overall Y range, and how the crown height differs.
import { readFileSync } from 'node:fs';

function readGlbJson(path) {
  const buf = readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  return JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
}

const LIP_Y_MIN = 1.536, LIP_Y_MAX = 1.5585;

for (const path of process.argv.slice(2)) {
  const json = readGlbJson(path);
  const mesh = (json.meshes ?? []).find(m => m.name === 'Patient');
  if (!mesh) { console.log(`${path}: no Patient mesh`); continue; }
  const posIdx = mesh.primitives[0].attributes.POSITION;
  const acc = json.accessors[posIdx];
  const [minX, minY, minZ] = acc.min;
  const [maxX, maxY, maxZ] = acc.max;
  const lipBandInside = minY <= LIP_Y_MAX && maxY >= LIP_Y_MIN;
  console.log(
    `${path}\n  Patient Y range [${minY.toFixed(3)}, ${maxY.toFixed(3)}]  crown≈${maxY.toFixed(3)}m  ` +
    `adult-lip-band(Y 1.536–1.5585) overlaps: ${lipBandInside ? 'YES' : 'NO'}`,
  );
}
