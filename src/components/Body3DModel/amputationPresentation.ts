import type { BodyInjury } from '@/lib/injuryMap';

export type ArmAmputationSide = 'right' | 'left';

/**
 * Keep destructive limb presentation explicit and data-driven. The visual
 * rig uses the same clinical injury inference as the assessment layer, but
 * only upper-limb amputations can be represented by the current adult rig.
 */
export function armAmputationSides(injuries: readonly BodyInjury[] = []): ArmAmputationSide[] {
  const sides = new Set<ArmAmputationSide>();
  for (const injury of injuries) {
    if (injury.kind !== 'amputation') continue;
    if (injury.region === 'right-arm') sides.add('right');
    if (injury.region === 'left-arm') sides.add('left');
  }
  return [...sides];
}
