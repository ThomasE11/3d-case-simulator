/**
 * SceneArrivalChyron — diegetic lower-third announcing arrival on scene.
 *
 * A broadcast-style location card that slides in from the left as the
 * CameraEntrance dollies the student into the scene, holds, then slides out.
 * Presentational only: it never intercepts pointer events and carries no
 * clinical logic. Respects `prefers-reduced-motion` (instant, no slide).
 */
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export interface SceneArrivalChyronProps {
  active: boolean;
  kicker: string;
  title: string;
  sub?: string;
  className?: string;
}

export function SceneArrivalChyron({
  active,
  kicker,
  title,
  sub,
  className = '',
}: SceneArrivalChyronProps) {
  const reducedMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="scene-arrival-chyron"
          data-testid="scene-arrival-chyron"
          role="status"
          aria-label={`${kicker}: ${title}`}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -28, filter: 'blur(4px)' }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -14, filter: 'blur(2px)' }}
          transition={{ duration: reducedMotion ? 0.01 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`scene-arrival-chyron pointer-events-none fixed left-6 top-24 z-30 max-w-[min(22rem,calc(100vw-3rem))] ${className}`}
        >
          <div className="relative overflow-hidden rounded-lg border border-cyan-300/25 bg-slate-950/82 px-4 py-3 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md">
            {/* Accent hairline — reads as a broadcast lower-third rail. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400 via-cyan-300 to-emerald-400"
            />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                {kicker}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-cyan-300/40 to-transparent" />
            </div>
            <h2 className="mt-1.5 text-sm font-bold uppercase tracking-[0.12em] text-white sm:text-base">
              {title}
            </h2>
            {sub && (
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-300/80">
                {sub}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
