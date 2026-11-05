
/* ============================================================
   PixelBackground: animated pixel-dot field
   Usage:
     const bg = new PixelBackground(document.getElementById('bg'), {
       accent: [52, 230, 130]   // RGB of the coloured dots
     });
     bg.setAccent([77, 141, 255]);  // change colour later
     bg.destroy();                  // stop and clean up
   Options (all optional):
     background  CSS colour of the page      default '#070709'
     accent      [r,g,b] coloured dots        default green
     neutral     [r,g,b] gray/white dots      default [190,190,200]
     pitch       distance between dots (px)   default 10.5
     size        size of each dot (px)        default 5.1
     speed       animation speed multiplier   default 1
     cursorGlow  dots near mouse light up     default true (set false to remove)
     cursorRadius size of the mouse effect(px) default 60
     accentRatio  share of coloured dots (0-1)  default 0.3 (always held on screen)
   ============================================================ */
class PixelBackground {
  constructor(canvas, opts = {}) {
    this.c = canvas;
    this.x = canvas.getContext('2d');
    this.o = Object.assign({
      background: '#070709', accent: [52, 230, 130], neutral: [190, 190, 200],
      pitch: 10.5, size: 5.1, speed: 1, cursorGlow: true, cursorRadius: 60, accentRatio: 0.3
    }, opts);
    this.mx = -999; this.my = -999; this.raf = 0;
    this._move = e => {
      const r = this.c.getBoundingClientRect();
      this.mx = e.clientX - r.left; this.my = e.clientY - r.top;
    };
    this._resize = () => this.resize();
    window.addEventListener('pointermove', this._move);
    window.addEventListener('resize', this._resize);
    this.resize();
    this._loop = ms => { this.draw(ms / 1000 * this.o.speed); this.raf = requestAnimationFrame(this._loop); };
    this.raf = requestAnimationFrame(this._loop);
  }
  setAccent(rgb) { this.o.accent = rgb; }
  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('pointermove', this._move);
    window.removeEventListener('resize', this._resize);
  }
  resize() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    this.W = this.c.clientWidth; this.H = this.c.clientHeight;
    this.c.width = this.W * d; this.c.height = this.H * d;
    this.x.setTransform(d, 0, 0, d, 0, 0);
    this.cols = Math.ceil(this.W / this.o.pitch);
    this.rows = Math.ceil(this.H / this.o.pitch);
    const n = this.cols * this.rows;
    this.bx = new Float32Array(n); this.by = new Float32Array(n);
    this.ba = new Float32Array(n); this.bs = new Float32Array(n);
  }
  hash(i, j, k) { const n = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return n - Math.floor(n); }
  field(u, v, t) {
    return Math.sin(u * 5 + t * .55) + Math.sin(v * 4.2 - t * .4 + 1.3) + Math.sin((u + v) * 3.1 + t * .3)
      + Math.sin(Math.hypot(u - .5, v - .4) * 7 - t * .5) + Math.sin(u * 9 - v * 6 + t * .2) * .5;
  }
  draw(t) {
    const { x, W, H, cols, rows, bx, by, ba, bs } = this, o = this.o, P = o.pitch, S = o.size;
    const A = o.accent, N = o.neutral, step = Math.floor(t * 3), R = o.cursorRadius;
    x.fillStyle = o.background; x.fillRect(0, 0, W, H);

    // Pass 1: work out which dots are visible this frame and give each a colour score
    let n = 0;
    const bins = new Uint32Array(256);
    for (let j = 0; j < rows; j++) {
      const v = j / rows;
      for (let i = 0; i < cols; i++) {
        const u = i / cols;
        const f = this.field(u * 1.6, v * 1.6, t);
        const edge = Math.min(1, Math.abs(u - .5) * 2.2 + .15);
        let p = (f + 1.2) / 5.2;
        p = Math.max(0, p * p * 2.2 - .18) * (.5 + edge * .6);
        const X = i * P, Y = j * P, d = Math.hypot(X - this.mx, Y - this.my);
        if (o.cursorGlow && d < R) p += (1 - d / R) * .3;
        if (p <= 0) continue;
        const r = this.hash(i, j, step * .13 + (this.hash(j, i, 1) > .7 ? step : 0));
        if (r > p) continue;
        // score = soft clusters + per-dot randomness; cursor dots get pushed to the top
        const c = Math.min(1, Math.max(0, (this.field(u * 1.1 + 3, v * 1.1 + 7, t * .7) + 4) / 8));
        let sc = c * .6 + this.hash(i, j, 9) * .4;
        if (o.cursorGlow && d < R * .4) sc += 1;
        bx[n] = X; by[n] = Y; ba[n] = .35 + this.hash(j, i, 3) * .55; bs[n] = sc;
        bins[Math.min(255, Math.floor(sc / 2 * 256))]++;
        n++;
      }
    }

    // Find the score cut-off so exactly accentRatio of visible dots are coloured
    let want = Math.round(n * o.accentRatio), cut = 256;
    for (let k = 255; k >= 0 && want > 0; k--) { want -= bins[k]; cut = k; }
    const cutScore = cut / 256 * 2;

    // Pass 2: draw
    for (let k = 0; k < n; k++) {
      const a = ba[k];
      x.fillStyle = bs[k] >= cutScore
        ? `rgba(${A[0]},${A[1]},${A[2]},${a})`
        : `rgba(${N[0]},${N[1]},${N[2]},${a * .75})`;
      x.fillRect(bx[k], by[k], S, S);
    }
  }
}


window.PixelBackground = PixelBackground;
