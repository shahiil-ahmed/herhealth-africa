/**
 * Generates placeholder PNG assets for the HerHealth Expo app.
 * Uses only Node.js built-ins — no npm packages required.
 *
 * Produces valid PNG files with the HerHealth brand colors:
 *   - assets/icon.png          1024x1024  (app icon)
 *   - assets/adaptive-icon.png 1024x1024  (Android adaptive icon foreground)
 *   - assets/splash.png        1284x2778  (splash screen — iPhone 14 Pro Max size)
 *   - assets/favicon.png        48x48     (web favicon)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─── Minimal PNG encoder ──────────────────────────────────────────────────────

function crc32(buf) {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u32be(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = u32be(data.length);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crc = u32be(crc32(crcInput));
  return Buffer.concat([len, typeBytes, data, crc]);
}

/**
 * Encode an RGBA pixel array into a valid PNG buffer.
 * @param {number} width
 * @param {number} height
 * @param {Uint8Array} pixels  - flat RGBA array, length = width * height * 4
 */
function encodePNG(width, height, pixels) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.concat([
    u32be(width),
    u32be(height),
    Buffer.from([8, 2, 0, 0, 0]), // bit depth 8, color type 2 (RGB), no interlace
  ]);
  // We'll use RGB (drop alpha) for simplicity — fully opaque images
  // Actually let's keep RGBA: color type 6
  const ihdr2 = Buffer.concat([
    u32be(width),
    u32be(height),
    Buffer.from([8, 6, 0, 0, 0]), // bit depth 8, color type 6 (RGBA)
  ]);

  // Build raw scanlines: filter byte (0) + RGBA row
  const rowSize = width * 4;
  const raw = Buffer.alloc((1 + rowSize) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (1 + rowSize)] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + rowSize) + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr2),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function createCanvas(w, h, bgHex) {
  const pixels = new Uint8Array(w * h * 4);
  const [r, g, b] = hexToRgb(bgHex);
  for (let i = 0; i < w * h; i++) {
    pixels[i * 4]     = r;
    pixels[i * 4 + 1] = g;
    pixels[i * 4 + 2] = b;
    pixels[i * 4 + 3] = 255;
  }
  return pixels;
}

function setPixel(pixels, w, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= w) return;
  const i = (y * w + x) * 4;
  pixels[i]     = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
  pixels[i + 3] = a;
}

/** Filled circle using midpoint algorithm */
function fillCircle(pixels, w, h, cx, cy, radius, r, g, b, a = 255) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(pixels, w, x, y, r, g, b, a);
      }
    }
  }
}

/** Filled rounded rectangle */
function fillRoundRect(pixels, w, h, x, y, rw, rh, radius, r, g, b, a = 255) {
  for (let py = y; py < y + rh; py++) {
    for (let px = x; px < x + rw; px++) {
      if (px < 0 || py < 0 || px >= w || py >= h) continue;
      // Corner check
      const inCornerTL = px < x + radius && py < y + radius;
      const inCornerTR = px >= x + rw - radius && py < y + radius;
      const inCornerBL = px < x + radius && py >= y + rh - radius;
      const inCornerBR = px >= x + rw - radius && py >= y + rh - radius;
      if (inCornerTL) {
        const dx = px - (x + radius), dy = py - (y + radius);
        if (dx * dx + dy * dy > radius * radius) continue;
      } else if (inCornerTR) {
        const dx = px - (x + rw - radius), dy = py - (y + radius);
        if (dx * dx + dy * dy > radius * radius) continue;
      } else if (inCornerBL) {
        const dx = px - (x + radius), dy = py - (y + rh - radius);
        if (dx * dx + dy * dy > radius * radius) continue;
      } else if (inCornerBR) {
        const dx = px - (x + rw - radius), dy = py - (y + rh - radius);
        if (dx * dx + dy * dy > radius * radius) continue;
      }
      setPixel(pixels, w, px, py, r, g, b, a);
    }
  }
}

/** Draw a thick ring (circle outline) */
function drawRing(pixels, w, h, cx, cy, radius, thickness, r, g, b, a = 255) {
  const inner = (radius - thickness) * (radius - thickness);
  const outer = radius * radius;
  for (let y = cy - radius - 1; y <= cy + radius + 1; y++) {
    for (let x = cx - radius - 1; x <= cx + radius + 1; x++) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (d2 >= inner && d2 <= outer) {
        setPixel(pixels, w, x, y, r, g, b, a);
      }
    }
  }
}

// ─── Brand colors ─────────────────────────────────────────────────────────────
const ROSE_PINK   = '#D4688A';
const DARK_PLUM   = '#2D1B2E';
const PETAL       = '#FAF9F6';
const WHITE       = '#FFFFFF';

const [rp_r, rp_g, rp_b] = hexToRgb(ROSE_PINK);
const [dp_r, dp_g, dp_b] = hexToRgb(DARK_PLUM);
const [pt_r, pt_g, pt_b] = hexToRgb(PETAL);
const [wh_r, wh_g, wh_b] = hexToRgb(WHITE);

// ─── Generate icon.png (1024×1024) ───────────────────────────────────────────
function generateIcon(size) {
  const pixels = createCanvas(size, size, DARK_PLUM);
  const cx = size / 2, cy = size / 2;
  const outerR = Math.floor(size * 0.42);

  // Outer rose-pink circle background
  fillCircle(pixels, size, size, cx, cy, outerR, rp_r, rp_g, rp_b);

  // White inner circle
  const innerR = Math.floor(size * 0.32);
  fillCircle(pixels, size, size, cx, cy, innerR, wh_r, wh_g, wh_b);

  // Draw a simple heart shape using two circles + triangle
  const heartScale = size * 0.13;
  const heartCY = Math.floor(cy - heartScale * 0.1);

  // Left lobe
  fillCircle(pixels, size, size,
    Math.floor(cx - heartScale * 0.5), Math.floor(heartCY - heartScale * 0.2),
    Math.floor(heartScale * 0.55), rp_r, rp_g, rp_b);
  // Right lobe
  fillCircle(pixels, size, size,
    Math.floor(cx + heartScale * 0.5), Math.floor(heartCY - heartScale * 0.2),
    Math.floor(heartScale * 0.55), rp_r, rp_g, rp_b);
  // Bottom triangle fill
  const tipY = Math.floor(heartCY + heartScale * 1.1);
  for (let y = Math.floor(heartCY - heartScale * 0.2); y <= tipY; y++) {
    const progress = (y - (heartCY - heartScale * 0.2)) / (tipY - (heartCY - heartScale * 0.2));
    const halfW = Math.floor(heartScale * 0.95 * (1 - progress));
    for (let x = cx - halfW; x <= cx + halfW; x++) {
      if (x >= 0 && y >= 0 && x < size && y < size) {
        setPixel(pixels, size, x, y, rp_r, rp_g, rp_b);
      }
    }
  }

  // Decorative ring
  drawRing(pixels, size, size, cx, cy, Math.floor(size * 0.38), Math.floor(size * 0.015),
    255, 255, 255, 40);

  return encodePNG(size, size, pixels);
}

// ─── Generate splash.png (1284×2778) ─────────────────────────────────────────
function generateSplash(w, h) {
  const pixels = createCanvas(w, h, PETAL);
  const cx = w / 2, cy = h / 2;

  // Subtle radial gradient effect — darker plum circle in center
  const gradR = Math.floor(Math.min(w, h) * 0.55);
  for (let y = cy - gradR; y <= cy + gradR; y++) {
    for (let x = cx - gradR; x <= cx + gradR; x++) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= gradR) {
        const t = d / gradR; // 0 = center, 1 = edge
        // Blend from slightly tinted petal toward pure petal
        const alpha = Math.floor((1 - t) * 18);
        const [pr, pg, pb] = hexToRgb('#EDE8E4');
        const blendR = Math.floor(pt_r * (1 - alpha / 255) + pr * (alpha / 255));
        const blendG = Math.floor(pt_g * (1 - alpha / 255) + pg * (alpha / 255));
        const blendB = Math.floor(pt_b * (1 - alpha / 255) + pb * (alpha / 255));
        setPixel(pixels, w, Math.floor(x), Math.floor(y), blendR, blendG, blendB);
      }
    }
  }

  // Large rose-pink circle (logo background)
  const logoR = Math.floor(Math.min(w, h) * 0.18);
  fillCircle(pixels, w, h, cx, Math.floor(cy - h * 0.04), logoR, rp_r, rp_g, rp_b);

  // White inner circle
  const innerR = Math.floor(logoR * 0.72);
  fillCircle(pixels, w, h, cx, Math.floor(cy - h * 0.04), innerR, wh_r, wh_g, wh_b);

  // Heart inside
  const hs = logoR * 0.38;
  const hcx = cx, hcy = Math.floor(cy - h * 0.04 - hs * 0.05);
  fillCircle(pixels, w, h, Math.floor(hcx - hs * 0.5), Math.floor(hcy - hs * 0.2),
    Math.floor(hs * 0.55), rp_r, rp_g, rp_b);
  fillCircle(pixels, w, h, Math.floor(hcx + hs * 0.5), Math.floor(hcy - hs * 0.2),
    Math.floor(hs * 0.55), rp_r, rp_g, rp_b);
  const tipY2 = Math.floor(hcy + hs * 1.1);
  for (let y = Math.floor(hcy - hs * 0.2); y <= tipY2; y++) {
    const progress = (y - (hcy - hs * 0.2)) / (tipY2 - (hcy - hs * 0.2));
    const halfW = Math.floor(hs * 0.95 * (1 - progress));
    for (let x = hcx - halfW; x <= hcx + halfW; x++) {
      if (x >= 0 && y >= 0 && x < w && y < h) {
        setPixel(pixels, w, Math.floor(x), Math.floor(y), rp_r, rp_g, rp_b);
      }
    }
  }

  // Decorative dots (petal pattern)
  const dotPositions = [
    [cx - w * 0.3, cy - h * 0.25],
    [cx + w * 0.3, cy - h * 0.25],
    [cx - w * 0.35, cy + h * 0.15],
    [cx + w * 0.35, cy + h * 0.15],
    [cx, cy - h * 0.32],
    [cx, cy + h * 0.28],
  ];
  dotPositions.forEach(([dx, dy]) => {
    fillCircle(pixels, w, h, Math.floor(dx), Math.floor(dy),
      Math.floor(w * 0.018), rp_r, rp_g, rp_b, 60);
  });

  return encodePNG(w, h, pixels);
}

// ─── Generate favicon.png (48×48) ────────────────────────────────────────────
function generateFavicon(size) {
  const pixels = createCanvas(size, size, DARK_PLUM);
  const cx = size / 2, cy = size / 2;
  const r = Math.floor(size * 0.44);
  fillCircle(pixels, size, size, cx, cy, r, rp_r, rp_g, rp_b);
  // Simple cross/plus as a minimal icon
  const arm = Math.floor(size * 0.12);
  const len = Math.floor(size * 0.28);
  // Vertical bar
  fillRoundRect(pixels, size, size,
    Math.floor(cx - arm), Math.floor(cy - len),
    arm * 2, len * 2, arm, wh_r, wh_g, wh_b);
  // Horizontal bar
  fillRoundRect(pixels, size, size,
    Math.floor(cx - len), Math.floor(cy - arm),
    len * 2, arm * 2, arm, wh_r, wh_g, wh_b);
  return encodePNG(size, size, pixels);
}

// ─── Write files ──────────────────────────────────────────────────────────────
const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

const files = [
  { name: 'icon.png',          data: generateIcon(1024),        desc: '1024×1024 app icon' },
  { name: 'adaptive-icon.png', data: generateIcon(1024),        desc: '1024×1024 Android adaptive icon' },
  { name: 'splash.png',        data: generateSplash(1284, 2778), desc: '1284×2778 splash screen' },
  { name: 'favicon.png',       data: generateFavicon(48),        desc: '48×48 web favicon' },
];

files.forEach(({ name, data, desc }) => {
  const filePath = path.join(assetsDir, name);
  fs.writeFileSync(filePath, data);
  const kb = (data.length / 1024).toFixed(1);
  console.log(`✅  ${name.padEnd(22)} ${desc}  (${kb} KB)`);
});

console.log('\n✨  All assets generated successfully in mobile/assets/');
