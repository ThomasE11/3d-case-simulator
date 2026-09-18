import { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { getTreatmentBayTransform, type BayPatientStage } from './BodyMesh';
import type { PatientMobility, PatientPosture } from '@/lib/patientStaging';
import { patientExpectedHeightMetres } from '@/lib/patientAgePresentation';

interface AnatomyReferenceLayerProps {
  visible: boolean;
  presentation?: 'upright' | 'treatment-bay';
  stage?: BayPatientStage;
  posture?: PatientPosture;
  mobility?: PatientMobility;
  activeRegion?: string | null;
  patientAge?: number;
  seatedSupportLift?: number;
  plantOffset?: { x?: number; z?: number };
}

function boneMatchesRegion(name: string, region: string | null): boolean {
  if (!region) return true;
  const value = name.toLowerCase();
  if (region === 'face' || region === 'head') {
    return /frontal|parietal|occipital|temporal|sphenoid|ethmoid|maxilla|mandible|zygom|nasal|lacrimal|vomer|concha|tooth|incisor|molar|premolar|canine/.test(value);
  }
  if (region === 'neck-cspine') return /cervical|atlas|axis|hyoid/.test(value);
  if (region === 'chest') return /rib|sternum|thoracic|clavicle|scapula/.test(value);
  if (region === 'abdomen') return /lumbar|rib_?(8|9|10|11|12)|rib.*(8|9|10|11|12)/.test(value);
  if (region === 'pelvis') return /pelvi|hip_bone|sacrum|coccyx/.test(value);
  if (region === 'right-arm') return /humerus|radius|ulna|carpal|metacarpal|phalanx|scaphoid|lunate|triquet|pisiform|trapez|capitate|hamate/.test(value) && /r$|right/.test(value);
  if (region === 'left-arm') return /humerus|radius|ulna|carpal|metacarpal|phalanx|scaphoid|lunate|triquet|pisiform|trapez|capitate|hamate/.test(value) && /l$|left/.test(value);
  if (region === 'right-leg') return /femur|tibia|fibula|patella|tarsal|metatarsal|calcaneus|talus|cuboid|cuneiform|phalanx/.test(value) && /r$|right/.test(value);
  if (region === 'left-leg') return /femur|tibia|fibula|patella|tarsal|metatarsal|calcaneus|talus|cuboid|cuneiform|phalanx/.test(value) && /l$|left/.test(value);
  if (region === 'posterior-logroll') return /vertebra|sacrum|coccyx|scapula|rib/.test(value);
  return true;
}

export function AnatomyReferenceLayer({ visible, presentation = 'upright', stage = 'stretcher', posture = null, mobility = 'recumbent', activeRegion = null, patientAge, seatedSupportLift = 0, plantOffset }: AnatomyReferenceLayerProps) {
  const { scene } = useGLTF('/models/open3d-skeleton.glb');
  const patientScale = patientExpectedHeightMetres(patientAge) / 1.8;

  const anatomyScene = useMemo(() => {
    const clone = cloneSkeleton(scene) as THREE.Group;

    clone.traverse((child) => {
      child.visible = true;
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;
      mesh.raycast = () => null;
      mesh.material = new THREE.MeshBasicMaterial({
        color: '#fff3dc',
        transparent: false,
        opacity: 1,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      mesh.renderOrder = 50;
    });

    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const height = box.max.y - box.min.y;
    if (Number.isFinite(height) && height > 0.5) {
      const targetHeight = patientExpectedHeightMetres(patientAge);
      const modelScale = targetHeight / height;
      const center = box.getCenter(new THREE.Vector3());
      clone.scale.setScalar(modelScale);
      clone.position.set(
        -center.x * modelScale,
        -box.min.y * modelScale,
        -center.z * modelScale,
      );
      clone.updateMatrixWorld(true);
    }

    return clone;
  }, [scene, patientAge]);

  useEffect(() => {
    anatomyScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) child.visible = boneMatchesRegion(child.name, activeRegion);
    });
  }, [activeRegion, anatomyScene]);

  if (!visible) return null;

  const bayTransform = presentation === 'treatment-bay'
    ? getTreatmentBayTransform(stage, posture, mobility, patientScale, seatedSupportLift, plantOffset)
    : { position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 1 };
  const groupPosition: [number, number, number] = [
    bayTransform.position[0],
    bayTransform.position[1],
    bayTransform.position[2] + (presentation === 'treatment-bay' && (activeRegion === 'face' || activeRegion === 'head') ? 0.10 : 0),
  ];

  return (
    <group name="anatomy-reference" position={groupPosition} rotation={bayTransform.rotation} scale={bayTransform.scale}>
      <primitive object={anatomyScene} />
    </group>
  );
}

useGLTF.preload('/models/open3d-skeleton.glb');
