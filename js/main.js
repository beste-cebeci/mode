/* ============================================================
   MEMOIRS OF DISAPPEARING EARTH — js/main.js
   ============================================================
   1. Nav scroll behaviour
   2. Ancient symbol + strata animation
   3. Audio toggle
   4. Scroll reveal
   5. Scroll hint fade
   ============================================================ */


/* ── 1. NAV ─────────────────────────────────────────────────── */
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ── 2. CANVAS ANIMATION ────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, T = 0, animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── Smooth value noise ── */
  function hash(n) {
    const x = Math.sin(n) * 43758.5453;
    return x - Math.floor(x);
  }
  function smoothNoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash(ix     + iy * 57);
    const b = hash(ix + 1 + iy * 57);
    const c = hash(ix     + (iy + 1) * 57);
    const d = hash(ix + 1 + (iy + 1) * 57);
    return a + (b-a)*ux + (c-a)*uy + (d-a+a-b-c+b)*ux*uy;
  }

  /* ── STRATA LINES ──
     Slow horizontal breathing layers — geological, waveform-like.
  */
  class StrataLine {
    constructor(i, total) {
      this.y     = H * 0.06 + (i / total) * H * 0.88;
      this.amp   = 4 + Math.random() * 16;
      this.freq  = 0.0012 + Math.random() * 0.002;
      this.speed = 0.00010 + Math.random() * 0.00008;
      this.phase = Math.random() * Math.PI * 2;
      this.alpha = 0.06 + Math.random() * 0.10;
      this.w     = 0.28 + Math.random() * 0.26;
    }
    draw(t) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = this.y
          + Math.sin(x * this.freq + t * this.speed + this.phase) * this.amp
          + Math.sin(x * this.freq * 0.36 + t * this.speed * 0.52) * this.amp * 0.35;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${this.alpha})`;
      ctx.lineWidth   = this.w;
      ctx.stroke();
    }
  }

  /* ── SYMBOL BUILDER ──
     8 ancient mark types drawn as continuous pen paths.
     NaN = pen lift between sub-paths.
  */
  function buildSymbol(type, cx, cy, r) {
    const pts = [];

    if (type === 'spiral') {
      /* Inward spiral — universal Paleolithic mark */
      for (let i = 0; i <= 240; i++) {
        const a  = (i / 240) * Math.PI * 2 * 3.2;
        const rr = r * (i / 240);
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
    }

    else if (type === 'arcs') {
      /* Nested concentric arcs — tree rings / geological cross-section */
      for (let ring = 1; ring <= 5; ring++) {
        const rr = r * (ring / 5);
        for (let i = 0; i <= 52; i++) {
          const a = -Math.PI * 0.75 + (i / 52) * Math.PI * 1.5;
          pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.5]);
        }
        pts.push([NaN, NaN]);
      }
    }

    else if (type === 'dots') {
      /* Cupule dot cluster — Bhimbetka rock shelters */
      [
        [0,-r*0.1],[r*0.55,r*0.28],[-r*0.48,r*0.32],
        [r*0.12,-r*0.52],[r*0.6,-r*0.22],[-r*0.52,-r*0.18],
        [-r*0.08,r*0.62],[r*0.32,r*0.66]
      ].forEach(([dx, dy]) => {
        const rr = r * 0.085;
        for (let i = 0; i <= 20; i++) {
          const a = (i / 20) * Math.PI * 2;
          pts.push([cx+dx+Math.cos(a)*rr, cy+dy+Math.sin(a)*rr]);
        }
        pts.push([NaN, NaN]);
      });
    }

    else if (type === 'tallies') {
      /* Tally marks — Ishango bone counting system (~20,000 BC) */
      for (let i = 0; i < 6; i++) {
        const x = cx - r*0.7 + (i/5)*r*1.4;
        pts.push([x, cy - r*0.6]);
        pts.push([x, cy + r*0.6]);
        pts.push([NaN, NaN]);
      }
      /* diagonal cross mark */
      pts.push([cx - r*0.82, cy - r*0.32]);
      pts.push([cx + r*0.82, cy + r*0.32]);
      pts.push([NaN, NaN]);
    }

    else if (type === 'circle') {
      /* Circle with centre dot — universal ancient form */
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 2;
        pts.push([cx + Math.cos(a)*r, cy + Math.sin(a)*r*0.88]);
      }
      pts.push([NaN, NaN]);
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        pts.push([cx + Math.cos(a)*r*0.14, cy + Math.sin(a)*r*0.14]);
      }
    }

    else if (type === 'delta') {
      /* River delta / root system — branching living systems */
      pts.push([cx, cy + r]);
      pts.push([cx, cy + r*0.1]);
      pts.push([NaN, NaN]);
      [
        [[cx,cy+r*0.1],[cx-r*0.65,cy-r*0.55]],
        [[cx,cy+r*0.1],[cx+r*0.58,cy-r*0.5]],
        [[cx,cy+r*0.1],[cx-r*0.14,cy-r*0.7]],
        [[cx-r*0.65,cy-r*0.55],[cx-r*0.95,cy-r*1.05]],
        [[cx-r*0.65,cy-r*0.55],[cx-r*0.28,cy-r*0.98]],
        [[cx+r*0.58,cy-r*0.5],[cx+r*0.9,cy-r*1.02]],
        [[cx+r*0.58,cy-r*0.5],[cx+r*0.22,cy-r*0.96]],
        [[cx-r*0.14,cy-r*0.7],[cx-r*0.14,cy-r*1.12]],
      ].forEach(([a, b]) => {
        pts.push(a); pts.push(b); pts.push([NaN, NaN]);
      });
    }

    else if (type === 'rays') {
      /* Radiating lines — abstracted handprint / sun */
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI * 0.5;
        pts.push([cx + Math.cos(a)*r*0.18, cy + Math.sin(a)*r*0.18]);
        pts.push([cx + Math.cos(a)*r,      cy + Math.sin(a)*r]);
        pts.push([NaN, NaN]);
      }
    }

    else if (type === 'meander') {
      /* Meander — ancient water / time symbol, universal */
      for (let i = 0; i <= 64; i++) {
        const t = i / 64;
        pts.push([
          cx - r + t * r * 2,
          cy + Math.sin(t*Math.PI*5)*r*0.42
             + Math.sin(t*Math.PI*2.2)*r*0.22
        ]);
      }
    }

    return pts;
  }

  /* ── SYMBOL INSTANCE ── */
  const TYPES = ['spiral','arcs','dots','tallies','circle','delta','rays','meander'];

  class Symbol {
    constructor(delay) {
      this.delay = delay || 0;
      this.reset();
    }

    reset() {
      this.type  = TYPES[Math.floor(Math.random() * TYPES.length)];
      /* Large — like the mountain drawing in the reference images */
      this.r     = 65 + Math.random() * 90;
      /* Place in margins — avoid centre where title lives */
      const zones = [
        [0.05, 0.22, 0.08, 0.88],   /* left */
        [0.76, 0.95, 0.08, 0.88],   /* right */
        [0.22, 0.76, 0.06, 0.24],   /* top centre */
        [0.22, 0.76, 0.76, 0.94],   /* bottom centre */
      ];
      const z   = zones[Math.floor(Math.random() * zones.length)];
      this.cx   = W * (z[0] + Math.random() * (z[1] - z[0]));
      this.cy   = H * (z[2] + Math.random() * (z[3] - z[2]));
      this.pts  = buildSymbol(this.type, this.cx, this.cy, this.r);
      this.total      = this.pts.length;
      this.drawn      = 0;
      this.drawSpeed  = 0.10 + Math.random() * 0.10;  /* slow hand-trace */
      this.maxAlpha   = 0.22 + Math.random() * 0.18;
      this.alpha      = 0;
      this.state      = this.delay > 0 ? 'waiting' : 'drawing';
      this.waitLeft   = this.delay;
      this.holdFor    = 300 + Math.random() * 500;
      this.holdT      = 0;
      this.fadeSpeed  = 0.0007 + Math.random() * 0.0005;
    }

    update() {
      if (this.state === 'waiting') {
        this.waitLeft--;
        if (this.waitLeft <= 0) this.state = 'drawing';
        return;
      }
      if (this.state === 'drawing') {
        this.drawn += this.drawSpeed;
        this.alpha  = Math.min(this.maxAlpha, this.alpha + 0.003);
        if (this.drawn >= this.total) {
          this.drawn = this.total;
          this.state = 'holding';
        }
      }
      else if (this.state === 'holding') {
        this.holdT++;
        if (this.holdT >= this.holdFor) this.state = 'fading';
      }
      else if (this.state === 'fading') {
        this.alpha -= this.fadeSpeed;
        if (this.alpha <= 0) this.reset();
      }
    }

    draw() {
      if (this.state === 'waiting' || this.alpha <= 0.002) return;
      ctx.save();
      ctx.strokeStyle = `rgba(255,255,255,${this.alpha})`;
      ctx.lineWidth   = 0.9;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      let penDown = false;
      const end = Math.floor(this.drawn);
      for (let i = 0; i < end && i < this.pts.length; i++) {
        const p = this.pts[i];
        if (isNaN(p[0])) { penDown = false; continue; }
        if (!penDown) { ctx.moveTo(p[0], p[1]); penDown = true; }
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ── SETUP ── */
  let strata, symbols;

  function init() {
    strata  = Array.from({ length: 18 }, (_, i) => new StrataLine(i, 18));
    symbols = Array.from({ length: 6  }, (_, i) => new Symbol(i * 110));
  }

  function loop() {
    /* Clear fully — marble always shows through */
    ctx.clearRect(0, 0, W, H);
    T++;
    strata.forEach(s => s.draw(T));
    symbols.forEach(s => { s.update(); s.draw(); });
    animId = requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
  init();
  loop();

  /* Pause when tab hidden */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else loop();
  });
})();


/* ── 3. AUDIO TOGGLE ────────────────────────────────────────── */
(function initAudio() {
  const btn   = document.getElementById('audio-btn');
  const audio = document.getElementById('synth-audio');
  if (!btn || !audio) return;

  const waveSpans = [
    ...document.querySelectorAll('#wave-l span'),
    ...document.querySelectorAll('#wave-r span'),
  ];
  const delays = [0, 0.11, 0.06, 0.18, 0.04, 0.14, 0.09];
  let isOn = false;

  btn.addEventListener('click', () => {
    isOn = !isOn;
    btn.classList.toggle('is-on', isOn);
    btn.setAttribute('aria-pressed', String(isOn));

    if (isOn) {
      audio.play().catch(() => {
        /* audio file not yet added — button still animates */
      });
      waveSpans.forEach((s, i) => {
        const dur = (0.62 + (i % 3) * 0.14).toFixed(2);
        const del = delays[i % 7].toFixed(2);
        s.style.animation = `wvanim ${dur}s ease-in-out ${del}s infinite`;
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
      waveSpans.forEach(s => {
        s.style.animation = 'none';
        s.style.height    = '3px';
      });
    }
  });
})();


/* ── 4. SCROLL REVEAL ───────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.12 }
  );
  els.forEach(el => observer.observe(el));
})();


/* ── 5. SCROLL HINT FADE ────────────────────────────────────── */
(function initScrollHint() {
  const hint = document.getElementById('scroll-hint');
  if (!hint) return;
  hint.style.transition = 'opacity 0.5s ease';
  window.addEventListener('scroll', () => {
    hint.style.opacity = window.scrollY > 80 ? '0' : '1';
  }, { passive: true });
})();
