export type WoundKind = 'surgical-incision' | 'infected-incision' | 'laceration' | 'abrasion' | 'bruise' | 'burn' | 'active-bleeding' | 'urticaria' | 'soot';

function drawWound(ctx: CanvasRenderingContext2D, kind: WoundKind, cx: number, cy: number, sizePx: number, rotationRad?: number): void {
  ctx.save();
  ctx.translate(cx, cy);
  if (rotationRad) ctx.rotate(rotationRad);

  let s = (cx * 31 + cy * 17) >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

  switch (kind) {
    case 'surgical-incision':
      ctx.strokeStyle = '#8B0000';
      ctx.lineWidth = sizePx * 0.03;
      ctx.beginPath();
      ctx.moveTo(-sizePx, 0);
      ctx.lineTo(sizePx, 0);
      ctx.stroke();

      for (let i = -sizePx; i <= sizePx; i += sizePx * 0.12) {
        ctx.beginPath();
        ctx.moveTo(i, -sizePx * 0.05);
        ctx.lineTo(i, sizePx * 0.05);
        ctx.stroke();
      }

      const incisionGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sizePx * 1.2);
      incisionGradient.addColorStop(0, 'rgba(255, 99, 71, 0.3)');
      incisionGradient.addColorStop(1, 'rgba(255, 99, 71, 0)');
      ctx.fillStyle = incisionGradient;
      ctx.fillRect(-sizePx * 1.2, -sizePx * 1.2, sizePx * 2.4, sizePx * 2.4);
      break;

    case 'infected-incision':
      // Similar to surgical-incision but with a wider halo and yellowish spots
      ctx.strokeStyle = '#FF6347';
      ctx.lineWidth = sizePx * 0.05;
      ctx.beginPath();
      ctx.moveTo(-sizePx, 0);
      ctx.lineTo(sizePx, 0);
      ctx.stroke();

      for (let i = -sizePx; i <= sizePx; i += sizePx * 0.12) {
        ctx.beginPath();
        ctx.moveTo(i, -sizePx * 0.05);
        ctx.lineTo(i, sizePx * 0.05);
        ctx.stroke();
      }

      const infectedGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sizePx * 1.4);
      infectedGradient.addColorStop(0, 'rgba(255, 99, 71, 0.6)');
      infectedGradient.addColorStop(1, 'rgba(255, 99, 71, 0)');
      ctx.fillStyle = infectedGradient;
      ctx.fillRect(-sizePx * 1.4, -sizePx * 1.4, sizePx * 2.8, sizePx * 2.8);

      for (let i = 0; i < 6; i++) {
        const angle = rand() * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * sizePx * 0.42, Math.sin(angle) * sizePx * 0.62, sizePx * (0.025 + rand() * 0.025), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(235, 218, 154, 0.82)';
        ctx.fill();
      }
      break;

    case 'laceration':
      // Jagged polyline with seeded jitter
      ctx.strokeStyle = '#8B0000';
      ctx.lineWidth = sizePx * 0.03;
      ctx.beginPath();
      ctx.moveTo(-sizePx, 0);
      for (let i = -sizePx; i <= sizePx; i += sizePx / 6) {
        const jitter = rand() * sizePx * 0.1 - sizePx * 0.05;
        ctx.lineTo(i + jitter, Math.sin(i / sizePx) * sizePx * 0.2);
      }
      ctx.stroke();

      ctx.strokeStyle = '#4B0082';
      ctx.lineWidth = sizePx * 0.02;
      ctx.beginPath();
      ctx.moveTo(-sizePx, 0);
      for (let i = -sizePx; i <= sizePx; i += sizePx / 6) {
        const jitter = rand() * sizePx * 0.1 - sizePx * 0.05;
        ctx.lineTo(i + jitter, Math.sin(i / sizePx) * sizePx * 0.2);
      }
      ctx.stroke();

      const lacerationGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sizePx * 1.6);
      lacerationGradient.addColorStop(0, 'rgba(139, 0, 0, 0.2)');
      lacerationGradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
      ctx.fillStyle = lacerationGradient;
      ctx.fillRect(-sizePx * 1.6, -sizePx * 1.6, sizePx * 3.2, sizePx * 3.2);
      break;

    case 'abrasion':
      // Small seeded dots/short strokes inside an ellipse area
      for (let i = 0; i < 25; i++) {
        const angle = rand() * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * sizePx * 0.8, Math.sin(angle) * sizePx * 0.6, sizePx * 0.03, 0, Math.PI * 2);
        ctx.fillStyle = '#A52A2A';
        ctx.fill();
      }

      const abrasionGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, sizePx * 1.6);
      abrasionGradient.addColorStop(0, 'rgba(165, 42, 42, 0.3)');
      abrasionGradient.addColorStop(1, 'rgba(165, 42, 42, 0)');
      ctx.fillStyle = abrasionGradient;
      ctx.fillRect(-sizePx * 1.6, -sizePx * 1.6, sizePx * 3.2, sizePx * 3.2);
      break;

    case 'bruise':
      // Three concentric ellipse fills
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#800080';
      ctx.beginPath();
      ctx.ellipse(0, 0, sizePx * 0.4, sizePx * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ADD8E6';
      ctx.beginPath();
      ctx.ellipse(0, 0, sizePx * 0.5, sizePx * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#90EE90';
      ctx.beginPath();
      ctx.ellipse(0, 0, sizePx * 0.6, sizePx * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'active-bleeding': {
      // A distinct, unmistakable "this wound is bleeding NOW" sprite: a dark
      // red core with bright fresnel edge, plus drip droplets trailing DOWN the
      // body (negative canvas Y = up in UV space after flipY, so we nudge the
      // drips toward +Y to read as gravity for the standard front view).
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, sizePx * 0.55);
      core.addColorStop(0, 'rgba(120, 8, 12, 0.95)');
      core.addColorStop(0.72, 'rgba(150, 16, 22, 0.85)');
      core.addColorStop(1, 'rgba(180, 30, 30, 0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.ellipse(0, 0, sizePx * 0.55, sizePx * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      const halo = ctx.createRadialGradient(0, 0, sizePx * 0.5, 0, 0, sizePx * 1.1);
      halo.addColorStop(0, 'rgba(190, 34, 34, 0.60)');
      halo.addColorStop(1, 'rgba(190, 34, 34, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, sizePx * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Wet shine on the wound face.
      ctx.strokeStyle = 'rgba(255, 140, 120, 0.55)';
      ctx.lineWidth = sizePx * 0.04;
      ctx.beginPath();
      ctx.ellipse(-sizePx * 0.08, -sizePx * 0.16, sizePx * 0.22, sizePx * 0.09, -0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Drips down the limb — gravity direction.
      for (let i = 0; i < 6; i++) {
        const dx = (rand() - 0.5) * sizePx * 0.9;
        const len = sizePx * (0.3 + rand() * 0.75);
        ctx.strokeStyle = `rgba(110, 8, 12, ${0.55 + rand() * 0.35})`;
        ctx.lineWidth = sizePx * (0.06 + rand() * 0.05);
        ctx.beginPath();
        ctx.moveTo(dx, sizePx * 0.2);
        ctx.lineTo(dx + (rand() - 0.5) * sizePx * 0.25, sizePx * 0.2 + len);
        ctx.stroke();
        // Drop at the drip tip.
        ctx.beginPath();
        ctx.arc(dx + (rand() - 0.5) * sizePx * 0.2, sizePx * 0.2 + len + sizePx * 0.06, sizePx * 0.07, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120, 12, 14, 0.9)';
        ctx.fill();
      }
      break;
    }

    case 'soot': {
      // Carbon deposits around the nose and mouth after smoke exposure — the
      // sign that turns a burn into a suspected inhalation injury. Reads as a
      // grubby stipple that thins outward, not a solid grey patch.
      const smudge = ctx.createRadialGradient(0, 0, 0, 0, 0, sizePx * 1.2);
      smudge.addColorStop(0, 'rgba(38, 34, 32, 0.5)');
      smudge.addColorStop(0.55, 'rgba(38, 34, 32, 0.24)');
      smudge.addColorStop(1, 'rgba(38, 34, 32, 0)');
      ctx.fillStyle = smudge;
      ctx.fillRect(-sizePx * 1.2, -sizePx * 1.2, sizePx * 2.4, sizePx * 2.4);

      const specks = 26 + Math.floor(rand() * 14);
      for (let i = 0; i < specks; i++) {
        const angle = rand() * Math.PI * 2;
        // Denser at the centre, sparse at the edges.
        const dist = rand() * rand() * sizePx * 1.1;
        ctx.beginPath();
        ctx.arc(
          Math.cos(angle) * dist,
          Math.sin(angle) * dist,
          sizePx * (0.015 + rand() * 0.045),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(26, 23, 21, ${0.3 + rand() * 0.45})`;
        ctx.fill();
      }
      break;
    }

    case 'urticaria': {
      // Urticaria reads as PALE raised wheals sitting on a red flare — not a
      // uniform red patch. Draw the diffuse erythema first, then scatter
      // blanched wheals with soft red margins on top of it.
      const flare = ctx.createRadialGradient(0, 0, 0, 0, 0, sizePx * 1.5);
      flare.addColorStop(0, 'rgba(214, 74, 74, 0.42)');
      flare.addColorStop(0.6, 'rgba(214, 74, 74, 0.22)');
      flare.addColorStop(1, 'rgba(214, 74, 74, 0)');
      ctx.fillStyle = flare;
      ctx.fillRect(-sizePx * 1.5, -sizePx * 1.5, sizePx * 3, sizePx * 3);

      const wheals = 7 + Math.floor(rand() * 5);
      for (let i = 0; i < wheals; i++) {
        // Bias toward the centre so the patch has a dense core and soft edges.
        const angle = rand() * Math.PI * 2;
        const dist = (rand() * 0.55 + rand() * 0.45) * sizePx;
        const wx = Math.cos(angle) * dist;
        const wy = Math.sin(angle) * dist * 0.8;
        const wr = sizePx * (0.12 + rand() * 0.16);

        ctx.beginPath();
        ctx.ellipse(wx, wy, wr, wr * (0.7 + rand() * 0.5), rand() * Math.PI, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(226, 160, 150, 0.55)';
        ctx.fill();
        ctx.lineWidth = sizePx * 0.02;
        ctx.strokeStyle = 'rgba(190, 60, 60, 0.5)';
        ctx.stroke();
      }
      break;
    }

    case 'burn': {
      // A second-degree burn is not one colour. From centre out: charred
      // black eschar, a raised pale blister ring, then an erythematous flare
      // that fades into surrounding skin. The old sprite was a flat orange
      // blob with eight cream dots — it read as a decal, not a wound, which
      // is exactly what the burn-001 audit flagged.
      // 1. Deep eschar core — irregular, not a circle.
      ctx.strokeStyle = '#2B0E0A';
      ctx.lineWidth = sizePx * 0.04;
      ctx.beginPath();
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const r = sizePx * (0.42 + rand() * 0.16);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r * 0.78;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = '#3A140C';
      ctx.fill();
      ctx.stroke();

      // Charred cross-hatch — cracked eschar reads as burnt, not bruised.
      ctx.strokeStyle = 'rgba(80, 30, 20, 0.7)';
      ctx.lineWidth = sizePx * 0.012;
      for (let i = 0; i < 5; i++) {
        const a = rand() * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * sizePx * 0.5, Math.sin(a) * sizePx * 0.4);
        ctx.lineTo(Math.cos(a + Math.PI) * sizePx * 0.5, Math.sin(a + Math.PI) * sizePx * 0.4);
        ctx.stroke();
      }

      // 2. Pale blister ring — raised, wet-looking, sitting on the eschar.
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#F3E4C0';
      for (let i = 0; i < 9; i++) {
        const a = rand() * Math.PI * 2;
        const r = sizePx * (0.18 + rand() * 0.28);
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r, Math.sin(a) * r * 0.78, sizePx * (0.05 + rand() * 0.04), 0, Math.PI * 2);
        ctx.fill();
      }
      // Blister shine.
      ctx.strokeStyle = 'rgba(255, 255, 235, 0.55)';
      ctx.lineWidth = sizePx * 0.015;
      ctx.beginPath();
      ctx.arc(-sizePx * 0.06, -sizePx * 0.05, sizePx * 0.07, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // 3. Erythematous flare fading outward — warm red, not orange.
      const flare = ctx.createRadialGradient(0, 0, sizePx * 0.3, 0, 0, sizePx * 1.9);
      flare.addColorStop(0, 'rgba(196, 30, 24, 0.55)');
      flare.addColorStop(0.5, 'rgba(210, 58, 40, 0.28)');
      flare.addColorStop(1, 'rgba(210, 58, 40, 0)');
      ctx.fillStyle = flare;
      ctx.fillRect(-sizePx * 1.9, -sizePx * 1.9, sizePx * 3.8, sizePx * 3.8);

      // 4. Soot stipple at the wound edge — inhalation-injury tell that
      // pairs with the separate 'soot' sprite when both are authored.
      for (let i = 0; i < 14; i++) {
        const a = rand() * Math.PI * 2;
        const dist = rand() * sizePx * 1.3;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist * 0.78, sizePx * (0.01 + rand() * 0.025), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30, 24, 20, ${0.25 + rand() * 0.3})`;
        ctx.fill();
      }
      break;
    }
  }

  ctx.restore();
}

export { drawWound };
