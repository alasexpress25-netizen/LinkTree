import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crc = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, toCrc, crcBuf]);
}

function generatePng(size, isMaskable = false) {
  const width = size;
  const height = size;

  // Raw image buffer: (1 filter byte + width * 4 bytes RGBA) * height
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.38 : 0.44);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Base background: #0f172a (15, 23, 42)
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Outer gold circle ring
      const ringDist = Math.abs(dist - radius);
      if (ringDist < width * 0.02) {
        r = 245;
        g = 158;
        b = 11;
      }

      // Heart and cross shape logic
      // Normalized coordinates from -1 to 1
      const nx = (x - cx) / (width * 0.32);
      const ny = -(y - cy + height * 0.04) / (width * 0.32);

      // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const inHeart = Math.pow(nx * nx + ny * ny - 1, 3) - (nx * nx * ny * ny * ny) <= 0;

      if (inHeart) {
        // Gold gradient fill: #f59e0b to #fbbf24
        r = 245;
        g = 158 + Math.floor(ny * 30);
        b = 11;

        // Cross in the center: vertical and horizontal bars
        const inCrossV = Math.abs(dx) < width * 0.035 && dy > -height * 0.22 && dy < height * 0.16;
        const inCrossH = Math.abs(dy + height * 0.05) < width * 0.035 && Math.abs(dx) < width * 0.16;

        if (inCrossV || inCrossH) {
          r = 15;
          g = 23;
          b = 42;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Deflate compressed IDAT
  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePng(32));

console.log('✅ Icons generated successfully in public/');
