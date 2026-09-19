/**
 * AmbientAudioLayer — R3F bridge for the procedural villa ambience.
 *
 * Mounts the room tone, AC hum and patient breath emitters from
 * `createAmbientAudio()` into the scene graph, parents the THREE.AudioListener
 * to the active camera (so positional audio tracks the student's viewpoint),
 * and keeps the breath loop in sync with the case's respiratory rate and
 * auscultation findings as vitals evolve.
 *
 * Gating:
 * - Mounts for every rendered environment variant. The home/villa variant
 *    keeps its dedicated roomTone + AC hum + patient breath stack; every
 *    outdoor variant additionally gets a synthesized scene bed (traffic,
 *    water, fire crackle, worksite rumble) so the scene sounds like the
 *    place it draws instead of being silent.
 * - Respects the global voice-enabled preference the same way narration
 *    does; if the student muted voice, the whole soundscape goes silent.
 * - Tears down fully on unmount (stop + disconnect + listener detach).
 */

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createAmbientAudio,
  DEFAULT_AMBIENT_PATIENT_POSITION,
  type AmbientAudioPosition,
  type AmbientAudioState,
  type AmbientBreathKind,
} from '@/lib/ambientAudio';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';
import {
  getVoiceEnabledPreference,
  subscribeVoiceEnabledPreference,
} from '@/hooks/useVoiceNarration';

export function bindAmbientAudioToVoicePreference(
  state: Pick<AmbientAudioState, 'setEnabled'>,
): () => void {
  return subscribeVoiceEnabledPreference(state.setEnabled);
}

interface AmbientAudioLayerProps {
  active: boolean;
  variant: EnvironmentVariant;
  breathKind: AmbientBreathKind;
  breathRpm: number;
  patientPosition?: AmbientAudioPosition;
}

export function AmbientAudioLayer({
  active,
  variant,
  breathKind,
  breathRpm,
  patientPosition = DEFAULT_AMBIENT_PATIENT_POSITION,
}: AmbientAudioLayerProps) {
  const camera = useThree((s) => s.camera);
  const groupRef = useRef<THREE.Group>(null);
  const stateRef = useRef<AmbientAudioState | null>(null);
  const [patientX, patientY, patientZ] = patientPosition;

  useEffect(() => {
    if (!active) return undefined;
    const state = createAmbientAudio({
      enabled: getVoiceEnabledPreference(),
      variant,
      patientPosition: [patientX, patientY, patientZ],
    });
    stateRef.current = state;
    const unsubscribeVoicePreference = bindAmbientAudioToVoicePreference(state);
    camera.add(state.listener);
    const group = groupRef.current;
    if (group) {
      group.add(state.roomTone);
      group.add(state.ac);
      group.add(state.patient);
    }
    state.setPatientBreath(breathKind, breathRpm);
    return () => {
      unsubscribeVoicePreference();
      state.dispose();
      stateRef.current = null;
    };
    // Mount/unmount only on presentation/variant/camera changes. Breath
    // updates flow through the effect below without re-creating buffers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, variant, camera]);

  useEffect(() => {
    stateRef.current?.setPatientBreath(breathKind, breathRpm);
  }, [breathKind, breathRpm]);

  useEffect(() => {
    stateRef.current?.setPatientPosition([patientX, patientY, patientZ]);
  }, [patientX, patientY, patientZ]);

  return <group ref={groupRef} />;
}
