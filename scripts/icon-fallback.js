import { promises as fs } from 'fs';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import png2icons from 'png2icons';

const source = 'assets/logo.svg';
const outDir = 'src-tauri/icons';
const sizes = [32, 128, 256, 512];

async function generate() {
  await fs.mkdir(outDir, { recursive: true });
  const pngBuffers = [];
  for (const size of sizes) {
    const buffer = await sharp(source)
      .resize(size, size)
      .png()
      .toBuffer();
    await fs.writeFile(`${outDir}/${size}x${size}.png`, buffer);
    pngBuffers.push(buffer);
  }
  const ico = await pngToIco(pngBuffers);
  await fs.writeFile(`${outDir}/icon.ico`, ico);
  const icns = png2icons.createICNS(pngBuffers[pngBuffers.length - 1], png2icons.BILINEAR, 0);
  if (icns) {
    await fs.writeFile(`${outDir}/icon.icns`, icns);
  }
}

generate().catch((err) => {
  console.error('Icon fallback failed:', err);
  process.exit(1);
});
