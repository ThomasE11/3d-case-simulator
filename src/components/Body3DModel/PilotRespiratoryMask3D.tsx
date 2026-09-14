import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
  pilotRespiratoryMaskGeometry,
  createPilotMaskShellGeometry,
  createPilotReservoirGeometry,
  type PilotRespiratoryMaskMode,
  type Point3,
} from './pilotRespiratoryMaskGeometry';

export interface PilotRespiratoryMask3DProps {
  mode: PilotRespiratoryMaskMode;
  position: Point3;
  rotation: Point3;
  scale: number;
  width: number;
  height: number;
  tubeExitOffset: Point3;
}

const NO_RAYCAST = () => null;

export function PilotRespiratoryMask3D({
  mode, position, rotation, scale, width, height, tubeExitOffset,
}: PilotRespiratoryMask3DProps) {
  const [tubeExitX, tubeExitY, tubeExitZ] = tubeExitOffset;
  const spec = useMemo(
    () => pilotRespiratoryMaskGeometry(mode, width, height, [tubeExitX, tubeExitY, tubeExitZ]),
    [height, mode, tubeExitX, tubeExitY, tubeExitZ, width],
  );
  const sealCurve = useMemo(
    () => new THREE.CatmullRomCurve3(spec.seal.map(point => new THREE.Vector3(...point)), true, 'centripetal'),
    [spec.seal],
  );
  const connectorCurve = useMemo(
    () => new THREE.CatmullRomCurve3(spec.connector.map(point => new THREE.Vector3(...point)), false, 'centripetal'),
    [spec.connector],
  );
  const accessoryCurve = useMemo(
    () => new THREE.CatmullRomCurve3(spec.accessoryLink.map(point => new THREE.Vector3(...point)), false, 'centripetal'),
    [spec.accessoryLink],
  );
  const shellGeometry = useMemo(() => createPilotMaskShellGeometry(spec), [spec]);
  useEffect(() => () => shellGeometry.dispose(), [shellGeometry]);
  const reservoirGeometry = useMemo(() => createPilotReservoirGeometry(width, height), [height, width]);
  useEffect(() => () => reservoirGeometry.dispose(), [reservoirGeometry]);
  const reservoirEdges = useMemo(() => new THREE.EdgesGeometry(reservoirGeometry, 24), [reservoirGeometry]);
  useEffect(() => () => reservoirEdges.dispose(), [reservoirEdges]);

  return (
    <group name={`applied-${mode}-mask`} position={position} rotation={rotation} scale={scale} raycast={NO_RAYCAST}>
      <mesh name={`${mode}-face-seal`} raycast={NO_RAYCAST} renderOrder={18}>
        <tubeGeometry args={[sealCurve, 48, 0.0019, 7, true]} />
        <meshPhysicalMaterial color="#d8edf0" transparent opacity={0.9} roughness={0.28} depthWrite />
      </mesh>
      <mesh
        name={`${mode}-contoured-shell`}
        geometry={shellGeometry}
        raycast={NO_RAYCAST}
        renderOrder={17}
      >
        <meshPhysicalMaterial color="#dff2f3" transparent opacity={0.48} roughness={0.2} metalness={0} depthWrite side={THREE.DoubleSide} />
      </mesh>
      <mesh name={`${mode}-accessory-link`} raycast={NO_RAYCAST} renderOrder={19}>
        <tubeGeometry args={[accessoryCurve, 16, 0.0052, 7, false]} />
        <meshStandardMaterial color="#d6e8e5" roughness={0.34} />
      </mesh>
      <mesh name={`${mode}-outlet-collar`} position={spec.accessoryLink[0]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.007, 0.008, 0.008, 16]} />
        <meshStandardMaterial color="#d6e8e5" roughness={0.34} />
      </mesh>

      {mode === 'nonrebreather' ? (
        <group key="reservoir" name="nonrebreather-reservoir" position={[-width * 0.035, -height * 0.11, 0.043]} raycast={NO_RAYCAST}>
          <mesh geometry={reservoirGeometry} renderOrder={16} raycast={NO_RAYCAST}>
            <meshPhysicalMaterial color="#edf4e9" transparent opacity={0.84} roughness={0.62} depthWrite />
          </mesh>
          <lineSegments name="nonrebreather-reservoir-seam" geometry={reservoirEdges} raycast={NO_RAYCAST}>
            <lineBasicMaterial color="#c8d5c6" transparent opacity={0.68} />
          </lineSegments>
          <mesh position={[0, height * 0.27, 0.006]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.008, 0.011, 0.022, 14]} />
            <meshStandardMaterial color="#d8e8df" roughness={0.38} />
          </mesh>
        </group>
      ) : (
        // Distinct keys prevent R3F reusing the reservoir's explicit geometry
        // mesh and resetting the newly attached cup geometry to an empty buffer.
        <group key="medication-cup" name="nebulizer-medication-cup" position={[width * 0.04, -height * 0.15, 0.062]} raycast={NO_RAYCAST}>
          <mesh name="nebulizer-cup-wall" renderOrder={19} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.018, 0.024, 0.052, 18, 1, true]} />
            <meshPhysicalMaterial color="#dff6f3" transparent opacity={0.48} roughness={0.24} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.021, 0]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.020, 0.022, 0.010, 18]} />
            <meshPhysicalMaterial color="#8ed8c0" transparent opacity={0.84} roughness={0.3} depthWrite />
          </mesh>
          <mesh position={[0, 0.035, 0]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.010, 0.014, 0.019, 14]} />
            <meshStandardMaterial color="#dcebea" roughness={0.34} />
          </mesh>
          {[-0.026, 0.026].map(y => (
            <mesh key={`nebulizer-cup-rim-${y}`} name="nebulizer-cup-rim" position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
              <torusGeometry args={[y > 0 ? 0.018 : 0.023, 0.0018, 6, 18]} />
              <meshStandardMaterial color="#c5dedb" roughness={0.36} />
            </mesh>
          ))}
          {[-0.010, 0, 0.010].map(y => (
            <mesh key={`nebulizer-graduation-${y}`} name="nebulizer-cup-graduation" position={[0.019, y, 0.011]} raycast={NO_RAYCAST}>
              <boxGeometry args={[0.006, 0.0012, 0.0012]} />
              <meshStandardMaterial color="#7aa5a0" roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}

      <mesh name={`${mode}-connector`} raycast={NO_RAYCAST} renderOrder={20}>
        <tubeGeometry args={[connectorCurve, 18, 0.0042, 7, false]} />
        <meshPhysicalMaterial color="#d9f7ef" transparent opacity={0.9} roughness={0.3} depthWrite={false} />
      </mesh>
      <group name="pilot-mask-tube-exit" position={[tubeExitX, tubeExitY, tubeExitZ]} raycast={NO_RAYCAST} />
    </group>
  );
}
